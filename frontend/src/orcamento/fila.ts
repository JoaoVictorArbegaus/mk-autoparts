/*
 * Fila do rodízio de vendedores (DEC-017, RN-11, RN-12), em funções puras. O primeiro da fila é o da
 * vez; quem atende um cliente, por rodízio ou por escolha, vai para o fim e os demais mantêm a ordem.
 * Demonstração: a fila fica no localStorage deste navegador (`mk-fila-v1`) e só demonstra a
 * sequência; o rodízio real é do servidor e vale para todos os visitantes.
 */
import { gravar, lerJson } from '../rastreio/armazenamento';

export const CHAVE_FILA = 'mk-fila-v1';

/**
 * Fila válida para os vendedores ativos: mantém a ordem gravada, tira quem saiu ou foi desativado e
 * põe no fim, na ordem do cadastro, quem ainda não estava nela (vendedor novo entra no fim).
 */
export function normalizarFila(gravada: readonly string[] | null | undefined, ativos: readonly string[]): string[] {
  const fila: string[] = [];
  for (const c of gravada ?? []) if (ativos.includes(c) && !fila.includes(c)) fila.push(c);
  for (const c of ativos) if (!fila.includes(c)) fila.push(c);
  return fila;
}

/** O vendedor `codigo` atendeu: vai para o fim; os demais mantêm a ordem. */
export function atender(fila: readonly string[], codigo: string): string[] {
  if (!fila.includes(codigo)) return [...fila];
  return [...fila.filter(c => c !== codigo), codigo];
}

const valida = (d: unknown) => (Array.isArray(d) && d.every(c => typeof c === 'string') ? (d as string[]) : null);

export function lerFila(ativos: readonly string[]): string[] {
  return normalizarFila(lerJson(CHAVE_FILA, valida), ativos);
}

export function gravarFila(fila: readonly string[]) {
  gravar(CHAVE_FILA, JSON.stringify(fila));
}
