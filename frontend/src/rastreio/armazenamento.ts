/** Acesso seguro ao armazenamento do navegador: falha de cota ou modo privado nunca quebra a página. */
export function ler(chave: string, sessao = false): string | null {
  try {
    return (sessao ? sessionStorage : localStorage).getItem(chave);
  } catch {
    return null;
  }
}

export function gravar(chave: string, valor: string, sessao = false) {
  try {
    (sessao ? sessionStorage : localStorage).setItem(chave, valor);
  } catch {
    /* cota cheia ou armazenamento indisponível: a demonstração segue sem gravar */
  }
}

export function apagar(chave: string) {
  try {
    localStorage.removeItem(chave);
  } catch {
    /* indisponível */
  }
}

export function lerJson<T>(chave: string, validar: (dado: unknown) => T | null, sessao = false): T | null {
  const bruto = ler(chave, sessao);
  if (!bruto) return null;
  try {
    return validar(JSON.parse(bruto));
  } catch {
    return null;
  }
}

export function novoId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
