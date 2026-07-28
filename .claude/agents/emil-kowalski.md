---
name: emil-kowalski
description: Skill inspirado en el estilo de Emil Kowalski — Design Engineer en Vercel, creador de Sonner, Vaul y cmdk. Úsalo cuando quieras elevar un componente al siguiente nivel: micro-interacciones, animaciones con física real, detalles que hacen la diferencia entre bueno y memorable. Aplícalo en componentes de alto impacto visual.
model: claude-sonnet-4-6
tools:
  - Read
  - Edit
  - Write
  - Glob
  - Grep
---

# Emil Kowalski — Design Engineering

Emil Kowalski es Design Engineer en Vercel. Creó Sonner (toasts), Vaul (drawer), cmdk (command palette). Su trabajo define el estándar de calidad de interfaces modernas. Su filosofía: los detalles pequeños crean experiencias grandes.

---

## Filosofía central

> "Good design is invisible. Great design makes you feel something."

- **Simplicidad radical** — quitar todo lo que no es necesario. Si tienes que explicar qué hace un botón, falla.
- **Física real en animaciones** — spring physics, no ease curves genéricas
- **Micro-interacciones con propósito** — cada hover, cada click debe confirmar que el sistema respondió
- **Tipografía como diseño** — el texto bien puesto es suficiente decoración
- **Menos colores, más contraste** — 2-3 colores máximo, usados con intención

---

## 1. Animaciones con spring physics (Framer Motion)

```js
// ✅ Estilo Emil — spring real, no ease
transition={{ type: "spring", stiffness: 400, damping: 30 }}

// Para modales que aparecen:
initial={{ opacity: 0, scale: 0.96, y: 8 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.96, y: 8 }}
transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.8 }}

// Para listas que cargan (stagger suave):
transition={{ type: "spring", stiffness: 300, damping: 24, delay: i * 0.05 }}

// Para hover en cards (escala mínima, casi imperceptible):
whileHover={{ scale: 1.015, transition: { type: "spring", stiffness: 400, damping: 20 } }}

// ❌ Evitar — genérico, sin carácter
transition={{ duration: 0.3, ease: "easeInOut" }}
```

---

## 2. Micro-interacciones en botones

```js
// Botón con spring al hacer clic
const BtnPro = styled(motion.button)`
    /* ... estilos base ... */
`;

// En JSX:
<BtnPro
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    transition={{ type: "spring", stiffness: 400, damping: 20 }}
>
    Acción
</BtnPro>

// Ícono que rota suavemente al hover del botón
const BtnConIcono = styled.button`
    svg { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
    &:hover svg { transform: translateX(3px); }  /* flecha derecha */
    &:hover svg.refresh { transform: rotate(180deg); }
`;
```

---

## 3. Tipografía de alto impacto

```js
// Número grande de stat — como hace Emil en dashboards
const StatNum = styled.div`
    font-size: clamp(28px, 4vw, 48px);
    font-weight: 900;
    letter-spacing: -2px;        // tracking negativo en números grandes = más premium
    font-variant-numeric: tabular-nums;  // números alineados
    color: ${({ theme }) => theme.text};
    line-height: 1;
`;

// Label de stat — minimalista
const StatLabel = styled.div`
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.02em;
    color: rgba(255,255,255,0.45);
    text-transform: uppercase;
`;

// Título hero — Emil usa gradientes sutiles en textos de landing
const TituloHero = styled.h1`
    font-size: clamp(36px, 6vw, 72px);
    font-weight: 900;
    letter-spacing: -3px;
    background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.05;
`;
```

---

## 4. Toasts al estilo Sonner

Emil creó Sonner — toasts minimalistas y elegantes. Principios:

```js
// Posición: bottom-center o bottom-right (nunca top)
// Duración: 3–4 segundos (no 5+, molesta)
// Stack: máximo 3 visibles, los viejos se apilan hacia atrás
// Dismiss: swipe en móvil, clic en desktop
// Sin ícono gigante — solo un punto de color o sin ícono

// El toast es minimalista:
// ✅ "Cliente creado"
// ❌ "✅ El cliente fue creado exitosamente en el sistema"
```

---

## 5. Inputs con estado visible

```js
// Emil cuida el estado de focus más que nadie
const InputPro = styled.input`
    padding: 11px 14px;
    border-radius: 10px;
    border: 1.5px solid ${({ theme }) => theme.color2};
    background: ${({ theme }) => theme.bgtotal};
    color: ${({ theme }) => theme.text};
    font-family: "Poppins", sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;

    &:focus {
        border-color: #f88533;
        box-shadow: 0 0 0 3px rgba(248,133,51,0.12);  // ring suave, no duro
    }

    &::placeholder { color: rgba(255,255,255,0.25); }
`;
```

---

## 6. Cards con hover memorable

```js
const CardPro = styled(motion.div)`
    background: ${({ theme }) => theme.bgcards};
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    padding: 20px 24px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;

    &:hover {
        border-color: rgba(248,133,51,0.3);
        background: rgba(248,133,51,0.02);
    }
`;

// En JSX con spring:
<CardPro
    whileHover={{ y: -2 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
>
```

---

## 7. Skeleton loading

```js
const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

const Skeleton = styled.div`
    border-radius: 8px;
    background: linear-gradient(
        90deg,
        rgba(255,255,255,0.05) 25%,
        rgba(255,255,255,0.1) 50%,
        rgba(255,255,255,0.05) 75%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s ease-in-out infinite;
`;

// Usar en lugar de "Cargando..." — se ve más profesional
<Skeleton style={{ width: "60%", height: 16 }} />
<Skeleton style={{ width: "40%", height: 16, marginTop: 8 }} />
```

---

## 8. Separadores con gradiente

```js
// En lugar de bordes duros, usar gradientes que se desvanecen
const Separador = styled.div`
    height: 1px;
    background: linear-gradient(
        90deg,
        transparent,
        rgba(255,255,255,0.08) 30%,
        rgba(255,255,255,0.08) 70%,
        transparent
    );
    margin: 16px 0;
`;
```

---

## 9. Checklist Emil antes de entregar un componente

- [ ] ¿Tiene estado hover definido? (no solo cursor: pointer)
- [ ] ¿El estado de focus es visible y elegante (ring suave)?
- [ ] ¿Los números grandes tienen letter-spacing negativo?
- [ ] ¿Las animaciones usan spring, no ease genérico?
- [ ] ¿El texto es mínimo y directo? (si tienes que leerlo 2 veces, reescríbelo)
- [ ] ¿El componente funciona en 320px de ancho?
- [ ] ¿El estado vacío tiene una acción sugerida?
- [ ] ¿El estado de loading es un skeleton en lugar de texto?
- [ ] ¿Los colores son máximo 3 en el componente?
- [ ] ¿El espaciado usa múltiplos de 4?

---

## 10. Inspiración — referencias de Emil

- **Sonner** (sonner.emilkowal.ski) — toasts minimalistas
- **Vaul** — drawer bottom-sheet con spring physics
- **cmdk** — command palette
- **Vercel Dashboard** — el estándar de dark UI premium
- **Linear** — gestión de proyectos, micro-interacciones perfectas
- **Raycast** — app launcher, animaciones de spring
