import { toastError } from "../utils/toast";
import { supabase } from "../index";
const tabla = "usuarios";

export async function MostrarUsuarios(p) {
    const { data } = await supabase
        .from(tabla)
        .select()
        .eq("id_auth", p.id_auth)
        .maybeSingle();
    return data;
}

export async function ListarUsuariosEmpresa(p) {
    const { data, error } = await supabase
        .from(tabla)
        .select()
        .eq("id_empresa", p.id_empresa)
        .order("created_at", { ascending: false });
    if (error) { toastError(error.message, "Usuarios › Listar"); return []; }
    return data ?? [];
}

export async function InsertarAdmin(p) {
    const { data, error } = await supabase.from(tabla).insert(p).select().maybeSingle();
    if (error) {
        if (error.code === "23505") return null;
        toastError(error.message, "Usuarios › Insertar admin");
        return;
    }
    return data;
}

export async function CrearUsuarioEmpleado(p) {
    // Llama al Edge Function que usa service_role para crear el auth user
    const { data, error } = await supabase.functions.invoke("dynamic-worker", {
        body: {
            email:       p.email,
            password:    p.password,
            usuario:     p.usuario    ?? null,
            nombres:     p.nombres,
            nro_doc:     p.nro_doc    ?? null,
            telefono:    p.telefono   ?? null,
            id_empresa:  p.id_empresa,
            id_sucursal: p.id_sucursal ?? null,
            id_almacen:  p.id_almacen  ?? null,
            tipo:        p.tipo        ?? "cajero",
            permisos:    p.permisos    ?? {},
        },
    });
    if (error) {
        let msg = error.message;
        try {
            const body = await error.context?.json?.();
            if (body?.error) msg = body.error;
        } catch { /* ignorar */ }
        toastError(msg, "Usuarios › Crear empleado");
        throw new Error(msg);
    }
    // Guardar email y apellidos (el Edge Function no los persiste directamente)
    await supabase
        .from(tabla)
        .update({ email: p.email, apellidos: p.apellidos ?? null })
        .eq("usuario", p.usuario)
        .eq("id_empresa", p.id_empresa);
    return data;
}

export async function ObtenerEmailPorUsuario(usuario) {
    const { data, error } = await supabase
        .rpc("get_email_por_usuario", { p_usuario: usuario });
    if (error || !data || data.length === 0) return null;
    return { email: data[0].email ?? null, tipo: data[0].tipo ?? null };
}

export async function ActualizarUsuario(p) {
    const { id, id_auth, id_empresa, created_at, ...campos } = p;
    const { data, error } = await supabase
        .from(tabla)
        .update(campos)
        .eq("id_auth", id_auth)
        .eq("id_empresa", id_empresa)
        .select()
        .maybeSingle();
    if (error) { toastError(error.message, "Usuarios › Actualizar"); throw new Error(error.message); }
    return data;
}

export async function EliminarUsuarioEmpleado(p) {
    // Usa el Edge Function para borrar también el auth user (evita "email ya registrado" al re-crear)
    const { data, error } = await supabase.functions.invoke("dynamic-worker", {
        body: { action: "delete", id_auth: p.id_auth, id_empresa: p.id_empresa },
    });
    if (error) {
        let msg = error.message;
        try { const b = await error.context?.json?.(); if (b?.error) msg = b.error; } catch { /* */ }
        toastError(msg, "Usuarios › Eliminar");
        throw new Error(msg);
    }
    if (data?.error) { toastError(data.error, "Usuarios › Eliminar"); throw new Error(data.error); }
}

export async function ObtenerIdAuthSupabase() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session != null) {
        const { user } = session;
        return user.id;
    }
}