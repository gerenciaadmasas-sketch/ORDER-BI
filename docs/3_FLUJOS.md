# Flujo del SaaS y la App
## SaaS.DTO2 — Mapa completo de navegación y flujos de usuario

---

## 1. Flujo de adquisición (Landing → Cliente activo)

```
[Landing /]
    ↓ Elige plan (Chispa / Fuego / Cosmos)
    ↓ Llena formulario:
      · Nombre, apellido, cédula, teléfono
      · Actividad económica
      · Empresa
      · Billing: mensual / anual
    ↓ wompi-sign genera hash de integridad
    ↓ Redirect → Checkout Wompi
    
[Checkout Wompi]
    ↓ APROBADO → redirect /pago-exitoso?status=APPROVED&reference=POS-xxx
    ↓ RECHAZADO → redirect /pago-exitoso?status=DECLINED
    
[wompi-webhook — background]
    ↓ Recibe transaction.updated APPROVED
    ↓ Verifica firma SHA-256
    ↓ Genera usuario único (NombreApellido / NombreApellido2...)
    ↓ Genera contraseña aleatoria segura
    ↓ Crea: empresa → usuario auth → usuario DB → sucursal → almacén → suscripción
    ↓ Guarda credentials en wompi_transacciones_pendientes (plain, 1 sola vez)
    ↓ Guarda PBKDF2 hash en suscripciones.password_admin
    
[/pago-exitoso — polling]
    ↓ RPC get_onboarding_credentials(reference) cada 3s (máx 60s)
    ↓ Muestra credenciales: usuario + contraseña
    ↓ Botón "Ingresar al sistema →"
```

---

## 2. Flujo de Login

```
[/login]
    ↓ Usuario ingresa: usuario + contraseña
    ↓ supabase.auth.signInWithPassword({ email: `usuario@empXXX.pos`, password })
    ↓ JWT guardado en localStorage automáticamente
    ↓ mostrarusuarios() → carga datos del usuario (tipo, id_empresa, permisos)
    ↓ mostrarempresa() → carga datos de la empresa
    ↓ Redirect /home
    
[/home]
    → Dashboard diferenciado por actividad_economica + plan
```

---

## 3. Flujo de navegación (usuario cliente)

```
/home               → Dashboard con KPIs y accesos rápidos (personalizado por actividad)
/pos                → Punto de venta principal
/inventario         → Stock por almacén + ajustes
/kardex             → Trazabilidad de movimientos (solo Fuego/Cosmos)
/reportes           → KPIs + gráficas + arqueo
/clientes           → Gestión de clientes
/soporte            → Chat con superadmin
/perfil             → Datos personales + cambio de contraseña
/arqueo             → Cierre de caja del turno

/configuracion
  /categorias        → CRUD categorías
  /productos         → CRUD productos
  /clientes          → CRUD clientes
  /proveedores       → CRUD proveedores
  /empresa           → Datos de la empresa
  /usuarios          → Gestión de roles (solo admin)
  /sucursales        → Sucursales y cajas (Fuego/Cosmos)
  /ticket            → Ticket personalizado (Fuego/Cosmos)
  /serializacion     → Serialización por pieza (joyería)
  /impresoras        → Configuración impresoras
```

### Módulos especiales por actividad

**Construcción / Inmobiliaria:**
```
/propiedades         → CRUD de propiedades con imágenes
/proyectos           → Lista de proyectos de obra
/proyectos/:id       → Detalle: fases, personal, presupuesto
/arrendamientos      → Contratos de arriendo
/administracion      → Panel de administración
```

**Restaurante:**
```
/mesas               → Grid de mesas + comandas
/cocina              → Pantalla tiempo real (pública, sin auth)
/menu-editor         → CRUD menú
/suministros         → Insumos y compras
/reportes            → Dashboard restaurante (KPIs propios)
/arqueo              → Cierre del día
```

---

## 4. Flujo del Superadmin

```
Login con usuario DeyvidMendez
    ↓ tipo === "superadmin"
    ↓ Sidebar muestra menú exclusivo

/saas               → Panel de clientes
    · Ver todos los clientes con estado
    · Alertas de vencimiento (≤10 días)
    · Crear cliente manual → modal credenciales
    · Registrar pago / eximir / reactivar
    · Regenerar contraseña → modal credenciales
    
/prospectos         → Pipeline de ventas
/finanzas           → Rentabilidad del SaaS
/mensajes           → Chat con todos los clientes
/configuracion/planes  → Precios y features por tier
/configuracion/version → Gestión de versión del sistema
```

---

## 5. Flujo de creación de cliente manual (Superadmin)

```
[/saas] → Botón "+ Nuevo cliente"
    ↓ Modal formulario:
      · Nombre, apellido, cédula, teléfono
      · Actividad económica (dropdown)
      · Plan (Chispa / Fuego / Cosmos)
      · Mensualidad, fecha próximo pago, notas
    ↓ InsertarSuscripcion()
      → Genera usuario único
      → Genera contraseña aleatoria
      → Crea: empresa → usuario auth (Edge Function) → suscripción
    ↓ Modal credenciales (overlay persistente):
      · Usuario + Contraseña (con botones Copiar)
      · Advertencia: "Guarda esta contraseña — no se puede recuperar"
      · Botón WhatsApp (mensaje pre-armado si tiene teléfono)
      · Copiar todo
    ↓ Superadmin cierra modal → lista actualizada
```

---

## 6. Flujo de regenerar contraseña

```
[/saas] → Tarjeta del cliente → Ícono refresh (🔄) junto a "Protegida (PBKDF2)"
    ↓ SweetAlert: "¿Regenerar contraseña? La actual quedará inválida."
    ↓ Confirmar
    ↓ RegenerarPassword()
      → generatePassword() → contraseña nueva aleatoria
      → RPC admin_reset_password(email, password) → actualiza auth.users (bcrypt)
      → hashPassword(password) → PBKDF2 → actualiza suscripciones.password_admin
    ↓ Modal credenciales con nueva contraseña
      · Copiar + WhatsApp
```

---

## 7. Flujo de soporte (Chat)

```
[Cliente en /soporte]
    ↓ Ve conversación con superadmin
    ↓ Envía mensaje → tabla mensajes_soporte (filtrada por id_empresa)
    
[Superadmin en /mensajes]
    ↓ Ve conversaciones de todos los clientes
    ↓ Selecciona cliente → responde
    ↓ Realtime Supabase → cliente recibe respuesta instantánea
```

---

## 8. Rutas públicas (sin autenticación)

```
/               → Landing (PlanesTemplate) — si ya logueado: redirect /home
/login          → Login — si ya logueado: redirect /home
/pago-exitoso   → Resultado del pago Wompi (con credenciales)
/cocina         → Pantalla cocina restaurante (TV pública del negocio)
/privacidad     → Política de privacidad (Ley 1581/2012)
/terminos       → Términos de uso
```

---

## 9. Permisos por rol

| Ruta / Acción | Superadmin | Admin | Supervisor | Cajero |
|---------------|-----------|-------|-----------|--------|
| /saas, /finanzas, /prospectos | ✅ | ❌ | ❌ | ❌ |
| /configuracion/usuarios | ✅ | ✅ | ❌ | ❌ |
| /configuracion (todo) | ✅ | ✅ | ❌ | ❌ |
| /reportes | ✅ | ✅ | ✅ | ❌ |
| /pos | ✅ | ✅ | ✅ | ✅ |
| /inventario | ✅ | ✅ | ✅ | ✅ |
| /kardex | ✅ | ✅ (Fuego+) | ✅ (Fuego+) | ❌ |
