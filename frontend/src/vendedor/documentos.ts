/*
 * CPF e CNPJ do cliente do orçamento: validação dos dígitos verificadores (especificação do
 * documento, "Regras de validação") e formatação para exibir. Só verifica a conta; não consulta a Receita.
 */

const soDigitos = (s: string) => s.replace(/\D/g, '');

function digitoVerificador(base: string, pesos: number[]) {
  const soma = pesos.reduce((s, p, i) => s + Number(base[i]) * p, 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function cpfValido(texto: string): boolean {
  const d = soDigitos(texto);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const d1 = digitoVerificador(d, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = digitoVerificador(d, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d1 === Number(d[9]) && d2 === Number(d[10]);
}

export function cnpjValido(texto: string): boolean {
  const d = soDigitos(texto);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const d1 = digitoVerificador(d, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = digitoVerificador(d, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d1 === Number(d[12]) && d2 === Number(d[13]);
}

/** "000.000.000-00" ou "00.000.000/0000-00" quando os dígitos estão completos; senão como veio. */
export function formatarDocumento(texto: string): string {
  const d = soDigitos(texto);
  if (d.length === 11) return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  if (d.length === 14) return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  return texto.trim();
}
