/*
 * Acesso ao catálogo, busca, filtros e ordenação (funções puras, sem DOM).
 * Componentes nunca importam os arrays de dados diretamente: usam estas funções, que
 * são o ponto de troca pela API no produto definitivo (sdd_kit/10-architecture.md).
 */
import { produtos } from './produtos';
import { categorias } from './categorias';
import { montadoras } from './montadoras';
import { dimensoesImagens } from './imagens';
import type { Aplicacao, Categoria, Lado, Montadora, Produto } from './tipos';

export type { Aplicacao, Categoria, Lado, Montadora, Produto };

/* ---------- Acesso ---------- */

const ativos = produtos.filter(p => p.ativo);
const porSlug = new Map(ativos.map(p => [p.slug, p]));

export const listarProdutos = (): Produto[] => ativos;
export const obterProduto = (slug: string): Produto | undefined => porSlug.get(slug);
export const listarCategorias = (): Categoria[] => [...categorias].sort((a, b) => a.ordem - b.ordem);
export const obterCategoria = (slug: string) => categorias.find(c => c.slug === slug);
export const listarMontadoras = (): Montadora[] => montadoras;
export const obterMontadora = (slug: string) => montadoras.find(m => m.slug === slug);
export const listarPromocoes = () => ativos.filter(p => p.promocao);
export const listarDestaques = () => ativos.filter(p => p.destaque);

/** Marcas de peça presentes nos dados (o filtro só aparece com duas ou mais). */
export function listarMarcas(): string[] {
  return [...new Set(ativos.map(p => p.marca).filter((m): m is string => !!m))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

export function contarPorCategoria(slug: string) {
  return ativos.filter(p => p.categoria === slug).length;
}

export function contarPorMontadora(slug: string) {
  return ativos.filter(p => p.aplicacoes.some(a => a.montadora === slug)).length;
}

/** Produtos da mesma categoria, sem o próprio (RF-14). */
export function relacionados(produto: Produto, limite = 4) {
  return ativos.filter(p => p.categoria === produto.categoria && p.slug !== produto.slug).slice(0, limite);
}

/* ---------- Apresentação ---------- */

/** Os dados apontam para os recortes em PNG; o site serve as versões WebP otimizadas. */
export function imagemProduto(p: Produto) {
  if (!p.imagem) return null;
  const nome = p.imagem.replace(/^\/img\/produtos\//, '').replace(/\.(png|jpe?g)$/i, '');
  const dim = dimensoesImagens[nome];
  return { src: `/img/produtos/${nome}.webp`, largura: dim?.[0] ?? 400, altura: dim?.[1] ?? 300 };
}

/** Arte de promoção do cliente (DEC-013), em WebP, com versão menor. */
export function artePromocao(p: Produto) {
  if (!p.artePromocao) return null;
  const nome = p.artePromocao.replace(/^\/img\/promocoes\//, '').replace(/\.(png|jpe?g)$/i, '');
  return { src: `/img/promocoes/${nome}.webp`, src400: `/img/promocoes/${nome}-400.webp`, largura: 760, altura: 1140 };
}

export const temLados = (p: Produto) => !!p.variantes?.length;

/** Códigos MK do produto (de cada lado, quando houver). */
export function codigosMK(p: Produto): string[] {
  if (p.variantes?.length) return p.variantes.map(v => v.codigo).filter((c): c is string => !!c);
  return p.codigo ? [p.codigo] : [];
}

export function codigoDoLado(p: Produto, lado?: Lado): string | undefined {
  if (lado && p.variantes) return p.variantes.find(v => v.lado === lado)?.codigo;
  return p.codigo;
}

export function codigosOriginais(p: Produto): string[] {
  return [...(p.codigosOriginais ?? []), ...(p.variantes ?? []).flatMap(v => v.codigosOriginais ?? [])];
}

/** Rótulo curto do código no card: "S03-068 / S03-069" ou o código único. */
export function rotuloCodigo(p: Produto) {
  const c = codigosMK(p);
  return c.length ? c.join(' / ') : null;
}

export function formatarPreco(valor: number) {
  // Espaço comum (o Intl usa espaço inseparável), para a mensagem do WhatsApp ficar igual em todo lugar.
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor).replace(/ /g, ' ');
}

export function rotuloAplicacao(a: Aplicacao) {
  const m = obterMontadora(a.montadora);
  const modelo = a.modelo ? m?.modelos.find(x => x.slug === a.modelo)?.nome : undefined;
  return { montadora: m?.nome ?? a.montadora, modelo: modelo ?? 'Todos os modelos (consultar)', anos: rotuloAnos(a) };
}

/**
 * Aplicação resumida para o card: marca do veículo, modelos e anos ("Scania NTG · 2015+").
 * O cliente de caminhão pergunta "serve no meu?": isto vem antes da categoria (revisão impeccable).
 */
export function resumoAplicacao(p: Produto): string {
  if (!p.aplicacoes.length) return 'Aplicação universal: consultar';
  const grupos = new Map<string, { modelos: string[]; anos: string[] }>();
  for (const a of p.aplicacoes) {
    const m = obterMontadora(a.montadora);
    const nome = m?.nome ?? a.montadora;
    const g = grupos.get(nome) ?? { modelos: [], anos: [] };
    const modelo = a.modelo ? m?.modelos.find(x => x.slug === a.modelo)?.nome : undefined;
    if (modelo && !g.modelos.includes(modelo)) g.modelos.push(modelo);
    const anos = a.anoInicio && a.anoFim ? `${a.anoInicio}–${a.anoFim}` : a.anoInicio ? `${a.anoInicio}+` : a.anoFim ? `até ${a.anoFim}` : '';
    if (anos && !g.anos.includes(anos)) g.anos.push(anos);
    grupos.set(nome, g);
  }
  return [...grupos.entries()]
    .map(([nome, g]) => [[nome, g.modelos.join(', ')].filter(Boolean).join(' '), g.anos.join(', ')].filter(Boolean).join(' · '))
    .join(' / ');
}

export function rotuloAnos(a: Aplicacao) {
  if (a.anoInicio && a.anoFim) return `${a.anoInicio} a ${a.anoFim}`;
  if (a.anoInicio) return `A partir de ${a.anoInicio}`;
  if (a.anoFim) return `Até ${a.anoFim}`;
  return '—';
}

/* ---------- Busca ---------- */

/** Minúsculas, sem acentos, sem espaços, hífens, pontos e barras (RF-06). */
export function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[\s\-./\\_]+/g, '');
}

/** Termos da busca: cada palavra normalizada; vazios descartados. */
export function termos(busca: string) {
  return busca.split(/\s+/).map(normalizar).filter(Boolean);
}

type Indice = { nome: string; codigos: string[]; outros: string };
const indices = new Map<string, Indice>();
function indice(p: Produto): Indice {
  let i = indices.get(p.slug);
  if (!i) {
    i = { nome: normalizar(p.nome), codigos: [...codigosMK(p), ...codigosOriginais(p)].map(normalizar), outros: normalizar(p.marca ?? '') };
    indices.set(p.slug, i);
  }
  return i;
}

/** Pontuação de relevância; 0 = não encontrado. Todos os termos precisam aparecer. */
export function pontuar(p: Produto, busca: string) {
  const ts = termos(busca);
  if (!ts.length) return 1;
  const i = indice(p);
  const inteiro = normalizar(busca);
  let total = 0;
  for (const t of ts) {
    let s = 0;
    if (i.codigos.some(c => c === t)) s = 100;
    else if (i.codigos.some(c => c.startsWith(t))) s = 60;
    else if (i.nome.startsWith(t)) s = 40;
    else if (i.nome.includes(t)) s = 25;
    else if (i.codigos.some(c => c.includes(t))) s = 20;
    else if (i.outros.includes(t)) s = 15;
    if (!s) return 0;
    total += s;
  }
  // A busca inteira sem espaços (ex.: "S03 035") também vale como código.
  if (ts.length > 1 && i.codigos.some(c => c === inteiro)) total += 100;
  return total;
}

/* ---------- Filtros na URL ---------- */

export type Ordem = 'relevancia' | 'nome' | 'codigo';

export type Consulta = {
  q: string;
  categorias: string[];
  montadora: string;
  modelo: string;
  marcas: string[];
  promocao: boolean;
  ordem: Ordem;
};

export const consultaVazia: Consulta = { q: '', categorias: [], montadora: '', modelo: '', marcas: [], promocao: false, ordem: 'nome' };

/** Lê a query string, descartando valores que não existem nos dados. */
export function lerConsulta(params: URLSearchParams): Consulta {
  const q = (params.get('q') ?? '').trim().slice(0, 120);
  const cats = new Set(categorias.map(c => c.slug));
  const marcasValidas = new Set(listarMarcas());
  const montadora = obterMontadora(params.get('montadora') ?? '') ? params.get('montadora')! : '';
  const modeloParam = params.get('modelo') ?? '';
  const modelo = montadora && obterMontadora(montadora)!.modelos.some(m => m.slug === modeloParam) ? modeloParam : '';
  const ordemParam = params.get('ordem');
  const ordem: Ordem = ordemParam === 'codigo' || ordemParam === 'nome' ? ordemParam : ordemParam === 'relevancia' && q ? 'relevancia' : q ? 'relevancia' : 'nome';
  return {
    q,
    categorias: [...new Set(params.getAll('categoria').filter(c => cats.has(c)))].sort(),
    montadora,
    modelo,
    marcas: [...new Set(params.getAll('marca').filter(m => marcasValidas.has(m)))].sort(),
    promocao: params.get('promocao') === '1',
    ordem,
  };
}

export function escreverConsulta(c: Consulta) {
  const p = new URLSearchParams();
  if (c.q.trim()) p.set('q', c.q.trim());
  for (const cat of [...new Set(c.categorias)].sort()) p.append('categoria', cat);
  if (c.montadora) p.set('montadora', c.montadora);
  if (c.montadora && c.modelo) p.set('modelo', c.modelo);
  for (const m of [...new Set(c.marcas)].sort()) p.append('marca', m);
  if (c.promocao) p.set('promocao', '1');
  const padrao = c.q.trim() ? 'relevancia' : 'nome';
  const ordem = c.ordem === 'relevancia' && !c.q.trim() ? 'nome' : c.ordem;
  if (ordem !== padrao) p.set('ordem', ordem);
  return p.toString();
}

/** Trocar a montadora limpa o modelo (AC-02). */
export function trocarMontadora(c: Consulta, montadora: string): Consulta {
  return { ...c, montadora, modelo: '' };
}

export function contarFiltros(c: Consulta) {
  return c.categorias.length + (c.montadora ? 1 : 0) + (c.modelo ? 1 : 0) + c.marcas.length + (c.promocao ? 1 : 0);
}

function atendeAplicacao(p: Produto, c: Consulta) {
  if (!c.montadora) return true;
  // Sem aplicação cadastrada = "consultar aplicação": não aparece com filtro de veículo (RN-03).
  return p.aplicacoes.some(a => a.montadora === c.montadora && (!c.modelo || a.modelo === c.modelo));
}

export function filtrar(lista: Produto[], c: Consulta) {
  return lista.filter(p =>
    (!c.categorias.length || c.categorias.includes(p.categoria)) &&
    atendeAplicacao(p, c) &&
    (!c.marcas.length || (!!p.marca && c.marcas.includes(p.marca))) &&
    (!c.promocao || !!p.promocao),
  );
}

const comparaNome = (a: Produto, b: Produto) => a.nome.localeCompare(b.nome, 'pt-BR');
const primeiroCodigo = (p: Produto) => codigosMK(p)[0];

/** Busca + filtros + ordenação. */
export function consultar(c: Consulta, lista: Produto[] = ativos): Produto[] {
  const filtrados = filtrar(lista, c);
  const comBusca = c.q.trim()
    ? filtrados.map(p => ({ p, s: pontuar(p, c.q) })).filter(x => x.s > 0)
    : filtrados.map(p => ({ p, s: 0 }));
  const ordem = c.ordem === 'relevancia' && !c.q.trim() ? 'nome' : c.ordem;
  // Promoções sempre primeiro (pedido do responsável humano); com busca, só desempatam a relevância.
  const promo = (a: Produto, b: Produto) => Number(!!b.promocao) - Number(!!a.promocao);
  comBusca.sort((a, b) => {
    if (ordem === 'relevancia') return b.s - a.s || promo(a.p, b.p) || comparaNome(a.p, b.p);
    const pr = promo(a.p, b.p);
    if (pr) return pr;
    if (ordem === 'codigo') {
      const ca = primeiroCodigo(a.p), cb = primeiroCodigo(b.p);
      if (ca && cb) return ca.localeCompare(cb, 'pt-BR', { numeric: true }) || comparaNome(a.p, b.p);
      return ca ? -1 : cb ? 1 : comparaNome(a.p, b.p);
    }
    return comparaNome(a.p, b.p);
  });
  return comBusca.map(x => x.p);
}

export type FiltroAtivo = { chave: string; rotulo: string; proxima: Consulta };

/** Chips dos filtros aplicados; cada um carrega a consulta sem ele. */
export function filtrosAtivos(c: Consulta): FiltroAtivo[] {
  const chips: FiltroAtivo[] = [];
  if (c.q.trim()) chips.push({ chave: 'q', rotulo: `Busca: “${c.q.trim()}”`, proxima: { ...c, q: '', ordem: c.ordem === 'relevancia' ? 'nome' : c.ordem } });
  for (const slug of c.categorias) chips.push({ chave: `cat:${slug}`, rotulo: obterCategoria(slug)?.nome ?? slug, proxima: { ...c, categorias: c.categorias.filter(x => x !== slug) } });
  if (c.montadora) {
    const m = obterMontadora(c.montadora);
    chips.push({ chave: 'montadora', rotulo: m?.nome ?? c.montadora, proxima: { ...c, montadora: '', modelo: '' } });
    if (c.modelo) chips.push({ chave: 'modelo', rotulo: m?.modelos.find(x => x.slug === c.modelo)?.nome ?? c.modelo, proxima: { ...c, modelo: '' } });
  }
  for (const marca of c.marcas) chips.push({ chave: `marca:${marca}`, rotulo: `Marca ${marca}`, proxima: { ...c, marcas: c.marcas.filter(x => x !== marca) } });
  if (c.promocao) chips.push({ chave: 'promocao', rotulo: 'Somente promoções', proxima: { ...c, promocao: false } });
  return chips;
}
