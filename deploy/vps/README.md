# Publicação do MK Autoparts na VPS compartilhada

Este pacote prepara a publicação temporária em
`https://mkautoparts.jksoftware.com.br`. Ele não cria backend, banco ou persistência
no servidor. O protótipo é público e não exige autenticação (`DEC-016`).

## Topologia

```text
Cloudflare público ── HTTPS
        │
        ▼
Nginx central da VPS
        │ rede interna mk_autoparts_edge
        ▼
Nginx do site :8080 ── release estática pré-renderizada
```

- Diretório: `/opt/mksia/sites/mk-autoparts`.
- Projeto Compose: `mk-autoparts`.
- Rede interna: `mk_autoparts_edge`, subnet `172.23.18.0/24`.
- Alias do upstream: `mk-autoparts:8080`.
- Nenhuma porta do site é publicada no host.
- Releases ficam em `releases/<release-id>`; `current` aponta para a release ativa.

Antes da execução, reconfirmar que a subnet continua livre. A coleta de preparação
encontrou livres `172.23.18.0/24` e os recursos necessários na VPS.

## Arquivos

| Arquivo | Destino/uso |
| --- | --- |
| `compose.yml` | `/opt/mksia/sites/mk-autoparts/compose.yml` |
| `nginx/site.conf` | `/opt/mksia/sites/mk-autoparts/nginx/default.conf` |
| `nginx/central-http-bootstrap.conf` | bootstrap ACME, ainda responde 503 |
| `nginx/central-https.conf` | proxy HTTPS definitivo |
| `core-compose-network-snippet.yml` | integração persistente da rede no Compose `core` |
| `scripts/refresh-cloudflare-origin-ips.sh` | restringe a origem aos IPs oficiais da Cloudflare |
| `New-Release.ps1` | build, validação, pacote e SHA-256 no computador de operação |

## Estado do destino e pré-condições para uma nova instalação

- O `A` de `mkautoparts.jksoftware.com.br` está `Proxied` e aponta a origem para
  `45.55.94.42`.
- Durante a emissão inicial do certificado, o registro fica em **DNS only**.
- Depois de emitir o certificado, mudar o registro para **Proxied**; o hostname
  continuará público e não terá tela de login da Cloudflare.
- A zona usa SSL `Full` no geral e já possui uma Configuration Rule `Strict` limitada
  ao hostname; não alterar a zona inteira sem validar os outros sites.
- Não ativar `nginx/central-https.conf` antes de o certificado e a lista de IPs da
  Cloudflare estarem instalados.

## 1. Gerar a release local

Com a árvore Git limpa:

```powershell
pwsh -File deploy/vps/New-Release.ps1
```

O script instala exatamente o lockfile, compila com o `SITE_URL` definitivo, verifica
arquivos essenciais e gera em `deploy/vps/out/` o `.tar.gz` e seu `.sha256`. Para uma
preparação ainda não commitada, `-AllowDirty` é explícito; uma publicação normal deve
usar uma release commitada.

## 2. Preparar diretórios e enviar os arquivos

Os comandos exatos de `scp` devem usar a chave operacional fora do repositório.
Criar na VPS:

```text
/opt/mksia/sites/mk-autoparts/
├── compose.yml
├── current -> releases/<release-id>
├── deploy/
├── nginx/default.conf
└── releases/<release-id>/
```

No recebimento da release:

1. conferir o SHA-256 antes de extrair;
2. extrair num diretório novo com o identificador da release;
3. conferir `index.html`, `catalogo/index.html`, `painel/index.html`,
   `admin/index.html` e `404.html`;
4. trocar `current` somente depois das conferências.

Não apagar a release anterior: ela é o rollback imediato.

## 3. Subir somente o container do site

Executar a partir de `/opt/mksia/sites/mk-autoparts`:

```bash
docker compose config
docker compose up -d
docker compose ps
docker compose exec -T web wget -q -O - http://127.0.0.1:8080/healthz
```

O resultado esperado é `healthy` e corpo `ok`.

## 4. Conectar o Nginx central de forma persistente

Fazer backup de `/opt/mksia/core/docker-compose.yml`. Integrar as duas entradas de
`core-compose-network-snippet.yml`: uma em `services.nginx.networks` e outra no bloco
raiz `networks`. Validar sem exibir o `.env`:

```bash
cd /opt/mksia/core
docker compose config --quiet
docker network connect mk_autoparts_edge nginx
docker exec nginx wget -q -O - http://mk-autoparts:8080/healthz
```

`docker network connect` pode informar que o endpoint já existe; nesse caso não há
erro operacional. Não recriar os serviços `core` nesta publicação.

## 5. Bootstrap HTTP e certificado

Instalar `central-http-bootstrap.conf` como
`/opt/mksia/core/nginx/conf.d/mk-autoparts.conf`, executar `nginx -t` e recarregar o
Nginx. O endereço deve responder 503, exceto no webroot ACME.

Emitir o certificado usando o mesmo volume de certificados já existente:

```bash
docker run --rm \
  --name certbot-mk-autoparts-issue \
  --volume /opt/mksia/core/nginx/letsencrypt:/etc/letsencrypt \
  --volume /opt/mksia/core/nginx/www:/var/www/certbot \
  certbot/certbot@sha256:f70ad0adbb7e117f0fe42a63c553f28ea451edabc0148757b6efcd9735acaa20 \
  certonly --webroot --webroot-path /var/www/certbot \
  --non-interactive --agree-tos \
  --cert-name mkautoparts.jksoftware.com.br \
  -d mkautoparts.jksoftware.com.br
```

## 6. Renovação e restrição da origem

O `crontab` existente do usuário `deploy` executa diariamente `certbot renew` sobre o
volume compartilhado de certificados e reinicia o Nginx após sucesso. O dry-run do
novo certificado deve passar antes de encerrar a publicação.

Instalar e executar `refresh-cloudflare-origin-ips.sh`; ele gera um include com as
faixas oficiais da Cloudflare. Essa restrição bloqueia o acesso direto ao IP da VPS,
mas não exige login nem restringe os visitantes que usam o hostname público.

Conferir:

```bash
crontab -l | grep 'certbot/certbot renew'
test -s /opt/mksia/core/nginx/conf.d/snippets/mk-autoparts-cloudflare-ips.conf
```

## 7. Proxy público da Cloudflare e ativação HTTPS

1. Criar uma Configuration Rule para esse hostname com SSL `Strict`.
2. Mudar o registro `A` para **Proxied**.
3. Não criar aplicação do Cloudflare Access: o protótipo é público (`DEC-016`).
4. Substituir o bootstrap por `nginx/central-https.conf`.
5. Executar `docker exec nginx nginx -t` e somente então recarregar o Nginx.

Com a origem restrita, uma chamada direta ao IP com o `Host` do site deve receber
`403`; pelo hostname público, qualquer visitante deve receber o site normalmente.

## 8. Smoke test

Validar pelo hostname público:

- `/`, `/catalogo`, um `/produto/<slug>`, `/painel`, `/admin` e uma rota inexistente;
- status 200 nas rotas válidas e 404 na inexistente;
- `X-Robots-Tag: noindex, nofollow`;
- canonical e Open Graph com `https://mkautoparts.jksoftware.com.br`;
- assets com cache longo e HTML com `no-cache`;
- console do navegador vazio e ausência de rolagem lateral no celular;
- nenhum reinício ou mudança de saúde nas outras stacks.

## Atualização e rollback

Uma atualização cria outra pasta em `releases/`, confere o pacote, troca `current` e
recria somente `mk-autoparts-web-1` para o bind mount seguir o novo link. Para rollback,
apontar `current` à release anterior e recriar somente esse container. Nginx central,
certificado, rede e Cloudflare não mudam numa atualização normal.

Nunca executar `docker compose down` no diretório `core` para atualizar este site.
