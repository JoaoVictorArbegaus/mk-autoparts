---
target: área do vendedor e orçamento do cliente (celular)
total_score: 19
max_score: 36
na_heuristics: 10
p0_count: 0
p1_count: 4
target_identity: "file:D:\\IntelliJ\\Workspace\\MK_Autoparts\\frontend\\src\\vendedor\\VendedorArea.tsx"
target_fingerprint: "sha256:67ec702a9df47a38ba5dae8f6acf75375d3d3215bb1f7359136465197aba8397"
target_path: "D:\\IntelliJ\\Workspace\\MK_Autoparts\\frontend\\src\\vendedor\\VendedorArea.tsx"
timestamp: 2026-11-17T01-51-47Z
slug: frontend-src-vendedor-vendedorarea-tsx
---
# Crítica: área do vendedor (/vendedor) e orçamento do cliente (/orcamento), foco no celular

Método: dual-agent (A: revisão de design · B: detector + navegador). Somente leitura.

## Notas Nielsen (19/36, Aceitável; 10 n/a: protótipo, ajuda suficiente)
1 Status 2 · 2 Mundo real 3 · 3 Controle 1 · 4 Consistência 3 · 5 Prevenção 2 · 6 Reconhecimento 3 · 7 Eficiência 1 · 8 Estética 2 · 9 Erros 2 · 10 n/a

## Medições (celular)
Topo do vendedor 116 px (390) e 164 px em 3 linhas (360). Item do editor 357–415 px; editor com 3 itens 2.191–2.274 px; "Salvar e gerar link" em y≈2.078–2.161. Card da lista 324–385 px, ações em 148 px. /orcamento com 3 itens: total em y≈1.036, "Solicitar orçamento" em y≈1.207 (tela de 664); faixa vazia de ~96 px antes do título. Sem rolagem lateral, sem erros de console, fontes dos campos 16 px, inputMode decimal nos valores, contraste AA em todos os textos secundários.

## Problemas prioritários
- [P1] Editor no celular: total e salvar ~2.000 px abaixo; resultados da busca abaixo da dobra/teclado. Barra fixa com total + salvar; rolar a busca para o topo ao focar; busca antes de Cliente/Validade.
- [P1] Topo do vendedor ocupa 116–164 px fixos. Topo enxuto em 1 linha (selo, avatar, sair) e abas fora do fixo ou embaixo.
- [P1] Excluir link e Encerrar sem confirmação nem desfazer; 5 botões iguais por card. Manter Copiar/Enviar + Editar; resto em "Mais"; confirmar ou desfazer na exclusão.
- [P1] Envio pelo celular: sem compartilhar nativo (navigator.share); "Link copiado" aparece mesmo se a cópia falhar; link base64 longo à mostra; PDF/Word desativados ocupam espaço.
- [P2] /orcamento: total e ações ~2 telas abaixo; sem total por linha (qtd > 1); vazio no topo; % do total quebra de linha. Barra fixa com total + Solicitar; total da linha; menos vazio.
- [P2] Campos do editor: busca com recuo para ícone ausente; placeholder "Vazio = sob consu…" cortado; valor sem formatação 1.250,00; lado como select estreito (42 px).

## Detector
CLI e overlay: 0 achados nas três telas. Alvos < 44 px: link da marca (40 px alto), selects de lado/tipo (42–43 px de largura), campo numérico do stepper (botões ± ok); links do rodapé global (36 px).

## Menores
Selo e título desalinhados com a coluna no desktop; "Novo orçamento" após salvar pode não limpar o formulário; link inválido sem saída (WhatsApp da loja/catálogo); cabeçalho do cliente mostra o contador da lista em 0 ao lado do orçamento; adicionar peça no cliente não avisa que entra sob consulta; frase de alívio no aviso de horário.
