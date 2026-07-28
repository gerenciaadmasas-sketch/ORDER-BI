# Product Requirements Document (PRD)
## SaaS.DTO2 — POS para micro-empresas colombianas

---

## 1. Visión del producto

SaaS.DTO2 es una plataforma SaaS de Punto de Venta (POS) diseñada para micro-empresas colombianas. Combina gestión de inventario, ventas, reportes y presencia digital en un solo sistema, adaptado automáticamente al tipo de negocio del cliente.

**Propuesta de valor diferencial:**
- Activación en menos de 2 minutos desde el pago
- Interfaz adaptada a la actividad económica del negocio
- Aislamiento total de datos entre clientes (multi-tenant real)
- Soporte real por WhatsApp (sin bots)
- Complemento de presencia digital (páginas web)

---

## 2. Usuarios objetivo

| Tipo | Descripción |
|------|-------------|
| **Cliente final** | Dueño de micro-empresa colombiana (retail, restaurante, construcción, veterinaria) |
| **Superadmin** | DeyvidMendez — gestiona todas las cuentas desde el mismo sistema |

---

## 3. Actividades económicas soportadas

```
retail_ropa         → Retail — Ropa y accesorios     👗
retail_supermercado → Retail — Supermercado           🛒
retail_joyeria      → Retail — Joyería                💎
restaurante         → Restaurante                     🍽️
construccion        → Construcción / Inmobiliaria      🏗️
veterinaria         → Veterinaria                     🐾
```

Cada actividad recibe una interfaz diferenciada en Home, Sidebar y módulos especiales.

---

## 4. Planes de suscripción

| Plan | Mensual | Anual/mes | Descuento |
|------|---------|-----------|-----------|
| Chispa ⚡ | $49.000 COP | $42.000 COP | −15% |
| Fuego 🔥 | $129.000 COP | $110.000 COP | −15% |
| Cosmos 🌌 | $249.000 COP | $212.000 COP | −15% |

### Límites por plan

| Feature | Chispa | Fuego | Cosmos |
|---------|--------|-------|--------|
| Almacenes | 1 | 3 | 6 |
| Usuarios | 2 | 6 | 12 |
| Kardex / trazabilidad | ❌ | ✅ | ✅ |
| Multi-sucursal | ❌ | ✅ | ✅ |
| Ticket personalizado | ❌ | ✅ | ✅ |
| App móvil optimizada | ❌ | ❌ | ✅ |
| Onboarding personalizado | ❌ | ❌ | ✅ |
| SLA 99.9% | ❌ | ❌ | ✅ |
| Almacén extra | N/A | N/A | +$100.000/mes |

---

## 5. Módulos del sistema

### 5.1 POS (Punto de Venta)
- Selección de productos por categoría
- Carrito de compras con cantidades
- Cobro con múltiples métodos de pago (efectivo, transferencia, QR)
- Cálculo automático de cambio
- Emisión de ticket (PDF / impresora térmica)
- Módulo restaurante: mesas, comandas, cocina en tiempo real

### 5.2 Inventario y Almacenes
- CRUD de productos con imagen y código
- Multi-almacén por sucursal
- Ajustes de stock (entrada / salida / traslado)
- Kardex: trazabilidad completa de movimientos
- Serialización por pieza (para joyería)
- Alertas de stock mínimo

### 5.3 Clientes y Proveedores
- CRUD de clientes con historial de compras
- CRUD de proveedores
- Módulo veterinaria: ficha de mascotas por cliente

### 5.4 Reportes y Dashboard
- KPIs en tiempo real: ventas del día, semana, mes
- Gráficas de ventas por período
- Top productos más vendidos
- Ticket promedio, margen bruto
- Reportes diferenciados por actividad económica
- Arqueo / cierre de caja (resumen del turno)

### 5.5 Configuración
- Gestión de usuarios y roles (cajero, supervisor, administrador)
- Sucursales y cajas registradoras
- Categorías y productos
- Impresoras (tickets)
- Ticket personalizado con logo

### 5.6 Módulos especiales por actividad

**Construcción / Inmobiliaria:**
- Propiedades (CRUD con imágenes)
- Proyectos de obra con fases
- Arrendamientos
- Personal de obra

**Restaurante:**
- Gestión de mesas
- Comandas por mesa
- Pantalla de cocina (realtime)
- Editor de menú
- Suministros / insumos
- Cierre del día

### 5.7 Soporte y Comunicación
- Chat empresa ↔ superadmin
- Mensajería interna por empresa

---

## 6. Panel Superadmin (/saas)

Acceso exclusivo del superadmin para gestionar su negocio SaaS:

- Ver todos los clientes con estado de suscripción
- Registrar pagos manuales
- Eximir cobros
- Reactivar cuentas en mora
- Alertas de próximos vencimientos
- Regenerar contraseña de cliente
- Crear cliente manualmente (con modal de credenciales)
- Prospectos de ventas
- Finanzas y rentabilidad
- Mensajes internos

---

## 7. Servicio web complementario

| Servicio | Precio base | Con Fuego (−25%) | Con Cosmos (−35%) |
|----------|------------|-----------------|-------------------|
| Landing page | $1.200.000 | ~$900.000 | ~$780.000 |
| Portafolio | $2.200.000 | ~$1.650.000 | ~$1.430.000 |
| Tienda virtual | $3.800.000 | ~$2.850.000 | ~$2.470.000 |
| Mantenimiento | $180.000/mes | $120.000 c/2 meses | $90.000 c/3 meses |

---

## 8. Flujo de onboarding automático (Wompi)

1. Cliente elige plan en la landing → llena formulario
2. Paga en checkout Wompi
3. Webhook APPROVED → sistema crea empresa + usuario admin + sucursal + almacén
4. Cliente recibe credenciales en `/pago-exitoso` (usuario + contraseña aleatoria)
5. Cliente ingresa al sistema listo para usar

---

## 9. Seguridad y privacidad

- Aislamiento total de datos por `id_empresa` (multi-tenant)
- Contraseñas hasheadas con PBKDF2 (100.000 iteraciones, sal aleatoria)
- RLS activo en todas las tablas de Supabase
- Páginas legales: `/privacidad` y `/terminos` (Ley 1581/2012, Colombia)
- Checkbox de aceptación obligatorio en registro

---

## 10. Restricciones y reglas de negocio

- Sin permanencia — el cliente puede cancelar cuando quiera
- Sin contrato — mes a mes o anual con descuento
- Superadmin es el único con visión cross-empresa
- Los datos de un cliente NUNCA son visibles para otro cliente
- Las contraseñas son PBKDF2 — no se pueden recuperar, solo regenerar
