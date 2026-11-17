import { describe, expect, it } from 'vitest';
import { foraDoHorario } from './horario';

// Brasília é UTC−3 (sem horário de verão): 8h em Brasília = 11h UTC.
const utc = (iso: string) => new Date(`${iso}Z`);

describe('horário comercial (DEC-023, RN-15)', () => {
  it('segunda às 10h de Brasília está dentro', () => {
    expect(foraDoHorario(utc('2026-11-16T13:00:00'))).toBe(false);
  });

  it('limites: 8h em ponto dentro, 7h59 e 18h em ponto fora', () => {
    expect(foraDoHorario(utc('2026-11-16T11:00:00'))).toBe(false);
    expect(foraDoHorario(utc('2026-11-16T10:59:00'))).toBe(true);
    expect(foraDoHorario(utc('2026-11-16T21:00:00'))).toBe(true);
    expect(foraDoHorario(utc('2026-11-16T20:59:00'))).toBe(false);
  });

  it('sábado e domingo ficam fora', () => {
    expect(foraDoHorario(utc('2026-11-14T13:00:00'))).toBe(true);
    expect(foraDoHorario(utc('2026-11-15T13:00:00'))).toBe(true);
  });

  it('usa o fuso de Brasília: sexta 23h em Brasília já é fora, mesmo sendo sábado em UTC', () => {
    expect(foraDoHorario(utc('2026-11-21T02:00:00'))).toBe(true);
    // Segunda 9h em Brasília (12h UTC) é dentro.
    expect(foraDoHorario(utc('2026-11-23T12:00:00'))).toBe(false);
  });
});
