---
name: frontend-design
description: Skill de diseño frontend para ORDER BI. Úsalo cuando vayas a crear o modificar componentes React — te da las reglas, patrones y restricciones del sistema de diseño del proyecto. Lee esto ANTES de escribir cualquier styled component, layout, o estructura JSX.
model: claude-sonnet-4-6
tools:
  - Read
  - Edit
  - Write
  - Glob
  - Grep
---

# Frontend Design — ORDER BI

Eres el experto de frontend de este proyecto. Cada componente que construyas debe verse y sentirse como parte del mismo sistema, no como piezas sueltas.

---

## Stack activo

- React 19 + Vite (Rolldown)
- Styled Components v6 (CSS-in-JS, ThemeProvider)
- Framer Motion v12 (`motion/react`)
- react-icons/ri (primario) + @iconify/react (secundario)
- TanStack Query v5 (server state)
- Zustand (client state)

---

## Sistema de colores — SIEMPRE usar estas variables

```js
// Primarios
naranja:  #f88533   // CTA, acentos, botones principales
lavanda:  #DAC1FF   // elementos secundarios
verde:    #4ade80   // éxito, contraseñas, "al día"
amarillo: #fbbf24   // advertencias, plan Chispa
rojo:     #f87171   // error, mora
indigo:   #818cf8   // plan Cosmos

// Planes
Chispa ⚡ → #fbbf24
Fuego 🔥  → #f88533
Cosmos 🌌 → #818cf8

// Siempre usar theme.* para valores que cambian con dark/light
theme.bgtotal       // fondo de página
theme.bgcards       // fondo de tarjetas
theme.text          // texto principal
theme.colorsubtitlecard  // texto secundario/labels
theme.color2        // bordes
```

---

## Botones — patrones aprobados

```js
// Botón primario (naranja con sombra flat-3D)
const BtnPrimario = styled.button`
    padding: 14px 24px; border-radius: 14px;
    border: 2px solid #B56B12; background: #E8891A;
    color: #fff; font-weight: 800; font-family: "Poppins", sans-serif;
    box-shadow: 4px 4px 0 #B56B12;
    cursor: pointer;
    transition: filter 0.15s, transform 0.1s, box-shadow 0.1s;
    &:hover  { filter: brightness(1.1); transform: translateY(-1px); }
    &:active { box-shadow: 2px 2px 0 #B56B12; transform: translate(2px,2px); }
`;

// Botón WhatsApp
const BtnWA = styled.button`
    background: rgba(37,211,102,0.1); border: 2px solid #25D366;
    color: #25D366; font-weight: 700; cursor: pointer;
    &:hover { background: rgba(37,211,102,0.2); }
`;

// Botón icono pequeño (acción en tarjeta)
const BtnIcono = styled.button`
    width: 32px; height: 32px; border-radius: 8px; border: none;
    background: rgba(255,255,255,0.06); color: ${({ theme }) => theme.colorsubtitlecard};
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    &:hover { background: rgba(255,255,255,0.12); color: ${({ theme }) => theme.text}; }
`;
```

---

## Cards

```js
const Card = styled.div`
    background: ${({ theme }) => theme.bgcards};
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 20px 24px;
    display: flex; flex-direction: column; gap: 12px;
`;
```

---

## Modales — overlay siempre fixed

```js
const Overlay = styled.div`
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.65);
    display: flex; align-items: center; justify-content: center;
    z-index: 500; padding: 16px;
`;

const Modal = styled.div`
    background: ${({ theme }) => theme.bgcards};
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 20px; padding: 28px;
    width: 100%; max-width: 480px;
    display: flex; flex-direction: column; gap: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
`;
```

---

## Labels y campos de formulario

```js
const Campo = styled.div`
    display: flex; flex-direction: column; gap: 5px;
    label {
        font-size: 11px; font-weight: 700; text-transform: uppercase;
        color: ${({ theme }) => theme.colorsubtitlecard}; letter-spacing: 0.4px;
    }
`;

const Input = styled.input`
    padding: 10px 14px; border-radius: 10px;
    border: 1.5px solid ${({ theme }) => theme.color2};
    background: ${({ theme }) => theme.bgtotal}; color: ${({ theme }) => theme.text};
    font-size: 13px; font-family: "Poppins", sans-serif; outline: none;
    &:focus { border-color: #f88533; }
`;
```

---

## Dropdown — NUNCA usar `<select>` nativo

```jsx
const [open, setOpen] = useState(false);
const ref = useRef(null);
useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
}, []);

<DropWrap ref={ref}>
    <SelectorBtn onClick={() => setOpen(v => !v)}>
        <span>{seleccionActual}</span>
        <RiArrowDownSLine />
    </SelectorBtn>
    {open && (
        <DropMenu>
            {opciones.map(o => (
                <DropItem key={o.key} $activo={valor === o.key}
                    onClick={() => { setValor(o.key); setOpen(false); }}>
                    {o.label}
                </DropItem>
            ))}
        </DropMenu>
    )}
</DropWrap>
```

---

## Iconos — reglas estrictas

| Uso | Ícono | Import |
|-----|-------|--------|
| Eliminar | `RiDeleteBin2Line` | react-icons/ri |
| Editar | `RiEditLine` | react-icons/ri |
| Cerrar / X | `RiCloseLine` | react-icons/ri |
| Refresh | `RiRefreshLine` | react-icons/ri |
| WhatsApp | `RiWhatsappLine` | react-icons/ri |
| Escudo | `RiShieldLine` | react-icons/ri |
| Flecha abajo | `RiArrowDownSLine` | react-icons/ri |

NUNCA usar calaveras ni íconos confusos para eliminar.

---

## Responsive — siempre

```js
// NUNCA dejar overflow horizontal en móvil
// Grids de cards:
grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
@media (max-width: 480px) { grid-template-columns: 1fr; }

// Botones e inputs en móvil: mínimo 44px de altura
// Textos largos: word-break: break-word
// Tablas: overflow-x: auto en el contenedor
```

---

## Fuente

```css
font-family: "Poppins", sans-serif;  /* siempre */
font-family: monospace;              /* para credenciales, códigos, precios */
```

---

## Restricciones absolutas

1. No modificar código fuera del scope del cambio pedido
2. `npm run build` debe pasar sin errores antes de cada commit
3. No agregar dependencias npm sin consultar
4. No crear comentarios que expliquen QUÉ hace el código
5. No usar emojis en código a menos que el usuario lo pida explícitamente
6. No crear archivos de documentación adicionales (ya existen en `/docs`)
7. Siempre reflejar cambios importantes en el doc correspondiente de `/docs`
