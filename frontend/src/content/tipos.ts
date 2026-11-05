export type Lado = 'LD' | 'LE';

export interface Categoria {
  slug: string;
  nome: string;
  ordem: number;
}

export interface Modelo {
  slug: string;
  nome: string;
}

export interface Montadora {
  slug: string;
  nome: string;
  modelos: Modelo[];
}

export interface Aplicacao {
  montadora: string;
  modelo?: string;
  anoInicio?: number;
  anoFim?: number;
}

export interface Variante {
  lado: Lado;
  /** Código MK do lado; ausente quando a fonte não informa (ex.: artes de promoção). */
  codigo?: string;
  codigosOriginais?: string[];
}

export interface Promocao {
  preco: number;
  precoOriginal?: number;
}

export interface Produto {
  slug: string;
  nome: string;
  categoria: string;
  /** Código MK de peça sem lado. Peça com lado usa `variantes` (DEC-012). */
  codigo?: string;
  codigosOriginais?: string[];
  variantes?: Variante[];
  marca?: string;
  descricao?: string;
  aplicacoes: Aplicacao[];
  promocao?: Promocao;
  /** Arte de promoção do cliente exibida no carrossel da landing (DEC-013). */
  artePromocao?: string;
  imagem?: string;
  destaque?: boolean;
  ativo: boolean;
  exemplo?: boolean;
}
