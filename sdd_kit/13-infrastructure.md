# 13 — Infraestrutura

## Protótipo

- Execução local: `npm run dev` ou `npm run build && npm run preview` em
  `frontend/`.
- Container: `frontend/Dockerfile` faz o build e serve `dist/` com Nginx;
  `frontend/docker-compose.yml` publica por padrão somente em
  `127.0.0.1:8084`, com healthcheck e reinício automático.
- A URL pública é informada por `SITE_URL` no build para canonical, Open Graph e
  JSON-LD. Sem valor, permanece o domínio `.invalid` explícito.
- Publicação temporária para a apresentação (opcional, somente com pedido humano):
  proxy reverso com HTTPS, senha ou restrição de IP, `noindex`, rotas servidas
  pelos `index.html` pré-renderizados e `404.html` como fallback. Roteiro em
  `docs/deploy-vps.md`.

## Produto definitivo

Hospedagem, domínio, containers, mídia e backup serão decididos depois da
apresentação. Referência: `D:\IntelliJ\Workspace\KiProdutos\sdd_kit\13-infrastructure.md`.
