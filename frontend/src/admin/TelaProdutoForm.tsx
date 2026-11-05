/*
 * Admin (demonstração): formulário de produto (novo ou edição por ?slug=). Salvar atualiza a lista do
 * admin nesta sessão; o site público não muda. A foto é só uma prévia local (object URL).
 */
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useRouter } from '../router';
import { admin } from '../content/admin';
import { imagemProduto, listarCategorias, listarMontadoras, obterMontadora } from '../content/catalogo';
import { Icone } from '../components/Icons';
import { gerarSlug, useAdmin } from './AdminDemo';
import type { Aplicacao, Produto, Variante } from '../content/tipos';

const lista = (s: string) =>
  s
    .split(/[,;\n]/)
    .map(x => x.trim())
    .filter(Boolean);
const texto = (l?: string[]) => (l ?? []).join(', ');

type Lados = { ld: string; ldOrig: string; le: string; leOrig: string };

export function TelaProdutoForm({ editar = false }: { editar?: boolean }) {
  const t = admin.form;
  const { busca, navegar, montado } = useRouter();
  const { produtos, salvarProduto, avisar, fotos, definirFoto } = useAdmin();
  const slugAtual = useMemo(() => (editar ? new URLSearchParams(busca).get('slug') ?? '' : ''), [editar, busca]);
  const original = editar ? produtos.find(p => p.slug === slugAtual) : undefined;

  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descricao, setDescricao] = useState('');
  const [marca, setMarca] = useState('');
  const [temLados, setTemLados] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [originais, setOriginais] = useState('');
  const [lados, setLados] = useState<Lados>({ ld: '', ldOrig: '', le: '', leOrig: '' });
  const [aplicacoes, setAplicacoes] = useState<Aplicacao[]>([]);
  const [ativo, setAtivo] = useState(true);
  const [foto, setFoto] = useState('');
  const [erro, setErro] = useState('');

  // Carrega o produto quando a query (?slug=) chega, depois da montagem.
  useEffect(() => {
    if (!original) return;
    const ld = original.variantes?.find(v => v.lado === 'LD');
    const le = original.variantes?.find(v => v.lado === 'LE');
    setNome(original.nome);
    setCategoria(original.categoria);
    setDescricao(original.descricao ?? '');
    setMarca(original.marca ?? '');
    setTemLados(!!original.variantes?.length);
    setCodigo(original.codigo ?? '');
    setOriginais(texto(original.codigosOriginais));
    setLados({ ld: ld?.codigo ?? '', ldOrig: texto(ld?.codigosOriginais), le: le?.codigo ?? '', leOrig: texto(le?.codigosOriginais) });
    setAplicacoes(original.aplicacoes.map(a => ({ ...a })));
    setAtivo(original.ativo);
    setFoto(fotos[original.slug] ?? imagemProduto(original)?.src ?? '');
    // Só ao abrir o produto: depois o formulário é da pessoa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [original?.slug]);

  const titulo = editar ? t.tituloEditar : t.tituloNovo;

  if (editar && montado && !original) {
    return (
      <section className="adm-tela">
        <Link href="/admin/produtos" className="adm-voltar">
          <Icone nome="setaEsq" tamanho={18} />
          {t.voltar}
        </Link>
        <p className="adm-vazio">{t.naoEncontrado}</p>
      </section>
    );
  }

  const mudarApp = (i: number, campo: keyof Aplicacao, valor: string) =>
    setAplicacoes(l =>
      l.map((a, k) => {
        if (k !== i) return a;
        if (campo === 'montadora') return { montadora: valor };
        if (campo === 'modelo') return { ...a, modelo: valor || undefined };
        const n = Number(valor);
        return { ...a, [campo]: valor && Number.isFinite(n) ? n : undefined };
      }),
    );

  const salvar = (e: FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !categoria) {
      setErro(t.obrigatorio);
      return;
    }
    const variantes: Variante[] | undefined = temLados
      ? [
          { lado: 'LD', codigo: lados.ld.trim() || undefined, codigosOriginais: lista(lados.ldOrig) },
          { lado: 'LE', codigo: lados.le.trim() || undefined, codigosOriginais: lista(lados.leOrig) },
        ].map(v => (v.codigosOriginais.length ? v : { lado: v.lado, codigo: v.codigo })) as Variante[]
      : undefined;
    const base = original ?? ({ aplicacoes: [], ativo: true } as unknown as Produto);
    let slug = original?.slug ?? gerarSlug(`${nome} ${temLados ? lados.ld : codigo}`);
    if (!original) {
      const usados = new Set(produtos.map(p => p.slug));
      let n = 2;
      const raiz = slug || 'produto';
      slug = raiz;
      while (usados.has(slug)) slug = `${raiz}-${n++}`;
    }
    const p: Produto = {
      ...base,
      slug,
      nome: nome.trim(),
      categoria,
      descricao: descricao.trim() || undefined,
      marca: marca.trim() || undefined,
      codigo: temLados ? undefined : codigo.trim() || undefined,
      codigosOriginais: temLados ? undefined : lista(originais).length ? lista(originais) : undefined,
      variantes,
      aplicacoes: aplicacoes.filter(a => a.montadora),
      ativo,
    };
    salvarProduto(p, original?.slug);
    if (foto.startsWith('blob:')) definirFoto(slug, foto);
    avisar(t.salvo);
    navegar('/admin/produtos');
  };

  return (
    <section className="adm-tela" aria-labelledby="adm-titulo">
      <Link href="/admin/produtos" className="adm-voltar">
        <Icone nome="setaEsq" tamanho={18} />
        {t.voltar}
      </Link>
      <div className="adm-tela__cabeca">
        <h1 id="adm-titulo">{titulo}</h1>
      </div>

      <form className="adm-form adm-form--grade" onSubmit={salvar} noValidate>
        <div className="adm-form__principal">
          <fieldset className="adm-bloco">
            <legend>{t.secoes.dados}</legend>
            <label className="adm-campo">
              <span>{t.nome}</span>
              <input value={nome} onChange={e => setNome(e.target.value)} required />
            </label>
            <div className="adm-linha">
              <label className="adm-campo">
                <span>{t.categoria}</span>
                <select value={categoria} onChange={e => setCategoria(e.target.value)} required>
                  <option value="">—</option>
                  {listarCategorias().map(c => (
                    <option key={c.slug} value={c.slug}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label className="adm-campo">
                <span>{t.marca}</span>
                <input value={marca} onChange={e => setMarca(e.target.value)} />
              </label>
            </div>
            <label className="adm-campo">
              <span>{t.descricao}</span>
              <textarea rows={3} value={descricao} onChange={e => setDescricao(e.target.value)} />
            </label>
          </fieldset>

          <fieldset className="adm-bloco">
            <legend>{t.secoes.codigos}</legend>
            <label className="adm-check">
              <input type="checkbox" checked={temLados} onChange={e => setTemLados(e.target.checked)} />
              <span>{t.temLados}</span>
            </label>
            {temLados ? (
              <div className="adm-linha">
                {(['ld', 'le'] as const).map(l => (
                  <div key={l} className="adm-lado">
                    <label className="adm-campo">
                      <span>{t.codigoLado(l.toUpperCase())}</span>
                      <input className="adm-mono" value={lados[l]} onChange={e => setLados(s => ({ ...s, [l]: e.target.value }))} />
                    </label>
                    <label className="adm-campo">
                      <span>{t.originaisLado(l.toUpperCase())}</span>
                      <input className="adm-mono" value={lados[`${l}Orig`]} onChange={e => setLados(s => ({ ...s, [`${l}Orig`]: e.target.value }))} />
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="adm-linha">
                <label className="adm-campo">
                  <span>{t.codigo}</span>
                  <input className="adm-mono" value={codigo} onChange={e => setCodigo(e.target.value)} />
                </label>
                <label className="adm-campo">
                  <span>{t.originais}</span>
                  <input className="adm-mono" value={originais} onChange={e => setOriginais(e.target.value)} />
                </label>
              </div>
            )}
          </fieldset>

          <fieldset className="adm-bloco">
            <legend>{t.secoes.aplicacoes}</legend>
            {aplicacoes.length === 0 && <p className="adm-dica">{t.semAplicacao}</p>}
            {aplicacoes.map((a, i) => {
              const m = obterMontadora(a.montadora);
              return (
                <div key={i} className="adm-aplicacao">
                  <label className="adm-campo">
                    <span>{t.marcaVeiculo}</span>
                    <select value={a.montadora} onChange={e => mudarApp(i, 'montadora', e.target.value)}>
                      {listarMontadoras().map(x => (
                        <option key={x.slug} value={x.slug}>
                          {x.nome}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="adm-campo">
                    <span>{t.modelo}</span>
                    <select value={a.modelo ?? ''} onChange={e => mudarApp(i, 'modelo', e.target.value)}>
                      <option value="">{t.qualquerModelo}</option>
                      {m?.modelos.map(x => (
                        <option key={x.slug} value={x.slug}>
                          {x.nome}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="adm-campo adm-campo--ano">
                    <span>{t.anoInicio}</span>
                    <input inputMode="numeric" value={a.anoInicio ?? ''} onChange={e => mudarApp(i, 'anoInicio', e.target.value)} />
                  </label>
                  <label className="adm-campo adm-campo--ano">
                    <span>{t.anoFim}</span>
                    <input inputMode="numeric" value={a.anoFim ?? ''} onChange={e => mudarApp(i, 'anoFim', e.target.value)} />
                  </label>
                  <button type="button" className="adm-icone-btn" aria-label={t.remover} onClick={() => setAplicacoes(l => l.filter((_, k) => k !== i))}>
                    <Icone nome="lixeira" tamanho={18} />
                  </button>
                </div>
              );
            })}
            <button type="button" className="adm-btn adm-btn--fantasma" onClick={() => setAplicacoes(l => [...l, { montadora: listarMontadoras()[0].slug }])}>
              <Icone nome="mais" tamanho={18} />
              {t.addAplicacao}
            </button>
          </fieldset>
        </div>

        <aside className="adm-form__lateral">
          <fieldset className="adm-bloco">
            <legend>{t.secoes.foto}</legend>
            <div className="adm-foto">{foto ? <img src={foto} alt="" /> : <Icone nome="peca" tamanho={40} />}</div>
            <label className="adm-btn adm-btn--fantasma adm-arquivo">
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) setFoto(URL.createObjectURL(f));
                }}
              />
              {t.trocarFoto}
            </label>
            <p className="adm-dica">{t.fotoAviso}</p>
          </fieldset>
          <fieldset className="adm-bloco">
            <legend>{t.secoes.publicacao}</legend>
            <label className="adm-check">
              <input type="checkbox" checked={ativo} onChange={e => setAtivo(e.target.checked)} />
              <span>{t.ativo}</span>
            </label>
          </fieldset>
          {erro && (
            <p className="adm-erro" role="alert">
              {erro}
            </p>
          )}
          <div className="adm-form__acoes">
            <button type="submit" className="adm-btn adm-btn--primario">
              {t.salvar}
            </button>
            <Link href="/admin/produtos" className="adm-btn adm-btn--fantasma">
              {t.cancelar}
            </Link>
          </div>
        </aside>
      </form>
    </section>
  );
}
