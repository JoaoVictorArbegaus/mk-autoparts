/* Ícones SVG próprios, traço único de 1,75 px (contrato: sem emoji, uma família de ícones). */
import type { SVGProps } from 'react';

const caminhos = {
  busca: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  lista: <><path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1Z" /><path d="M16 5h2a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 18 21H6a1.5 1.5 0 0 1-1.5-1.5v-13A1.5 1.5 0 0 1 6 5h2" /><path d="M8.5 11h7M8.5 14.5h7M8.5 18h4" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  fechar: <path d="m6 6 12 12M18 6 6 18" />,
  whatsapp: <><path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.6Z" /><path d="M9.2 8.6c.2-.5.6-.5.9-.5.2 0 .5.6.8 1.2.2.4-.4.8-.5 1 .4.9 1.3 1.9 2.4 2.4.2-.2.6-.8 1-.6l1.2.7c.2.2.1.7-.2 1-.5.6-1.3.8-2.2.4-1.6-.7-3.1-2.2-3.7-3.7-.3-.8-.1-1.5.3-1.9Z" /></>,
  telefone: <path d="M6.6 4h2.6l1.4 3.6-1.8 1.2a10 10 0 0 0 6.4 6.4l1.2-1.8 3.6 1.4v2.6a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.6 6.2 2 2 0 0 1 6.6 4Z" />,
  instagram: <><rect x="4" y="4" width="16" height="16" rx="4.5" /><circle cx="12" cy="12" r="3.6" /><circle cx="16.8" cy="7.2" r=".6" fill="currentColor" /></>,
  local: <><path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0c0 5.4 6.5 11 6.5 11Z" /><circle cx="12" cy="10" r="2.4" /></>,
  relogio: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  caminhao: <><path d="M3 6.5h10.5v9H3zM13.5 9.5h3.8l2.7 3v3h-6.5" /><circle cx="7" cy="17" r="1.8" /><circle cx="17" cy="17" r="1.8" /></>,
  loja: <><path d="M4 9.5 5.5 4.5h13L20 9.5" /><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" /><path d="M5.5 11.5V20h13v-8.5M10 20v-5h4v5" /></>,
  seta: <path d="M5 12h14m-5-5 5 5-5 5" />,
  setaEsq: <path d="M19 12H5m5-5-5 5 5 5" />,
  setaDiag: <path d="M7 17 17 7M9 7h8v8" />,
  mais: <path d="M12 5v14M5 12h14" />,
  menos: <path d="M5 12h14" />,
  lixeira: <><path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.8 12.5h9.4L17.5 7" /><path d="M10 11v5.5M14 11v5.5" /></>,
  filtro: <><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></>,
  check: <path d="m5 12.5 4.2 4.2L19 7" />,
  chevron: <path d="m7 10 5 5 5-5" />,
  pausa: <path d="M9 6v12M15 6v12" />,
  play: <path d="M8 5.5v13l10-6.5Z" />,
  copiar: <><rect x="8.5" y="8.5" width="11" height="11" rx="2" /><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" /></>,
  alerta: <><path d="M12 4 21 19.5H3Z" /><path d="M12 10v4.5M12 17.2v.1" /></>,
  mapa: <><path d="M9 4.5 3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5Z" /><path d="M9 4.5v13M15 6.5v13" /></>,
  caixa: <><path d="M4 8 12 4l8 4v8l-8 4-8-4Z" /><path d="M4 8l8 4 8-4M12 12v8" /></>,
  grafico: <><path d="M4 20h16" /><path d="M7 16v-4M12 16V7M17 16v-6" /></>,
  peca: <><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></>,
} as const;

export type NomeIcone = keyof typeof caminhos;

export function Icone({ nome, tamanho = 20, ...resto }: { nome: NomeIcone; tamanho?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...resto}>
      {caminhos[nome]}
    </svg>
  );
}
