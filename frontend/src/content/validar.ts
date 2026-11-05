/*
 * Validação dos dados (sdd_kit/03-domain-model.md), chamada no build pelo scripts/prerender.mjs
 * e nos testes. Devolve a lista de erros; vazia = dados válidos.
 */
import { produtos } from './produtos';
import { categorias } from './categorias';
import { montadoras } from './montadoras';
import { vendedores } from './vendedores';
import { baseMetricas, ORIGENS } from './demo-metricas';

export function validarDados(existeArquivo?: (caminhoPublico: string) => boolean): string[] {
  const erros: string[] = [];
  const slugs = new Set<string>();
  const codigos = new Set<string>();
  const cats = new Set(categorias.map(c => c.slug));

  for (const p of produtos) {
    if (slugs.has(p.slug)) erros.push(`slug duplicado: ${p.slug}`);
    slugs.add(p.slug);
    const cods = [p.codigo, ...(p.variantes ?? []).map(v => v.codigo)].filter((c): c is string => !!c);
    for (const c of cods) {
      if (codigos.has(c)) erros.push(`código duplicado: ${c} (${p.slug})`);
      codigos.add(c);
    }
    const lados = (p.variantes ?? []).map(v => v.lado);
    if (new Set(lados).size !== lados.length) erros.push(`lado repetido em ${p.slug}`);
    if (!cats.has(p.categoria)) erros.push(`categoria inexistente em ${p.slug}: ${p.categoria}`);
    for (const a of p.aplicacoes) {
      const m = montadoras.find(x => x.slug === a.montadora);
      if (!m) erros.push(`montadora inexistente em ${p.slug}: ${a.montadora}`);
      else if (a.modelo && !m.modelos.some(x => x.slug === a.modelo)) erros.push(`modelo inexistente em ${p.slug}: ${a.modelo}`);
    }
    if (p.promocao) {
      if (!(p.promocao.preco > 0)) erros.push(`preço de promoção inválido em ${p.slug}`);
      if (p.promocao.precoOriginal !== undefined && !(p.promocao.precoOriginal > p.promocao.preco)) erros.push(`preço original inválido em ${p.slug}`);
    }
    if (existeArquivo) {
      if (p.imagem) {
        const webp = p.imagem.replace(/\.(png|jpe?g)$/i, '.webp');
        if (!existeArquivo(webp)) erros.push(`imagem não encontrada: ${webp}`);
      }
      if (p.artePromocao) {
        const webp = p.artePromocao.replace(/\.(png|jpe?g)$/i, '.webp');
        if (!existeArquivo(webp)) erros.push(`arte não encontrada: ${webp}`);
      }
    }
  }

  const codVend = vendedores.map(v => v.codigo);
  if (new Set(codVend).size !== codVend.length) erros.push('código de vendedor duplicado');
  for (const o of ORIGENS) if (o !== 'direto' && !codVend.includes(o)) erros.push(`base do painel cita vendedor inexistente: ${o}`);
  for (const slug of Object.keys(baseMetricas.produtos)) if (!slugs.has(slug)) erros.push(`base do painel cita produto inexistente: ${slug}`);
  return erros;
}
