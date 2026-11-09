# Revisão da transcrição do catálogo

Fonte: `docs/produtos/CATALOGO MK AUTOPARTS 2025.pdf` (7 páginas, Canva,
abril de 2025) e as três imagens recebidas em `docs/produtos/`. Resultado em
`frontend/src/content/` (`produtos.ts`, `categorias.ts`, `montadoras.ts`,
`tipos.ts`) e imagens em `frontend/public/img/produtos/` e `img/promocoes/`.

## Resumo

- 73 peças do PDF + 3 promoções = **76 produtos**. Quadros vazios do PDF foram
  ignorados.
- Peças em par viraram um produto com lados LD/LE, cada lado com o código MK e os
  códigos originais do PDF (`DEC-012`).
- Fotos recortadas do PDF (fundo branco, resolução do PDF, cerca de 250–370 px
  de largura). As das promoções foram recortadas das artes e têm fundo escuro.
- Nomes reescritos em caixa normal, com acentos e preposições. O nome original
  de cada peça fica num comentário em `produtos.ts`.

## Correções feitas na transcrição

| Peça | No PDF | No catálogo |
| --- | --- | --- |
| S03-035/036 | "FAROL PRINCILPAL" | Farol principal |
| VW01-035/036 | "FAROL PRINCIAL" | Farol principal |
| VW01-032/031 | "CONSTALAION" | Constellation |
| VW01-033/034 | "DEIVERY" | Delivery |
| S03-035/036 | "SC1760597LE" | SC1760597 (LE) |
| V06-045/046 | "LANTERNA DIANTERA VW CR" (na página Volvo) | Lanterna dianteira Volvo VM, acrílico |
| S07-096/097 e -1 | "MANUAL" / "ELETRICO" | regulagem manual / regulagem elétrica |

## Dúvidas para o cliente (não corrigidas por inferência)

1. **S07-102/103 (lente do farol NTG):** os códigos originais são os mesmos do
   farol S07-096-1/097-1 (2379893 / 2379889). Erro do PDF?
2. **V09-020/021:** o mesmo código original 21221129 para LD e LE.
3. **V05-067/068 (retrovisor FH após 2008):** o PDF marca os dois códigos
   originais como LE (22286149 e 20752914); 22286149 também aparece no
   V04-083. Ficaram sem lado.
4. **V04-082 e V05-067:** mesmo nome ("Espelho retrovisor Volvo FH após 2008"),
   códigos MK diferentes. Qual a diferença entre eles?
5. **V06-045/046:** o texto diz "VW", mas a peça está na página da Volvo e os
   códigos (20537295 / 0537294) parecem Volvo. "0537294" está sem o "2" inicial?
6. **V09-016-1/017-1:** códigos originais lidos como "VO21221154" / "VO21221153"
   (letra O ou zero?).
7. **VW01-033/034:** os "códigos originais" são de 13 dígitos (7897563504310 /
   7397652203792), parecem códigos de barras (EAN), não códigos da montadora.
8. **B01-010/011:** LD 6885447203 e LE 688547103 (um dígito a menos no LE?).
9. **S06-016, V05-061, V04-219, V04-281, V09-162:** o nome diz "LD/LE", mas há um
   único código MK. O mesmo código serve aos dois lados? Ficaram como peça sem
   lado.
10. **V09-037:** só existe o lado LD?
11. **S02-095/096 (farol de milha), S02-012, B10-268, B01-010:** sem modelo no
    PDF; aplicados só à montadora.
12. **"FH5" (V12-114/115 e V12-120/121):** é a 5ª geração do FH? Foi aplicado ao
    modelo FH.
13. **Promoções:** as artes não trazem código MK nem códigos originais; os
    produtos de promoção estão sem código. Quais são os códigos?

## Classificação adotada (proposta)

- **Categorias:** Faróis; Lanternas e sinalização; Retrovisores; Lentes e vidros
  de farol; Portas e vidros elétricos; Motor, tensores e polias; Implementos e
  acessórios.
- **Marca do veículo / modelos:** Scania (Série 4, Série 5, NTG/Série 6), Volvo
  (FH, FM, VM), Mercedes-Benz (Axor, Actros), MAN (TGX), Volkswagen
  (Constellation, Delivery), Iveco (Stralis, Tector, Cursor), DAF (XF, CF),
  Randon (Bitrem, Carreta). Anos entram só quando o PDF informa.
- **Marca da peça:** o PDF não informa o fabricante das peças; só a caixa de
  lanterna é "original Randon". O filtro de marca da peça fica oculto até haver
  ao menos duas marcas (`PEND-007`).
- **Destaques (escolha da equipe, sem critério do cliente):** espelho Scania NTG,
  farol Scania NTG manual, lanterna LED Scania NTG, lanterna traseira Volvo FH16,
  espelho Volvo FH New, farol Actros 2018+, farol VW Delivery 2017, além das três
  promoções.
