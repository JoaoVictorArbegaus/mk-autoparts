/*
 * Metadados por rota: usados pelo scripts/prerender.mjs (via entry-server) para montar o <head>
 * de cada página estática, e pelo cliente para trocar título e descrição ao navegar.
 */
import { limparCaminho, resolverRota } from './router';
import { artePromocao, codigosMK, formatarPreco, imagemProduto, listarMontadoras, obterCategoria, obterProduto } from './content/catalogo';
import { empresa, seo, SITE_URL } from './content/site';

export type Meta = { titulo: string; descricao: string; caminho: string; imagem: string; tipo: 'website' | 'product'; noindex?: boolean; jsonLd?: object };

const OG_PADRAO = '/img/marca/og-selo.png';

function jsonLdLoja() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoPartsStore',
    '@id': `${SITE_URL}/#loja`,
    name: empresa.nome,
    legalName: empresa.razaoSocial,
    description: seo.landing.descricao,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/img/marca/og-selo.png`,
    image: `${SITE_URL}/img/loja/fachada.webp`,
    telephone: `+${empresa.whatsapp}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: empresa.endereco.rua,
      addressLocality: empresa.endereco.cidade,
      addressRegion: empresa.endereco.uf,
      addressCountry: 'BR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: empresa.endereco.geo.lat, longitude: empresa.endereco.geo.lng },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '12:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '13:00', closes: '18:00' },
    ],
    areaServed: 'BR',
    sameAs: [empresa.instagram],
  };
}

export function metaDaRota(caminho: string): Meta {
  const rota = resolverRota(caminho);
  if (rota.nome === 'landing') return { ...seo.landing, titulo: seo.landing.titulo, descricao: seo.landing.descricao, caminho: '/', imagem: OG_PADRAO, tipo: 'website', jsonLd: jsonLdLoja() };
  if (rota.nome === 'catalogo') return { titulo: seo.catalogo.titulo, descricao: seo.catalogo.descricao, caminho: '/catalogo', imagem: OG_PADRAO, tipo: 'website' };
  if (rota.nome === 'painel') return { titulo: seo.painel.titulo, descricao: seo.painel.descricao, caminho: '/painel', imagem: OG_PADRAO, tipo: 'website', noindex: true };
  if (rota.nome === 'admin') return { titulo: seo.admin.titulo, descricao: seo.admin.descricao, caminho: limparCaminho(caminho), imagem: OG_PADRAO, tipo: 'website', noindex: true };
  if (rota.nome === 'produto') {
    const p = obterProduto(rota.slug);
    if (p) {
      const codigos = codigosMK(p);
      const veiculos = [...new Set(p.aplicacoes.map(a => listarMontadoras().find(m => m.slug === a.montadora)?.nome).filter(Boolean))].join(', ');
      const descricao = [
        `${p.nome}${codigos.length ? ` (cód. ${codigos.join(' / ')})` : ''}`,
        obterCategoria(p.categoria)?.nome,
        veiculos ? `Para ${veiculos}` : '',
        p.promocao ? `Promoção ${formatarPreco(p.promocao.preco)}` : 'Orçamento pelo WhatsApp da MK Autoparts, Lages – SC',
      ].filter(Boolean).join('. ') + '.';
      const img = artePromocao(p)?.src ?? imagemProduto(p)?.src ?? OG_PADRAO;
      return {
        titulo: `${p.nome} | MK Autoparts`,
        descricao,
        caminho: `/produto/${p.slug}`,
        imagem: img,
        tipo: 'product',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: p.nome,
          ...(codigos.length ? { sku: codigos[0], mpn: codigos.join(' / ') } : {}),
          ...(p.marca ? { brand: { '@type': 'Brand', name: p.marca } } : {}),
          ...(p.descricao ? { description: p.descricao } : {}),
          image: `${SITE_URL}${img}`,
          category: obterCategoria(p.categoria)?.nome,
          url: `${SITE_URL}/produto/${p.slug}`,
          // Offer só em promoção (DEC-008).
          ...(p.promocao ? { offers: { '@type': 'Offer', price: p.promocao.preco.toFixed(2), priceCurrency: 'BRL', url: `${SITE_URL}/produto/${p.slug}`, seller: { '@id': `${SITE_URL}/#loja` } } } : {}),
        },
      };
    }
  }
  return { titulo: seo.naoEncontrado.titulo, descricao: seo.naoEncontrado.descricao, caminho, imagem: OG_PADRAO, tipo: 'website', noindex: true };
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Bloco do <head> que o prerender insere no lugar de <!--app-head-->. */
export function headHtml(caminho: string) {
  const m = metaDaRota(caminho);
  const url = `${SITE_URL}${m.caminho}`;
  const linhas = [
    `<title>${esc(m.titulo)}</title>`,
    `<meta name="description" content="${esc(m.descricao)}" />`,
    m.noindex ? '<meta name="robots" content="noindex, nofollow" />' : '',
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="${m.tipo === 'product' ? 'product' : 'website'}" />`,
    '<meta property="og:locale" content="pt_BR" />',
    '<meta property="og:site_name" content="MK Autoparts" />',
    `<meta property="og:title" content="${esc(m.titulo)}" />`,
    `<meta property="og:description" content="${esc(m.descricao)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(SITE_URL + m.imagem)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    m.jsonLd ? `<script type="application/ld+json">${JSON.stringify(m.jsonLd).replace(/</g, '\\u003c')}</script>` : '',
  ];
  return linhas.filter(Boolean).join('\n    ');
}
