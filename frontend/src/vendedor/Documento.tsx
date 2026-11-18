/*
 * Documento do orçamento (RN-13), igual à página 1 de MKAutoparts-Orcamento-Exemplo.pdf
 * (docs/pfd-regras). Uma só estrutura de dados (montarDocumento) e um só cálculo
 * (calcularOrcamento) alimentam a prévia em HTML, a impressão em PDF e o Word.
 * Não tem: controle do representante, ordem de compra, embarque previsto, código do cliente,
 * redespacho, "Descontos" no cabeçalho, aviso de conferência nem cabeçalho repetido. Nunca mostra estoque.
 */
import { imagemProduto, obterProduto } from '../content/catalogo';
import { dataBR, documento as d, linhaCodigo, primeiroNome } from '../content/documento';
import { formatarWhatsapp, obterVendedor } from '../content/vendedores';
import { whatsapp, mensagens } from '../content/site';
import { Dec, brl, num, pctFiscal, pctTexto } from './decimal';
import { formatarDocumento } from './documentos';
import { dadosDoItem, itensDoCatalogo } from './itens';
import { calcularOrcamento, nomeCliente, type Orcamento } from './orcamento';
import './documento.css';

/** Sem foto no catálogo, a placa mostra o selo da MK (imagem padrão). */
export const FOTO_PADRAO = '/img/marca/selo-160.webp';

export type LinhaDocumento = {
  foto: string;
  semFoto: boolean;
  descricao: string;
  /** "Cód. MK S03-068 · Lado direito (LD)". */
  codigo: string;
  compativel?: string;
  unidade: string;
  qtd: number;
  promocao: boolean;
  /** Sob consulta: só descrição, códigos, unidade e quantidade; fora de todos os cálculos. */
  sobConsulta: boolean;
  preco?: string;
  liquido?: string;
  /** "12,7%" quando o líquido é menor que o preço de tabela. */
  pct?: string;
  ipi?: string;
  st?: string;
  unitario?: string;
  total?: string;
};

export type TotaisDocumento = {
  semDesconto: string;
  desconto?: { pct: string; valor: string };
  valorProdutos: string;
  ipi: string;
  st: string;
  frete: string;
  impostos: string;
  total: string;
};

export type DadosDocumento = {
  numero: string;
  codigoVenda: string;
  emissao: string;
  validade?: string;
  vendedor: { nome: string; whatsapp: string; whatsappRotulo: string };
  cliente: { destaque: string; campos: [string, string][] };
  entrega?: { entrega: string; cobranca: string; transportadora: string; prazo: string };
  linhas: LinhaDocumento[];
  totais?: TotaisDocumento;
  logistica?: { cubagem: string; volumes: string; pesoLiquido: string; pesoBruto: string };
  observacao?: string;
  link: string;
  linkCurto: string;
  /** Itens cujo produto saiu do catálogo (removidos com aviso). */
  removidos: number;
};

const VAZIO = '—';

export function montarDocumento(orc: Orcamento, link: string): DadosDocumento {
  const r = d.rotulos;
  const vendedor = obterVendedor(orc.vendedor);
  const { validos, removidos } = itensDoCatalogo(orc.itens);
  const calc = calcularOrcamento({ ...orc, itens: validos });

  const linhas: LinhaDocumento[] = validos.map((i, k) => {
    const p = obterProduto(i.slug)!;
    const item = dadosDoItem(i, p);
    const c = calc.itens[k];
    const foto = imagemProduto(p)?.src;
    const linha: LinhaDocumento = {
      foto: foto ?? FOTO_PADRAO,
      semFoto: !foto,
      descricao: item.descricao,
      codigo: linhaCodigo(item.codigoMk, i.lado),
      compativel: item.codigoOriginal || undefined,
      unidade: item.unidade,
      qtd: i.quantidade,
      promocao: !!p.promocao,
      sobConsulta: !c.comPreco,
    };
    if (!c.comPreco) return linha;
    return {
      ...linha,
      preco: num(c.preco!),
      liquido: num(c.liquido!),
      pct: c.pctDesconto ? pctTexto(c.pctDesconto) : undefined,
      ipi: pctFiscal(c.ipiPct),
      st: num(c.st),
      unitario: num(c.unitario!),
      total: num(c.total!),
    };
  });

  // Cliente: PJ mostra razão social em destaque, comprador, CNPJ e inscrição estadual; PF, nome e CPF.
  // Campo vazio não aparece. A ordem enche a grade de duas colunas como no exemplo.
  const cl = orc.cliente;
  const doc = cl.documento ? formatarDocumento(cl.documento) : '';
  const campos: [string, string | undefined][] =
    cl.tipo === 'PJ'
      ? [
          [r.comprador, cl.nome],
          [r.cnpj, doc],
          [r.inscricaoEstadual, cl.inscricaoEstadual],
          [r.email, cl.email],
          [r.fone, cl.telefone],
        ]
      : [
          [r.cpf, doc],
          [r.email, cl.email],
          [r.fone, cl.telefone],
        ];

  const e = orc.entrega;
  const cobranca = e.cobrancaIgualEntrega ? e.enderecoEntrega : e.enderecoCobranca;
  const temEntrega = [e.enderecoEntrega, cobranca, e.transportadora, e.prazoPagamento].some(Boolean);

  const lg = orc.logistica;
  const temLogistica = !!lg && [lg.cubagemM3, lg.volumes, lg.pesoLiquidoKg, lg.pesoBrutoKg].some(v => v !== undefined);

  let curto = link;
  try {
    const u = new URL(link);
    curto = `${u.host}${u.pathname}`;
  } catch {
    /* link relativo: fica como veio */
  }

  return {
    numero: orc.numero ?? orc.id.toUpperCase(),
    codigoVenda: orc.codigoVenda?.trim() || d.semCodigoVenda,
    emissao: dataBR(orc.criadoEm),
    validade: orc.validade ? dataBR(orc.validade) : undefined,
    vendedor: { nome: vendedor?.nome ?? orc.vendedor, whatsapp: vendedor?.whatsapp ?? '', whatsappRotulo: vendedor ? formatarWhatsapp(vendedor.whatsapp) : '' },
    cliente: { destaque: nomeCliente(cl), campos: campos.filter((c): c is [string, string] => !!c[1]) },
    entrega: temEntrega
      ? { entrega: e.enderecoEntrega ?? VAZIO, cobranca: cobranca ?? VAZIO, transportadora: e.transportadora ?? VAZIO, prazo: e.prazoPagamento ?? VAZIO }
      : undefined,
    linhas,
    totais: calc.comPreco
      ? {
          semDesconto: num(calc.semDesconto),
          desconto: calc.desconto.zero ? undefined : { pct: pctTexto(calc.pctDesconto), valor: num(calc.desconto) },
          valorProdutos: num(calc.valorProdutos),
          ipi: num(calc.ipi),
          st: num(calc.st),
          frete: num(calc.frete),
          impostos: num(calc.impostos),
          total: brl(calc.total),
        }
      : undefined,
    logistica: temLogistica
      ? {
          cubagem: lg!.cubagemM3 ? `${num(Dec.de(lg!.cubagemM3), 6)} m³` : VAZIO,
          volumes: lg!.volumes !== undefined ? String(lg!.volumes) : VAZIO,
          pesoLiquido: lg!.pesoLiquidoKg ? `${num(Dec.de(lg!.pesoLiquidoKg), 4)} kg` : VAZIO,
          pesoBruto: lg!.pesoBrutoKg ? `${num(Dec.de(lg!.pesoBrutoKg), 4)} kg` : VAZIO,
        }
      : undefined,
    observacao: orc.observacao?.trim() || undefined,
    link,
    linkCurto: curto,
    removidos,
  };
}

export function DocumentoOrcamento({ dados }: { dados: DadosDocumento }) {
  const r = d.rotulos;
  const t = dados.totais;
  const nomeCurto = primeiroNome(dados.vendedor.nome);
  const falar = dados.vendedor.whatsapp ? whatsapp(dados.vendedor.whatsapp, mensagens.contato.replace('MK Autoparts', dados.vendedor.nome)) : dados.link;
  return (
    <article className="doc" aria-label={`${d.titulo} ${dados.numero}`}>
      <header className="doc-topo">
        <div className="doc-topo__linha">
          <div className="doc-topo__marca">
            <img className="doc-selo" src="/img/marca/selo-320.webp" alt="MK Autoparts" width={80} height={80} />
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
            <span>{r.codigoVenda}</span>
            <b className="doc-cv">{dados.codigoVenda}</b>
            {dados.validade ? (
              <>
                <span>{r.validoAte}</span>
                <b>{dados.validade}</b>
              </>
            ) : (
              <>
                <span />
                <b />
              </>
            )}
          </div>
        </div>
      </header>

      <div className="doc-corpo">
        <div className="doc-partes">
          <div className="doc-parte">
            <h4>{r.vendedor}</h4>
            <b className="doc-nome">{dados.vendedor.nome}</b>
            {dados.vendedor.whatsappRotulo && (
              <dl>
                <dt>{r.whatsapp}</dt>
                <dd>{dados.vendedor.whatsappRotulo}</dd>
              </dl>
            )}
          </div>
          <div className="doc-parte">
            <h4>{r.cliente}</h4>
            <b className="doc-nome">{dados.cliente.destaque}</b>
            {dados.cliente.campos.length > 0 && (
              <dl className="doc-c2">
                {dados.cliente.campos.map(([k, v]) => (
                  <Par key={k} k={k} v={v} />
                ))}
              </dl>
            )}
          </div>
        </div>

        {dados.entrega && (
          <div className="doc-logi">
            <div>
              <b>{r.entrega}</b>
              {dados.entrega.entrega}
            </div>
            <div>
              <b>{r.cobranca}</b>
              {dados.entrega.cobranca}
            </div>
            <div>
              <b>{r.transportadora}</b>
              {dados.entrega.transportadora}
              <b className="doc-logi__seg">{r.prazoPagamento}</b>
              {dados.entrega.prazo}
            </div>
          </div>
        )}

        <table className="doc-itens">
          <thead>
            <tr>
              <th aria-label="Foto" />
              <th>{r.produto}</th>
              <th>{r.unidade}</th>
              <th className="n">{r.quantidade}</th>
              <th className="n">{r.liquido}</th>
              <th className="n">{r.ipi}</th>
              <th className="n">{r.st}</th>
              <th className="n">{r.unitario}</th>
              <th className="n">{r.total}</th>
            </tr>
          </thead>
          <tbody>
            {dados.linhas.map((l, k) => (
              <tr key={k}>
                <td className="doc-foto">
                  <div>
                    <img src={l.foto} alt="" className={l.semFoto ? 'doc-foto--padrao' : undefined} />
                  </div>
                </td>
                <td className="doc-nm">
                  <b>
                    {l.descricao}
                    {l.promocao && <span className="doc-promo">{r.promocao}</span>}
                  </b>
                  {l.codigo && <span>{l.codigo}</span>}
                  {l.compativel && <span>{r.compativel(l.compativel)}</span>}
                </td>
                <td>{l.unidade}</td>
                <td className="n">{l.qtd}</td>
                {l.sobConsulta ? (
                  <td className="n doc-consulta" colSpan={5}>
                    {r.sobConsulta}
                  </td>
                ) : (
                  <>
                    <td className="n">
                      {l.pct ? (
                        <>
                          <span className="doc-old">{l.preco}</span>
                          <span className="doc-new">
                            {l.liquido}
                            <span className="doc-off">−{l.pct}</span>
                          </span>
                        </>
                      ) : (
                        <span className="doc-new">{l.liquido}</span>
                      )}
                    </td>
                    <td className="n">{l.ipi}</td>
                    <td className="n">{l.st}</td>
                    <td className="n">{l.unitario}</td>
                    <td className="n doc-tt">{l.total}</td>
                  </>
                )}
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
              <p>
                {dados.validade ? (
                  <>
                    {d.validade.antes}
                    <strong>{dados.validade}</strong>
                    {d.validade.depois}
                  </>
                ) : (
                  d.semValidade
                )}
              </p>
            </div>
            <div className="doc-nota">
              <b>
                {r.condicoes} <small>{r.condicoesNota}</small>
              </b>
              <p>{d.condicoes}</p>
            </div>
            {dados.logistica && (
              <div className="doc-pesos">
                <div>
                  <b>{r.cubagem}</b>
                  {dados.logistica.cubagem}
                </div>
                <div>
                  <b>{r.volumes}</b>
                  {dados.logistica.volumes}
                </div>
                <div>
                  <b>{r.pesoLiquido}</b>
                  {dados.logistica.pesoLiquido}
                </div>
                <div>
                  <b>{r.pesoBruto}</b>
                  {dados.logistica.pesoBruto}
                </div>
              </div>
            )}
          </div>
          {t && (
            <div className="doc-tot">
              {t.desconto && (
                <>
                  <div className="doc-l">
                    <span>{r.semDesconto}</span>
                    <span className="doc-riscado">{t.semDesconto}</span>
                  </div>
                  <div className="doc-l">
                    <span>{r.desconto(t.desconto.pct)}</span>
                    <span>− {t.desconto.valor}</span>
                  </div>
                </>
              )}
              <div className="doc-l">
                <span>{r.valorProdutos}</span>
                <span>{t.valorProdutos}</span>
              </div>
              <div className="doc-l">
                <span>{r.ipiTotal}</span>
                <span>{t.ipi}</span>
              </div>
              <div className="doc-l">
                <span>{r.stTotal}</span>
                <span>{t.st}</span>
              </div>
              <div className="doc-l">
                <span>{r.frete}</span>
                <span>{t.frete}</span>
              </div>
              <div className="doc-l">
                <span>{r.impostos}</span>
                <span>{t.impostos}</span>
              </div>
              <div className="doc-final">
                <span>{r.valorTotal}</span>
                <b>{t.total}</b>
              </div>
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
      </div>

      <RodapeImpressao />
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

function Par({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </>
  );
}

/** Texto para `content:` do CSS (aspas e barras escapadas; \A quebra a linha). */
const textoCss = (linhas: string[]) => `"${linhas.map(l => l.replace(/\\/g, '\\\\').replace(/"/g, '\\"')).join('\\A ')}"`;

/**
 * Rodapé da impressão: no PDF, a empresa sai no pé de todas as páginas, nas caixas de margem da página
 * (@page @bottom-left/right; a margem de baixo é reservada em documento.css). Na tela, vale o <footer>.
 */
function RodapeImpressao() {
  const r = d.rotulos;
  const esquerda = textoCss([`${d.empresa.razaoSocial}${d.empresa.mostrarCnpj ? ` · CNPJ ${d.empresa.cnpj}` : ''}`, d.empresa.endereco]);
  const direita = textoCss([`Instagram ${d.empresa.instagram}`, r.geradoPor]);
  const caixa = "white-space: pre; vertical-align: top; padding-top: 2mm; font-family: 'IBM Plex Sans', Arial, sans-serif; font-size: 6.8pt; line-height: 1.4; color: #5b6678;";
  const filete = 'linear-gradient(#d9dee5, #d9dee5) no-repeat';
  const css = `@page {
  @bottom-left { content: ${esquerda}; text-align: left; padding-left: 13mm; ${caixa} background: ${filete} 13mm 0 / calc(100% - 13mm) 1px; }
  @bottom-center { content: ""; ${caixa} background: ${filete} 0 0 / 100% 1px; }
  @bottom-right { content: ${direita}; text-align: right; padding-right: 13mm; ${caixa} background: ${filete} 0 0 / calc(100% - 13mm) 1px; }
}`;
  return <style media="print">{css}</style>;
}
