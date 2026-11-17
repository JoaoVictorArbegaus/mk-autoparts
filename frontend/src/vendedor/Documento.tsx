/*
 * Documento do orçamento (REU-06, RN-13): uma só estrutura de dados (montarDocumento) alimenta a prévia
 * em HTML, a impressão em PDF e o Word, como manda o guia do modelo (docs/Para-Socio-Orcamento,
 * seção 2: "nunca montar o PDF e o Word com lógicas de cálculo diferentes"). Nunca mostra estoque.
 */
import { codigoDoLado, formatarPreco, imagemProduto, obterProduto } from '../content/catalogo';
import { dataBR, detalheDoItem, documento as d, primeiroNome } from '../content/documento';
import { formatarWhatsapp, obterVendedor } from '../content/vendedores';
import { whatsapp, mensagens } from '../content/site';
import { calcularItem, calcularTotais, formatarPorcentagem, type Orcamento } from './orcamento';
import './documento.css';

export type LinhaDocumento = {
  nome: string;
  detalhe: string;
  foto?: string;
  qtd: number;
  promocao: boolean;
  /** null = sob consulta (fora de todas as somas). */
  preco: number | null;
  precoFinal: number | null;
  pct: number;
  total: number | null;
};

export type DadosDocumento = {
  numero: string;
  emissao: string;
  validade?: string;
  vendedor: { nome: string; whatsapp: string; whatsappRotulo: string };
  cliente?: { nome: string; contato?: string };
  observacao?: string;
  linhas: LinhaDocumento[];
  totais: ReturnType<typeof calcularTotais>;
  descontoTotalRotulo?: string;
  link: string;
  linkCurto: string;
};

export function montarDocumento(orc: Orcamento, link: string): DadosDocumento {
  const vendedor = obterVendedor(orc.vendedor);
  const linhas = orc.itens.flatMap(i => {
    const p = obterProduto(i.slug);
    if (!p) return [];
    const l = calcularItem(i);
    return [
      {
        nome: p.nome,
        detalhe: detalheDoItem(i.lado, codigoDoLado(p, i.lado) ?? p.codigo),
        foto: imagemProduto(p)?.src,
        qtd: i.quantidade,
        promocao: !!p.promocao,
        preco: l.comPreco ? l.unitario : null,
        precoFinal: l.comPreco ? l.unitarioFinal : null,
        pct: l.pct,
        total: l.comPreco ? l.total : null,
      },
    ];
  });
  const totais = calcularTotais(orc);
  const dt = orc.descontoTotal;
  let curto = link;
  try {
    const u = new URL(link);
    curto = `${u.host}${u.pathname}`;
  } catch {
    /* link relativo: fica como veio */
  }
  return {
    numero: orc.numero ?? orc.id.toUpperCase(),
    emissao: dataBR(orc.criadoEm),
    validade: orc.validade ? dataBR(orc.validade) : undefined,
    vendedor: { nome: vendedor?.nome ?? orc.vendedor, whatsapp: vendedor?.whatsapp ?? '', whatsappRotulo: vendedor ? formatarWhatsapp(vendedor.whatsapp) : '' },
    cliente: orc.cliente ? { nome: orc.cliente, contato: orc.clienteContato } : undefined,
    observacao: orc.observacao?.trim() || undefined,
    linhas,
    totais,
    descontoTotalRotulo: dt && dt.valor > 0 ? (dt.tipo === 'percentual' ? d.rotulos.descontoTotal(formatarPorcentagem(dt.valor)) : d.rotulos.descontoTotalValor) : undefined,
    link,
    linkCurto: curto,
  };
}

export function DocumentoOrcamento({ dados }: { dados: DadosDocumento }) {
  const r = d.rotulos;
  const { totais: t } = dados;
  const nomeCurto = primeiroNome(dados.vendedor.nome);
  const falar = dados.vendedor.whatsapp ? whatsapp(dados.vendedor.whatsapp, mensagens.contato.replace('MK Autoparts', dados.vendedor.nome)) : dados.link;
  return (
    <article className="doc" aria-label={`${d.titulo} ${dados.numero}`}>
      <header className="doc-topo">
        <div className="doc-topo__linha">
          <div className="doc-topo__marca">
            <img className="doc-selo" src="/img/marca/selo-320.webp" alt="MK Autoparts" width={106} height={106} />
            <div>
              <div className="doc-eyebrow">{d.eyebrow}</div>
              <h1>{d.titulo}</h1>
            </div>
          </div>
          <div className="doc-meta">
            <span>{r.numero}</span>
            <b>{dados.numero}</b>
            <span>{r.emissao}</span>
            <b>{dados.emissao}</b>
            {dados.validade && (
              <>
                <span>{r.validoAte}</span>
                <b>{dados.validade}</b>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="doc-corpo">
        <div className="doc-partes">
          <div className="doc-parte">
            <h4>{r.vendedor}</h4>
            <b>{dados.vendedor.nome}</b>
            <span>MK Autoparts{dados.vendedor.whatsappRotulo && ` · WhatsApp ${dados.vendedor.whatsappRotulo}`}</span>
          </div>
          <div className="doc-parte">
            <h4>{r.cliente}</h4>
            <b>{dados.cliente?.nome ?? r.clienteVazio}</b>
            {dados.cliente?.contato && <span>{dados.cliente.contato}</span>}
          </div>
        </div>

        <table className="doc-itens">
          <thead>
            <tr>
              <th aria-label="Foto" />
              <th>{r.produto}</th>
              <th className="n" style={{ width: '11mm' }}>
                {r.quantidade}
              </th>
              <th className="n" style={{ width: '36mm' }}>
                {r.precoUnitario}
              </th>
              <th className="n" style={{ width: '27mm' }}>
                {r.total}
              </th>
            </tr>
          </thead>
          <tbody>
            {dados.linhas.map((l, k) => (
              <tr key={k}>
                <td className="doc-foto">
                  <div>{l.foto && <img src={l.foto} alt="" />}</div>
                </td>
                <td className="doc-nm">
                  <b>
                    {l.nome}
                    {l.promocao && <span className="doc-promo">{r.promocao}</span>}
                  </b>
                  <span>{l.detalhe}</span>
                </td>
                <td className="n">{l.qtd}</td>
                <td className="n">
                  {l.precoFinal === null ? (
                    <span className="doc-consulta">{r.sobConsulta}</span>
                  ) : l.pct > 0 ? (
                    <>
                      <span className="doc-old">{formatarPreco(l.preco!)}</span>
                      <span className="doc-new">
                        {formatarPreco(l.precoFinal)}
                        <span className="doc-off">−{formatarPorcentagem(l.pct)}</span>
                      </span>
                    </>
                  ) : (
                    <span className="doc-new">{formatarPreco(l.precoFinal)}</span>
                  )}
                </td>
                <td className="n">{l.total === null ? <span className="doc-consulta">—</span> : <b style={{ fontWeight: 600 }}>{formatarPreco(l.total)}</b>}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="doc-baixo">
          <div>
            {dados.observacao && (
              <div className="doc-nota">
                <b>{r.observacao}</b>
                <p>{dados.observacao}</p>
              </div>
            )}
            <div className="doc-nota">
              <b>{r.validade}</b>
              <p>{dados.validade ? d.validade(dados.validade) : d.semValidade}</p>
            </div>
            <div className="doc-nota">
              <b>
                {r.condicoes} <small>{r.condicoesNota}</small>
              </b>
              <p>{d.condicoes}</p>
            </div>
          </div>
          {t.subtotal > 0 && (
            <div className="doc-tot">
              {t.economia > 0 && (
                <div className="doc-l">
                  <span>{r.subtotalSemDesconto}</span>
                  <span className="doc-old">{formatarPreco(t.subtotalSemDesconto)}</span>
                </div>
              )}
              {t.subtotal !== t.subtotalSemDesconto && (
                <div className="doc-l">
                  <span>{r.comDescontoItens}</span>
                  <span>{formatarPreco(t.subtotal)}</span>
                </div>
              )}
              {dados.descontoTotalRotulo && t.descontoTotal > 0 && (
                <div className="doc-l">
                  <span>{dados.descontoTotalRotulo}</span>
                  <span>− {formatarPreco(t.descontoTotal)}</span>
                </div>
              )}
              <div className="doc-final">
                <span>{r.total}</span>
                <b>{formatarPreco(t.total)}</b>
              </div>
              {t.economia > 0 && <div className="doc-eco">{r.economia(formatarPorcentagem(t.economia))}</div>}
            </div>
          )}
        </div>

        <div className="doc-link">
          <a href={dados.link}>
            <b>{r.linkTitulo}</b>
            <span>
              {dados.linkCurto} · {r.linkApoio(nomeCurto)}
            </span>
          </a>
          <a className="doc-btn" href={falar}>
            {r.falarCom(nomeCurto)}
          </a>
        </div>
        <div className="doc-respiro" />
      </div>

      <footer className="doc-rod">
        <span>
          <strong>{d.empresa.razaoSocial}</strong>
          {d.empresa.mostrarCnpj && ` · CNPJ ${d.empresa.cnpj}`}
          <br />
          {d.empresa.endereco}
        </span>
        <span>
          Instagram {d.empresa.instagram}
          <br />
          {r.geradoPor}
        </span>
      </footer>
    </article>
  );
}
