/*
 * Admin de demonstração (DEC-015): layout de trabalho (menu lateral marinho, área clara), login
 * simulado e as telas. Fora da casca pública (sem cabeçalho, rodapé, Lenis nem rastreio).
 * Pré-renderiza só a estrutura; a sessão simulada é lida depois da montagem.
 */
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useRouter, type TelaAdmin } from '../router';
import { admin } from '../content/admin';
import { Icone, type NomeIcone } from '../components/Icons';
import { AdminDemoProvider, useAdmin } from './AdminDemo';
import { TelaProdutos } from './TelaProdutos';
import { TelaProdutoForm } from './TelaProdutoForm';
import { TelaPromocoes } from './TelaPromocoes';
import { TelaVendedores } from './TelaVendedores';
import { Painel } from '../pages/Painel';

export function Admin({ tela }: { tela: TelaAdmin }) {
  return (
    <AdminDemoProvider>
      <Casca tela={tela} />
    </AdminDemoProvider>
  );
}

function Casca({ tela }: { tela: TelaAdmin }) {
  const { logado, aviso } = useAdmin();
  const { navegar } = useRouter();

  // Logado na tela de login: vai para Produtos. Fora do login sem sessão: mostra o login no lugar.
  useEffect(() => {
    if (logado && tela === 'login') navegar('/admin/produtos', { substituir: true });
  }, [logado, tela, navegar]);

  let conteudo;
  if (logado === null) conteudo = <div className="adm-carregando">{admin.carregando}</div>;
  else if (!logado || tela === 'login') conteudo = <Login />;
  else conteudo = <Layout tela={tela} />;

  return (
    <div className="adm">
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

function Selo() {
  return (
    <p className="adm-selo">
      <Icone nome="alerta" tamanho={16} />
      {admin.selo}
    </p>
  );
}

function Login() {
  const { entrar } = useAdmin();
  const { navegar, caminho } = useRouter();
  const t = admin.login;
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    entrar(usuario);
    if (caminho === '/admin') navegar('/admin/produtos', { substituir: true });
  };
  return (
    <div className="adm-login">
      <div className="adm-login__cartao">
        <img src="/img/marca/horizontal-claro.svg" alt="MK Autoparts" width={194} height={40} className="adm-login__logo" />
        <h1>{t.titulo}</h1>
        <p className="adm-login__apoio">{t.apoio}</p>
        <Selo />
        <form onSubmit={enviar} className="adm-form">
          <label className="adm-campo">
            <span>{t.usuario}</span>
            <input value={usuario} onChange={e => setUsuario(e.target.value)} autoComplete="username" />
          </label>
          <label className="adm-campo">
            <span>{t.senha}</span>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} autoComplete="current-password" />
          </label>
          <button type="submit" className="adm-btn adm-btn--primario adm-btn--largo">
            {t.entrar}
          </button>
        </form>
      </div>
    </div>
  );
}

function Layout({ tela }: { tela: TelaAdmin }) {
  const { usuario, sair } = useAdmin();
  const { navegar, caminho } = useRouter();
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [caminho]);
  const atual = tela.startsWith('produto') ? 'produtos' : tela;

  return (
    <div className={`adm-app${menu ? ' adm-app--menu' : ''}`}>
      <aside className="adm-lateral" aria-label="Menu do admin">
        <Link href="/admin/produtos" className="adm-lateral__logo" aria-label="MK Autoparts, admin">
          <img src="/img/marca/horizontal-escuro.svg" alt="" width={160} height={33} />
        </Link>
        <nav>
          <ul>
            {admin.menu.map(item => (
              <li key={item.tela}>
                <Link href={item.href} aria-current={atual === item.tela ? 'page' : undefined}>
                  <Icone nome={item.icone as NomeIcone} tamanho={20} />
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="adm-lateral__pe">
          <a href="/" target="_blank" rel="noopener">
            <Icone nome="setaDiag" tamanho={18} />
            {admin.verSite}
          </a>
          <button
            type="button"
            onClick={() => {
              sair();
              navegar('/admin', { substituir: true });
            }}
          >
            <Icone nome="fechar" tamanho={18} />
            {admin.sair}
          </button>
        </div>
      </aside>
      <div className="adm-principal">
        <header className="adm-topo">
          <button type="button" className="adm-topo__menu" aria-label={menu ? admin.fecharMenu : admin.abrirMenu} aria-expanded={menu} onClick={() => setMenu(m => !m)}>
            <Icone nome={menu ? 'fechar' : 'menu'} tamanho={22} />
          </button>
          <Selo />
          <span className="adm-topo__usuario">
            <span aria-hidden="true">{(usuario || 'a').slice(0, 1).toUpperCase()}</span>
            {usuario}
          </span>
        </header>
        <div className="adm-corpo">
          {tela === 'produtos' && <TelaProdutos />}
          {tela === 'produto-novo' && <TelaProdutoForm />}
          {tela === 'produto-editar' && <TelaProdutoForm editar />}
          {tela === 'promocoes' && <TelaPromocoes />}
          {tela === 'vendedores' && <TelaVendedores />}
          {tela === 'metricas' && (
            <div className="adm-metricas">
              <Painel />
            </div>
          )}
        </div>
      </div>
      {menu && <button type="button" className="adm-veu" aria-label={admin.fecharMenu} onClick={() => setMenu(false)} />}
    </div>
  );
}
