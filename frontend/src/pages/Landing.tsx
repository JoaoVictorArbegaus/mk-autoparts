import { Hero } from '../components/landing/Hero';
import { Montadoras } from '../components/landing/Montadoras';
import { Categorias } from '../components/landing/Categorias';
import { Promocoes } from '../components/landing/Promocoes';
import { Clientes, Loja, Sobre } from '../components/landing/Sobre';

/** Landing: ordem do contrato (direcao-visual.md), ritmo escuro / claro. */
export function Landing() {
  return (
    <>
      <Hero />
      <Montadoras />
      <Categorias />
      <Promocoes />
      <Sobre />
      <Clientes />
      <Loja />
    </>
  );
}
