# Publicação temporária do protótipo na VPS

Este roteiro resume a publicação autorizada do protótipo. A especificação operacional,
os templates e o rollback estão em [`deploy/vps/README.md`](../deploy/vps/README.md).

## Destino definido

- URL: `https://mkautoparts.jksoftware.com.br`.
- DNS: registro `A` ativo em modo `Proxied`, apontando a origem para a VPS.
- Host: VPS compartilhada da MKS IA.
- Diretório: `/opt/mksia/sites/mk-autoparts`.
- Projeto/rede: `mk-autoparts` / `mk_autoparts_edge`.
- Entrada pública: somente o Nginx central em 80/443.
- Acesso: público, sem Cloudflare Access ou lista de identidades (`DEC-016`). A origem
  HTTPS aceita somente faixas oficiais da Cloudflare para impedir acesso direto ao IP.
- SSL da zona: modo geral `Full`, com Configuration Rule `Strict` ativa somente para
  esse hostname, sem mudar os outros sites da zona.

O `/admin` aceita qualquer usuário e senha porque é uma demonstração, não salva nada
e não altera o catálogo público. Ele também é acessível por URL direta. `noindex` não
é controle de acesso e serve somente para desencorajar indexação.

## Estado implantado

- Build com `SITE_URL` definitivo e 86 rotas pré-renderizadas mais 404.
- Gerador local de release `.tar.gz` com SHA-256.
- Container Nginx sem privilégios, filesystem somente leitura, limites, healthcheck
  e rotação de logs.
- Rede interna própria, sem porta publicada no host.
- Template de bootstrap HTTP que responde 503 durante uma nova emissão inicial de TLS.
- Proxy HTTPS, restrição da origem às faixas da Cloudflare e renovação automática do
  certificado pelo cron diário existente na VPS.
- Releases imutáveis com troca por link `current` e rollback para a pasta anterior.

## Sequência de subida

1. Gerar a release com `deploy/vps/New-Release.ps1` numa árvore Git limpa.
2. Conferir o SHA-256 e instalar a release num diretório novo da VPS.
3. Subir somente o Compose `mk-autoparts` e validar o healthcheck interno.
4. Integrar `mk_autoparts_edge` ao Nginx do Compose `core`, sem recriar outras stacks.
5. Instalar o bootstrap HTTP e emitir o certificado com Certbot/webroot.
6. Validar o cron de renovação existente e instalar a lista oficial de IPs da Cloudflare.
7. Ativar o proxy DNS público e a regra SSL `Strict` apenas para o hostname.
8. Trocar para o virtual host HTTPS, validar Nginx e executar os smoke tests.

## Critérios antes de abrir

- [x] Release e checksum conferidos.
- [x] Container `healthy` e upstream interno respondendo `ok`.
- [x] Certificado válido, regra SSL `Strict` e renovação simulada com sucesso.
- [x] Acesso direto à origem bloqueado; hostname público acessível sem login.
- [x] Landing, catálogo, produto, painel, admin e 404 validados.
- [x] `X-Robots-Tag: noindex, nofollow` confirmado.
- [x] Canonical e Open Graph usam o subdomínio definitivo.
- [x] Console vazio e celular sem rolagem lateral.
- [x] Outras stacks continuam saudáveis e sem reinícios.

Não há banco nem volume persistente no protótipo. Eventos, lista e sessão ficam no
navegador de cada visitante.
