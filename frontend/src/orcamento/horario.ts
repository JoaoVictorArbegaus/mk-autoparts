/*
 * Horário comercial (DEC-023, RN-15): único para todos os vendedores, segunda a sexta, das 8h às 18h,
 * no horário de Brasília. Constante de configuração, sem edição no admin; feriados não são tratados.
 * Fora dele o site só avisa que o tempo de resposta é indeterminado: ninguém sai do rodízio.
 */
export const HORARIO_COMERCIAL = {
  fuso: 'America/Sao_Paulo',
  /** Dias da semana: 0 = domingo … 6 = sábado. */
  dias: [1, 2, 3, 4, 5],
  inicio: 8,
  fim: 18,
} as const;

const DIAS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Dia da semana e hora decimal no fuso de Brasília, independentemente do fuso do aparelho. */
function agoraEmBrasilia(data: Date) {
  const partes = new Intl.DateTimeFormat('en-US', { timeZone: HORARIO_COMERCIAL.fuso, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(data);
  const valor = (tipo: string) => partes.find(p => p.type === tipo)?.value ?? '';
  return { dia: DIAS[valor('weekday')], hora: Number(valor('hour')) + Number(valor('minute')) / 60 };
}

/** true fora de segunda a sexta, 8h–18h (18h em ponto já é fora). */
export function foraDoHorario(data: Date = new Date()): boolean {
  const { dia, hora } = agoraEmBrasilia(data);
  const { dias, inicio, fim } = HORARIO_COMERCIAL;
  return !(dias as readonly number[]).includes(dia) || hora < inicio || hora >= fim;
}
