/*
 * Busca pelo veículo na landing (M1): marca → modelo → ano → "Ver peças", que abre o catálogo já
 * filtrado. Sem JS, o formulário envia por GET para /catalogo (só a marca; modelo e ano dependem dela).
 */
import { useState, type FormEvent } from 'react';
import { useRouter } from '../../router';
import { escreverConsulta, consultaVazia, listarAnos, listarMontadoras, obterMontadora } from '../../content/catalogo';
import { textos } from '../../content/site';
import { Icone } from '../Icons';
import { Button } from '../Button';

export function BuscaVeiculo() {
  const t = textos.buscaVeiculo;
  const tc = textos.catalogo;
  const { navegar } = useRouter();
  const [montadora, setMontadora] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState(0);
  const m = obterMontadora(montadora);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const qs = escreverConsulta({ ...consultaVazia, montadora, modelo: m ? modelo : '', ano: m ? ano : 0 });
    navegar(qs ? `/catalogo?${qs}` : '/catalogo');
  };

  return (
    <form className="busca-veiculo contido" action="/catalogo" method="get" onSubmit={enviar} aria-labelledby="busca-veiculo-titulo">
      <h3 id="busca-veiculo-titulo" className="busca-veiculo__titulo">
        <Icone nome="caminhao" tamanho={22} />
        {t.titulo}
      </h3>
      <div className="busca-veiculo__campos">
        <label className="busca-veiculo__campo">
          <span>{tc.marcaVeiculo}</span>
          <select
            name="montadora"
            value={montadora}
            onChange={e => {
              setMontadora(e.target.value);
              setModelo('');
              if (!e.target.value) setAno(0);
            }}
          >
            <option value="">{t.escolha}</option>
            {listarMontadoras().map(x => (
              <option key={x.slug} value={x.slug}>
                {x.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="busca-veiculo__campo">
          <span>{tc.modelo}</span>
          <select name="modelo" value={modelo} disabled={!m} onChange={e => setModelo(e.target.value)}>
            <option value="">{m ? tc.todosModelos : tc.escolhaMarca}</option>
            {m?.modelos.map(x => (
              <option key={x.slug} value={x.slug}>
                {x.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="busca-veiculo__campo">
          <span>{tc.ano}</span>
          <select name="ano" value={ano || ''} disabled={!m} onChange={e => setAno(Number(e.target.value) || 0)}>
            <option value="">{m ? tc.todosAnos : tc.escolhaMarca}</option>
            {listarAnos().map(a => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" iconeFim="seta" className="busca-veiculo__botao">
          {t.verPecas}
        </Button>
      </div>
    </form>
  );
}
