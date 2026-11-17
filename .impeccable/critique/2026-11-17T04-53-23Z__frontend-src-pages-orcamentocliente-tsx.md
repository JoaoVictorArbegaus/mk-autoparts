---
target: aviso e cartões do orçamento do cliente
total_score: 7
max_score: 12
na_heuristics: 2,3,5,6,7,9,10
p0_count: 0
p1_count: 2
target_identity: "file:D:\\IntelliJ\\Workspace\\MK_Autoparts\\frontend\\src\\pages\\OrcamentoCliente.tsx"
target_fingerprint: "sha256:523320e1894dbb435a50c2d5701ccad3cfc4451fc9638f4362c61a32fb2d88ae"
target_path: "D:\\IntelliJ\\Workspace\\MK_Autoparts\\frontend\\src\\pages\\OrcamentoCliente.tsx"
timestamp: 2026-11-17T04-53-23Z
slug: frontend-src-pages-orcamentocliente-tsx
---
# Crítica: aviso de peça adicionada e cartões de item em /orcamento (celular)

Método: dual-agent. Somente leitura. Notas parciais: 1 Status 3 · 4 Consistência 2 · 8 Estética 2 (7/12).

- [P1] Aviso com 81 px e 3 linhas, a 5,7 px da barra por bottom fixo (150 px); cobre o cartão recém-adicionado. Ancorar na barra (bottom: 100% + 10px), cortar em 2 linhas, texto curto.
- [P1] Cartões de 193–231 px com 96–135 px vazios sob a foto; preço e 'Sob consulta' em linha própria. Grade: foto 56, lixeira no topo, quantidade e preço na mesma linha (162–168 px).
- [P2] Três avisos diferentes (site, admin, orçamento): canto, ícone, sombra, animação, corte. Unificar no estilo do aviso do site.
- [P2] Texto redundante ('LD e LE (os dois lados)') e diferente do vendedor. 'Par adicionado · <peça> (LD e LE)' nos dois.
- [P3] Peça nova fora da tela, sem atalho: botão 'Ver' que rola e destaca.

Detector: 0 achados (CLI e overlay). LD/LE do cartão com 36 px de altura (abaixo de 44). Sem rolagem lateral nem erros.
