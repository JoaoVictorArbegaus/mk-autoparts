/*
 * Registro de eventos da demonstração (RN-08). Escrita agrupada: os eventos vão para uma fila e
 * são gravados juntos logo depois (ou ao sair da página), nunca durante o render.
 */
import { gravar, ler, lerJson, novoId, apagar } from './armazenamento';
import { vendedorGravado } from './vendedor';
import { TIPOS_EVENTO, type Evento, type TipoEvento } from './tipos';

export const CHAVE_EVENTOS = 'mk-eventos-v1';
export const CHAVE_VISITANTE = 'mk-visitante-v1';
export const CHAVE_SESSAO = 'mk-sessao-v1';
export const LIMITE_EVENTOS = 5000;

let fila: Evento[] = [];
let agendado = 0;

export function visitanteId() {
  let id = ler(CHAVE_VISITANTE);
  if (!id) {
    id = novoId();
    gravar(CHAVE_VISITANTE, id);
  }
  return id;
}

export function sessaoId() {
  let id = ler(CHAVE_SESSAO, true);
  if (!id) {
    id = novoId();
    gravar(CHAVE_SESSAO, id, true);
  }
  return id;
}

function valido(e: unknown): e is Evento {
  if (!e || typeof e !== 'object') return false;
  const x = e as Evento;
  return typeof x.id === 'string' && typeof x.em === 'string' && typeof x.sessaoId === 'string' && TIPOS_EVENTO.includes(x.tipo) && (x.vendedor === null || typeof x.vendedor === 'string');
}

export function lerEventos(): Evento[] {
  const salvos = lerJson(CHAVE_EVENTOS, d => (Array.isArray(d) ? d.filter(valido) : null)) ?? [];
  return fila.length ? [...salvos, ...fila] : salvos;
}

export function descarregar() {
  if (agendado) {
    clearTimeout(agendado);
    agendado = 0;
  }
  if (!fila.length) return;
  const salvos = lerJson(CHAVE_EVENTOS, d => (Array.isArray(d) ? d.filter(valido) : null)) ?? [];
  const todos = [...salvos, ...fila];
  fila = [];
  gravar(CHAVE_EVENTOS, JSON.stringify(todos.slice(-LIMITE_EVENTOS)));
}

let ouvindoSaida = false;

export function registrar(tipo: TipoEvento, extra: { produto?: string; carrinho?: string; dados?: Record<string, string | number> } = {}) {
  if (typeof window === 'undefined') return;
  fila.push({ id: novoId(), em: new Date().toISOString(), visitanteId: visitanteId(), sessaoId: sessaoId(), vendedor: vendedorGravado()?.codigo ?? null, tipo, ...extra });
  if (!ouvindoSaida) {
    ouvindoSaida = true;
    window.addEventListener('pagehide', descarregar);
  }
  if (!agendado) agendado = window.setTimeout(descarregar, 400);
}

/** Uma visita por sessão, com a origem (vendedor ou direta). */
export function registrarVisita() {
  const chave = 'mk-visita-registrada';
  if (ler(chave, true)) return;
  gravar(chave, '1', true);
  const v = vendedorGravado();
  registrar('visita_iniciada', { dados: { origem: v ? 'vendedor' : 'direta' } });
}

export function apagarEventos() {
  fila = [];
  apagar(CHAVE_EVENTOS);
}
