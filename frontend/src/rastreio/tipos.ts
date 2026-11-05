import type { Lado } from '../content/tipos';

export type TipoEvento =
  | 'visita_iniciada'
  | 'produto_clicado'
  | 'busca_realizada'
  | 'item_adicionado'
  | 'item_removido'
  | 'carrinho_finalizado'
  | 'whatsapp_clicado';

export const TIPOS_EVENTO: TipoEvento[] = ['visita_iniciada', 'produto_clicado', 'busca_realizada', 'item_adicionado', 'item_removido', 'carrinho_finalizado', 'whatsapp_clicado'];

export type Evento = {
  id: string;
  em: string;
  visitanteId: string;
  sessaoId: string;
  vendedor: string | null;
  tipo: TipoEvento;
  produto?: string;
  carrinho?: string;
  /** Origem da visita, termo buscado, lado ou quantidade. */
  dados?: Record<string, string | number>;
};

export type ItemCarrinho = { slug: string; lado?: Lado; quantidade: number };

export type EstadoCarrinho = 'ativo' | 'finalizado' | 'vazio';

export type Carrinho = {
  id: string;
  vendedor: string | null;
  estado: EstadoCarrinho;
  criadoEm: string;
  ultimaAtividade: string;
  finalizadoEm?: string;
  itens: ItemCarrinho[];
};
