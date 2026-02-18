# 🧭 NutriPilot

**NutriPilot helps busy people eat healthier and spend less by generating weekly grocery missions automatically.**

[![Live Demo](https://img.shields.io/badge/🚀-Live%20Demo-success)](https://nutripilot.app)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18.0-61dafb)
![Next.js](https://img.shields.io/badge/Next.js-14-black)

> **📸 [View Screenshots](#-screenshots) | 💰 [Pricing](#-pricing) | 🚀 [Try it Now](https://nutripilot.app)**

---

## 📊 O Problema

- **30% dos alimentos** comprados vão para o lixo por falta de planejamento
- Famílias gastam **20-30% a mais** em supermercados sem lista organizada
- Planejar refeições semanais manualmente consome **2-3 horas** por semana
- Dificuldade em calcular quantidades corretas para múltiplas pessoas
- Ingredientes repetidos não são consolidados

## 💡 A Solução

O **NutriPilot** automatiza completamente o planejamento semanal de refeições:

1. **Input rápido**: Pessoas, estilo alimentar, orçamento (30 segundos)
2. **Geração automática**: Plano semanal completo em segundos
3. **Lista inteligente**: Ingredientes consolidados por categoria
4. **Modo Mercado**: Interface otimizada para usar durante as compras
5. **Histórico**: Últimos 3 planos salvos para reutilização

---

## 📸 Screenshots

> 🚧 **Coming soon** - Screenshots will be added after first production deployment.

<!-- 
![Home Screen](docs/screenshots/home.png)
![Shopping List](docs/screenshots/shopping-list.png)
![Market Mode](docs/screenshots/market-mode.png)
-->

---

## ✨ Features MVP (v1.0)

### Core Features
- ✅ **Planejamento Automático**: 7 dias, 4 refeições/dia
- ✅ **3 Estilos Alimentares**: Saudável, Balanceado, Conforto
- ✅ **Lista de Compras Inteligente**: Agrupada por categoria, quantidades consolidadas
- ✅ **Modo Mercado**: UI simplificada com fonte grande para usar no supermercado
- ✅ **Checklist Interativo**: Marcar itens comprados (vão para o final)
- ✅ **Sugestões de Receitas**: Baseadas nos ingredientes comprados
- ✅ **Histórico Local**: Últimos 3 planos salvos (LocalStorage)
- ✅ **Cálculo Automático**: Custo total e quantidades ajustadas por número de pessoas
- ✅ **Restrições Alimentares**: Filtro de ingredientes não desejados

### Tech Highlights
- **Lógica 100% separada da UI** (`/core/logic` vs `/app`)
- **Persistência LocalStorage** (offline-first)
- **Mobile-first** design responsivo
- **Zero dependências** de backend no MVP
- **TypeScript strict** mode (zero `any`)

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/nutripilot.git
cd nutripilot

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev

# Abra no navegador
# http://localhost:3000
```

### Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Start do build de produção
npm run lint         # Linter ESLint
npm run type-check   # Verificação de tipos TypeScript
```

---

## 📁 Estrutura do Projeto

```
src/
├── core/                    # Lógica de negócio (sem UI)
│   ├── models/             # TypeScript interfaces
│   │   ├── PlanInput.ts
│   │   ├── FoodItem.ts
│   │   ├── Recipe.ts
│   │   └── WeeklyPlan.ts
│   ├── logic/              # Funções puras
│   │   ├── generateWeeklyPlan.ts
│   │   ├── generateShoppingList.ts
│   │   ├── calculateQuantities.ts
│   │   └── suggestRecipes.ts
│   ├── storage/            # LocalStorage persistence
│   │   ├── savePlan.ts
│   │   ├── loadHistory.ts
│   │   └── clearHistory.ts
│   └── config/             # Configurações
│       └── features.ts     # Feature flags (Premium)
│
├── data/                    # Mock data
│   ├── mockFoods.ts        # 36+ alimentos com preços
│   ├── mockRecipes.ts      # 8+ receitas completas
│   └── dietRules.ts        # Regras por estilo alimentar
│
├── hooks/                   # React hooks customizados
│   └── useShoppingPlan.ts  # Hook principal (estado global)
│
├── app/                     # UI Layer
│   ├── pages/              # Páginas
│   │   ├── PlannerPage.tsx        # Home (input)
│   │   ├── ShoppingListPage.tsx   # Lista + Modo Mercado
│   │   ├── RecipesPage.tsx        # Sugestões
│   │   └── HistoryPage.tsx        # Histórico
│   ├── layout/             # Layout components
│   │   ├── AppLayout.tsx
│   │   └── Navbar.tsx
│   └── routes.tsx          # React Router config
│
└── ...
```

### Princípios Arquiteturais

1. **Separação de Responsabilidades**: Lógica em `/core`, UI em `/app`
2. **Funções Puras**: Toda lógica é testável e previsível
3. **Single Source of Truth**: Hook `useShoppingPlan` centraliza estado
4. **Type Safety**: TypeScript strict, sem `any`
5. **Mock Data Isolado**: Facilita troca futura por API

---

## 💰 Pricing

### Free Plan
- ✅ Weekly meal planning (7 days)
- ✅ Smart shopping list
- ✅ Recipe suggestions
- ✅ History (last 3 plans)
- ✅ Market mode

### Premium - €4.99/month
- ✅ Everything in Free
- ✅ Export to PDF
- ✅ Budget optimizer
- ✅ Macro calculator (fitness)
- ✅ Unlimited history
- ✅ Priority support

**🔥 Coming Soon** - Join the waitlist at [/pricing](https://nutripilot.app/pricing)

### Premium Features (Technical Details)

Feature flags já preparadas em `src/core/config/features.ts`:

```typescript
export const FEATURES = {
  premiumBudgetMode: false,      // Otimização por orçamento
  premiumMacros: false,           // Cálculo de macronutrientes
  premiumUnlimitedHistory: false, // Histórico ilimitado
  premiumPdfExport: false,        // Exportar PDF
};
```

**Diferenciais Premium:**
- 📊 **Budget Mode**: IA otimiza lista para ficar dentro do orçamento
- 💪 **Macros Fitness**: Cálculo automático de proteínas, carbs, gorduras
- ♾️ **Histórico Ilimitado**: Salvar todos os planos
- 📄 **Export PDF**: Lista formatada para impressão

---

## 🗓️ Roadmap

### v1.1 - Premium Básico (Q2 2026)
- [ ] Export PDF da lista de compras
- [ ] Histórico ilimitado (integração com backend)
- [ ] Autenticação básica (email/senha)
- [ ] Página de assinatura Premium

### v1.2 - Fitness Mode (Q3 2026)
- [ ] Cálculo de macronutrientes
- [ ] Metas personalizadas (bulking, cutting, manutenção)
- [ ] Dashboard de nutrição semanal
- [ ] Integração com apps fitness (MyFitnessPal, etc)

### v1.3 - Budget Optimizer (Q4 2026)
- [ ] IA para otimização de orçamento
- [ ] Substituição automática de ingredientes caros
- [ ] Comparação de preços entre supermercados
- [ ] Alertas de promoções

### v2.0 - Integração Supermercados (2027)
- [ ] API de supermercados parceiros
- [ ] Preços em tempo real
- [ ] Compra online direto do app
- [ ] Cashback em compras

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build**: Next.js App Router
- **Routing**: React Router v6
- **Styling**: CSS Modules (mobile-first)
- **State**: Custom Hooks (useShoppingPlan)
- **Storage**: LocalStorage (offline-first)
- **Future**: Node.js + PostgreSQL (backend Premium)

---

## 🎯 Diferenciais Competitivos

| Feature | NutriPilot | Concorrente A | Concorrente B |
|---------|-------------|---------------|---------------|
| Plano Semanal Automático | ✅ | ❌ | ✅ |
| Modo Mercado | ✅ | ❌ | ❌ |
| Offline-First | ✅ | ❌ | ✅ |
| Lista por Categoria | ✅ | ✅ | ✅ |
| Cálculo de Macros | 🔜 Premium | ✅ | ❌ |
| Otimização Orçamento | 🔜 Premium | ❌ | ❌ |
| Integração Supermercado | 🔜 v2.0 | ❌ | ❌ |

---

## 📈 Métricas de Sucesso

- **Redução de 25%** no tempo de planejamento semanal
- **Economia de 15-20%** no gasto com supermercado
- **Redução de 30%** no desperdício de alimentos
- **5 minutos** para gerar plano completo (vs 2-3 horas manual)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: add amazing feature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Convenção de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `chore:` Manutenção
- `refactor:` Refatoração de código

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Equipe

Desenvolvido com ❤️ por [Seu Nome]

---

## 📞 Contato

- Email: contact@nutripilot.app
- Twitter: [@nutripilot](https://twitter.com/nutripilot)
- LinkedIn: [NutriPilot](https://linkedin.com/company/nutripilot)

---

⭐ Se este projeto te ajudou, considere dar uma estrela no GitHub!
