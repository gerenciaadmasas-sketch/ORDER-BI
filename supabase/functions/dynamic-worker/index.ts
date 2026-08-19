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

// Lee el claim "role" del JWT sin verificarlo (la verificación de firma ya la
// hace la plataforma antes de invocar la función, vía verify_jwt: true).
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

    const body = await req.json();
    const {
      email, password, usuario, nombres, nro_doc, telefono,
      id_empresa, id_sucursal, id_almacen, tipo, permisos,
    } = body;

    // ── Autorización ──
    // Llamadas internas (service role: webhook de Wompi, onboarding automático)
    // se confían igual que antes. Cualquier otra llamada debe venir de un usuario
    // autenticado con permiso para crear usuarios, y solo dentro de SU PROPIA
    // empresa y con un rol igual o menor al que la interfaz ya le permite crear
    // (mismas reglas que TIPOS_ADMIN / TIPOS_SUPERVISOR en UsuariosTemplate.jsx).
    const TIPOS_PERMITIDOS = {
      administrador: ["cajero", "supervisor"],
      supervisor:    ["cajero"],
    };
    let idEmpresaFinal = id_empresa;
    const esServiceRole = rolDelToken(token) === "service_role";

    if (!esServiceRole) {
      const { data: authUser, error: authUserError } = await supabaseAdmin.auth.getUser(token);
      if (authUserError || !authUser?.user) {
        return new Response(JSON.stringify({ error: "No autorizado" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: caller } = await supabaseAdmin
        .from("usuarios")
        .select("tipo, id_empresa")
        .eq("id_auth", authUser.user.id)
        .maybeSingle();

      if (!caller || !["administrador", "supervisor", "superadmin"].includes(caller.tipo)) {
        return new Response(JSON.stringify({ error: "No autorizado para crear usuarios" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (caller.tipo !== "superadmin") {
        idEmpresaFinal = caller.id_empresa; // ignora cualquier id_empresa recibido del cliente
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
