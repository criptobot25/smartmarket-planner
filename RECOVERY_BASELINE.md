# RECOVERY_BASELINE — NutriPilot (Next Shell + React Core)

Data: 2026-02-18

## 1) Diagnóstico do estado atual

### Build / integridade técnica
- Status: `npm run build` passa limpo.
- Rotas App Router ativas: `/`, `/app`, `/app/list`, `/app/prep-guide`, `/login`, `/pricing`.

### Páginas quebradas / pontos críticos
1. **Fluxo principal ainda acoplado a auth no prep**
   - `middleware.ts` força login e premium em `/app/prep-guide` via `matcher`.
   - Efeito: usuário sem login pode gerar plano/lista, mas é redirecionado ao acessar prep (quebra de continuidade de UX).

2. **Dependência de login no núcleo do planner (acoplamento desnecessário)**
   - `app/components/PlannerDashboard.tsx` importa `useSession/signIn/signOut`.
   - O fluxo principal funciona, mas o core fica misturado com autenticação no mesmo componente.

3. **Condição geral do UX core**
   - Planner/lista/prep estão renderizando e builda.
   - Correções de contraste/hover e i18n global já aplicadas nas últimas entregas.

---

## 2) Objetivo do rollback parcial

Manter **Next.js apenas como shell de rotas/layout**, restaurando o **core React funcional e desacoplado de auth** no fluxo principal:
- `/app` e `/app/list` e `/app/prep-guide` devem funcionar sem login obrigatório.
- Auth permanece disponível como recurso opcional (rota `/login` e integrações prontas), sem bloquear a jornada principal.

---

## 3) Plano de rollback parcial (passos pequenos, testáveis)

## Passo A — Desbloquear fluxo principal de auth obrigatório
**Mudança**
- Ajustar `middleware.ts` para não interceptar `/app/prep-guide` durante baseline recovery.
- Opção recomendada: remover temporariamente o matcher (ou condicionar por flag de ambiente `ENFORCE_PREP_AUTH=false`).

**Teste**
- Acessar `/app -> /app/list -> /app/prep-guide` sem sessão autenticada.
- Confirmar ausência de redirect para `/login`.

**Commit sugerido**
- `chore: disable prep auth middleware for recovery baseline`

## Passo B — Separar auth do core do planner
**Mudança**
- Extrair bloco de login/logout de `PlannerDashboard` para um componente isolado (`AuthControls`), carregado como opcional.
- `PlannerDashboard` passa a depender só de `ShoppingPlanContext` + i18n + navegação.

**Teste**
- Gerar plano, repetir semana e navegar para lista/prep sem uso de sessão.
- Se auth estiver indisponível, planner continua funcional.

**Commit sugerido**
- `refactor: decouple auth controls from planner core`

## Passo C — Garantir sem mistura de contexto entre Grocery e Monday Prep
**Mudança**
- Revalidar regra de desbloqueio do prep apenas por progresso da lista (sem gate de login).
- Garantir que CTA de prep só aparece na lista quando progresso = 100%.

**Teste**
- Marcar itens na lista e verificar desbloqueio progressivo do prep.
- Navegação entre páginas sem redirecionamentos externos ao fluxo.

**Commit sugerido**
- `fix: enforce grocery-to-prep unlock by shopping progress only`

## Passo D — Baseline de estabilidade
**Mudança**
- Nenhuma feature nova. Somente hardening final.
- Rodar build + suíte completa.

**Teste**
- `npm run build`
- `npm test -- --run`

**Commit sugerido**
- `chore: validate recovery baseline stability`

---

## 4) Critérios de aceite (Recovery Baseline)

- [ ] `/app` abre e gera plano sem login.
- [ ] `/app/list` funciona com checklist e exports sem depender de sessão.
- [ ] `/app/prep-guide` acessível no fluxo principal (sem redirect de auth).
- [ ] Login continua disponível em `/login`, mas não obrigatório para core.
- [ ] Build limpo + testes passando.

---

## 5) Decisão arquitetural para esta fase

- **Agora:** Next como shell + core React estável, auth opcional.
- **Depois (fase auth):** reintroduzir proteção de rotas premium via feature flag, sem quebrar o fluxo base.

Isso evita regressão de UX e mantém evolução incremental com risco controlado.

---

## 6) Progresso de execução

- ✅ **Passo A concluído**
   - Auth obrigatório no prep desativado por padrão em `middleware.ts`.
   - Reativação futura suportada por `ENFORCE_PREP_AUTH=true`.

- ✅ **Passo B concluído**
   - Auth desacoplado do core do planner.
   - `PlannerDashboard` não depende mais diretamente de `useSession/signIn/signOut`.
   - Controles de auth isolados em componente opcional: `app/components/PlannerAuthControls.tsx`.
