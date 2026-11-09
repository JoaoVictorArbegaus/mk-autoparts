# Preparação do protótipo para VPS

Este roteiro prepara uma publicação temporária do protótipo. Não é o desenho de
produção do produto definitivo.

## Estado preparado no repositório

- Build em duas etapas definido no Dockerfile; o mesmo build foi validado com Node
  antes da subida.
- Site estático servido por Nginx.
- Healthcheck do container.
- Reinício automático (`unless-stopped`).
- Rotas pré-renderizadas e página 404.
- Cabeçalho `X-Robots-Tag: noindex, nofollow`.
- Porta vinculada a `127.0.0.1` por padrão.
- URL pública configurável no build.

## Informações necessárias antes da subida

- IP e acesso SSH da VPS.
- Sistema operacional e usuário de deploy.
- Domínio ou endereço temporário.
- Proxy reverso já existente, se houver.
- Forma de restringir o protótipo: senha ou lista de IPs.

> O `/admin` aceita qualquer usuário e senha porque é uma demonstração. `noindex`
> não é controle de acesso. Enquanto o protótipo estiver público, proteger todo o
> endereço com senha no proxy reverso ou limitar os IPs autorizados.

## 1. Pré-requisitos na VPS

- Git.
- Docker Engine.
- Plugin Docker Compose.
- Firewall liberando somente SSH, HTTP e HTTPS.
- Proxy reverso com TLS quando houver domínio.

Conferência:

```bash
git --version
docker --version
docker compose version
```

## 2. Obter o projeto

```bash
git clone https://github.com/JoaoVictorArbegaus/mk-autoparts.git
cd mk-autoparts/frontend
cp .env.example .env
```

Editar `.env`:

```dotenv
SITE_URL=https://endereco-do-prototipo.example
IP_BIND=127.0.0.1
PORTA=8084
```

`SITE_URL` entra no canonical, Open Graph e JSON-LD durante o build. O arquivo
`.env` não deve ser commitado.

## 3. Validar e subir

```bash
docker compose config
docker compose up -d --build
docker compose ps
curl -I http://127.0.0.1:8084/
```

Resultado esperado:

- container `healthy`;
- resposta HTTP `200` na landing;
- cabeçalho `X-Robots-Tag: noindex, nofollow`;
- `/catalogo`, `/produto/<slug>`, `/painel` e `/admin` acessíveis pelo proxy.

## 4. Proxy reverso

O container fica em `127.0.0.1:8084`. O proxy reverso da VPS recebe HTTPS e
encaminha para esse endereço.

Exemplo mínimo de destino:

```text
https://endereco-do-prototipo.example
        → proxy reverso com TLS e senha
        → http://127.0.0.1:8084
```

No Nginx do host, o bloco principal deve incluir algo equivalente a:

```nginx
location / {
    proxy_pass http://127.0.0.1:8084;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Adicionar `auth_basic` no proxy do host ou uma regra de IP. As credenciais e os
certificados pertencem à VPS e nunca entram neste repositório.

## 5. Atualizar uma publicação

```bash
cd mk-autoparts
git pull --ff-only
cd frontend
docker compose up -d --build
docker image prune -f
```

Depois da atualização:

```bash
docker compose ps
docker compose logs --tail=100 site
curl -I http://127.0.0.1:8084/
```

## 6. Acesso temporário sem domínio

Somente para teste curto e consciente dos riscos:

```dotenv
SITE_URL=http://IP-DA-VPS:8084
IP_BIND=0.0.0.0
PORTA=8084
```

Essa opção expõe a porta diretamente, sem TLS e sem a proteção do proxy. A opção
recomendada é manter `127.0.0.1` e publicar por proxy reverso com senha.

## 7. Retirada do ar

```bash
cd mk-autoparts/frontend
docker compose down
```

Não há banco nem volume persistente no protótipo. Eventos, lista e sessão ficam no
navegador de cada visitante.

## Checklist antes da apresentação

- [ ] Endereço público definido em `SITE_URL`.
- [ ] HTTPS válido.
- [ ] Senha ou restrição de IP ativa.
- [ ] Firewall revisado.
- [ ] Container `healthy`.
- [ ] Landing, catálogo, produto, painel e admin testados.
- [ ] Console do navegador sem erros.
- [ ] Celular sem rolagem lateral.
- [ ] `noindex` confirmado nos headers.
- [ ] WhatsApp, telefone, mapa e Instagram testados.
- [ ] Responsável sabe como atualizar e retirar o protótipo do ar.
