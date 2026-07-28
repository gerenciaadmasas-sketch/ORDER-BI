# Plan de Implementación
## SaaS.DTO2 — Hoja de ruta paso a paso

---

## Estado actual del sistema (2026-07-28)

### ✅ Completado

**Infraestructura base:**
- React 19 + Vite + Styled Components + Framer Motion + TanStack Query + Zustand
- Supabase: Auth, PostgreSQL, Storage, Realtime, Edge Functions
- Deploy: GitHub → Vercel (saasdto2.vercel.app) automático
- Multi-tenant con RLS en 30+ tablas

**Autenticación y seguridad:**
- Login con Supabase Auth (emails sintéticos `usuario@empXXX.pos`)
- Roles: superadmin / administrador / supervisor / cajero
- Contraseñas PBKDF2 (100.000 iteraciones, sal aleatoria)
- Generación de contraseñas aleatorias (sin caracteres ambiguos)
- Guards de ruta: `ProtectedRoute` y `SuperadminRoute`
- Páginas legales: `/privacidad` y `/terminos` (Ley 1581/2012)

**Panel SaaS (superadmin):**
- Lista de clientes con estado, alertas de vencimiento
- Crear cliente manual con modal de credenciales (Usuario + Contraseña + WhatsApp)
- Registrar pago, eximir pago, reactivar cuenta
- Regenerar contraseña (RPC `admin_reset_password` + modal credenciales)
- Prospectos, finanzas, mensajes internos

**POS y operaciones:**
- POS genérico (carrito, cobro, ticket)
- Inventario multi-almacén con ajustes
- Kardex (trazabilidad)
- Clientes y proveedores
- Reportes y dashboard
- Arqueo / cierre de caja
- Configuración completa (usuarios, sucursales, ticket, impresoras)
- Serialización por pieza

**Módulos especiales completos:**
- Construcción: propiedades, proyectos de obra, arrendamientos, administración
- Restaurante: mesas, comandas, cocina realtime, menú editor, suministros, cierre del día

**Flujo de pago automático (Wompi):**
- `wompi-sign` y `wompi-webhook` escritas y en producción (sin credenciales reales aún)
- `/pago-exitoso` con polling de credenciales via RPC `get_onboarding_credentials`

**Landing:**
- 8 secciones: hero, planes, comparativa, FAQ, servicio web, CTA, footer
- Toggle mensual/anual con precios dinámicos
- 6 actividades económicas disponibles

---

## FASE 2 — UI diferenciada por actividad (SIGUIENTE)

### 2A — Dashboard Home por actividad

Cada actividad tiene su propio bloque de KPIs y accesos rápidos en `/home`.

**Pendiente:**

| Actividad | Estado |
|-----------|--------|
| retail_ropa | ⚠️ Usa POS genérico — pendiente home custom |
| retail_supermercado | ⚠️ Nuevo — pendiente home custom |
| retail_joyeria | ⚠️ Nuevo — pendiente home custom |
| restaurante | ⚠️ Tiene módulos — pendiente home custom |
| veterinaria | ⚠️ Nuevo — pendiente home custom |
| construccion | ✅ Completo |

**KPIs planificados por actividad:**
- **retail_ropa:** Ventas del día, stock bajo, top producto, ticket promedio
- **retail_supermercado:** Rotación de productos, vencimientos próximos, stock crítico
- **retail_joyeria:** Inventario por valor, margen por pieza, SKUs más caros
- **restaurante:** Platos más pedidos, hora pico, mesas activas, ticket promedio mesa
- **veterinaria:** Mascotas atendidas, servicios más frecuentes, productos vendidos

### 2B — Sidebar diferenciado por actividad

Cada actividad muestra solo los módulos relevantes:
- **retail_ropa / supermercado / joyeria:** POS, inventario, clientes, reportes
- **restaurante:** Mesas, cocina, menú, suministros, reportes restaurante
- **construccion:** Propiedades, proyectos, arrendamientos, administración
- **veterinaria:** POS, clientes (mascotas), inventario (productos veterinarios), reportes

---

## FASE 3 — Landing y marketing

### 3A — Sección "Bundle POS + Web"
- Tabla comparativa de precios cruzados (POS + Web)
- Mostrar ahorro real en COP para cliente Fuego y Cosmos
- Animación de reveal

### 3B — Mejoras a la landing
- Links `/privacidad` y `/terminos` en footer
- Checkbox de aceptación en modal de pago (Wompi)
- Sección de testimonios (cuando haya clientes reales con permiso)

### 3C — SEO básico
- Meta tags correctos en `index.html`
- OG tags para compartir en redes
- Descripción y keywords

---

## FASE 4 — Wompi en producción

**Trigger:** cuando el usuario tenga las credenciales de producción.

```
Pasos:
1. Agregar secrets en Supabase → Edge Functions → Secrets:
   WOMPI_PUBLIC_KEY, WOMPI_PRIVATE_KEY, WOMPI_INTEGRITY_SECRET, WOMPI_EVENTS_SECRET
   FRONTEND_URL = https://saasdto2.vercel.app

2. Desplegar Edge Functions:
   supabase functions deploy wompi-sign
   supabase functions deploy wompi-webhook

3. En panel Wompi → configurar webhook URL:
   https://souwqzfmxsorhelmidqq.supabase.co/functions/v1/wompi-webhook

4. Prueba end-to-end:
   - Compra de plan Chispa mensual con tarjeta de prueba
   - Verificar /pago-exitoso muestra credenciales
   - Verificar que el cliente puede iniciar sesión

5. Hacer repositorio GitHub privado (seguridad)
```

---

## FASE 5 — App móvil (futuro, plan Cosmos)

> Solo para clientes del plan Cosmos que tienen "App móvil optimizada".

Opciones técnicas a definir:
- PWA (Progressive Web App) — reutiliza 100% del código actual
- React Native / Expo — requiere reescritura de componentes
- Capacitor — wrapper nativo del mismo código React

**Recomendación:** empezar con PWA (manifiesto + service worker) ya que es el camino más rápido y reutiliza todo el código actual.

---

## FASE 6 — Módulo veterinaria (completo)

- Ficha de mascota vinculada al cliente
- Historial médico por mascota
- Agenda de citas
- Productos veterinarios (diferenciados de retail)
- Home dashboard veterinaria

---

## Reglas de calidad para cada fase

1. `npm run build` ✅ antes de cada commit
2. Solo modificar el código específico del cambio — no tocar lo que funciona
3. Cambios de seguridad verificar en Supabase antes del commit
4. Push automático a GitHub → Vercel despliega en ~2 minutos
5. El usuario prueba siempre en Vercel (no localhost)
6. Cada feature nueva se documenta en el documento correspondiente de `/docs`

---

## Backlog priorizado (ordenado por valor)

| # | Feature | Impacto | Esfuerzo |
|---|---------|---------|---------|
| 1 | Home diferenciado retail_ropa | Alto | Medio |
| 2 | Home diferenciado restaurante | Alto | Bajo (módulos ya existen) |
| 3 | Bundle POS+Web en landing | Alto | Bajo |
| 4 | Links legales en footer landing | Medio | Muy bajo |
| 5 | Checkbox aceptación en modal pago | Medio | Bajo |
| 6 | Home diferenciado veterinaria | Alto | Alto |
| 7 | Home diferenciado supermercado/joyería | Medio | Medio |
| 8 | Wompi producción | Crítico | Bajo (ya está escrito) |
| 9 | PWA básica (manifiesto) | Medio | Bajo |
| 10 | Módulo veterinaria completo | Alto | Alto |
