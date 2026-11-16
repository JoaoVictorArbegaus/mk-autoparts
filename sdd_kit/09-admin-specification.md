# 09 — Especificação da administração

## Protótipo: admin de demonstração (`DEC-015`)

Só visual: os produtos do site continuam no arquivo de dados (`frontend/src/content/`).

| Rota | Tela |
| --- | --- |
| `/admin` | Login simulado (qualquer usuário e senha) |
| `/admin/produtos` | Lista com busca, filtro por categoria e situação, ativar/desativar, "Novo produto" |
| `/admin/produtos/novo`, `/admin/produtos/editar?slug=` | Formulário: nome, categoria, marca, lados LD/LE com códigos MK e originais, aplicações (marca do veículo, modelo, anos), descrição, foto (prévia local) e situação ativo/inativo |
| `/admin/promocoes` | Produtos em promoção, preço e preço "de"; adicionar e remover |
| `/admin/vendedores` | Lista, novo vendedor, link `?v=` com copiar, ativar/desativar; WhatsApp do vendedor real (`DEC-022`); fila do rodízio |
| `/admin/metricas` | Painel de métricas (`RN-10`) |

Regras: selo "Demonstração: nada é salvo no site" em todas as telas; edições ficam na memória da
sessão do admin; sem eventos de rastreio; `noindex`; sair apaga a sessão simulada.

Acréscimo para a próxima versão do protótipo: `/admin/vendedores` mostra a fila do
rodízio e o próximo da vez (`RN-11`), com foto ou iniciais de cada vendedor (`RN-12`).

## Painel do vendedor (`DEC-018`)

Área separada da administração do catálogo, só para vendedores, em `/vendedor`. O
administrador principal controla quais contas acessam (`DEC-021`). No protótipo é
simulada e sem persistência.

| Tela | Função |
| --- | --- |
| Login simulado | Escolhe um vendedor; sem senha real |
| Orçamentos | Lista dos orçamentos ativos, aviso "Alterado pelo cliente" com o que mudou, "Marcar como visto" e "Encerrar" (`RN-13`) |
| Novo orçamento | Busca no catálogo, lado, quantidade, observação e cliente opcional (`RN-13`) |
| Preços | Preço unitário por item (ou sem preço) e desconto em valor ou %, por item ou no total, com preço antigo riscado e porcentagem (`RN-13`) |
| Resultado | "Copiar link", "Baixar PDF" e "Baixar Word", à escolha do vendedor |

Fora do protótipo: login real, histórico de orçamentos, status, métricas pessoais e
permissões (`PEND-023`). O documento segue a identidade de `docs/design/`, com o
logo principal (`DEC-020`), e nunca mostra estoque (`RN-14`).

## Produto definitivo

Para o produto definitivo, levantar com o cliente (`docs/client-questions.md`):
quem cadastra os produtos, quantos são, com que frequência os itens mudam, se há
importação em massa por planilha e se há mais de um usuário. Referência de formato:
`D:\IntelliJ\Workspace\KiProdutos\sdd_kit\09-admin-specification.md`.
