# Growth roadmap (90 dias)

Objetivo: manter produto 100% gratuito para maximizar aquisição orgânica e retenção, preparando base para futura versão Pro sem travar funcionalidades essenciais.

## North Star

- North Star Metric: usuários que geram plano e retornam em 7 dias.
- Meta 90 dias: aumentar tráfego orgânico qualificado e taxa de retorno semanal.

## Fase 1 (Dias 1-30) — Free-first + SEO foundation

### Produto (execução iniciada)

- [x] Desativar paywall por padrão (`premiumMonetizationV2=false`).
- [x] Liberar recursos premium quando monetização está off.
- [ ] Revisar UI para remover mensagens de bloqueio em páginas de app.

### Conteúdo / SEO

- [x] Infra de blog MDX com RSS/sitemap/schema.
- [ ] Publicar 2 artigos/semana com foco em intenção transacional/informacional.
- [ ] Criar cluster principal:
  - `/meal-plan/cutting`
  - `/meal-plan/bulking`
  - `/meal-plan/maintenance`
  - artigos de suporte ligados internamente.

### Medição

- [x] GA4 + Consent Mode.
- [x] Web Vitals tracking.
- [ ] Dashboard semanal (GSC + GA4): CTR, queries, páginas de entrada, conversão para geração de plano.

## Fase 2 (Dias 31-60) — Scale de conteúdo + UX SEO

### Conteúdo

- [ ] Expandir para 25-35 páginas programáticas + blog supporting pages.
- [ ] Atualizar artigos com dados de performance (freshness).
- [ ] Otimizar snippets (título/meta) baseado em CTR do Search Console.

### Produto

- [ ] Melhorar onboarding para reduzir tempo até "primeiro plano gerado".
- [ ] Adicionar módulos de retenção: checklist semanal, plano salvo, retorno simplificado.

### Técnico

- [ ] Melhorar linking interno automático entre artigos relacionados.
- [ ] Revisar Core Web Vitals em páginas com maior tráfego orgânico.

## Fase 3 (Dias 61-90) — Preparação para Pro (sem bloquear core)

### Estratégia de monetização futura

- [ ] Definir funcionalidades Pro não essenciais ao core gratuito.
- [ ] Criar páginas "coming soon" para recursos avançados, sem bloquear fluxo principal.
- [ ] Definir pricing hypotheses com base em uso real (não em suposição).

### Experimentos

- [ ] Capturar interesse em features Pro (eventos + formulário in-app).
- [ ] Validar willingness-to-pay com cohort de power users.

## Backlog de execução imediata (próximos 7 dias)

1. Remover/ajustar elementos de UI com texto de bloqueio premium no app principal.
2. Publicar 3 novos artigos SEO de alta intenção com interlinking para `/meal-plan/*`.
3. Criar rotina semanal de atualização (refresh) para artigos já publicados.
4. Configurar relatório semanal com métricas: sessões orgânicas, geração de plano, retenção D7.

## Guardrails

- Não bloquear funcionalidades core gratuitas durante fase de aquisição.
- Não coletar dados pessoais sensíveis em analytics.
- Priorizar qualidade de conteúdo e utilidade real (evitar thin pages).
