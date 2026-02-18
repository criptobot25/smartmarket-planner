# ✅ Definition of Done - MVP NutriPilot

## 🎯 Checklist de Qualidade (Obrigatório)

### 1. Funcionalidades Core
- [ ] **Gerar plano semanal** - Input → Plano completo
- [ ] **Lista de compras aparece** - Navegação /list funcional
- [ ] **Receitas aparecem** - Navegação /recipes funcional  
- [ ] **Histórico funciona** - Últimos 3 planos salvos
- [ ] **F5 mantém estado** - LocalStorage persistindo dados
- [ ] **Modo Mercado** - UI simplificada para compras

### 2. Arquitetura Limpa
- [ ] **Sem lógica em UI** - Toda lógica em `/core/logic`
- [ ] **Context fino** - Provider apenas orquestra
- [ ] **Funções puras** - Testáveis e previsíveis
- [ ] **TypeScript strict** - Sem `any`

### 3. Persistência Robusta
- [ ] **savePlan() automático** - Ao gerar plano
- [ ] **loadHistory() ao iniciar** - useEffect no Provider
- [ ] **Limite de 3 planos** - Rotação automática
- [ ] **Estado restaurado após F5** - Dados não se perdem

## 🧪 Teste Manual (Executar AGORA)

### Teste 1: Fluxo Completo
```
1. Abrir http://localhost:5173/
2. Preencher formulário (2 pessoas, Balanceado, R$ 300)
3. Clicar "Gerar Plano Semanal"
4. ✅ Deve navegar para /list
5. ✅ Lista deve aparecer com itens
6. Clicar em "Ver Receitas"
7. ✅ Receitas sugeridas devem aparecer
8. Voltar e ir para /history
9. ✅ Deve mostrar 1 plano salvo
```

### Teste 2: Persistência (CRÍTICO)
```
1. Gerar um plano (seguir Teste 1)
2. Navegar para /list
3. ✅ Lista aparece normalmente
4. Pressionar F5 (atualizar página)
5. ✅ Lista AINDA deve estar visível
6. Navegar para /recipes
7. ✅ Receitas AINDA devem aparecer
8. Fechar navegador completamente
9. Reabrir http://localhost:5173/
10. ✅ Ao ir em /list, plano deve estar salvo
```

### Teste 3: Modo Mercado
```
1. Estar em /list com plano gerado
2. Clicar "Entrar no Modo Mercado"
3. ✅ Fonte maior, layout simplificado
4. Clicar em um item
5. ✅ Item é marcado como comprado
6. ✅ Item vai para o final da categoria
7. Clicar "Sair"
8. ✅ Volta ao modo normal
```

### Teste 4: Histórico
```
1. Gerar 1º plano (2 pessoas, Saudável)
2. Voltar para home
3. Gerar 2º plano (3 pessoas, Conforto)
4. Voltar para home  
5. Gerar 3º plano (1 pessoa, Balanceado)
6. Ir para /history
7. ✅ Deve mostrar 3 planos
8. ✅ Mais recente no topo
9. Gerar 4º plano
10. Ir para /history
11. ✅ Deve mostrar apenas 3 planos (1º foi removido)
```

## 🚨 Bugs Conhecidos (Resolver ANTES de monetizar)

- [ ] Itens comprados não persistem após F5 (aceitar no MVP)
- [ ] Fast Refresh warning no Context (não afeta produção)

## 📊 Validação Técnica

### Console Logs (devem aparecer):
```
🔄 Inicializando app - carregando dados do LocalStorage...
📚 Histórico carregado: X planos
📥 Último plano encontrado: plan-xxxxx
✅ Estado restaurado do LocalStorage

// Ao gerar novo plano:
🚀 Gerando plano com input: {...}
📋 Plano semanal gerado: {...}
🛒 Lista de compras gerada: X itens
💰 Custo total: XXX.XX
🍳 Sugestões geradas: X receitas
💾 Plano salvo no LocalStorage: true
📚 Histórico atualizado: X planos
```

### LocalStorage (DevTools):
```
Key: smartmarket_plans
Value: Array com até 3 objetos WeeklyPlan
```

## ✅ Definition of Done = MVP Completo

Quando TODOS os testes acima passarem:
- ✅ MVP está pronto para usuários
- ✅ Pode começar monetização (V1.1)
- ✅ Código está em nível profissional

## 🚀 Próximo Passo (DEPOIS do DoD)

**V1.1 - Primeira Monetização:**
- [ ] Feature flag: `premiumUnlimitedHistory`
- [ ] Feature flag: `premiumPdfExport`
- [ ] Página /premium
- [ ] Checkout básico

**NÃO implementar antes do MVP estar 100% funcional.**
