import { useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MostrarConfigPlanes, EditarPrecioTier, EditarFeaturesTier, EditarTextosTier, calcularPrecios } from "../../supabase/crudConfigPlanes";
import { toastExito } from "../../utils/toast";
import { RiEditLine, RiCheckLine, RiCloseLine } from "react-icons/ri";
import iconoGold from "../../assets/caballero.png";
import iconoPro  from "../../assets/rey.png";

const formatCOP = (n) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n ?? 0);

// Mismos valores de marca que usa la landing (PlanesTemplate.jsx → PLANES) — para
// que estas cards se vean exactamente igual, no una versión aparte.
const TIERS = {
    chispa: { img: iconoGold, nombre: "Gold", popular: false, color: "#C4A882", colorAlt: "#A8885E", glow: "rgba(196,168,130,0.35)" },
    fuego:  { img: iconoPro,  nombre: "Pro",  popular: true,  color: "#3C6E9E", colorAlt: "#2E5A80", glow: "rgba(60,110,158,0.5)"   },
};

export function PlanesConfigTemplate() {
    const queryClient = useQueryClient();
    const { data: planes = [] } = useQuery({
        queryKey: ["config-planes"],
        queryFn: MostrarConfigPlanes,
    });

    const [editandoPrecio, setEditandoPrecio] = useState(null); // planId
    const [precioDraft, setPrecioDraft]       = useState("");

    const [editandoCampo, setEditandoCampo] = useState(null); // `${planId}:${campo}`
    const [draft, setDraft]                 = useState("");

    const mutPrecio = useMutation({
        mutationFn: ({ id, precio_base }) => EditarPrecioTier({ id, precio_base }),
        onSuccess: () => {
            toastExito("Precio base actualizado");
            queryClient.invalidateQueries({ queryKey: ["config-planes"] });
            setEditandoPrecio(null);
        },
    });

    const mutFeatures = useMutation({
        mutationFn: ({ id, features }) => EditarFeaturesTier({ id, features }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["config-planes"] }),
    });

    const mutTextos = useMutation({
        mutationFn: (payload) => EditarTextosTier(payload),
        onSuccess: () => {
            toastExito("Actualizado");
            queryClient.invalidateQueries({ queryKey: ["config-planes"] });
            setEditandoCampo(null);
        },
    });

    function abrirPrecio(plan) {
        setEditandoPrecio(plan.id);
        setPrecioDraft(String(plan.precio_base ?? 0));
    }

    function abrirCampo(plan, campo) {
        setEditandoCampo(`${plan.id}:${campo}`);
        setDraft(plan[campo] ?? "");
    }

    function guardarCampo(plan, campo) {
        mutTextos.mutate({
            id:          plan.id,
            nombre:      campo === "nombre"      ? draft : (plan.nombre ?? ""),
            tagline:     campo === "tagline"     ? draft : (plan.tagline ?? ""),
            descripcion: campo === "descripcion" ? draft : (plan.descripcion ?? ""),
            para:        campo === "para"        ? draft : (plan.para ?? ""),
            cta_text:    campo === "cta_text"    ? draft : (plan.cta_text ?? ""),
        });
    }

    function toggleFeature(plan, idx) {
        const updated = (plan.features ?? []).map((f, i) =>
            i === idx ? { ...f, activo: !f.activo } : f
        );
        mutFeatures.mutate({ id: plan.id, features: updated });
    }

    return (
        <Page>
            <TopBar>
                <h1>Configuración de planes</h1>
                <p>Las cards se ven igual que en la landing. Todo lo que edites aquí (menos la imagen) se refleja ahí en vivo — usa el lápiz de cada campo.</p>
            </TopBar>

            <CardsSection>
                {planes.filter(p => p.tier !== "cosmos").map(plan => {
                    const cfg = TIERS[plan.tier] ?? TIERS.chispa;
                    const enEdicionPrecio = editandoPrecio === plan.id;
                    const baseNum = enEdicionPrecio ? (Number(precioDraft) || 0) : (plan.precio_base ?? 0);
                    const precios = calcularPrecios(baseNum);

                    return (
                        <PlanCard key={plan.id} $color={cfg.color} $glow={cfg.glow} $popular={cfg.popular}>
                            <PlanAccentBar $color={cfg.color} $popular={cfg.popular} />
                            {cfg.popular && <PopularBand>⭐ El más elegido</PopularBand>}

                            <CardInner>
                                {/* Cabecera — la imagen no se edita, el resto sí */}
                                <PlanTopRow>
                                    <PlanEmojiBox $color={cfg.color} $glow={cfg.glow}>
                                        <img src={cfg.img} alt={plan.nombre || cfg.nombre} />
                                    </PlanEmojiBox>
                                    <PlanInfo>
                                        <CampoEditable
                                            styleAs={PlanNombre} $color={cfg.color}
                                            valor={plan.nombre || cfg.nombre}
                                            editando={editandoCampo === `${plan.id}:nombre`}
                                            draft={draft} setDraft={setDraft}
                                            onAbrir={() => abrirCampo(plan, "nombre")}
                                            onGuardar={() => guardarCampo(plan, "nombre")}
                                            onCancelar={() => setEditandoCampo(null)}
                                            pending={mutTextos.isPending}
                                        />
                                        <CampoEditable
                                            styleAs={PlanTaglineNew}
                                            valor={plan.tagline || cfg.nombre}
                                            editando={editandoCampo === `${plan.id}:tagline`}
                                            draft={draft} setDraft={setDraft}
                                            onAbrir={() => abrirCampo(plan, "tagline")}
                                            onGuardar={() => guardarCampo(plan, "tagline")}
                                            onCancelar={() => setEditandoCampo(null)}
                                            pending={mutTextos.isPending}
                                        />
                                    </PlanInfo>
                                </PlanTopRow>

                                <CampoEditable
                                    styleAs={PlanDescNew} multiline
                                    valor={plan.descripcion}
                                    editando={editandoCampo === `${plan.id}:descripcion`}
                                    draft={draft} setDraft={setDraft}
                                    onAbrir={() => abrirCampo(plan, "descripcion")}
                                    onGuardar={() => guardarCampo(plan, "descripcion")}
                                    onCancelar={() => setEditandoCampo(null)}
                                    pending={mutTextos.isPending}
                                />

                                {/* Precio — click al lápiz para editar el mensual, bimestral/trimestral se calculan solos */}
                                <PrecioBloque>
                                    {enEdicionPrecio ? (
                                        <PrecioEditRow>
                                            <PrecioInput
                                                type="number" min="0" step="1000" autoFocus
                                                $color={cfg.color}
                                                value={precioDraft}
                                                onChange={e => setPrecioDraft(e.target.value)}
                                            />
                                            <PencilOk $color={cfg.color} disabled={mutPrecio.isPending}
                                                onClick={() => mutPrecio.mutate({ id: plan.id, precio_base: precioDraft })}>
                                                <RiCheckLine />
                                            </PencilOk>
                                            <PencilCancel onClick={() => setEditandoPrecio(null)}><RiCloseLine /></PencilCancel>
                                        </PrecioEditRow>
                                    ) : (
                                        <PrecioRow>
                                            <PrecioNum $color={cfg.color}>{formatCOP(plan.precio_base)}</PrecioNum>
                                            <PrecioSufijo>/mes</PrecioSufijo>
                                            <PencilBtn onClick={() => abrirPrecio(plan)}><RiEditLine /></PencilBtn>
                                        </PrecioRow>
                                    )}

                                    {/* Desglose por periodo — mismo lugar de siempre, se recalcula solo */}
                                    <DerivadosList>
                                        <DerivadoItem>
                                            <DerivadoLabel>Mensual</DerivadoLabel>
                                            <DerivadoVal $color={cfg.color}>{formatCOP(precios.mensual)}</DerivadoVal>
                                        </DerivadoItem>
                                        <DerivadoItem>
                                            <DerivadoLabel>Bimestral <Descuento>−5%</Descuento></DerivadoLabel>
                                            <DerivadoVal $color={cfg.color}>{formatCOP(precios.bimestral)}</DerivadoVal>
                                        </DerivadoItem>
                                        <DerivadoItem>
                                            <DerivadoLabel>Trimestral <Descuento>−10%</Descuento></DerivadoLabel>
                                            <DerivadoVal $color={cfg.color}>{formatCOP(precios.trimestral)}</DerivadoVal>
                                        </DerivadoItem>
                                    </DerivadosList>
                                </PrecioBloque>

                                {/* CTA — solo texto editable, no navega a pago aquí */}
                                {editandoCampo === `${plan.id}:cta_text` ? (
                                    <CampoInlineRow>
                                        <CampoInlineInput $color={cfg.color} autoFocus value={draft} onChange={e => setDraft(e.target.value)} />
                                        <PencilOk $color={cfg.color} disabled={mutTextos.isPending} onClick={() => guardarCampo(plan, "cta_text")}><RiCheckLine /></PencilOk>
                                        <PencilCancel onClick={() => setEditandoCampo(null)}><RiCloseLine /></PencilCancel>
                                    </CampoInlineRow>
                                ) : (
                                    <BtnPlanWrap>
                                        <BtnPlan $color={cfg.color} $colorAlt={cfg.colorAlt} $glow={cfg.glow}>
                                            {plan.cta_text || `Empezar con ${plan.nombre || cfg.nombre}`}
                                        </BtnPlan>
                                        <PencilBtn $sobreBoton onClick={() => abrirCampo(plan, "cta_text")}><RiEditLine /></PencilBtn>
                                    </BtnPlanWrap>
                                )}

                                {/* Features — click directo para activar/desactivar, igual que antes */}
                                <PlanIncluye>Incluye:</PlanIncluye>
                                <FeatureList>
                                    {(plan.features ?? []).map((f, i) => (
                                        <FeatureRow key={i} $ok={f.activo} onClick={() => toggleFeature(plan, i)} title={f.activo ? "Desactivar" : "Activar"}>
                                            <FeatureIco $ok={f.activo} $color={cfg.color}>
                                                {f.activo ? <RiCheckLine /> : <RiCloseLine />}
                                            </FeatureIco>
                                            <span>{f.label}</span>
                                        </FeatureRow>
                                    ))}
                                </FeatureList>

                                <PlanParaWrap>
                                    Ideal para:{" "}
                                    <CampoEditable
                                        styleAs={PlanParaText}
                                        valor={plan.para}
                                        editando={editandoCampo === `${plan.id}:para`}
                                        draft={draft} setDraft={setDraft}
                                        onAbrir={() => abrirCampo(plan, "para")}
                                        onGuardar={() => guardarCampo(plan, "para")}
                                        onCancelar={() => setEditandoCampo(null)}
                                        pending={mutTextos.isPending}
                                        inline
                                    />
                                </PlanParaWrap>
                            </CardInner>
                        </PlanCard>
                    );
                })}
            </CardsSection>

            <Nota>
                Los cambios de precio, features, nombre y textos se reflejan de inmediato en la landing. Los clientes existentes conservan el valor pactado al suscribirse — el nuevo precio aplica a partir del próximo ciclo de facturación que proceses.
            </Nota>
        </Page>
    );
}

/* ─────────────────────────────────────────
   Campo de texto con lápiz — click al lápiz para editar inline,
   check para guardar, X para cancelar sin guardar.
───────────────────────────────────────── */
function CampoEditable({ styleAs: Display, valor, editando, draft, setDraft, onAbrir, onGuardar, onCancelar, pending, multiline, inline, $color }) {
    if (editando) {
        const Input = multiline ? CampoInlineTextarea : CampoInlineInput;
        return (
            <CampoInlineRow $inline={inline}>
                <Input $color={$color} autoFocus value={draft} onChange={e => setDraft(e.target.value)} />
                <PencilOk $color={$color} disabled={pending} onClick={onGuardar}><RiCheckLine /></PencilOk>
                <PencilCancel onClick={onCancelar}><RiCloseLine /></PencilCancel>
            </CampoInlineRow>
        );
    }
    return (
        <Display $color={$color} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {valor}
            <PencilBtn onClick={onAbrir}><RiEditLine /></PencilBtn>
        </Display>
    );
}

/* ── Animations ── */
const fadeUp = keyframes`from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}`;

/* ── Layout ── */
const Page = styled.div`
    min-height: 100vh; background: ${({ theme }) => theme.bgtotal};
    padding: 28px; animation: ${fadeUp} 0.3s ease;
    display: flex; flex-direction: column; align-items: center;
    @media (max-width: 767px) { padding: 68px 12px 20px; }
`;

const TopBar = styled.div`
    text-align: center; margin-bottom: 36px;
    h1 { font-size: 22px; font-weight: 900; color: ${({ theme }) => theme.text}; margin: 0 0 6px; }
    p  { font-size: 13px; color: ${({ theme }) => theme.colorsubtitlecard}; margin: 0 auto; max-width: 480px; line-height: 1.55; }
`;

/* ── Cards — mismos estilos que PlanesTemplate.jsx (landing) ── */
const CardsSection = styled.div`
    position: relative; z-index: 1;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 28px;
    width: 100%; max-width: 860px;

    @media (max-width: 760px) { grid-template-columns: 1fr; max-width: 460px; gap: 20px; }
`;

const PlanCard = styled.div`
    position: relative;
    border-radius: 28px;
    overflow: hidden;
    display: flex; flex-direction: column;
    height: 100%;
    transition: box-shadow 0.25s ease;

    ${({ $popular, $color, $glow }) => $popular ? css`
        background: linear-gradient(160deg, #1C1108 0%, #140D05 100%);
        box-shadow: 0 0 50px ${$glow}, 0 24px 56px rgba(0,0,0,0.55);
        &:hover { box-shadow: 0 0 70px ${$glow}, 0 30px 70px rgba(0,0,0,0.65); transform: translateY(-6px); }
    ` : css`
        background: rgba(255,255,255,0.022);
        border: 1px solid rgba(255,255,255,0.07);
        box-shadow: 0 4px 28px rgba(0,0,0,0.35);
        &:hover {
            box-shadow: 0 8px 44px ${$glow}, 0 20px 48px rgba(0,0,0,0.45);
            border-color: ${$color}40;
            transform: translateY(-6px);
        }
    `}
`;

const PlanAccentBar = styled.div`
    height: ${({ $popular }) => $popular ? "4px" : "3px"};
    background: ${({ $color }) => $color};
    opacity: ${({ $popular }) => $popular ? 1 : 0.7};
`;

const PopularBand = styled.div`
    background: #3C6E9E;
    color: #fff;
    text-align: center;
    font-size: 11px; font-weight: 800;
    padding: 6px 16px;
    letter-spacing: 0.04em;
`;

const CardInner = styled.div`
    position: relative; z-index: 2;
    padding: 28px 26px 26px;
    display: flex; flex-direction: column; gap: 18px;
    flex: 1;
`;

const PlanTopRow = styled.div`
    display: flex; align-items: center; gap: 14px;
`;

const PlanEmojiBox = styled.div`
    width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0;
    background: ${({ $color }) => `${$color}18`};
    border: 1.5px solid ${({ $color }) => `${$color}30`};
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 18px ${({ $glow }) => $glow};
    overflow: hidden;
    img { width: 30px; height: 30px; object-fit: contain; }
`;

const PlanInfo = styled.div`
    display: flex; flex-direction: column; gap: 2px;
`;

const PlanNombre = styled.h3`
    font-size: 22px; font-weight: 900;
    margin: 0; color: ${({ $color }) => $color};
    letter-spacing: -0.3px;
`;

const PlanTaglineNew = styled.span`
    font-size: 11px; font-weight: 700;
    color: rgba(255,255,255,0.35);
    text-transform: uppercase; letter-spacing: 0.05em;
`;

const PlanDescNew = styled.p`
    font-size: 13px; color: rgba(255,255,255,0.45);
    margin: 0; line-height: 1.65;
    border-left: 2px solid rgba(255,255,255,0.08);
    padding-left: 12px;
`;

const PrecioBloque = styled.div`
    display: flex; flex-direction: column; gap: 10px;
`;

const PrecioRow = styled.div`
    display: flex; align-items: baseline; gap: 6px;
`;

const PrecioNum = styled.span`
    font-size: 28px; font-weight: 900;
    color: ${({ $color }) => $color};
    letter-spacing: -0.5px;
`;

const PrecioSufijo = styled.span`
    font-size: 14px; color: rgba(255,255,255,0.3); font-weight: 600;
`;

const PrecioEditRow = styled.div`
    display: flex; align-items: center; gap: 8px;
`;

const PrecioInput = styled.input`
    flex: 1; padding: 8px 12px; border-radius: 10px;
    border: 2px solid ${({ $color }) => $color};
    background: ${({ theme }) => theme.bgtotal}; color: ${({ theme }) => theme.text};
    font-size: 18px; font-weight: 800; font-family: "Poppins", sans-serif; outline: none;
`;

/* ── Desglose Mensual/Bimestral/Trimestral ── */
const DerivadosList = styled.div`
    width: 100%; display: flex; flex-direction: column; gap: 8px;
    border-top: 1px solid rgba(255,255,255,0.06);
    padding-top: 12px;
`;

const DerivadoItem = styled.div`
    display: flex; justify-content: space-between; align-items: center;
`;

const DerivadoLabel = styled.span`
    font-size: 12px; color: rgba(255,255,255,0.45);
    font-family: "Poppins", sans-serif;
    display: flex; align-items: center; gap: 6px;
`;

const Descuento = styled.span`
    font-size: 10px; background: rgba(74,222,128,0.15); color: #4ade80;
    border-radius: 6px; padding: 1px 5px; font-weight: 700;
`;

const DerivadoVal = styled.span`
    font-size: 13px; font-weight: 800;
    font-family: "Poppins", sans-serif;
    color: ${({ $color }) => $color};
`;

/* ── Botón CTA (solo display + lápiz, no navega) ── */
const BtnPlanWrap = styled.div`
    position: relative; width: 100%;
`;

const BtnPlan = styled.div`
    width: 100%; padding: 15px 20px;
    border-radius: 14px;
    border: 2px solid ${({ $colorAlt }) => `${$colorAlt}88`};
    background: ${({ $color, $colorAlt }) => `linear-gradient(135deg, ${$color} 0%, ${$colorAlt} 100%)`};
    color: #fff;
    font-size: 15px; font-weight: 800;
    font-family: "Poppins", sans-serif;
    text-align: center; letter-spacing: 0.2px;
    box-shadow: ${({ $glow }) => `0 6px 24px ${$glow}, 4px 4px 0 rgba(0,0,0,0.3)`};
`;

/* ── Features ── */
const PlanIncluye = styled.div`
    font-size: 10px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: rgba(255,255,255,0.25);
    padding-top: 4px;
`;

const FeatureList = styled.ul`
    list-style: none; margin: 0; padding: 0;
    display: flex; flex-direction: column; gap: 6px;
`;

const FeatureRow = styled.li`
    display: flex; align-items: center; gap: 10px;
    font-size: 13px; font-weight: 500; cursor: pointer;
    padding: 3px 4px; border-radius: 6px;
    color: ${({ $ok }) => $ok ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.25)"};
    text-decoration: ${({ $ok }) => $ok ? "none" : "line-through"};
    transition: background 0.15s, color 0.15s;
    &:hover { background: rgba(255,255,255,0.05); }
`;

const FeatureIco = styled.span`
    display: flex; align-items: center; justify-content: center;
    width: 22px; height: 22px; border-radius: 6px;
    font-size: 13px; flex-shrink: 0;
    background: ${({ $ok, $color }) => $ok ? `${$color}20` : "rgba(248,113,113,0.1)"};
    color: ${({ $ok, $color }) => $ok ? $color : "#f87171"};
`;

const PlanParaWrap = styled.div`
    margin-top: auto;
    padding: 10px 14px;
    border-radius: 10px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    font-size: 11px; font-weight: 600;
    color: rgba(255,255,255,0.3);
    line-height: 1.5;
    display: flex; align-items: center; flex-wrap: wrap; gap: 2px;
`;

const PlanParaText = styled.span`
    color: rgba(255,255,255,0.55); font-style: italic;
`;

/* ── Edición inline compartida ── */
const PencilBtn = styled.button`
    display: inline-flex; align-items: center; justify-content: center;
    background: none; border: none; cursor: pointer; padding: 0;
    font-size: 13px; color: rgba(255,255,255,0.3); flex-shrink: 0;
    transition: color 0.15s;
    &:hover { color: rgba(255,255,255,0.7); }

    ${({ $sobreBoton }) => $sobreBoton && css`
        position: absolute; top: -10px; right: -10px;
        width: 26px; height: 26px; border-radius: 50%;
        background: ${({ theme }) => theme.bgtotal};
        border: 1px solid rgba(255,255,255,0.15);
        color: rgba(255,255,255,0.6);
        &:hover { color: #fff; }
    `}
`;

const CampoInlineRow = styled.div`
    display: flex; align-items: center; gap: 6px;
    width: 100%;
`;

const CampoInlineInput = styled.input`
    flex: 1; min-width: 0; padding: 6px 10px; border-radius: 8px;
    border: 1.5px solid ${({ $color }) => $color ?? "rgba(255,255,255,0.2)"};
    background: ${({ theme }) => theme.bgtotal}; color: ${({ theme }) => theme.text};
    font-size: 13px; font-family: "Poppins", sans-serif; outline: none;
`;

const CampoInlineTextarea = styled.textarea`
    flex: 1; min-width: 0; padding: 6px 10px; border-radius: 8px;
    border: 1.5px solid ${({ $color }) => $color ?? "rgba(255,255,255,0.2)"};
    background: ${({ theme }) => theme.bgtotal}; color: ${({ theme }) => theme.text};
    font-size: 13px; font-family: "Poppins", sans-serif; outline: none; resize: vertical;
`;

const PencilOk = styled.button`
    flex-shrink: 0; width: 28px; height: 28px; border-radius: 8px; border: none;
    display: flex; align-items: center; justify-content: center;
    background: ${({ $color }) => $color ?? "#3C6E9E"}; color: #fff; cursor: pointer;
    &:disabled { opacity: 0.5; }
`;

const PencilCancel = styled.button`
    flex-shrink: 0; width: 28px; height: 28px; border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.12);
    display: flex; align-items: center; justify-content: center;
    background: transparent; color: rgba(255,255,255,0.5); cursor: pointer;
`;

const Nota = styled.div`
    text-align: center; margin-top: 32px;
    font-size: 12px; color: ${({ theme }) => theme.colorsubtitlecard};
    font-style: italic; max-width: 600px;
`;
