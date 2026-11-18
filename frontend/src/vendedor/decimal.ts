/*
 * Aritmética decimal do orçamento (especificação do documento, "Regras de cálculo": nunca ponto
 * flutuante). Emula o `decimal` do Python usado em orcamento_modelo.py, a referência executável:
 * valor = coeficiente inteiro (BigInt) × 10^expoente; soma, subtração e multiplicação exatas e
 * arredondadas a 28 dígitos significativos (ROUND_HALF_EVEN, o contexto padrão do Python); divisão
 * arredondada do mesmo jeito; `arredondar` = quantize com ROUND_HALF_UP (metade para cima).
 * Assim o site chega exatamente aos mesmos números do modelo, inclusive no rateio do desconto.
 */

const PRECISAO = 28;
const DEZ = 10n;
const pot = (n: number) => DEZ ** BigInt(n);
const digitos = (n: bigint) => (n < 0n ? -n : n).toString().length;

export class Dec {
  private constructor(
    readonly c: bigint,
    readonly e: number,
  ) {}

  static readonly ZERO = new Dec(0n, 0);
  static readonly UM = new Dec(1n, 0);
  static readonly CEM = new Dec(100n, 0);

  /** Texto com ponto decimal ("489.00", "-3", "0.381348") ou inteiro. Nunca um número fracionário. */
  static de(v: string | number | bigint | Dec): Dec {
    if (v instanceof Dec) return v;
    if (typeof v === 'bigint') return new Dec(v, 0);
    if (typeof v === 'number') {
      if (!Number.isInteger(v)) throw new Error(`Dec: use texto para valores fracionários (${v})`);
      return new Dec(BigInt(v), 0);
    }
    const m = /^\s*(-?)(\d+)(?:\.(\d+))?\s*$/.exec(v);
    if (!m) throw new Error(`Dec: valor inválido "${v}"`);
    const frac = m[3] ?? '';
    const c = BigInt(m[2] + frac);
    return new Dec(m[1] ? -c : c, -frac.length);
  }

  /** Arredonda o coeficiente a 28 dígitos significativos, metade para o par (contexto do Python). */
  private static contexto(c: bigint, e: number): Dec {
    const n = digitos(c);
    if (n <= PRECISAO) return new Dec(c, e);
    const corte = n - PRECISAO;
    const div = pot(corte);
    const sinal = c < 0n ? -1n : 1n;
    const abs = c * sinal;
    let q = abs / div;
    const r2 = (abs % div) * 2n;
    if (r2 > div || (r2 === div && q % 2n === 1n)) q += 1n;
    return new Dec(q * sinal, e + corte);
  }

  private alinhar(o: Dec): [bigint, bigint, number] {
    const e = Math.min(this.e, o.e);
    return [this.c * pot(this.e - e), o.c * pot(o.e - e), e];
  }

  mais(o: Dec | string | number): Dec {
    const [a, b, e] = this.alinhar(Dec.de(o));
    return Dec.contexto(a + b, e);
  }

  menos(o: Dec | string | number): Dec {
    const [a, b, e] = this.alinhar(Dec.de(o));
    return Dec.contexto(a - b, e);
  }

  vezes(o: Dec | string | number): Dec {
    const x = Dec.de(o);
    return Dec.contexto(this.c * x.c, this.e + x.e);
  }

  /** Divisão com 28 dígitos significativos, metade para o par (como o Decimal do Python). */
  dividido(o: Dec | string | number): Dec {
    const x = Dec.de(o);
    if (x.c === 0n) throw new Error('Dec: divisão por zero');
    if (this.c === 0n) return Dec.ZERO;
    const sinal = (this.c < 0n) !== (x.c < 0n) ? -1n : 1n;
    const a = this.c < 0n ? -this.c : this.c;
    const b = x.c < 0n ? -x.c : x.c;
    // Desloca o dividendo para o quociente ter ao menos 29 dígitos (um além da precisão).
    const k = Math.max(0, PRECISAO + 1 + digitos(b) - digitos(a));
    const n = a * pot(k);
    const q = n / b;
    const resto = n % b;
    const corte = digitos(q) - PRECISAO;
    const div = pot(corte);
    let r = q / div;
    const r2 = (q % div) * 2n;
    if (r2 > div || (r2 === div && (resto > 0n || r % 2n === 1n))) r += 1n;
    let e = this.e - x.e - k + corte;
    // Quociente exato: volta ao expoente ideal sem os zeros à direita (10 ÷ 100 = 0.1, como no Python).
    if (resto === 0n && r2 === 0n) {
      const ideal = this.e - x.e;
      while (e < ideal && r % 10n === 0n) {
        r /= 10n;
        e++;
      }
    }
    return new Dec(r * sinal, e);
  }

  /** quantize com ROUND_HALF_UP: 2 casas por padrão (centavos). */
  arredondar(casas = 2): Dec {
    if (this.e >= -casas) return new Dec(this.c * pot(this.e + casas), -casas);
    const div = pot(-casas - this.e);
    const sinal = this.c < 0n ? -1n : 1n;
    const abs = this.c * sinal;
    let q = abs / div;
    if ((abs % div) * 2n >= div) q += 1n;
    return new Dec(q * sinal, -casas);
  }

  comparar(o: Dec | string | number): number {
    const [a, b] = this.alinhar(Dec.de(o));
    return a === b ? 0 : a < b ? -1 : 1;
  }

  igual = (o: Dec | string | number) => this.comparar(o) === 0;
  get zero() {
    return this.c === 0n;
  }
  get negativo() {
    return this.c < 0n;
  }
  get inteiro() {
    return this.e >= 0 || this.c % pot(-this.e) === 0n;
  }

  static max(a: Dec, b: Dec) {
    return a.comparar(b) >= 0 ? a : b;
  }
  static min(a: Dec, b: Dec) {
    return a.comparar(b) <= 0 ? a : b;
  }
  static somar(lista: Dec[]) {
    return lista.reduce((s, x) => s.mais(x), Dec.ZERO);
  }

  /** Texto com ponto decimal e `casas` casas (ROUND_HALF_UP), para gravar no dado. */
  texto(casas?: number): string {
    const v = casas === undefined ? this : this.arredondar(casas);
    if (v.e >= 0) return (v.c * pot(v.e)).toString();
    const s = (v.c < 0n ? -v.c : v.c).toString().padStart(-v.e + 1, '0');
    return `${v.c < 0n ? '-' : ''}${s.slice(0, v.e)}.${s.slice(v.e)}`;
  }
}

/** "4.936,74": milhar com ponto, decimal com vírgula, `casas` casas (ROUND_HALF_UP). */
export function num(v: Dec, casas = 2): string {
  const t = v.texto(casas);
  const neg = t.startsWith('-');
  const [int, frac] = (neg ? t.slice(1) : t).split('.');
  const milhar = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${neg ? '-' : ''}${milhar}${frac ? `,${frac}` : ''}`;
}

/** "R$ 4.936,74". */
export const brl = (v: Dec) => `R$ ${num(v)}`;

/** Porcentagem de desconto: "10%" se inteira, senão uma casa com vírgula ("12,7%"). */
export function pctTexto(v: Dec): string {
  const r = v.arredondar(1);
  return `${r.inteiro ? r.arredondar(0).texto() : num(r, 1)}%`;
}

/** Alíquota fiscal com 2 casas ("3,25%"). */
export const pctFiscal = (v: Dec) => `${num(v, 2)}%`;

/**
 * Lê o que o vendedor digita: "1.234,56", "12,5", "12.5", "R$ 10". Devolve o texto decimal com
 * ponto ("1234.56"); vazio → undefined; inválido, negativo ou com mais de `casas` casas → null.
 */
export function lerDecimal(texto: string, casas = 2): string | undefined | null {
  const s = texto.trim().replace(/^R\$\s*/, '').replace(/\s/g, '');
  if (!s) return undefined;
  const normal = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s;
  const m = /^(\d+)(?:\.(\d*))?$/.exec(normal);
  if (!m || (m[2] ?? '').length > casas) return null;
  return Dec.de(`${m[1]}${m[2] ? `.${m[2]}` : ''}`).texto();
}

/** Dado legado (número gravado antes da aritmética decimal) ou texto → texto decimal; senão undefined. */
export function decimalDoDado(v: unknown): string | undefined {
  if (typeof v === 'string' && /^\d+(\.\d+)?$/.test(v)) return v;
  // Números antigos vieram de campos digitados: o texto mais curto do JS é o valor digitado.
  if (typeof v === 'number' && Number.isFinite(v) && v >= 0) return String(v).includes('e') ? undefined : String(v);
  return undefined;
}
