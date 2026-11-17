---
target: rodapé da lista de orçamento
total_score: 21
max_score: 36
na_heuristics: 9
p0_count: 1
p1_count: 2
target_identity: "file:d:\\IntelliJ\\Workspace\\MK_Autoparts\\frontend\\src\\components\\PainelOrcamento.tsx"
target_fingerprint: "sha256:93087edf71e1ef26df33bed068f6cc604475aadeec85c34af281dba590e9074a"
target_path: "d:\\IntelliJ\\Workspace\\MK_Autoparts\\frontend\\src\\components\\PainelOrcamento.tsx"
timestamp: 2026-11-17T00-31-36Z
slug: frontend-src-components-painelorcamento-tsx
---
# Crítica: rodapé da lista de orçamento

Método: dual-agent (A: revisão de design · B: detector + navegador). Somente leitura.

## Notas Nielsen (21/36, Aceitável; 9 n/a: sem estados de erro no rodapé)
1 Status 2 · 2 Mundo real 3 · 3 Controle 3 · 4 Consistência 2 · 5 Prevenção 3 · 6 Reconhecimento 2 · 7 Eficiência 2 · 8 Estética 1 · 9 n/a · 10 Ajuda 3

## Medições
Rodapé fixo 491 px (sem vendedor) / 403 px (com vendedor). Área dos itens: 1280x720 150 px; 1366x768 198; 390x664 94; 360x640 50 (cartão de item = 115 px). Blocos: obs 120, prévia 46, aviso 43, botão 56, destino 20 (40 em 360), escolha 77, limpar 40, gaps 60, padding 30. Faixa de vendedores 1114 px de largura, 3 de 8 visíveis; barra nativa de 10 px no desktop.

## Problemas prioritários
- [P0] Rodapé fixo ocupa 64–80% do painel; no celular sobram 50–94 px para os itens. Corpo rolável (itens + observação + prévia + aviso + limpar) e rodapé fixo só com botão, destino e escolha (~190 px).
- [P1] Redundância: aviso + "Vai para… pelo WhatsApp" + ícones (WhatsApp 3x). Tirar o aviso do rodapé ou fundir com o destino (texto final em PEND-003).
- [P1] Faixa de vendedores: barra nativa visível, primeiro chip encostado na borda (sem scroll-padding), roda do mouse não rola, sem pista de continuação. Esconder barra, scroll-padding, máscara de degradê; ou "Escolher outro" recolhível.
- [P2] Observação (120 px) antes da ação parece obrigatória; contador 0/500 sempre visível. Mover para o corpo ou recolher; contador só perto do limite.
- [P2] Ritmo plano (gap 10 em tudo) e alinhamentos mistos (centro/esquerda). Dois grupos com espaços diferentes; "Limpar lista" discreto no corpo.

## Detector
CLI 0 achados no PainelOrcamento.tsx. Overlay: 2 achados fora do painel (cromado do hero, falso positivo; marquee das marcas). Contraste AA em tudo (destino 5,8:1). Alvos: "Limpar lista" 40 px e +/- de quantidade 40x40 (abaixo de 44). Sem erros de console nem rolagem lateral.

## Menores
summary da prévia sem chevron; cores fixas fora dos tokens na prévia; textarea com resize vertical no rodapé fixo; destino quebra em 2 linhas em 360 px; cartão de item poderia ser ~30 px menor.
