/*
 * Área do vendedor de demonstração em /vendedor (DEC-018, DEC-021, RN-13, RF-30, RF-35, RF-37).
 * Fora da casca pública, com o visual de trabalho do admin. Login simulado: escolher quem é o
 * vendedor (sem senha). Orçamentos no localStorage deste navegador. Pré-renderiza só a estrutura;
 * a sessão é lida depois da montagem.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link, useRouter, type TelaVendedor } from '../router';
import { areaVendedor as t } from '../content/vendedor';
import { formatarPreco, obterProduto } from '../content/catalogo';
import { iniciais, vendedores, type Vendedor } from '../content/vendedores';
import { Icone } from '../components/Icons';
import { copiarLink, entrarComo, enviarLink, lerOrcamentos, linkDoOrcamento, sairDaSessao, vendedorDaSessao, atualizarOrcamento, CHAVE_ORCAMENTOS } from './armazem';
import { calcularTotais, expirado, type Orcamento } from './orcamento';
import { EditorOrcamento } from './EditorOrcamento';
import { TelaDocumento } from './TelaDocumento';

export function VendedorArea({ tela }: { tela: TelaVendedor }) {
  const [sessao, setSessao] = useState<Vendedor | null | undefined>(undefined);
  const [aviso, setAviso] = useState<{ id: number; texto: string } | null>(null);
  useEffect(() => setSessao(vendedorDaSessao() ?? null), []);
  useEffect(() => {
    if (!aviso) return;
    const id = window.setTimeout(() => setAviso(null), 3200);
    return () => clearTimeout(id);
  }, [aviso]);
  const avisar = useCallback((texto: string) => setAviso({ id: Date.now(), texto }), []);

  let conteudo;
  if (sessao === undefined) conteudo = <div className="adm-carregando">{t.carregando}</div>;
  else if (!sessao) conteudo = <Login aoEntrar={v => setSessao(v)} />;
  else
    conteudo = (
      <div className="vend-app">
        <header className="vend-topo">
          <Link href="/vendedor" className="vend-topo__marca">
            <img src="/img/marca/selo-64.webp" srcSet="/img/marca/selo-64.webp 1x, /img/marca/selo-128.webp 2x" alt="MK Autoparts" width={40} height={40} />
            <span className="vend-topo__titulo">{t.titulo}</span>
          </Link>
          <nav className="vend-abas" aria-label={t.titulo}>
            <Link href="/vendedor" aria-current={tela === 'lista' ? 'page' : undefined}>
              {t.abas.lista}
            </Link>
            <Link href="/vendedor/novo" aria-current={tela === 'novo' ? 'page' : undefined}>
              <Icone nome="mais" tamanho={16} />
              <span className="vend-abas__longo">{t.abas.novo}</span>
              <span className="vend-abas__curto">{t.abas.novoCurto}</span>
            </Link>
          </nav>
          <span className="vend-topo__quem">
            <span className="adm-vend__avatar vend-topo__avatar" aria-hidden="true">
              {sessao.foto ? <img src={sessao.foto} alt="" width={32} height={32} /> : iniciais(sessao.nome)}
            </span>
            <span className="vend-topo__nome">{sessao.nome}</span>
            <button
              type="button"
              className="adm-btn adm-btn--fantasma"
              onClick={() => {
                sairDaSessao();
                setSessao(null);
              }}
            >
              {t.sair}
            </button>
          </span>
        </header>
        <div className="vend-faixa">
          <p className="adm-selo">
            <Icone nome="alerta" tamanho={16} />
            {t.selo}
          </p>
        </div>
        <main className="vend-corpo">
          {tela === 'novo' ? <EditorOrcamento vendedor={sessao} avisar={avisar} /> : tela === 'documento' ? <TelaDocumento vendedor={sessao} avisar={avisar} /> : <Lista vendedor={sessao} avisar={avisar} />}
        </main>
      </div>
    );

  return (
    <div className="adm vend">
      {conteudo}
      <div className="adm-aviso" role="status" aria-live="polite">
        {aviso && (
          <p key={aviso.id}>
            <Icone nome="check" tamanho={18} />
            {aviso.texto}
          </p>
        )}
      </div>
    </div>
  );
}

function Login({ aoEntrar }: { aoEntrar: (v: Vendedor) => void }) {
  const ativos = vendedores.filter(v => v.ativo);
  return (
    <div className="adm-login">
      <div className="adm-login__cartao vend-login">
        <img src="/img/marca/selo-160.webp" srcSet="/img/marca/selo-160.webp 1x, /img/marca/selo-320.webp 2x" alt="MK Autoparts" width={80} height={80} className="adm-login__logo" />
        <h1>{t.login.titulo}</h1>
        <p className="adm-login__apoio">{t.login.apoio}</p>
        <ul className="vend-login__lista">
          {ativos.map(v => (
            <li key={v.codigo}>
              <button
                type="button"
                onClick={() => {
                  entrarComo(v.codigo);
                  aoEntrar(v);
                }}
              >
                <span className="adm-vend__avatar" aria-hidden="true">
                  {v.foto ? <img src={v.foto} alt="" width={44} height={44} /> : iniciais(v.nome)}
                </span>
                {v.nome}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const dataCurta = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString('pt-BR');
const dataHora = (iso: string) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

/** Orçamentos ativos do vendedor (RN-13, RF-37): aviso "Alterado pelo cliente", visto, encerrar, excluir. */
function Lista({ vendedor, avisar }: { vendedor: Vendedor; avisar: (t: string) => void }) {
  const tl = t.lista;
  const { navegar } = useRouter();
  const [lista, setLista] = useState<Orcamento[]>([]);
  const recarregar = useCallback(() => setLista(lerOrcamentos().filter(o => o.vendedor === vendedor.codigo && o.estado === 'ativo')), [vendedor.codigo]);
  useEffect(() => {
    recarregar();
    // Alterações feitas pelo cliente em outra aba deste navegador chegam pelo evento de storage.
    const aoMudar = (e: StorageEvent) => e.key === CHAVE_ORCAMENTOS && recarregar();
    window.addEventListener('storage', aoMudar);
    return () => window.removeEventListener('storage', aoMudar);
  }, [recarregar]);

  const mudar = (id: string, f: (o: Orcamento) => Orcamento, texto?: string) => {
    atualizarOrcamento(id, f);
    recarregar();
    if (texto) avisar(texto);
  };
  // Envio pelo compartilhamento do aparelho (ou cópia); o aviso só confirma o que de fato aconteceu.
  const enviar = async (o: Orcamento) => {
    const r = await enviarLink(o);
    if (r === 'copiado') avisar(tl.copiado);
    if (r === 'falhou') avisar(tl.falhouCopiar);
  };
  const copiar = async (o: Orcamento) => avisar((await copiarLink(o)) === 'copiado' ? tl.copiado : tl.falhouCopiar);

  return (
    <section className="adm-tela vend-tela" aria-labelledby="vend-lista-titulo">
      <div className="adm-tela__cabeca">
        <div>
          <h1 id="vend-lista-titulo">{tl.titulo}</h1>
          <p>{tl.apoio}</p>
        </div>
      </div>
      {!lista.length ? (
        <p className="adm-vazio">{tl.vazio}</p>
      ) : (
        <ul className="vend-orcs">
          {lista.map(o => {
            const tot = calcularTotais(o);
            const venceu = expirado(o);
            return (
              <li key={o.id} className={`adm-bloco vend-orc${o.alteracoes.length ? ' vend-orc--alterado' : ''}`}>
                <div className="vend-orc__cabeca">
                  <div>
                    <h2>{o.cliente || tl.semCliente}</h2>
                    <p className="vend-orc__meta">
                      {tl.criado(dataCurta(o.criadoEm))} · {tl.itens(o.itens.length)}
                      {o.validade && ` · ${tl.valido(dataCurta(o.validade))}`}
                      {venceu && <span className="adm-tag vend-tag--expirado">{tl.expirado}</span>}
                    </p>
                  </div>
                  <strong className="vend-orc__total">{tot.subtotal > 0 ? formatarPreco(tot.total) : tl.sobConsulta}</strong>
                </div>
                <p className="vend-orc__itens">
                  {o.itens
                    .slice(0, 4)
                    .map(i => `${i.quantidade}× ${obterProduto(i.slug)?.nome ?? i.slug}${i.lado ? ` ${i.lado}` : ''}`)
                    .join(' · ')}
                  {o.itens.length > 4 && ' …'}
                </p>
                {o.alteracoes.length > 0 && (
                  <div className="vend-alterado" role="note">
                    <p>
                      <Icone nome="alerta" tamanho={16} />
                      <strong>{tl.alterado}</strong>
                    </p>
                    <ul>
                      {o.alteracoes.map((a, i) => (
                        <li key={i}>
                          <span>{dataHora(a.em)}</span> {a.texto}
                        </li>
                      ))}
                    </ul>
                    <button type="button" className="adm-btn adm-btn--fantasma" onClick={() => mudar(o.id, x => ({ ...x, alteracoes: [] }))}>
                      <Icone nome="check" tamanho={16} />
                      {tl.visto}
                    </button>
                  </div>
                )}
                <div className="vend-orc__acoes">
                  <button type="button" className="adm-btn adm-btn--primario" onClick={() => enviar(o)}>
                    <Icone nome="whatsapp" tamanho={16} />
                    {tl.enviar}
                  </button>
                  <button type="button" className="adm-btn adm-btn--fantasma" onClick={() => navegar(`/vendedor/novo?id=${o.id}`)}>
                    {tl.editar}
                  </button>
                  {/* Ações menos usadas e destrutivas ficam recolhidas, com confirmação. */}
                  <details className="vend-mais">
                    <summary className="adm-btn adm-btn--fantasma">
                      {tl.mais}
                      <Icone nome="chevron" tamanho={16} />
                    </summary>
                    <div className="vend-mais__lista">
                      <button type="button" onClick={() => copiar(o)}>
                        <Icone nome="copiar" tamanho={16} />
                        {tl.copiar}
                      </button>
                      <a href={linkDoOrcamento(o)} target="_blank" rel="noopener">
                        {tl.abrir}
                      </a>
                      <Link href={`/vendedor/documento?id=${o.id}`}>{tl.documento}</Link>
                      <button type="button" onClick={() => window.confirm(tl.confirmarEncerrar) && mudar(o.id, x => ({ ...x, estado: 'encerrado' }), tl.encerrado)}>
                        {tl.encerrar}
                      </button>
                      <button type="button" className="vend-perigo" onClick={() => window.confirm(tl.confirmarExcluir) && mudar(o.id, x => ({ ...x, estado: 'excluido' }), tl.excluido)}>
                        <Icone nome="lixeira" tamanho={16} />
                        {tl.excluir}
                      </button>
                    </div>
                  </details>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
