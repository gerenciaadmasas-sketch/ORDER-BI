# Esquema Backend
## ORDER BI — Estructura de datos, tablas y relaciones

---

## 1. Arquitectura general

```
Supabase PostgreSQL — multi-tenant
Proyecto: souwqzfmxsorhelmidqq (us-east-2)
URL: https://souwqzfmxsorhelmidqq.supabase.co

Aislamiento: todas las tablas filtran por id_empresa
RLS: activo en las 30+ tablas
```

---

## 2. Jerarquía de datos

```
empresa (tenant root)
├── usuarios                    (admin, supervisor, cajero)
├── suscripciones               (plan, estado de pago)
├── sucursales
│   └── almacenes
│       ├── productos_almacen   (stock por almacén)
│       └── sesiones_caja       (turnos de caja)
├── categorias
├── productos                   (con imagen en Storage)
│   └── imagenes_producto
├── clientes
├── proveedores
├── ventas
│   └── detalle_ventas          (items de la venta)
├── kardex                      (trazabilidad de movimientos)
├── pagos_clientes              (pagos de suscripción)
├── mensajes_soporte            (chat empresa↔superadmin)
├── mensajes_internos           (mensajería interna)

-- Módulo Inmobiliaria (construccion)
├── propiedades
├── proyectos_obra
│   ├── fases_proyecto
│   └── personal_proyecto
└── arrendamientos

-- Módulo Restaurante
├── categorias_menu
├── items_menu
├── mesas
├── comandas
│   └── items_comanda
├── suministros
└── compras_suministros

-- Tablas globales (sin id_empresa)
prospectos                      (leads del SaaS)
wompi_transacciones_pendientes  (pagos en proceso)
config_planes                   (features por tier — solo superadmin)
```

---

## 3. Tablas principales — columnas y relaciones

### `empresa`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | integer PK | ID del tenant |
| razon_social | text | Nombre de la empresa |
| nit | text | NIT o cédula |
| telefono | text | |
| direccion | text | |
| ciudad | text | |
| logo_url | text | URL imagen en Supabase Storage |
| id_usuario | integer FK→usuarios | Admin principal |
| created_at | timestamptz | |

### `usuarios`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | integer PK | |
| id_auth | text | UUID de Supabase Auth |
| usuario | text | Nombre de usuario (NombreApellido) |
| email | text | `usuario@empXXX.pos` |
| nombres | text | |
| apellidos | text | |
| nro_doc | text | Cédula |
| tipo | text | `superadmin / administrador / supervisor / cajero` |
| id_empresa | integer FK→empresa | Tenant |
| id_sucursal | integer FK→sucursales | |
| id_almacen | integer FK→almacenes | |
| permisos | jsonb | `{ventas, cobrar_venta, configuracion, ...}` |
| created_at | timestamptz | |

**Permisos disponibles:**
```json
{
  "ventas": true,
  "cobrar_venta": true,
  "configuracion": true,
  "impresoras": true,
  "empresa": true,
  "categorias": true,
  "productos": true,
  "clientes": true,
  "proveedores": true,
  "sucursales_cajas": true,
  "usuarios": true,
  "almacenes": true,
  "inventario": true,
  "kardex": true,
  "dashboard": true,
  "config_ticket": true,
  "serializacion": true
}
```

### `suscripciones`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | integer PK | |
| id_empresa | integer FK→empresa | |
| nombre_cliente | text | |
| apellido_cliente | text | |
| cedula_cliente | text | |
| telefono | text | |
| plan | text | `mensual / anual` |
| tipo_plan | text | `chispa / fuego / cosmos` |
| valor_mensual | numeric | |
| costo_implementacion | numeric | |
| estado | text | `al_dia / por_vencer / en_mora / cancelado` |
| fecha_proximo_pago | date | |
| actividad_economica | text | |
| usuario_admin | text | Username del admin |
| password_admin | text | Hash PBKDF2 |
| email_admin | text | `usuario@empXXX.pos` |
| descuento_pct | numeric | Descuento aplicado |
| notas | text | |
| created_at | timestamptz | |

**RLS:**
- SELECT: solo superadmin (tenant no puede leer suscripción propia)
- INSERT / UPDATE / DELETE: solo superadmin

### `sucursales`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | integer PK | |
| id_empresa | integer FK→empresa | |
| razon_social | text | Nombre de la sucursal |
| direccion | text | |
| telefono | text | |
| created_at | timestamptz | |

### `almacenes`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | integer PK | |
| id_empresa | integer FK→empresa | |
| id_sucursal | integer FK→sucursales | |
| nombre | text | |
| created_at | timestamptz | |

### `categorias`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | integer PK | |
| id_empresa | integer FK→empresa | |
| nombre | text | |
| descripcion | text | |
| created_at | timestamptz | |

### `productos`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | integer PK | |
| id_empresa | integer FK→empresa | |
| id_categoria | integer FK→categorias | |
| nombre | text | |
| precio | numeric | |
| costo | numeric | |
| codigo | text | Código de barras / referencia |
| imagen_url | text | URL Supabase Storage |
| serializado | boolean | Para joyería |
| created_at | timestamptz | |

### `productos_almacen` (stock)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | integer PK | |
| id_empresa | integer FK→empresa | |
| id_producto | integer FK→productos | |
| id_almacen | integer FK→almacenes | |
| cantidad | numeric | Stock actual |
| stock_minimo | numeric | Alerta cuando baja de aquí |
| created_at | timestamptz | |

### `ventas`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | integer PK | |
| id_empresa | integer FK→empresa | |
| id_sucursal | integer FK→sucursales | |
| id_almacen | integer FK→almacenes | |
| id_usuario | integer FK→usuarios | Cajero |
| id_cliente | integer FK→clientes | Opcional |
| total | numeric | |
| metodo_pago | text | `efectivo / transferencia / qr` |
| pagado_con | numeric | Monto recibido |
| cambio | numeric | Vuelto |
| estado | text | `completada / anulada` |
| created_at | timestamptz | |

### `detalle_ventas`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | integer PK | |
| id_venta | integer FK→ventas | |
| id_producto | integer FK→productos | |
| cantidad | numeric | |
| precio_unitario | numeric | |
| subtotal | numeric | |

### `kardex`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | integer PK | |
| id_empresa | integer FK→empresa | |
| id_producto | integer FK→productos | |
| id_almacen | integer FK→almacenes | |
| tipo | text | `entrada / salida / ajuste / traslado / venta` |
| cantidad | numeric | |
| stock_anterior | numeric | |
| stock_nuevo | numeric | |
| motivo | text | |
| created_at | timestamptz | |

### `sesiones_caja`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | integer PK | |
| id_empresa | integer FK→empresa | |
| id_usuario | integer FK→usuarios | |
| id_sucursal | integer FK→sucursales | |
| apertura | numeric | Monto inicial |
| cierre | numeric | Monto final |
| fecha_apertura | timestamptz | |
| fecha_cierre | timestamptz | |
| estado | text | `abierta / cerrada` |

### `pagos_clientes` (pagos de suscripción SaaS)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | integer PK | |
| id_suscripcion | integer FK→suscripciones | |
| monto | numeric | |
| metodo | text | `efectivo / transferencia / qr / wompi` |
| notas | text | |
| fecha_pago | timestamptz | |

---

## 4. Tablas del módulo Restaurante

### `mesas`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | integer PK | |
| id_empresa | integer FK→empresa | |
| numero | integer | Número de mesa |
| nombre | text | Alias opcional |
| estado | text | `libre / ocupada / reservada` |
| capacidad | integer | |

### `comandas`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | integer PK | |
| id_empresa | integer FK→empresa | |
| id_mesa | integer FK→mesas | |
| id_usuario | integer FK→usuarios | |
| estado | text | `abierta / en_cocina / lista / cerrada` |
| total | numeric | |
| metodo_pago | text | |
| pagado_con | numeric | |
| cambio | numeric | |
| created_at | timestamptz | |

### `items_comanda`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | integer PK | |
| id_comanda | integer FK→comandas | |
| id_item | integer FK→items_menu | |
| cantidad | integer | |
| precio_unitario | numeric | |
| notas | text | Instrucciones especiales |
| estado | text | `pendiente / en_preparacion / listo` |

### `suministros`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid PK | |
| id_empresa | integer FK→empresa | |
| nombre | text | |
| unidad | text | `unidades / kg / litros / etc` |
| stock_actual | numeric | |
| stock_minimo | numeric | |
| precio_promedio | numeric | |
| created_at | timestamptz | |

---

## 5. Tablas globales (sin RLS tenant)

### `wompi_transacciones_pendientes`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | integer PK | |
| reference | text UNIQUE | `POS-xxx-xxxx` |
| nombre | text | |
| apellido | text | |
| cedula | text | |
| telefono | text | |
| empresa | text | |
| plan | text | `chispa / fuego / cosmos` |
| billing | text | `mensual / anual` |
| actividad_economica | text | |
| prospecto_id | integer FK→prospectos | |
| estado | text | `pendiente / procesado / fallido` |
| wompi_transaction_id | text | ID de Wompi |
| usuario_admin | text | Credencial temporal (post-pago) |
| password_admin | text | Contraseña plain — solo para /pago-exitoso |
| created_at | timestamptz | |

**RLS:** SELECT solo via RPC `get_onboarding_credentials(reference)` — SECURITY DEFINER

### `prospectos`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | integer PK | |
| nombre | text | |
| telefono | text | |
| empresa | text | |
| plan_interes | text | |
| estado | text | `nuevo / contactado / demo / cerrado / perdido` |
| notas | text | |
| created_at | timestamptz | |

### `config_planes`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | integer PK | |
| tipo_plan | text | `chispa / fuego / cosmos` |
| max_usuarios | integer | |
| max_almacenes | integer | |
| kardex | boolean | |
| multi_sucursal | boolean | |
| ticket_personalizado | boolean | |
| precio_mensual | numeric | |
| precio_anual | numeric | |

---

## 6. Funciones SQL (RPC)

| Función | Tipo | Descripción |
|---------|------|-------------|
| `get_mi_empresa()` | STABLE | Retorna `id_empresa` del usuario autenticado |
| `es_superadmin()` | STABLE | Retorna boolean si es superadmin |
| `get_onboarding_credentials(p_reference)` | SECURITY DEFINER | Credenciales post-pago para anon |
| `admin_reset_password(p_email, p_new_password)` | SECURITY DEFINER | Reset contraseña en auth.users (solo superadmin) |
| `get_descuento_web(p_usuario)` | STABLE | Descuento web según plan activo |

---

## 7. Edge Functions (Deno)

| Función | Trigger | Descripción |
|---------|---------|-------------|
| `wompi-sign` | HTTP POST | Genera hash + crea transacción pendiente + prospecto |
| `wompi-webhook` | HTTP POST (Wompi) | Activa cliente al pago aprobado |
| `limpiar-mensajes-internos` | Cron semanal | Limpia mensajes viejos |

---

## 8. Storage (Supabase)

| Bucket | Acceso | Uso |
|--------|--------|-----|
| productos | Público | Imágenes de productos |
| empresas | Público | Logos de empresa |

---

## 9. Realtime

| Canal | Tabla | Uso |
|-------|-------|-----|
| `mensajes_internos:id_empresa=eq.X` | mensajes_internos | Chat en tiempo real |
| `comandas:id_empresa=eq.X` | comandas | Cocina → órdenes en tiempo real |

---

## 10. Políticas RLS clave

```sql
-- Política estándar de tenant (todas las tablas)
CREATE POLICY "tenant_isolation" ON tabla
    USING (id_empresa = get_mi_empresa());

-- Política superadmin (tabla suscripciones)
CREATE POLICY "superadmin_all" ON suscripciones
    USING (es_superadmin());

-- Sin RLS por defecto para tabla X
ALTER TABLE X ENABLE ROW LEVEL SECURITY;
```
