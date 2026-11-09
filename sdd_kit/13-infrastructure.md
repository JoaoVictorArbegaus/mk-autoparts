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
  proxy reverso com HTTPS, `noindex`, rotas servidas pelos `index.html`
  pré-renderizados e `404.html` como fallback. Por decisão explícita, o protótipo
  publicado é acessível ao público sem autenticação (`DEC-016`). Roteiro em
  `docs/deploy-vps.md`.
- A publicação temporária autorizada usa
  `https://mkautoparts.jksoftware.com.br`, proxy público da Cloudflare e a VPS
  compartilhada da MKS IA. O site fica em `/opt/mksia/sites/mk-autoparts`, num
  projeto Compose e numa rede interna próprios, sem porta publicada no host. O
  Nginx central é o único ponto de entrada; a origem aceita o proxy final somente
  das faixas oficiais da Cloudflare. Artefatos e rollback seguem o pacote versionado
  em `deploy/vps/`.
- Estado atual: release `65e611cc3dd0` publicada, container saudável, certificado
  Let's Encrypt com renovação simulada, DNS proxied e SSL `Strict` limitado ao
  hostname. As demais stacks da VPS permanecem isoladas.

## Produto definitivo

Hospedagem, domínio, containers, mídia e backup serão decididos depois da
apresentação. Referência: `D:\IntelliJ\Workspace\KiProdutos\sdd_kit\13-infrastructure.md`.
