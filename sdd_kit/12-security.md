# 12 — Segurança

## Protótipo

Sem backend, sem login e sem dados pessoais coletados. Regras que valem:

- Nenhum segredo, token ou credencial no código ou no build.
- Links externos com `rel="noopener"`; mensagens do WhatsApp sempre com
  `encodeURIComponent`.
- Conteúdo dos dados renderizado como texto pelo React; sem
  `dangerouslySetInnerHTML` com dados de produto.
- `localStorage` guarda só a lista, o vendedor atribuído, um identificador anônimo
  de visitante, eventos e carrinhos da demonstração (`03-domain-model.md`); nenhum
  dado pessoal. Dado salvo é validado ao ler e descartado se inválido.
- O código `?v=` só é aceito se existir na lista de vendedores; nunca é exibido
  sem ser o nome cadastrado.
- `/painel` não tem login porque só mostra dados fictícios e do próprio navegador;
  no produto definitivo, painel exige autenticação.
- Se o protótipo for publicado num endereço temporário, marcar `noindex` para não
  ser indexado antes do produto definitivo (`13-infrastructure.md`).

## Produto definitivo

Definir junto com backend e painel. Referência:
`D:\IntelliJ\Workspace\KiProdutos\sdd_kit\12-security.md`.
