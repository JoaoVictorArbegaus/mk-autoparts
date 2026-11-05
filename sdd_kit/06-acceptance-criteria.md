# 06 — Critérios de aceite do protótipo

## AC-01 — Landing

- Dado que o visitante abre `/`, então vê hero, montadoras, categorias, promoções
  e destaques, sobre/envio para o Brasil, clientes, loja e contato, nessa ordem ou na aprovada em
  `frontend/design/direcao-visual.md`.
- Ao clicar numa categoria, o catálogo abre filtrado por ela (`?categoria=<slug>`).
- Ao clicar numa montadora, o catálogo abre filtrado por ela (`?montadora=<slug>`).

## AC-02 — Busca e filtros

- Buscar por um código com hífen ou ponto encontra o produto escrito sem eles, e
  vice-versa.
- Combinar categoria + montadora + modelo + marca + promoção mostra só os produtos que atendem
  a todos.
- Trocar a montadora limpa o modelo selecionado.
- Recarregar a página com a URL filtrada mostra o mesmo resultado.
- Sem resultados, aparecem o estado vazio, "Limpar filtros" e o link de WhatsApp.

## AC-03 — Preço só em promoção

- Produto fora de promoção não mostra preço em card, detalhe, lista, metadado ou
  mensagem do WhatsApp.
- Produto em promoção mostra selo e preço promocional; o preço original riscado só
  aparece se existir no dado.
- "Somente promoções" lista apenas produtos com `promocao`.
- A lista nunca mostra total.

## AC-04 — Lista de orçamento

- Adicionar o mesmo produto duas vezes soma as quantidades.
- Quantidade fora de 1–999 é corrigida para o limite mais próximo.
- Recarregar a página mantém a lista e a observação.
- Um slug salvo que não existe mais é removido com aviso.
- "Enviar pelo WhatsApp" abre `https://wa.me/5549991100096?text=...` com a
  mensagem de `RN-05`, corretamente codificada (acentos e quebras de linha), com a
  observação só quando preenchida.

## AC-05 — Detalhe

- `/produto/<slug>` válido mostra todos os campos de `RF-13` presentes no dado.
- `/produto/inexistente` mostra "produto não encontrado" com link ao catálogo.

## AC-06 — Qualidade

- `npm run build` passa (typecheck, validação de dados, build, pré-renderização).
- Console sem erros nem avisos de hidratação nas rotas principais.
- Sem rolagem lateral em 390 px.
- Screenshots 1440×900 e 390×844 conferidos, inclusive com movimento reduzido.

## AC-07 — Link de vendedor (simulado)

- Abrir `/?v=<código válido>` mostra "Atendimento: `<nome>`"; navegar e recarregar
  sem o parâmetro mantém o aviso.
- Abrir depois `/?v=<outro código>` troca o vendedor.
- `?v=inexistente` não mostra aviso e não apaga um vendedor válido já gravado.
- Com vendedor, "Enviar pelo WhatsApp" abre o número do vendedor e a mensagem
  começa com o nome dele.

## AC-08 — Eventos e carrinhos (simulados)

- Abrir um produto, adicionar, remover e enviar a lista gera os eventos
  correspondentes com o vendedor da sessão.
- Enviar a lista marca o carrinho como finalizado; alterar a lista depois abre um
  novo carrinho.
- Uma lista com itens não enviada aparece como não finalizada no painel.

## AC-09 — Painel (simulado)

- `/painel` mostra o selo de demonstração, os indicadores de `RN-10` e não aparece
  na navegação nem na indexação.
- Depois de clicar num produto no site, o painel mostra um clique a mais nele.
- Filtrar por um vendedor mostra só os números dele.
- "Zerar dados da demonstração" volta os números à base fictícia.
