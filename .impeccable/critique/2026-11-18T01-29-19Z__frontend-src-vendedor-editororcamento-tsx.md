---
target: telas do orçamento (editor, documento, link)
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:d:\\IntelliJ\\Workspace\\MK_Autoparts\\frontend\\src\\vendedor\\EditorOrcamento.tsx"
target_fingerprint: "sha256:24425da5b2e692033b7db417e386ab836a9b5013d6f875eed1b9bfd9c9427fbc"
target_path: "d:\\IntelliJ\\Workspace\\MK_Autoparts\\frontend\\src\\vendedor\\EditorOrcamento.tsx"
timestamp: 2026-11-18T01-29-19Z
slug: frontend-src-vendedor-editororcamento-tsx
---
# Crítica: telas novas do orçamento (editor /vendedor/novo, documento /vendedor/documento, link /orcamento)

Método: dual-agent. Nota 25/40 (1:3 2:3 3:2 4:2 5:2 6:3 7:2 8:3 9:2 10:3).

Detector: 4 .tsx limpos no CLI; editor e link limpos no navegador (390 e 1280); documento ~150 achados, quase todos texto pequeno (esperado no A4 impresso, real na prévia do celular a ~45%); h1 seguido de h4 no documento; falsos positivos: nested-cards, listras do topo, contraste do eyebrow 4,4:1 sobre degradê. Sem rolagem lateral, sem erros de console.

- [P1] Campo de desconto do item corta o valor no celular (39 px úteis; R$ 140,00 aparece "14"). Largura mínima ou segmento %/R$ abaixo/dentro.
- [P1] Editor no celular com 5.768 px; peças 3.000 px antes do Cliente (obrigatório); barra + topo = 25% da tela. Recolher peça editada em linha-resumo, atalhos de seção na barra, logística 2×2.
- [P1] Erro ao salvar só na barra, sem rolar/focar o campo; mensagem genérica. Rolar e focar o 1º inválido, erro sob o campo, mensagem conforme PJ/PF.
- [P2] Estados inválidos: validade no passado, peça com lado sem lado, desconto em item sem preço.
- [P2] Prévia do documento ilegível no celular (358 px, texto ~5 px). Abrir em tamanho real ao tocar ou quadro de conferência.
- [P3] Explicar "-12,7%" = 10% no item + 3% no total (editor e link).

Menores: alvos 40 px (LD/LE/Par, %/R$, PJ/PF) e quantidade 27 px; links do rodapé 36 px no link; painel sem nº ORC e expirado com "Enviar"; Descrição com placeholder do catálogo; "Abrir link" e "Ver o link" redundantes; miniaturas encostando na borda; 7 campos PJ sem destaque do obrigatório; página 2 do PDF sem identificação; link sem "Baixar PDF"; CTA do link em 2 linhas soa como "mandar algo novo".
