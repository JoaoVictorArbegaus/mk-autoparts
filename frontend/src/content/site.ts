/*
 * Todos os textos do site, contatos e o helper do WhatsApp.
 * Fontes: design/briefing.md, sdd_kit/ (RN-05, DEC-014) e o lema do selo oficial.
 * Textos novos escritos para o protótipo estão listados no relatório para aprovação.
 */
import { WHATSAPP_EMPRESA } from './vendedores';

// PLACEHOLDER: domínio de publicação ainda não definido (briefing, seção 8).
export const SITE_URL = 'https://dominio-a-definir.invalid';

export const empresa = {
  nome: 'MK Autoparts',
  razaoSocial: 'Mk Auto Parts LTDA',
  lema: 'Peças e acessórios para caminhões',
  desde: 2021,
  whatsapp: WHATSAPP_EMPRESA,
  whatsappRotulo: '(49) 99110-0096',
  telefone: '+554930188278',
  telefoneRotulo: '(49) 3018-8278',
  instagram: 'https://www.instagram.com/mk.autoparts__/',
  instagramRotulo: '@mk.autoparts__',
  endereco: {
    rua: 'Av. Corina Caon, 103',
    bairro: 'Ponte Grande',
    cidade: 'Lages',
    uf: 'SC',
    // PLACEHOLDER: CEP a confirmar (briefing, seção 5).
    cep: '[PLACEHOLDER: CEP]',
    geo: { lat: -27.799256140575427, lng: -50.2957836672779 },
    mapa: 'https://maps.app.goo.gl/Jy46cHxL9fPuc28v6',
  },
  horario: [
    { dias: 'Segunda a sexta', horas: '08:00–12:00 e 13:00–18:00' },
    { dias: 'Sábado e domingo', horas: 'Fechado' },
  ],
  // PLACEHOLDER: horário em feriados a confirmar.
  feriados: '[PLACEHOLDER: horário em feriados]',
};

export const mensagens = {
  contato: 'Olá, MK Autoparts! Vi o catálogo online e gostaria de atendimento.',
};

/** Link do WhatsApp com a mensagem url-encoded. O número vem sempre de `destinoWhatsApp` (vendedor da sessão). */
export function whatsapp(numero: string, mensagem: string) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

export const nav = [
  { rotulo: 'Catálogo', href: '/catalogo' },
  { rotulo: 'Promoções', href: '/catalogo?promocao=1' },
  { rotulo: 'Categorias', href: '/#categorias' },
  { rotulo: 'Loja', href: '/#loja' },
];

export const textos = {
  pularConteudo: 'Pular para o conteúdo',
  abrirMenu: 'Abrir menu',
  fecharMenu: 'Fechar menu',
  abrirLista: 'Abrir lista de orçamento',
  atendimento: 'Atendimento:',
  whatsappFlutuante: 'Falar com a MK Autoparts no WhatsApp',
  flutuante: {
    lista: (n: number) => `Lista (${n}) · Enviar`,
    abrirLista: (n: number) => `Abrir a lista de orçamento com ${n} ${n === 1 ? 'item' : 'itens'} para enviar`,
  },

  menu: {
    cartoes: [
      {
        titulo: 'Peças',
        texto: 'Busque pelo nome ou código, filtre por veículo e categoria.',
        links: [
          { rotulo: 'Catálogo', href: '/catalogo', externo: false },
          { rotulo: 'Promoções', href: '/catalogo?promocao=1', externo: false },
          { rotulo: 'Categorias', href: '/#categorias', externo: false },
        ],
      },
      {
        titulo: 'Loja',
        texto: 'Av. Corina Caon, 103 – Ponte Grande, Lages – SC.',
        links: [
          { rotulo: 'Visite a loja', href: '/#loja', externo: false },
          { rotulo: 'Como chegar', href: 'https://maps.app.goo.gl/Jy46cHxL9fPuc28v6', externo: true },
        ],
      },
    ],
  },

  hero: {
    titulo: ['Peças', 'e', 'acessórios', 'para'],
    tituloCromado: 'caminhões',
    apoio: 'Encontre a peça pelo nome ou pelo código, monte sua lista de orçamento e envie pelo WhatsApp. Enviamos para todo o Brasil.',
    buscaRotulo: 'Buscar no catálogo',
    buscaPlaceholder: 'Nome ou código da peça',
    buscaPlaceholderCurto: 'Nome ou código',
    buscar: 'Buscar',
    verCatalogo: 'Ver catálogo',
    falarWhatsapp: 'Falar no WhatsApp',
  },

  montadoras: {
    titulo: 'Marcas de veículo atendidas',
    pausar: 'Pausar a faixa de marcas',
    continuar: 'Continuar a faixa de marcas',
    pecas: (n: number) => `${n} ${n === 1 ? 'peça' : 'peças'}`,
  },

  categorias: {
    titulo: 'Encontre pela categoria',
    apoio: 'Faróis, lanternas, retrovisores e mais, separados como no catálogo da loja.',
    verTodas: 'Ver todo o catálogo',
  },

  promocoes: {
    titulo: 'Promoções',
    apoio: 'Preço de promoção confirmado no atendimento pelo WhatsApp.',
    verTodas: 'Ver promoções no catálogo',
  },

  sobre: {
    titulo: 'Loja em Lages, envio para todo o Brasil',
    // PLACEHOLDER: texto "Sobre nós" definitivo depende do cliente.
    texto: 'A MK Autoparts importa, exporta e distribui peças e acessórios para caminhões desde 2021. A loja fica no bairro Ponte Grande, em Lages – SC, e os pedidos seguem para todo o Brasil.',
    textoPendente: '[PLACEHOLDER: texto "Sobre nós" definitivo, a ser enviado pela MK Autoparts]',
    numeros: [
      { chave: 'produtos', rotulo: 'peças no catálogo online' },
      { chave: 'montadoras', rotulo: 'marcas de veículo' },
      { chave: 'categorias', rotulo: 'categorias de peças' },
    ],
    vantagens: [
      { icone: 'caminhao', titulo: 'Envio para todo o Brasil', texto: 'Os pedidos saem de Lages para qualquer estado.' },
      { icone: 'loja', titulo: 'Loja física em Lages – SC', texto: 'Desde 2021 na Av. Corina Caon, 103, Ponte Grande.' },
      { icone: 'whatsapp', titulo: 'Atendimento pelo WhatsApp', texto: 'Preço e disponibilidade confirmados na conversa.' },
    ],
    comoComprarTitulo: 'Como pedir',
    passos: [
      { titulo: 'Encontre a peça', texto: 'Busque pelo nome ou código, ou filtre por marca do veículo e categoria.' },
      { titulo: 'Monte a lista', texto: 'Adicione as peças, escolha o lado (LD ou LE) e a quantidade.' },
      { titulo: 'Envie pelo WhatsApp', texto: 'A lista vai pronta para o atendimento, com os códigos de cada item.' },
      { titulo: 'Feche com o atendimento', texto: 'Você recebe preço, disponibilidade e envio na conversa.' },
    ],
    fotos: [
      { src: '/img/loja/estoque-prateleiras.webp', src420: '/img/loja/estoque-prateleiras-420.webp', largura: 807, altura: 840, alt: 'Galpão de estoque da MK Autoparts com prateleiras de peças e caixas', legenda: 'Estoque em Lages – SC' },
      { src: '/img/loja/estoque-galpao.webp', src420: '/img/loja/estoque-galpao-420.webp', largura: 840, altura: 836, alt: 'Vista aberta do galpão da MK Autoparts, com paletes de peças embaladas', legenda: 'Pedidos separados no galpão' },
    ],
  },

  clientes: {
    titulo: 'Clientes MK Autoparts',
    texto: '[PLACEHOLDER: clientes atendidos — conteúdo do destaque "Clientes" do Instagram, somente com autorização e material fornecido pela MK Autoparts]',
    instagram: 'Ver no Instagram',
  },

  loja: {
    titulo: 'Visite a loja',
    enderecoTitulo: 'Endereço',
    horarioTitulo: 'Horário',
    contatoTitulo: 'Contato',
    comoChegar: 'Como chegar',
    ligar: 'Ligar',
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    mapaTitulo: 'Mapa da MK Autoparts em Lages – SC',
    fachadaAlt: 'Fachada do galpão da MK Autoparts na Av. Corina Caon, em Lages – SC',
  },

  rodape: {
    seloAlt: 'Selo MK Autoparts — peças e acessórios para caminhões',
    navegar: 'Navegar',
    contato: 'Contato',
    // PLACEHOLDER: CNPJ só aparece se o cliente autorizar.
    direitos: 'Mk Auto Parts LTDA',
  },

  catalogo: {
    titulo: 'Catálogo de peças',
    apoio: 'Busque pelo nome ou código e envie a lista de orçamento pelo WhatsApp.',
    buscaRotulo: 'Buscar por nome ou código',
    buscaPlaceholder: 'Ex.: farol Scania, S07-096, 1756751',
    buscaPlaceholderCurto: 'Ex.: farol Scania, S07-096',
    limparBusca: 'Limpar busca',
    resultados: (n: number) => `${n} ${n === 1 ? 'peça encontrada' : 'peças encontradas'}`,
    carregando: 'Aplicando filtros…',
    filtrar: 'Filtrar',
    filtros: 'Filtros',
    fecharFiltros: 'Fechar filtros',
    verResultados: (n: number) => `Ver ${n} ${n === 1 ? 'peça' : 'peças'}`,
    limparFiltros: 'Limpar filtros',
    categoria: 'Categoria',
    marcaVeiculo: 'Marca do veículo',
    todasMarcas: 'Todas as marcas',
    modelo: 'Modelo',
    todosModelos: 'Todos os modelos',
    escolhaMarca: 'Escolha a marca antes',
    marcaPeca: 'Marca da peça',
    somentePromocoes: 'Somente promoções',
    ordenar: 'Ordenar por',
    ordens: { relevancia: 'Relevância', nome: 'Nome', codigo: 'Código' },
    removerFiltro: (r: string) => `Remover filtro ${r}`,
    vazioTitulo: 'Nenhuma peça encontrada',
    vazioTexto: 'Confira o código ou limpe os filtros. Se não achar, chame no WhatsApp: o atendimento consulta o estoque para você.',
    vazioWhatsapp: 'Perguntar no WhatsApp',
    carregarMais: 'Mostrar mais peças',
    todasCategorias: 'Todas',
  },

  card: {
    aplicacao: 'Aplicação:',
    adicionar: 'Adicionar ao orçamento',
    adicionarCurto: 'Adicionar',
    adicionado: 'Adicionado',
    escolhaLado: 'Escolha o lado',
    promocao: 'Promoção',
    exemplo: '[EXEMPLO]',
    lados: 'LD / LE',
    cod: 'Cód.',
    semFoto: 'Foto em breve',
    fechar: 'Fechar',
  },

  lados: { LD: 'LD', LE: 'LE', Par: 'Par' },
  ladosLongos: { LD: 'Lado direito (LD)', LE: 'Lado esquerdo (LE)', Par: 'Par (LD + LE)' },

  produto: {
    catalogo: 'Catálogo',
    trilha: 'Caminho',
    codigo: 'Código MK',
    codigos: 'Códigos MK',
    originais: 'Códigos originais',
    marca: 'Marca',
    categoria: 'Categoria',
    lado: 'Lado',
    quantidade: 'Quantidade',
    menos: 'Diminuir quantidade',
    mais: 'Aumentar quantidade',
    solicitar: 'Solicitar orçamento pelo WhatsApp',
    aplicacoes: 'Aplicações',
    aplicacoesVazio: 'Aplicação a consultar com o atendimento.',
    colMarca: 'Marca do veículo',
    colModelo: 'Modelo',
    colAnos: 'Anos',
    relacionados: 'Da mesma categoria',
    precoPromocao: 'Preço de promoção',
    precoPorLado: 'por unidade',
    precoCadaLado: 'por unidade, cada lado',
    semPreco: 'Preço e disponibilidade no orçamento pelo WhatsApp.',
    naoEncontradoTitulo: 'Produto não encontrado',
    naoEncontradoTexto: 'Esta peça não está no catálogo online. Procure outra no catálogo ou chame no WhatsApp.',
    voltarCatalogo: 'Ir para o catálogo',
  },

  orcamento: {
    titulo: 'Lista de orçamento',
    fechar: 'Fechar lista',
    vazio: 'Sua lista está vazia. Adicione peças do catálogo para pedir o orçamento.',
    irCatalogo: 'Ver catálogo',
    itens: (itens: number, unidades: number) => `${itens} ${itens === 1 ? 'item' : 'itens'} · ${unidades} ${unidades === 1 ? 'unidade' : 'unidades'}`,
    remover: (nome: string) => `Remover ${nome} da lista`,
    observacao: 'Observação (opcional)',
    observacaoAjuda: 'Ex.: placa, modelo e ano do caminhão, cidade para envio.',
    // Texto final em PEND-003.
    aviso: 'Envie a lista pelo WhatsApp e receba o orçamento com preços e disponibilidade.',
    enviar: 'Enviar pelo WhatsApp',
    previa: 'Ver a mensagem que vai ser enviada',
    limpar: 'Limpar lista',
    confirmarLimpar: 'Limpar a lista?',
    sim: 'Sim, limpar',
    nao: 'Cancelar',
    removidos: 'Alguns itens saíram da lista porque não estão mais no catálogo.',
    precoUn: (preco: string) => `Promoção ${preco} un.`,
    adicionadoAviso: (nome: string) => `Adicionado: ${nome}`,
    verLista: 'Ver lista',
    caracteres: (n: number) => `${n}/500`,
  },

  painel: {
    titulo: 'Painel de métricas',
    selo: 'Demonstração — números fictícios',
    apoio: 'Base fictícia fixa somada às ações feitas neste navegador durante a apresentação.',
    filtro: 'Vendedor',
    todos: 'Todos',
    direto: 'Direto',
    visitas: 'Visitas',
    cliques: 'Cliques em produtos',
    adicionados: 'Itens adicionados',
    finalizados: 'Carrinhos finalizados',
    naoFinalizados: 'Carrinhos não finalizados',
    taxaFinalizacao: 'Taxa de finalização',
    maisClicados: 'Produtos mais clicados',
    menosClicados: 'Produtos menos clicados',
    cliquesAdicionados: 'Cliques × adicionados',
    taxa: 'Taxa',
    carrinhos: 'Carrinhos',
    porVendedor: 'Por vendedor',
    funil: 'Funil',
    funilEtapas: ['Visitas', 'Cliques em produto', 'Carrinhos criados', 'Finalizados'],
    linksTeste: 'Links de teste dos vendedores',
    zerar: 'Zerar dados da demonstração',
    zerarConfirmar: 'Apagar eventos, carrinhos e vendedor gravados neste navegador? A base fictícia continua.',
    zerado: 'Dados da demonstração apagados.',
    carregando: 'Calculando…',
    copiar: 'Copiar link',
    copiado: 'Copiado',
  },

  naoEncontrado: {
    titulo: 'Página não encontrada',
    texto: 'O endereço não existe ou mudou. Volte ao início ou procure a peça no catálogo.',
    inicio: 'Ir para o início',
    catalogo: 'Ver catálogo',
  },
};

/* ---------- SEO por rota (o <head> é montado só no index.html e no prerender) ---------- */

export const seo = {
  landing: {
    titulo: 'MK Autoparts | Peças e acessórios para caminhões em Lages – SC',
    descricao: 'Catálogo online da MK Autoparts: faróis, lanternas, retrovisores e peças para Scania, Volvo, Mercedes-Benz e mais. Loja em Lages – SC, envio para todo o Brasil.',
  },
  catalogo: {
    titulo: 'Catálogo de peças para caminhões | MK Autoparts',
    descricao: 'Busque peças para caminhão por nome, código ou marca do veículo e envie a lista de orçamento pelo WhatsApp da MK Autoparts, em Lages – SC.',
  },
  painel: { titulo: 'Painel de métricas (demonstração) | MK Autoparts', descricao: 'Painel de demonstração com números fictícios.' },
  admin: { titulo: 'Admin (demonstração) | MK Autoparts', descricao: 'Painel administrativo de demonstração da MK Autoparts.' },
  naoEncontrado: { titulo: 'Página não encontrada | MK Autoparts', descricao: 'A página procurada não existe no site da MK Autoparts.' },
};
