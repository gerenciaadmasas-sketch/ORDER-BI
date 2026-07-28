# UI/UX Design Brief
## ORDER BI — Sistema de diseño y guía visual

---

## 1. Principios de diseño

- **Dark mode primario** — ThemeProvider con temas Light/Dark, el oscuro es el estándar
- **Responsive real** — desktop Y móvil impecables, nunca overflow horizontal en móvil
- **Mobile-first** para uso frecuente: POS, login, inventario, reportes de turno
- **Desktop-first** para gestión: configuración, panel SaaS, reportes avanzados
- **Mínimo 44px** en botones e inputs en móvil (accesibilidad táctil)
- **Sin jerga técnica** en la UI — el cliente es un dueño de negocio, no un programador

---

## 2. Paleta de colores

### Colores principales
```
Primario (naranja):   #f88533  → CTA, botones principales, acentos
Secundario (lavanda): #DAC1FF  → Elementos secundarios, decorativos
Éxito / Plan-ok:      #9046FF  → Morado — notificaciones positivas
Error:                #F54E41  → Rojo — errores, eliminar
Ingresos:             #53B257  → Verde
Gastos:               #fe6156  → Rojo-salmón
```

### Colores de estado (suscripciones)
```
Al día:     verde  → #4ade80
Por vencer: naranja → #f59e0b
En mora:    rojo    → #f87171
Cancelado:  gris
```

### Colores de planes
```
Chispa ⚡ → #fbbf24 (amarillo)
Fuego 🔥  → #f88533 (naranja)
Cosmos 🌌 → #818cf8 (índigo)
```

### Cards y fondos (dark mode)
```
Fondo total:  theme.bgtotal
Fondo cards:  theme.bgcards
Texto:        theme.text
Subtítulos:   theme.colorsubtitlecard
Bordes:       theme.color2
```

---

## 3. Tipografía

- **Fuente principal:** Poppins (Google Fonts)
- **Fuente monospace:** Courier New / monospace (para credenciales, códigos)
- **Jerarquía:**
  - Títulos de página: 24–32px, font-weight 900
  - Subtítulos de sección: 16–18px, font-weight 700
  - Labels de campo: 11–12px, UPPERCASE, font-weight 700, letter-spacing 0.4px
  - Valores: 13–15px, font-weight 500–600
  - Texto secundario: 12px, color reducido (0.5 opacity)

---

## 4. Componentes estándar

### Botón primario (naranja con sombra)
```css
background: #E8891A;
border: 2px solid #B56B12;
box-shadow: 4px 4px 0 #B56B12;  /* estilo "comic/flat 3D" */
color: #fff;
font-weight: 800;
border-radius: 14px;
```

### Botón WhatsApp
```css
background: rgba(37,211,102,0.1);
border: 2px solid #25D366;
color: #25D366;
```

### Cards de cliente / contenido
```css
background: theme.bgcards;
border: 1px solid rgba(255,255,255,0.08);
border-radius: 20px;
padding: 20–28px;
```

### Modal overlay
```css
position: fixed; inset: 0;
background: rgba(0,0,0,0.65);
z-index: 500–600;
display: flex; align-items: center; justify-content: center;
```

### Dropdown personalizado (NUNCA usar `<select>` nativo)
```jsx
// Patrón aprobado:
const [dropOpen, setDropOpen] = useState(false);
const dropRef = useRef(null);
// useEffect para cerrar al clic fuera

<DropWrap ref={dropRef}>
    <SelectorBtn onClick={() => setDropOpen(v => !v)}>
        <span>{seleccionActual}</span>
        <RiArrowDownSLine className={dropOpen ? "abierto" : ""} />
    </SelectorBtn>
    {dropOpen && (
        <DropMenu>
            {opciones.map(o => <DropItem key={o.id}>{o.label}</DropItem>)}
        </DropMenu>
    )}
</DropWrap>
```

### Badge de estado
```css
display: inline-flex; align-items: center;
padding: 3px 10px; border-radius: 20px;
font-size: 11px; font-weight: 800;
/* Color dinámico por estado */
```

---

## 5. Iconos

- **Librería principal:** `react-icons/ri` (Remix Icons)
- **Librería secundaria:** `@iconify/react` (para iconos solares y especializados)
- **Ícono de eliminar:** SIEMPRE `RiDeleteBin2Line` — nunca calaveras u otros
- **Ícono de editar:** `RiEditLine`
- **Ícono de cerrar:** `RiCloseLine`
- **Ícono de refresh:** `RiRefreshLine`
- **Ícono de WhatsApp:** `RiWhatsappLine`
- **Ícono de escudo:** `RiShieldLine`, `RiShieldCheckLine`

---

## 6. Animaciones (Framer Motion v12)

```js
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
```

### Patterns aprobados
```js
// Entrada de lista (stagger)
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: i * 0.05 }}

// Acordeón / mostrar-ocultar
<AnimatePresence>
    {abierto && <motion.div initial={{height:0}} animate={{height:"auto"}} exit={{height:0}} />}
</AnimatePresence>

// Parallax en landing
const { scrollY } = useScroll();
const y = useTransform(scrollY, [0, 500], [0, -100]);

// TiltCard 3D (hover en cards de planes)
// whileInView + once: true para animaciones de entrada únicas
```

---

## 7. Responsive breakpoints

```css
/* Tablet */
@media (max-width: 768px) { ... }

/* Mobile */
@media (max-width: 480px) { ... }
```

### Grid de cards
```css
/* Desktop */
grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));

/* Mobile */
grid-template-columns: 1fr;
```

---

## 8. Landing page (PlanesTemplate)

### Secciones en orden
1. **Navbar** — Logo + links de planes + botón "Inicia sesión"
2. **Hero** — Título word-by-word animado, stats animados, toggle Mensual/Anual
3. **Cards de planes** — TiltCard 3D con flip, precio dinámico
4. **Comparativa** — Grid 4 ventajas vs competidores
5. **FAQ** — Acordeón con AnimatePresence
6. **Servicio Web** — Browser mockup + tabla de precios
7. **CTA final** — WhatsApp + registro
8. **Footer** — Logo + links legales + copyright

### Estilo de la landing
```css
/* Fondo oscuro con orbes animados */
background: #07090f;
/* Orbes: blur(80px) con colores del naranja y verde esmeralda */
/* Grid de líneas sutiles como fondo */
background-image: linear-gradient(rgba(248,133,51,0.03) 1px, transparent 1px), ...;
```

---

## 9. Panel SaaS (superadmin)

### Layout
```
TopBar (fijo arriba): logo + buscador + stats resumen
Contenido: StatsRow → AlertaSection → Grid de tarjetas de clientes
Sidebar: NO (el panel SaaS usa layout propio sin sidebar de módulos)
```

### Tarjeta de cliente
```
ClienteCard
├── CardTop: nombre + badge de estado
├── CardBody:
│   ├── Actividad económica
│   ├── Plan + TipoPlanPill
│   ├── Mensualidad (verde)
│   ├── Próximo pago + DiasBadge
│   ├── CredencialesBox: Usuario + Contraseña (con BtnResetPwd)
│   ├── Notas
│   └── Historial de pagos (expandible)
└── CardActions: Registrar pago + Editar + Eliminar
```

---

## 10. Modal de credenciales (patrón aprobado)

Aparece después de crear cliente o regenerar contraseña:

```
CredOverlay (fixed, backdrop oscuro, z-index 600)
└── CredModal (max-width 440px, borde verde)
    ├── CredHeader: "🎉 Cliente creado" + BtnClose (X)
    ├── CredWarning: "⚠️ Guarda esta contraseña — no podrá recuperarse"
    ├── CredRow: "USUARIO" | valor monospace verde | [Copiar]
    ├── CredRow: "CONTRASEÑA" | valor monospace verde | [Copiar]
    └── CredActions:
        ├── [WhatsApp] — solo si tiene teléfono, mensaje pre-armado
        └── [Copiar todo]
```

### Mensaje WhatsApp pre-armado
```
Hola {nombre}, tu cuenta en ORDER BI está lista 🎉

👤 Usuario: {usuario}
🔑 Contraseña: {password}

🌐 Ingresa en: https://saasdto2.vercel.app/login

¡Bienvenido!
```

---

## 11. Toasts y notificaciones

```js
// src/utils/toast.jsx
toastExito("Mensaje de éxito")   // Verde
toastError("Error", "contexto")  // Rojo
// Librería: react-hot-toast o similar
```

---

## 12. Reglas de estilo (no negociables)

- Sin comments que expliquen qué hace el código — el código se explica solo
- Sin emojis en código a menos que el usuario lo pida explícitamente
- Sin `<select>` nativo nunca
- Ícono de eliminar: siempre `RiDeleteBin2Line`
- Modales: siempre con overlay oscuro + border-radius generoso (16–24px)
- Contraseñas en UI: siempre en fuente monospace, color verde #4ade80
- Labels de campos: siempre UPPERCASE, font-weight 700, texto pequeño
