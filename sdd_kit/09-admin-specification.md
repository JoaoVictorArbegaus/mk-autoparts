# 09 — Especificação da administração

## Protótipo: admin de demonstração (`DEC-015`)

Só visual: os produtos do site continuam no arquivo de dados (`frontend/src/content/`).

| Rota | Tela |
| --- | --- |
| `/admin` | Login simulado (qualquer usuário e senha) |
| `/admin/produtos` | Lista com busca, filtro por categoria e situação, ativar/desativar, "Novo produto" |
| `/admin/produtos/novo`, `/admin/produtos/editar?slug=` | Formulário: nome, categoria, lados LD/LE com códigos MK e originais, aplicações (marca do veículo, modelo, anos), descrição, foto (prévia local), destaque, ativo |
| `/admin/promocoes` | Produtos em promoção, preço e preço "de"; adicionar e remover |
| `/admin/vendedores` | Lista, novo vendedor, link `?v=` com copiar, ativar/desativar; WhatsApp do vendedor = número da empresa na demonstração |
| `/admin/metricas` | Painel de métricas (`RN-10`) |

Regras: selo "Demonstração: nada é salvo no site" em todas as telas; edições ficam na memória da
sessão do admin; sem eventos de rastreio; `noindex`; sair apaga a sessão simulada.

## Produto definitivo

Para o produto definitivo, levantar com o cliente (`docs/client-questions.md`):
quem cadastra os produtos, quantos são, com que frequência os itens mudam, se há
importação em massa por planilha e se há mais de um usuário. Referência de formato:
`D:\IntelliJ\Workspace\KiProdutos\sdd_kit\09-admin-specification.md`.
