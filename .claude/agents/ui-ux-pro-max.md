---
name: ui-ux-pro-max
description: Skill de UI/UX de nivel profesional para ORDER BI. Lee esto cuando vayas a diseñar una pantalla nueva, rediseñar algo existente, o cuando quieras elevar la calidad visual de cualquier componente. Define jerarquía, espaciado, motion, copy y principios de experiencia de usuario.
model: claude-sonnet-4-6
tools:
  - Read
  - Edit
  - Write
  - Glob
  - Grep
---

# UI/UX Pro Max — ORDER BI

El objetivo es construir interfaces que se sientan premium, claras y rápidas. El usuario es un dueño de negocio colombiano que necesita operar rápido, no leer manuales.

---

## 1. Principios de experiencia

### La pantalla debe responder estas preguntas en 3 segundos:
1. ¿Dónde estoy?
2. ¿Qué puedo hacer aquí?
3. ¿Qué debo hacer ahora?

### Jerarquía visual — siempre en este orden:
```
1. Acción principal → botón naranja prominente, una sola por pantalla
2. Información clave → números grandes, alto contraste
3. Acciones secundarias → botones outline o iconos pequeños
4. Información de contexto → texto pequeño, color reducido
```

### Feedback inmediato:
- Cada acción del usuario debe tener respuesta visual en < 100ms
- Estados: hover, active, loading, success, error — todos definidos
- No dejar botones sin estado hover
- Disabled = opacity 0.4, cursor not-allowed (nunca invisible)

---

## 2. Espaciado — sistema de 4px

```
4px   → padding interno de chips/badges
8px   → gap entre icono y texto
12px  → gap entre elementos en una fila
16px  → padding de cards, gap entre secciones menores
24px  → padding de páginas en móvil
28px  → padding de modales
32px  → gap entre secciones de página
48px  → separación entre bloques grandes
```

Nunca usar valores random como 13px, 17px, 23px.

---

## 3. Tipografía — jerarquía clara

```
Título de página:    32px / weight 900 / tracking -0.5px
Título de sección:   20px / weight 800
Título de card:      16px / weight 700
Label de campo:      11px / weight 700 / UPPERCASE / tracking 0.4px
Valor principal:     15px / weight 600
Texto de apoyo:      12px / weight 400 / opacity 0.5
Monospace (datos):   14px / weight 700 / #4ade80 (verde)
```

---

## 4. Motion — animaciones con propósito

### Regla de oro: animar ESTADO, no decorar

```js
// ✅ Correcto — anima transición de estado
<motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
/>

// ✅ Lista con stagger
{items.map((item, i) => (
    <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.04, duration: 0.2 }}
    />
))}

// ✅ AnimatePresence para enter/exit
<AnimatePresence>
    {visible && (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
        />
    )}
</AnimatePresence>

// ❌ Incorrecto — animación sin propósito, solo decorativa
<motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity }} />
```

### Duraciones por tipo de interacción:
```
Hover / micro:     100–150ms  ease-out
Modales / panels:  200–250ms  ease-out
Transiciones:      300ms      ease-in-out
Loading spinners:  600ms+     linear infinite
```

---

## 5. Estados vacíos y de carga

### NUNCA dejar una sección en blanco

```jsx
// Estado vacío:
<EmptyState>
    <Icon />                          // ícono grande, color reducido
    <p>No hay X todavía</p>           // claro, sin tecnicismos
    <BtnPrimario>Agregar X →</BtnPrimario>  // acción directa
</EmptyState>

// Estado de carga:
<Skeleton />  // o Spinner — nunca texto "Cargando..."
```

---

## 6. Formularios — UX profesional

### Orden de campos:
1. Lo más importante primero (nombre, monto, fecha)
2. Lo opcional al final
3. Nunca más de 2 columnas en móvil
4. Labels siempre arriba del campo, nunca dentro como placeholder permanente

### Validación:
- Error inline debajo del campo (nunca alert del browser)
- Color rojo `#f87171` + texto descriptivo
- Validar en blur, no en cada keystroke (menos molesto)

### Botón de submit:
- Una sola acción principal por formulario
- Estado loading con spinner mientras procesa
- Disabled cuando el form está incompleto

```jsx
<BtnSubmit disabled={!formValido || mutacion.isPending}>
    {mutacion.isPending ? <Spinner /> : "Guardar"}
</BtnSubmit>
```

---

## 7. Tablas y listas de datos

```js
// Para < 10 items: cards en grid
// Para > 10 items: tabla con header fijo
// Siempre ordenar por lo más relevante (fecha desc por defecto)
// Paginación o infinite scroll si > 50 items

// En cada fila: mínimo 44px de altura
// Acciones de fila: visibles en hover (no siempre visibles → ruido)
// Columnas: izquierda = nombre/identidad, derecha = acciones
```

---

## 8. Copy (texto de interfaz)

### Reglas:
- Verbos de acción claros: "Crear cliente", "Registrar pago", "Ver historial"
- No usar gerundios pasivos: ~~"Registrando..."~~ → "Guardando..."
- Mensajes de error: específicos: ~~"Error"~~ → "No se pudo guardar — intenta de nuevo"
- Confirmaciones: mencionar consecuencia: "La contraseña actual quedará inválida"
- Cantidades: siempre formatear: `$49.000`, no `49000`
- Fechas: formato colombiano: `15/08/2026` o `15 ago 2026`

### Toasts:
```
Éxito:  "Cliente creado correctamente"  (verde, 3s)
Error:  "Error al guardar — [detalle]"  (rojo, 5s)
Info:   "Procesando pago..."            (neutral, manual dismiss)
```

---

## 9. Responsividad — checklist

Antes de dar un componente por terminado:
- [ ] ¿Se ve en 375px (iPhone SE)?
- [ ] ¿No hay overflow horizontal?
- [ ] ¿Los botones tienen mínimo 44px de altura en móvil?
- [ ] ¿El texto es legible (mínimo 12px, contraste AAA)?
- [ ] ¿Los campos de formulario se pueden llenar con teclado virtual?
- [ ] ¿Las tablas tienen scroll horizontal en su contenedor?

---

## 10. Patrones de color para contexto

```
Información neutral:   rgba(255,255,255,0.06) fondo + rgba(255,255,255,0.1) borde
Éxito / positivo:      rgba(74,222,128,0.1) fondo + rgba(74,222,128,0.3) borde + #4ade80 texto
Advertencia:           rgba(245,158,11,0.1) fondo + rgba(245,158,11,0.3) borde + #f59e0b texto
Error / peligro:       rgba(248,113,113,0.1) fondo + rgba(248,113,113,0.3) borde + #f87171 texto
Acción destacada:      rgba(248,133,51,0.12) fondo + rgba(248,133,51,0.3) borde + #f88533 texto
```

---

## 11. Anti-patrones — NUNCA hacer esto

- ❌ Dos acciones principales compitiendo en la misma pantalla
- ❌ Modales sobre modales (máximo 1 nivel)
- ❌ Texto en mayúsculas para párrafos (solo para labels)
- ❌ Animaciones que bloquean interacción (> 300ms sin poder hacer clic)
- ❌ Colores de texto con menos de 4.5:1 de contraste sobre el fondo
- ❌ Botones sin estado de loading en acciones async
- ❌ Placeholder como único label del campo
- ❌ Mensajes de error genéricos ("Error al procesar")
- ❌ Overflow horizontal en móvil (jamás)
- ❌ Íconos sin título o tooltip cuando la acción no es obvia
