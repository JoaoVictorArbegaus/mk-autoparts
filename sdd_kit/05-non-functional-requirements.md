# 05 — Requisitos não funcionais

## Experiência

- **RNF-01** Páginas vivas, fluidas e responsivas, conforme a "Preferência padrão:
  páginas vivas" do agente gerador-landing: fundos animados discretos, transições
  entre seções, entradas e microinterações.
- **RNF-02** Mobile-first. Prioridade ao celular: boa parte dos clientes de peças
  de caminhão acessa pelo telefone, inclusive na estrada.
- **RNF-03** Filtrar e buscar responde de imediato (sem requisição de rede).

## Desempenho

- **RNF-04** Todas as rotas pré-renderizadas no build (landing, catálogo e cada
  produto), com HTML contendo o conteúdo principal.
- **RNF-05** Metas no celular (Lighthouse, rede 4G simulada): LCP ≤ 2,5 s,
  CLS ≤ 0,1, desempenho ≥ 85. Medição registrada na PROTO-05.
- **RNF-06** Imagens WebP com `width`/`height`, `loading="lazy"` fora da primeira
  dobra e versões menores via `srcSet` quando houver.
- **RNF-07** Efeitos animados só rodam visíveis e com a aba ativa, DPR ≤ 1,5, com
  fallback estático sem GPU.

## Acessibilidade

- **RNF-08** WCAG 2.1 AA: contraste, foco visível, navegação por teclado, `alt` em
  PT-BR, `aria-label` em botões só com ícone, alvos de toque ≥ 44 px.
- **RNF-09** Movimento reduzido respeitado com todo o conteúdo visível.
- **RNF-10** Campo de busca com fonte ≥ 16 px no celular (sem zoom automático no
  iPhone).

## SEO

- **RNF-11** `title`, `description`, canonical e Open Graph por rota; produto usa
  a própria imagem no `og:image`, com o logo como alternativa.
- **RNF-12** JSON-LD `AutoPartsStore` na landing, com nome, endereço, `geo`,
  horário (`openingHoursSpecification`), telefone do WhatsApp e Instagram em
  `sameAs`, só com dados do briefing; `Product` no detalhe, com `Offer` somente
  quando o produto estiver em promoção. Sem domínio definido, placeholder claro.

## Simulação

- **RNF-14** O registro de eventos não atrasa a interação: escrita agrupada no
  `localStorage`, nunca durante o render, e falha de armazenamento (cota, modo
  privado) não quebra a página.
- **RNF-15** O painel é pré-renderizado como estrutura e calcula os números depois
  da montagem; gráficos seguem a skill `dataviz` e são acessíveis (tabela ou texto
  equivalente).

## Compatibilidade

- **RNF-13** Últimas duas versões de Chrome, Safari (iOS), Edge e Firefox; Android
  Chrome em aparelho intermediário.
