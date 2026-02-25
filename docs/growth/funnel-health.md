# Funnel health — Content -> Planner

Objetivo: monitorar semanalmente o funil de aquisição orgânica até geração de plano, com foco no fluxo de conteúdo.

## Eventos-chave do funil

1. `page_view` em páginas de conteúdo (`/blog/*`, `/meal-plan/*`)
2. `content_to_planner_cta`
3. `onboarding_completed`
4. `plan_generated`

## Dimensões obrigatórias

- `source` (ex.: `blog_post`, `blog_index`, `blog_search`, `blog_page_2`, `meal_plan_goal`)
- `slug` (slug do post ou goal)
- `goal` (`cutting`, `bulking`, `maintenance`)

## Cadência de revisão (semanal)

- Segunda: checar conversão 24h por `source`/`slug`/`goal`
- Quarta: identificar páginas com muito clique e baixa geração de plano
- Sexta: priorizar otimizações de CTA/copy/interlinking para top 3 gargalos

## GA4 (via BigQuery export)

> Ajuste `your_project.your_dataset` para o seu ambiente.

### 1) Tendência diária dos eventos do funil

```sql
SELECT
  PARSE_DATE('%Y%m%d', event_date) AS day,
  event_name,
  COUNT(*) AS events
FROM `your_project.your_dataset.events_*`
WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
  AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
  AND event_name IN ('content_to_planner_cta', 'onboarding_completed', 'plan_generated')
GROUP BY day, event_name
ORDER BY day DESC, event_name;
```

### 2) Conversão por source/slug/goal (CTA -> plan_generated em 24h)

```sql
WITH cta AS (
  SELECT
    user_pseudo_id,
    event_timestamp AS cta_ts,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key = 'source') AS source,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key = 'slug') AS slug,
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key = 'goal') AS goal
  FROM `your_project.your_dataset.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
    AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
    AND event_name = 'content_to_planner_cta'
),
plans AS (
  SELECT
    user_pseudo_id,
    event_timestamp AS plan_ts
  FROM `your_project.your_dataset.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
    AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
    AND event_name = 'plan_generated'
)
SELECT
  cta.source,
  cta.slug,
  cta.goal,
  COUNT(*) AS cta_events,
  COUNTIF(EXISTS (
    SELECT 1
    FROM plans p
    WHERE p.user_pseudo_id = cta.user_pseudo_id
      AND p.plan_ts BETWEEN cta.cta_ts AND cta.cta_ts + 24 * 60 * 60 * 1000000
  )) AS converted_24h,
  SAFE_DIVIDE(
    COUNTIF(EXISTS (
      SELECT 1
      FROM plans p
      WHERE p.user_pseudo_id = cta.user_pseudo_id
        AND p.plan_ts BETWEEN cta.cta_ts AND cta.cta_ts + 24 * 60 * 60 * 1000000
    )),
    COUNT(*)
  ) AS conversion_24h_rate
FROM cta
GROUP BY cta.source, cta.slug, cta.goal
ORDER BY cta_events DESC;
```

## PostHog (HogQL)

### 1) Tendência diária dos eventos do funil

```sql
SELECT
  toDate(timestamp) AS day,
  event,
  count() AS events
FROM events
WHERE timestamp >= now() - INTERVAL 30 DAY
  AND event IN ('content_to_planner_cta', 'onboarding_completed', 'plan_generated')
GROUP BY day, event
ORDER BY day DESC, event;
```

### 2) Conversão por source/slug/goal (CTA -> plan_generated em 24h)

```sql
WITH cta AS (
  SELECT
    distinct_id,
    min(timestamp) AS cta_ts,
    properties.source AS source,
    properties.slug AS slug,
    properties.goal AS goal
  FROM events
  WHERE event = 'content_to_planner_cta'
    AND timestamp >= now() - INTERVAL 30 DAY
  GROUP BY distinct_id, source, slug, goal
),
plans AS (
  SELECT
    distinct_id,
    min(timestamp) AS plan_ts
  FROM events
  WHERE event = 'plan_generated'
    AND timestamp >= now() - INTERVAL 30 DAY
  GROUP BY distinct_id
)
SELECT
  cta.source,
  cta.slug,
  cta.goal,
  count() AS cta_users,
  countIf(plans.plan_ts >= cta.cta_ts AND plans.plan_ts <= cta.cta_ts + INTERVAL 24 HOUR) AS converted_24h,
  round(
    100.0 * countIf(plans.plan_ts >= cta.cta_ts AND plans.plan_ts <= cta.cta_ts + INTERVAL 24 HOUR) / count(),
    2
  ) AS conversion_24h_pct
FROM cta
LEFT JOIN plans ON cta.distinct_id = plans.distinct_id
GROUP BY cta.source, cta.slug, cta.goal
ORDER BY cta_users DESC;
```

## Critérios de alerta

- `content_to_planner_cta` cresce e `plan_generated` não cresce por 2 semanas
- Conversão 24h abaixo de 20% nos top 5 slugs por tráfego
- Queda >15% em `plan_generated` semana contra semana

## Ações recomendadas por sintoma

- Muitos cliques, pouca geração: simplificar onboarding inicial e reforçar prova de resultado no CTA
- Muito tráfego, pouco clique: melhorar copy de CTA e posicionamento acima da dobra
- Boa conversão em um goal específico: replicar padrão de copy/interlinking para os outros goals