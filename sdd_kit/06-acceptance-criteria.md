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

## AC-10 — Atendimento travado e rodízio (simulados, `DEC-017`)

- Com `?v=<código>` válido, a lista não mostra a seção de escolha de vendedor, e
  "Solicitar orçamento" abre o WhatsApp desse vendedor, com a mensagem iniciada pelo
  nome dele. Abrir depois o link de outro vendedor troca a atribuição.
- Sem vendedor, com a fila A B C D E F, o primeiro pedido vai para A e a fila vira
  B C D E F A.
- Com a fila A B C D E F, escolher D abre o WhatsApp de D e a fila vira A B C E F D;
  escolher F em seguida leva a A B C E D F.
- Desativar um vendedor no admin de demonstração tira o nome dele da fila.
- Sem vendedor, "Escolher um vendedor" mostra foto (ou iniciais) e nome de cada
  vendedor ativo.
- Cada vendedor abre o WhatsApp do próprio número (`03-domain-model.md`).
- Um vendedor fora do horário é pulado no rodízio sem perder a posição e não aparece em
  "Escolher um vendedor"; ao voltar ao horário, reaparece e volta a receber pedidos.
- Com todos fora do horário, "Solicitar orçamento" abre o WhatsApp da empresa.

## AC-11 — Painel do vendedor (simulado, `DEC-018`)

- `/vendedor` não aparece na navegação pública nem na indexação e exige o login simulado.
- Montar um orçamento com lado e quantidade, informar preços e um desconto, e gerar o
  link: abrir o link em outra aba mostra os mesmos itens, preços e desconto, e
  "Atendimento: `<nome do vendedor>`".
- Desconto em valor ou em porcentagem, em item ou no total: o preço antigo aparece
  riscado, o novo logo abaixo e a porcentagem ao lado; o total confere com os preços e
  descontos.
- Um orçamento enviado sem preço aparece com "sob consulta" e sem total.
- No link, o cliente altera a quantidade, adiciona um produto (entra "sob consulta") e usa
  "Solicitar orçamento" ou "Falar com `<nome>`", sempre para o vendedor dono do link.
- O PDF e o documento editável trazem o logo principal, o vendedor, o cliente, os itens
  com código, lado, quantidade e preço, o desconto, o total e a observação.
- Item sem preço informado aparece como "sob consulta" e não entra no total.
- Nenhum arquivo ou página do orçamento mostra quantidade em estoque.
- Item removido do catálogo antes de abrir o link sai da lista com aviso.
- O orçamento gerado aparece como ativo no painel. Ao alterar a quantidade ou adicionar um
  produto pelo link (em outra aba do mesmo navegador), o painel mostra "Alterado pelo
  cliente" com o que mudou; "Marcar como visto" tira o aviso e "Encerrar" tira o orçamento
  da lista de ativos.

## AC-12 — Sem quantidades públicas (`DEC-019`)

- Na landing e no catálogo, nenhuma marca de veículo, categoria ou bloco mostra
  número de peças, nem o contador de resultados; o botão do filtro no celular diz "Ver
  resultados".
- O bloco "Sobre" não mostra números de peças, categorias nem montadoras e traz "Desde
  2021", "Envio para todo o Brasil" e "Loja em Lages – SC".
- O HTML pré-renderizado também não traz esses números em texto visível nem em dados
  estruturados.

## AC-13 — Hero com mosaico (`DEC-024`)

- O hero da landing mostra um mosaico de fotos reais de produtos e não mostra a foto do
  caminhão; nenhuma peça do mosaico tem preço, quantidade ou arte de promoção.
- Cada peça do mosaico abre o produto correspondente; todo `slug` do mosaico existe e está
  ativo (a validação do build falha se não).
- Sem rolagem lateral em 390 px e sem erros de console. Lighthouse no celular conferido
  depois da troca (`RNF-05`).
