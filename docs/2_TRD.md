# Technical Requirements Document (TRD)
## ORDER BI — Guía técnica para desarrollo

---

## 1. Stack tecnológico

### Frontend
| Herramienta | Versión | Rol |
|-------------|---------|-----|
| React | 19 | Framework principal |
| Vite (Rolldown) | 7.x | Build tool |
| Styled Components | 6.x | CSS-in-JS |
| Framer Motion (`motion/react`) | v12 | Animaciones |
| TanStack Query | v5 | Server state / caché |
| Zustand | 4.x | Client state global |
| React Router | v7 | Routing SPA |
| react-icons/ri | — | Iconos (Remix Icons) |
| @iconify/react | — | Iconos secundarios |
| SweetAlert2 | — | Modales de confirmación |
| ConfettiExplosion | — | Celebraciones UI |

### Backend
| Herramienta | Rol |
|-------------|-----|
| Supabase | BaaS completo (Auth + PostgreSQL + Storage + Realtime + Edge Functions) |
| PostgreSQL | Base de datos relacional |
| Row Level Security (RLS) | Aislamiento multi-tenant a nivel de DB |
| Edge Functions (Deno) | Lógica serverless (Wompi, cron, dynamic-worker) |
| Wompi | Pasarela de pagos Colombia |

### Infraestructura
| Herramienta | Rol |
|-------------|-----|
| Vercel | Deploy frontend (saasdto2.vercel.app) |
| GitHub | Control de versiones (gerenciaadmasas-sketch/ORDER BI) |
| Supabase Cloud | Backend (proyecto: souwqzfmxsorhelmidqq, región: us-east-2) |

---

## 2. Estructura del proyecto

```
POS-DL-V1/
├── src/
│   ├── components/
│   │   ├── templates/       # Pantallas completas (SaasTemplate, POSTemplate, etc.)
│   │   ├── organismos/      # Bloques grandes (Sidebar, TopBar)
│   │   └── moleculas/       # Componentes reutilizables (Spinner, Overlay)
│   ├── hooks/               # Custom hooks + guards (SuperadminRoute, usePlan)
│   ├── pages/               # Wrappers de rutas (lazy-loadable)
│   ├── routers/             # routes.jsx — definición completa de rutas
│   ├── supabase/            # CRUD por dominio + supabase.config.js
│   ├── styles/              # variables.jsx, themes (light/dark)
│   ├── utils/               # hash.js, toast.jsx, helpers
│   └── index.js             # Barrel de exportaciones
├── supabase/
│   └── functions/           # Edge Functions (Deno)
│       ├── wompi-sign/
│       ├── wompi-webhook/
│       └── limpiar-mensajes-internos/
├── docs/                    # Documentación del proyecto
└── public/                  # Assets estáticos
```

---

## 3. Autenticación y autorización

### Auth
- Proveedor: Supabase Auth (GoTrue)
- Método: email + password (emails sintéticos `usuario@empXXX.pos`)
- Tokens: JWT manejados automáticamente por Supabase client

### Roles de usuario
```
superadmin   → Cross-empresa, acceso total, panel /saas
administrador → Su empresa, configuración completa
supervisor   → Su sucursal, POS limitado
cajero       → Solo POS + inventario básico
```

### Guards de ruta
```jsx
// Ruta protegida (requiere sesión)
<ProtectedRoute user={user} redirectTo="/" />

// Ruta solo superadmin
<SuperadminRoute usuario={datausuarios} />
// → src/hooks/SuperadminRoute.jsx
```

---

## 4. Multi-tenancy

### Patrón de aislamiento
Todo filtro de datos usa `id_empresa` del store global:
```js
const { dataempresa } = useEmpresaStore();
// Todas las queries: .eq("id_empresa", dataempresa.id)
```

### Funciones Supabase clave
```sql
-- Retorna id_empresa del usuario autenticado
get_mi_empresa()
→ SELECT id_empresa FROM usuarios WHERE id_auth = auth.uid()::text LIMIT 1

-- Verifica si es superadmin
es_superadmin()
→ SELECT EXISTS(SELECT 1 FROM usuarios WHERE id_auth = auth.uid()::text AND tipo = 'superadmin')
```

### RLS (Row Level Security)
- Activo en las 30+ tablas
- Políticas usan `get_mi_empresa()` para filtrar automáticamente
- Superadmin tiene políticas separadas que bypasean el filtro tenant
- Funciones SECURITY DEFINER para casos específicos (onboarding, reset password)

---

## 5. Seguridad de contraseñas

### Algoritmo: PBKDF2
```js
// src/utils/hash.js
export async function hashPassword(plain) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.importKey("raw", encoder.encode(plain), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 100_000 }, key, 256);
    return `pbkdf2:${toHex(salt)}:${toHex(bits)}`;
}

export function generatePassword(length = 12) {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    return Array.from(crypto.getRandomValues(new Uint8Array(length))).map(b => chars[b % chars.length]).join("");
}
```

**Formato almacenado:** `pbkdf2:<sal_32hex>:<hash_64hex>`
**En Supabase Auth:** bcrypt via `crypt(password, gen_salt('bf'))` (pgcrypto)

---

## 6. APIs y servicios externos

### Supabase Management API
- URL: `https://api.supabase.com/v1/projects/souwqzfmxsorhelmidqq/`
- Endpoint DB: `.../database/query`
- Auth: Bearer token (conservar en secreto)
- Uso: migrations SQL, crear RPCs, configurar políticas

### Supabase Client (frontend)
```js
// src/supabase/supabase.config.js
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### Wompi (Colombia)
- Flujo: checkout hosted (redirect)
- `wompi-sign`: genera hash SHA-256 de integridad + crea transacción pendiente
- `wompi-webhook`: procesa `transaction.updated` APPROVED → activa cliente
- Verificación: SHA-256 de `id+status+amount+secret`

### Web Crypto API
- Nativa en browser y Deno
- Sin dependencias npm
- Uso: PBKDF2, generación de contraseñas aleatorias

---

## 7. Estado global (Zustand stores)

```js
useEmpresaStore    → dataempresa (id, razon_social, actividad_economica, plan, etc.)
useUsuariosStore   → datausuarios (id, tipo, permisos, id_empresa, id_sucursal)
```

### Flujo de carga al login
1. `mostrarusuarios()` → carga datos del usuario autenticado
2. `mostrarempresa()` → carga datos de la empresa por id_usuario
3. Si falla: `MostrarEmpresaPorId(id_empresa)` → fallback para empleados
4. Todos los componentes consumen los stores, no hacen queries directas de usuario/empresa

---

## 8. Patterns de data fetching

```js
// Lectura estándar
const { data, isFetching } = useQuery({
    queryKey: ["clave-unica", dependencias],
    queryFn: () => FuncionCRUD({ id_empresa: dataempresa.id }),
    staleTime: 30_000,
});

// Mutación estándar
const mutacion = useMutation({
    mutationFn: (payload) => FuncionCRUD(payload),
    onSuccess: () => { queryClient.invalidateQueries(["clave-unica"]); },
});
```

---

## 9. Reglas de calidad (no negociables)

1. `npm run build` debe pasar sin errores antes de cada push
2. No se modifica código que no esté relacionado con el cambio pedido
3. No se elimina funcionalidad existente — se extiende
4. Cambios de seguridad se verifican en Supabase antes de commit
5. Push a GitHub → Vercel despliega automáticamente
6. El usuario prueba siempre en Vercel (no usa localhost)
7. No usar `<select>` nativo — siempre dropdown personalizado
8. Iconos de eliminar: siempre `RiDeleteBin2Line`
9. Contraseñas: nunca almacenar en texto plano

---

## 10. Variables de entorno

```env
# Frontend (.env)
VITE_SUPABASE_URL=https://souwqzfmxsorhelmidqq.supabase.co
VITE_SUPABASE_ANON_KEY=...

# Edge Functions (Supabase secrets)
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
WOMPI_PUBLIC_KEY=...
WOMPI_PRIVATE_KEY=...
WOMPI_INTEGRITY_SECRET=...
WOMPI_EVENTS_SECRET=...
FRONTEND_URL=https://saasdto2.vercel.app
```
