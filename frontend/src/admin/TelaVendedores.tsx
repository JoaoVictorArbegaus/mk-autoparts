/*
 * Admin (demonstração): vendedores com link próprio do catálogo (?v=), copiar link, ativar/desativar
 * e cadastro. Vendedores reais da MK (DEC-022), cada um com o próprio WhatsApp; no cadastro o número é
 * digitado por quem administra (nenhum telefone inventado). Sem foto, o avatar mostra as iniciais.
 * Fila do rodízio (RN-11, RF-29): a gravada neste navegador pelos pedidos feitos no site, sem os
 * vendedores desativados aqui; o primeiro é o próximo da vez.
 */
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { admin } from '../content/admin';
import { Icone } from '../components/Icons';
import { gerarSlug, useAdmin } from './AdminDemo';
import { formatarWhatsapp, iniciais } from '../content/vendedores';
import { CHAVE_FILA, lerFila } from '../orcamento/fila';

export function TelaVendedores() {
  const t = admin.vendedores;
  const { vendedores, salvarVendedor, alternarVendedor, avisar } = useAdmin();
  const [origem, setOrigem] = useState('');
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [whats, setWhats] = useState('');
  const [mexeuCodigo, setMexeuCodigo] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => setOrigem(window.location.origin), []);

  // Fila do rodízio: lida depois da montagem e atualizada quando outra aba do site faz um pedido.
  const ativos = useMemo(() => vendedores.filter(v => v.ativo).map(v => v.codigo), [vendedores]);
  const [fila, setFila] = useState<string[]>([]);
  useEffect(() => {
    setFila(lerFila(ativos));
    const aoMudar = (e: StorageEvent) => e.key === CHAVE_FILA && setFila(lerFila(ativos));
    window.addEventListener('storage', aoMudar);
    return () => window.removeEventListener('storage', aoMudar);
  }, [ativos]);
  const porCodigo = (c: string) => vendedores.find(v => v.codigo === c);
  useEffect(() => {
    if (!mexeuCodigo) setCodigo(gerarSlug(nome).replace(/-/g, ''));
  }, [nome, mexeuCodigo]);

  const link = (c: string) => `${origem}/?v=${c}`;

  const copiar = async (c: string) => {
    try {
      await navigator.clipboard.writeText(link(c));
    } catch {
      /* sem permissão: o link continua visível para copiar à mão */
    }
    avisar(t.copiado);
  };

  const adicionar = (e: FormEvent) => {
    e.preventDefault();
    const c = gerarSlug(codigo).replace(/-/g, '');
    if (!nome.trim()) return setErro(t.vazioNome);
    if (!c || vendedores.some(v => v.codigo === c)) return setErro(t.duplicado);
    // DDD + número (10 ou 11 dígitos); o DDI 55 é acrescentado.
    const digitos = whats.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
    if (digitos.length < 10 || digitos.length > 11) return setErro(t.whatsappInvalido);
    setErro('');
    salvarVendedor({ codigo: c, nome: nome.trim(), whatsapp: `55${digitos}`, ativo: true });
    setNome('');
    setCodigo('');
    setWhats('');
    setMexeuCodigo(false);
    avisar(t.salvo);
  };

  return (
    <section className="adm-tela" aria-labelledby="adm-titulo">
      <div className="adm-tela__cabeca">
        <div>
          <h1 id="adm-titulo">{t.titulo}</h1>
          <p>{t.apoio}</p>
        </div>
      </div>

      <form className="adm-bloco adm-novo-vend" onSubmit={adicionar}>
        <h2>{t.novo}</h2>
        <div className="adm-novo-vend__campos">
          <label className="adm-campo">
            <span>{t.nome}</span>
            <input value={nome} onChange={e => setNome(e.target.value)} />
          </label>
          <label className="adm-campo">
            <span>{t.codigo}</span>
            <input
              className="adm-mono"
              value={codigo}
              onChange={e => {
                setMexeuCodigo(true);
                setCodigo(e.target.value);
              }}
              aria-describedby="ajuda-codigo"
            />
            <small id="ajuda-codigo">{t.codigoAjuda}</small>
          </label>
          <label className="adm-campo">
            <span>{t.whatsapp}</span>
            <input value={whats} onChange={e => setWhats(e.target.value)} inputMode="tel" autoComplete="off" placeholder="(49) 99999-9999" aria-describedby="ajuda-whats" />
            <small id="ajuda-whats">{t.whatsappAjuda}</small>
          </label>
          <button type="submit" className="adm-btn adm-btn--primario">
            <Icone nome="mais" tamanho={18} />
            {t.adicionar}
          </button>
        </div>
        {erro && (
          <p className="adm-erro" role="alert">
            {erro}
          </p>
        )}
      </form>

      {fila.length > 0 && (
        <section className="adm-bloco adm-fila" aria-labelledby="adm-fila-titulo">
          <h2 id="adm-fila-titulo">{t.fila}</h2>
          <p className="adm-fila__apoio">{t.filaApoio}</p>
          <ol>
            {fila.map((c, i) => {
              const v = porCodigo(c);
              if (!v) return null;
              return (
                <li key={c} className={i === 0 ? 'adm-fila__vez' : undefined}>
                  <span className="adm-vend__avatar adm-fila__avatar" aria-hidden="true">
                    {v.foto ? <img src={v.foto} alt="" width={32} height={32} /> : iniciais(v.nome)}
                  </span>
                  <span>{v.nome}</span>
                  {i === 0 && <span className="adm-tag adm-tag--ok">{t.daVez}</span>}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <ul className="adm-vendedores">
        {vendedores.map(v => (
          <li key={v.codigo} className={`adm-vend${v.ativo ? '' : ' adm-vend--inativo'}`}>
            <span className="adm-vend__avatar" aria-hidden="true">
              {v.foto ? <img src={v.foto} alt="" width={44} height={44} /> : iniciais(v.nome)}
            </span>
            <div className="adm-vend__info">
              <strong>{v.nome}</strong>
              <span className="adm-vend__whats">{formatarWhatsapp(v.whatsapp)}</span>
              <span className={`adm-tag${v.ativo ? ' adm-tag--ok' : ''}`}>{v.ativo ? t.ativo : t.inativo}</span>
            </div>
            <div className="adm-vend__link">
              <span className="sr-only">{t.link}</span>
              <code>{link(v.codigo)}</code>
              <button type="button" className="adm-icone-btn" aria-label={`${t.copiar}: ${v.nome}`} onClick={() => copiar(v.codigo)} disabled={!v.ativo}>
                <Icone nome="copiar" tamanho={18} />
              </button>
            </div>
            <button type="button" className="adm-btn adm-btn--fantasma" onClick={() => alternarVendedor(v.codigo)}>
              {t.alternar(v.ativo)}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
