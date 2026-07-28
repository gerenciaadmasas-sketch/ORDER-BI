---
name: vercel-deploy
description: Skill de deploy para SaaS.DTO2 en Vercel. Úsalo cuando vayas a desplegar cambios, verificar el estado del deploy, diagnosticar errores de build en Vercel, o cuando necesites información del proyecto en producción.
model: claude-sonnet-4-6
tools:
  - Bash
  - PowerShell
  - Read
  - Glob
  - Grep
---

# Vercel Deploy — SaaS.DTO2

---

## Datos del proyecto

```
App:        SaaS.DTO2
URL prod:   https://saasdto2.vercel.app
Repo:       https://github.com/gerenciaadmasas-sketch/SAAS.DTO2
Branch:     main → auto-deploy a producción
Framework:  Vite (React 19)
```

---

## Flujo de deploy (automático)

```
git add [archivos específicos]
git commit -m "tipo: descripción corta"
git push origin main
→ Vercel detecta el push → build automático → deploy en ~2 min
```

El usuario SIEMPRE prueba en la URL de Vercel, no en localhost.

---

## Antes de cada push — checklist obligatorio

```powershell
# 1. Build local sin errores
cd "c:\Users\User\Desktop\Point of sale\POSv1\POS-DL-V1"
npm run build

# 2. Solo si el build pasa ✅:
git add [archivos modificados — nunca git add -A]
git commit -m "tipo: descripción"
git push origin main
```

**Si el build falla:** corregir el error ANTES de hacer commit. Nunca subir código roto.

---

## Convención de commits

```
feat:     nueva funcionalidad
fix:      corrección de bug
docs:     cambios en documentación
style:    cambios de estilos/UI sin lógica
refactor: reorganización sin cambiar comportamiento
security: cambios de seguridad
chore:    mantenimiento, dependencias
```

Ejemplos:
```
feat: modal credenciales al crear cliente
fix: BtnClose faltante en modal credenciales
security: PBKDF2 + contraseña aleatoria
docs: PRD y TRD actualizados
```

---

## Diagnóstico de errores en Vercel

### Error más común: identificador duplicado
```
Error: Identifier `X` has already been declared
→ Buscar con Grep: grep "const X" src/
→ Renombrar el duplicado
```

### Error de import faltante
```
Error: X is not defined
→ Verificar que está importado en el archivo
→ Verificar que está exportado desde el módulo origen
```

### Error de build por styled component no definido
```
Síntoma: pantalla en blanco en producción
Causa: componente usado en JSX pero no definido con styled.*
Solución: Grep "StyledComponentName" y verificar que tiene definición
```

---

## Variables de entorno en Vercel

```
VITE_SUPABASE_URL          → URL del proyecto Supabase
VITE_SUPABASE_ANON_KEY     → Clave anon pública
```

Para agregar nuevas variables: Vercel Dashboard → Settings → Environment Variables.

---

## Supabase — datos de producción

```
Proyecto:  souwqzfmxsorhelmidqq
Región:    us-east-2
URL:       https://souwqzfmxsorhelmidqq.supabase.co
Dashboard: https://supabase.com/dashboard/project/souwqzfmxsorhelmidqq
```

### Management API (para migrations SQL y RPCs):
```
URL: https://api.supabase.com/v1/projects/souwqzfmxsorhelmidqq/database/query
```
El Bearer token se obtiene del usuario cuando se necesite (no almacenar en código).

---

## Edge Functions

```
wompi-sign          → genera hash + transacción pendiente
wompi-webhook       → activa cliente post-pago
limpiar-mensajes    → cron semanal

Deploy cuando sea necesario:
supabase functions deploy nombre-funcion
```

---

## Reglas de producción

1. Nunca hacer push con errores de build
2. Nunca hacer `git add -A` — siempre agregar archivos específicos
3. Nunca subir archivos `.env` o con claves
4. Nunca force push a main
5. Si el deploy falla en Vercel: revisar los logs en el dashboard antes de cualquier otra acción
6. Siempre hacer el build local primero para confirmar que pasa
