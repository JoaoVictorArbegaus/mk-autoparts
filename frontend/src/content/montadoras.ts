// Gerado a partir de frontend/design/originais (PDF "CATALOGO MK AUTOPARTS 2025" e artes de promoção).
// Revisão da transcrição: frontend/design/catalogo-revisao.md
import type { Montadora } from './tipos';

// Randon é fabricante de implementos; entra no filtro "Marca do veículo".
export const montadoras: Montadora[] = [
  { slug: "scania", nome: "Scania", modelos: [{ slug: "serie-4", nome: "Série 4" }, { slug: "serie-5", nome: "Série 5" }, { slug: "ntg", nome: "NTG (Série 6)" }] },
  { slug: "volvo", nome: "Volvo", modelos: [{ slug: "fh", nome: "FH" }, { slug: "fm", nome: "FM" }, { slug: "vm", nome: "VM" }] },
  { slug: "mercedes-benz", nome: "Mercedes-Benz", modelos: [{ slug: "axor", nome: "Axor" }, { slug: "actros", nome: "Actros" }] },
  { slug: "man", nome: "MAN", modelos: [{ slug: "tgx", nome: "TGX" }] },
  { slug: "volkswagen", nome: "Volkswagen", modelos: [{ slug: "constellation", nome: "Constellation" }, { slug: "delivery", nome: "Delivery" }] },
  { slug: "iveco", nome: "Iveco", modelos: [{ slug: "stralis", nome: "Stralis" }, { slug: "tector", nome: "Tector" }, { slug: "cursor", nome: "Cursor" }] },
  { slug: "daf", nome: "DAF", modelos: [{ slug: "xf", nome: "XF" }, { slug: "cf", nome: "CF" }] },
  { slug: "randon", nome: "Randon", modelos: [{ slug: "bitrem", nome: "Bitrem" }, { slug: "carreta", nome: "Carreta / semirreboque" }] },
];
