# Briefing — MK Autoparts (landing + catálogo)

> Preenchido com o que se sabe hoje (Instagram e `docs/fontes/dados-empresa.md`).
> Campos vazios ou `[A CONFIRMAR]` **não podem ser inventados**: viram
> placeholders na página. Dúvidas abertas em `../../docs/client-questions.md`.

## 1. Negócio

- **Nome do negócio:** MK Autoparts (razão social Mk Auto Parts LTDA; grafia na
  página em `PEND-018`)
- **CNPJ:** 41.577.754/0001-96 (exibir no rodapé só se o cliente autorizar)
- **Desde:** 14/04/2021 (data de abertura)
- **Nicho / segmento:** loja de autopeças e suprimentos (Google); importação,
  exportação e distribuição de peças e acessórios para caminhões (Instagram)
- **Cidade:** Lages – SC
- **Bairro:** Ponte Grande
- **Região atendida:** todo o Brasil (envio)

## 2. Produtos e preços

- Fonte: PDF atual em `docs/produtos/`. Promoções: imagens
  enviadas hoje pelo WhatsApp (a receber, `PEND-016`).
- O PDF não tem preços. Só as promoções têm preço; os demais produtos aparecem sem
  valor e são orçados pelo WhatsApp (`DEC-008`).

## 3. Diferenciais

Só fatos confirmados:

- Envio para todo o Brasil (bio do Instagram).
- Importação, exportação e distribuição (bio do Instagram).
- Loja física em Lages – SC.
- [A CONFIRMAR: outros diferenciais]

## 4. Horário de funcionamento (Google)

| Dia | Abre | Fecha |
| --- | --- | --- |
| Segunda a sexta | 08:00–12:00 | 13:00–18:00 |
| Sábado | Fechado | |
| Domingo | Fechado | |
| Feriados | [A CONFIRMAR] | |

## 5. Endereço

- **Rua e número:** Av. Corina Caon, 103
- **Bairro:** Ponte Grande
- **Cidade / UF:** Lages – SC
- **CEP:** [A CONFIRMAR]
- **Coordenadas:** -27.799256140575427, -50.2957836672779
- **Link do Google Maps:** https://maps.app.goo.gl/Jy46cHxL9fPuc28v6

## 6. Contato

- **WhatsApp (pedidos):** (49) 99110-0096 — `https://wa.me/5549991100096`
- **Telefone:** (49) 3018-8278, exibido como "Ligar" (`DEC-014`); é o número do
  PDF, das artes e da fachada
- **Mensagem padrão do WhatsApp:** "Olá, MK Autoparts! Vi o catálogo online e
  gostaria de atendimento."
- **E-mail:** [A CONFIRMAR]
- Observação: o atendimento real é feito por vários atendentes e vendedores pelo
  WhatsApp; no protótipo há um único número (`DEC-009`).

## 7. Redes sociais

- **Instagram:** https://www.instagram.com/mk.autoparts__/ (@mk.autoparts__)
- **Google Meu Negócio, Facebook, TikTok, YouTube:** [A CONFIRMAR]

## 8. Site atual

- **URL:** não há (catálogo enviado em PDF, promoções em imagens pelo WhatsApp)
- **Domínio para a nova página:** [A CONFIRMAR]

## 9. Identidade visual

- **Logo:** sistema de logotipos v1.1 em `docs/design/` (selo oficial cromado,
  lettering vetorial em monograma, assinatura e horizontal; 6 variações de cor;
  favicons; `LEIA-ME.txt` e `site/brand-tokens.css`). Prancha em
  `docs/design/mk-prancha-sistema-de-marca.png`.
- **Cores da marca:** prata `#D9DEE5`, azul royal `#1C4FD0`, azul vivo `#3D7EFF`,
  azul-marinho `#0B1A36`, branco; gradiente cromado só para tela.
- **Fontes da marca:** lettering próprio (itálico 12°, MK pesado de quinas vivas,
  AUTOPARTS estendido); não há fonte de texto definida.
- **Estilo desejado (responsável humano):** landing bem fluida, animada, com
  componentes React, otimizada.
- **Referências** (`referencias/`, sem `notas.md` preenchido):
  - `mk-prancha-sistema-de-marca.png`: a própria marca (fundo azul-marinho,
    cromado, azul vivo, itálico).
  - `97eb3b…jpg`: loja online de motos — cabeçalho com busca e carrinho, faixa de
    categorias, banner com promoções laterais, grade de produtos com botão de
    adicionar, preço riscado, blocos de oferta.
  - `da7e5a…jpg`: loja de autopeças — menu lateral de categorias, banner escuro,
    faixa de vantagens com ícones, blocos de categoria, produtos em abas.
  - `exemplo.jpg`: oficina/autopeças — fundo claro, mosaico de categorias com foto
    grande de peça em cartões arredondados, grade "por que nós" com ícones.
  - Artes de promoção do cliente: fundo azul escuro, cromado, faixas vermelhas e
    preço em amarelo (linguagem atual da marca nas redes).
- **O que o cliente NÃO quer:** [A CONFIRMAR]

## 10. Depoimentos reais

Nenhum autorizado até agora. O Instagram tem um destaque "Clientes" (`PEND-008`).

## 11. Fotos disponíveis

| Arquivo | O que mostra | Pode usar no topo? |
| --- | --- | --- |
| `image.png` (878×877) | Fachada do galpão verde-água com a placa da MK e fornecedores, céu azul | Sim (com tratamento) |
| `image1.png` (807×880) | Galpão de estoque: prateleiras, caixas, motos | Sim |
| `image2.png` (840×866) | Galpão de estoque em ângulo aberto, paletes e caixas | Sim |
| `image3.png` (492×746) | Arte "Reposição de estoque" (post do Instagram) | Não (é arte, com texto) |
| `catalogo-pdf/…pdf` | Fotos das peças (recortadas para `public/img/produtos/`) | Cards |
| `produtos/promo*.jpeg` (1024×1536) | Artes de promoção com preço | Carrossel de promoções |

## 12. Objetivo da página

- [x] Consultar o catálogo (objetivo principal: substituir o PDF)
- [x] Chamar no WhatsApp (via lista de orçamento)
- [x] Visitar a loja (endereço, horário e mapa)

**Ação principal:** encontrar a peça no catálogo e enviar a lista de orçamento pelo
WhatsApp. A landing institucional é secundária e deve ser rápida.

## 13. Tom de voz

- [x] Profissional e confiável [A CONFIRMAR]
- **Tratamento:** você
- **Público principal:** clientes atendidos pelos vendedores (oficinas, frotistas,
  caminhoneiros, revendas) [A CONFIRMAR]

## 14. Observações

- Protótipo para apresentação; não publicar sem pedido.
- Logos de montadoras e marcas de peças só com autorização.
- Formas de pagamento, troca e garantia: [A CONFIRMAR]; não citar na página antes.
