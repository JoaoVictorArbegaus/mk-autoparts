---
target: hero da landing no celular (mosaico)
total_score: 22
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
target_identity: "file:D:\\IntelliJ\\Workspace\\MK_Autoparts\\frontend\\src\\components\\landing\\Hero.tsx"
target_fingerprint: "sha256:7c5758be7421d2e9909908070057a7c89df0eec21788558c6d425094e4cb3094"
target_path: "D:\\IntelliJ\\Workspace\\MK_Autoparts\\frontend\\src\\components\\landing\\Hero.tsx"
timestamp: 2026-11-16T22-41-42Z
slug: frontend-src-components-landing-hero-tsx
---
# Crítica: hero da landing no celular (fundo com mosaico)

Método: dual-agent (A: revisão de design · B: detector + navegador). Somente leitura.

## Notas Nielsen (22/32, Aceitável; 7 e 10 n/a em landing)
1 Status 3 · 2 Mundo real 3 · 3 Controle 3 · 4 Consistência 2 (hero nítido no desktop, turvo no celular) · 5 Prevenção 3 · 6 Reconhecimento 3 · 7 n/a · 8 Estética 2 (fundo turvo, vermelho atrás do texto, vazios) · 9 Recuperação 3 · 10 n/a

## Problemas prioritários
- [P1] Mosaico ampliado ~3,75x no celular: carrega mosaico-800.jpg por sizes="100vw" (Hero.tsx:29, index.html:15 preload) com object-fit cover em retrato; ~26% da largura do arquivo visível. Correção: recorte em retrato próprio (<picture> com source media max-width 959px, ~1080x1600) a partir de frontend/design/originais/fotos/MosaicoProdutos.png, ou sizes "(max-width: 959px) 200vh, 100vw" (cuidado com LCP).
- [P1] Composição: faixa central do mosaico (lanternas vermelhas, farol cortado) exatamente atrás do texto; vazio marinho em cima e embaixo. Opção A: imagem nítida como faixa no topo (~50% do hero) desvanecendo para marinho, texto sobre marinho limpo. Opção B: tela cheia com recorte em retrato.
- [P2] Véu "meio-termo" (0,85→0,40 horizontal + 0,3→0,95 vertical): peças meio reconhecíveis; vermelho das lanternas atravessa atrás do h1. Ou textura (saturate .35, véu uniforme) ou vitrine (opção A).
- [P2] Filete diagonal da emenda passa sob o FAB do WhatsApp na dobra; linhas de velocidade (0,55) somam ruído. Hero menos alto no celular (marcas na dobra) ou FAB acima da emenda; linhas a 0,3.
- [P3] "Falar no WhatsApp" em vidro com borda fraca + FAB do WhatsApp no mesmo viewport (duas entradas).

## Detector
CLI: 0 achados em Hero.tsx, landing/ e landing.css. Navegador: low-contrast no cromado "caminhões" (falso positivo: mede color e não o preenchimento por background-clip), text-occlusion (falso positivo, etiqueta do overlay), marquee em .marcas__lista (fora do hero; faixa prevista no contrato).
Contraste medido por pixels: h1 pior caso 5,2:1; apoio 4,9:1 (ok). Cromado: faixa escura do glifo ~2,5:1 contra os pontos mais claros da foto (abaixo de 3:1).

## Personas
Jordan: a imagem não diz "peças de caminhão" no celular. Casey: parágrafo de 4 linhas sobre fundo granulado; busca + 2 CTAs + FAB. Riley: correção rápida de sizes pode multiplicar o peso; 320px quebra h1 em 3 linhas; paisagem não testada.

## Menores
Comentário landing.css:17 ainda fala "foto do caminhão"; DEC-024 pede "véu mais forte" no celular (mudar o tratamento pode exigir ajuste da decisão); animação foto-recua (scale 1.08) aumenta o upscale no início; placeholder curto "Nome ou código".
