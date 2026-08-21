import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function rolDelToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.role ?? null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const esServiceRole = rolDelToken(token) === "service_role";

    const body = await req.json();
    const { action = "create" } = body;

    // ── Resolver caller (compartido para todas las acciones) ──
    let caller: { tipo: string; id_empresa: number } | null = null;
    if (!esServiceRole) {
      const { data: authUser, error: authUserError } = await supabaseAdmin.auth.getUser(token);
      if (authUserError || !authUser?.user) {
        return new Response(JSON.stringify({ error: "No autorizado" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data } = await supabaseAdmin
        .from("usuarios")
        .select("tipo, id_empresa")
        .eq("id_auth", authUser.user.id)
        .maybeSingle();
      caller = data;
      if (!caller || !["administrador", "supervisor", "superadmin"].includes(caller.tipo)) {
        return new Response(JSON.stringify({ error: "No autorizado" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ── DELETE ──
    if (action === "delete") {
      const { id_auth: targetIdAuth } = body;
      if (!targetIdAuth) {
        return new Response(JSON.stringify({ error: "id_auth requerido para eliminar" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Elimina el auth user (borra también la fila de usuarios si hay FK con CASCADE,
      // sino el delete explícito de abajo lo limpia)
      const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(targetIdAuth);
      if (authErr) {
        return new Response(JSON.stringify({ error: authErr.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Delete explícito por si no hay CASCADE configurado en la FK
      await supabaseAdmin.from("usuarios").delete().eq("id_auth", targetIdAuth);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── CREATE (lógica original) ──
    const {
      email, password, usuario, nombres, nro_doc, telefono,
      id_empresa, id_sucursal, id_almacen, tipo, permisos,
    } = body;

    const TIPOS_PERMITIDOS: Record<string, string[]> = {
      administrador: ["cajero", "supervisor"],
      supervisor:    ["cajero"],
    };
    let idEmpresaFinal = id_empresa;

    if (!esServiceRole && caller) {
      if (caller.tipo !== "superadmin") {
        idEmpresaFinal = caller.id_empresa;
        if (!TIPOS_PERMITIDOS[caller.tipo]?.includes(tipo)) {
          return new Response(JSON.stringify({ error: "No autorizado para crear ese tipo de usuario" }), {
            status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email, password, email_confirm: true,
      });

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const id_auth = authData.user.id;

    const { data, error } = await supabaseAdmin
      .from("usuarios")
      .insert({
        id_auth, email, usuario: usuario ?? null, nombres,
        nro_doc: nro_doc ?? null, telefono: telefono ?? null,
        id_empresa: idEmpresaFinal, id_sucursal: id_sucursal ?? null,
        id_almacen: id_almacen ?? null,
        tipo: tipo ?? "cajero", permisos: permisos ?? {},
      })
      .select().maybeSingle();

    if (error) {
      await supabaseAdmin.auth.admin.deleteUser(id_auth);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ usuario: data }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error inesperado:", e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
