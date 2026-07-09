// ============================================================
// TORMENTO — Manifesto dos Apêndices
// Cada item aqui vira uma entrada clicável na página. `path` é
// relativo a este arquivo (ou seja, relativo à pasta apendices/).
//
// ATENÇÃO: os nomes de pasta abaixo (Talentos, Gerais, Grupos,
// Raciais, Itens, Veículos, Magia) foram limpos de qualquer 📂
// ou espaço extra que aparecia na árvore original — se a pasta
// real do seu vault tiver nome diferente, é só ajustar o `path`
// da entrada correspondente.
//
// Pra adicionar uma nota nova: copie uma linha, troque title/path.
// ============================================================

window.READER_MANIFEST = [
  {
    id: 'glossario',
    label: 'Glossário',
    items: [
      { title: 'Glossário', path: '02.00 Glossário.md' },
    ]
  },
  {
    id: 'arquetipos',
    label: 'Arquétipos',
    items: [
      { title: 'Arquétipos', path: '02.01 Arquétipos.md' },
    ]
  },
  {
    id: 'passados',
    label: 'Passados',
    items: [
      { title: 'Passados', path: '02.02 Passados.md' },
    ]
  },
  {
    id: 'racas',
    label: 'Raças',
    items: [
      { title: 'Raças', path: '02.03 Raças.md' },
    ]
  },
  {
    id: 'contratos',
    label: 'Contratos',
    items: [
      { title: 'Contratos', path: '02.04 Contratos.md' },
    ]
  },
  {
    id: 'tabelas',
    label: 'Tabelas',
    items: [
      { title: 'Tabelas (Penalidades, Opressão, etc.)', path: '02.05 Tabelas (Penalidades, Opressão, etc.).md' },
    ]
  },
  {
    id: 'talentos',
    label: 'Talentos',
    groups: [
      {
        title: 'Companheiros',
        items: [
          { title: 'Aves', path: '02.99 Talentos/Companheiros/Aves.md' },
          { title: 'Briguentos', path: '02.99 Talentos/Companheiros/Briguentos.md' },
          { title: 'Constructos', path: '02.99 Talentos/Companheiros/Constructos.md' },
          { title: 'Enxame', path: '02.99 Talentos/Companheiros/Enxame.md' },
          { title: 'Esguios', path: '02.99 Talentos/Companheiros/Esguios.md' },
        ]
      },
      {
        title: 'Gerais',
        items: [
          { title: 'Agente Social', path: '02.99 Talentos/Gerais/Agente Social.md' },
          { title: 'Atirador de Precisão', path: '02.99 Talentos/Gerais/Atirador de Precisão.md' },
          { title: 'Caule mágico', path: '02.99 Talentos/Gerais/Caule mágico.md' },
          { title: 'Caçador de Monstros', path: '02.99 Talentos/Gerais/Caçador de Monstros.md' },
          { title: 'Comandante de Campo', path: '02.99 Talentos/Gerais/Comandante de Campo.md' },
          { title: 'Detetive de Campo', path: '02.99 Talentos/Gerais/Detetive de Campo.md' },
          { title: 'Domador', path: '02.99 Talentos/Gerais/Domador.md' },
          { title: 'Fabricador', path: '02.99 Talentos/Gerais/Fabricador.md' },
          { title: 'Front de Choque', path: '02.99 Talentos/Gerais/Front de Choque.md' },
          { title: 'Infiltrador', path: '02.99 Talentos/Gerais/Infiltrador.md' },
          { title: 'Médico de Campo', path: '02.99 Talentos/Gerais/Médico de Campo.md' },
          { title: 'Sobrevivencialista', path: '02.99 Talentos/Gerais/Sobrevivencialista.md' },
        ]
      },
      {
        title: 'Grupos',
        items: [
          { title: 'Colégio dos Cirurgiões de Trincheira', path: '02.99 Talentos/Grupos/Colégio dos Cirurgiões de Trincheira.md' },
          { title: 'Consórcio Cogwright (Corporação a Vapor)', path: '02.99 Talentos/Grupos/Consórcio Cogwright (Corporação a Vapor).md' },
          { title: 'Irmandade dos Rastros (Guia Feral)', path: '02.99 Talentos/Grupos/Irmandade dos Rastros (Guia Feral).md' },
          { title: 'Ordem do Crisol de Prata (Igreja Militante)', path: '02.99 Talentos/Grupos/Ordem do Crisol de Prata (Igreja Militante).md' },
          { title: 'Os Fios Cinzentos (Sociedade Oculta)', path: '02.99 Talentos/Grupos/Os Fios Cinzentos (Sociedade Oculta).md' },
          { title: 'Sindicato dos Cravos (Submundo Urbano)', path: '02.99 Talentos/Grupos/Sindicato dos Cravos (Submundo Urbano).md' },
        ]
      },
      {
        title: 'Raciais',
        items: [
          { title: 'Ghouls', path: '02.99 Talentos/Raciais/Ghouls.md' },
          { title: 'Humanos', path: '02.99 Talentos/Raciais/Humanos.md' },
          { title: 'Lobisomens', path: '02.99 Talentos/Raciais/Lobisomens.md' },
          { title: 'Sereias', path: '02.99 Talentos/Raciais/Sereias.md' },
          { title: 'Trópagos', path: '02.99 Talentos/Raciais/Trópagos.md' },
          { title: 'Vampiros', path: '02.99 Talentos/Raciais/Vampiros.md' },
        ]
      },
    ]
  },
  {
    id: 'itens',
    label: 'Itens',
    groups: [
      {
        title: 'Catálogo',
        items: [
          { title: 'Assinaturas desgraçadas e tags', path: 'Itens/00. Assinaturas desgraçadas e tags.md' },
          { title: 'Geral', path: 'Itens/01. Geral.md' },
          { title: 'Armamento', path: 'Itens/02. Armamento.md' },
          { title: 'Armaduras e Escudos', path: 'Itens/02.1 Armaduras e Escudos.md' },
          { title: 'Adornos', path: 'Itens/02.2 Adornos.md' },
          { title: 'Melhorias', path: 'Itens/03. Melhorias.md' },
          { title: 'Consumíveis e mantimentos', path: 'Itens/04. Consumiveis e mantimentos.md' },
          { title: 'Ingredientes e ferramentas', path: 'Itens/05. Ingredientes e ferramentas.md' },
          { title: 'Animais', path: 'Itens/06. Animais.md' },
          { title: 'Mods de Armas', path: 'Itens/98. Mods Armas.md' },
          { title: 'Mods de Armaduras e Escudos', path: 'Itens/99. Mods Armaduras e Escudos.md' },
        ]
      },
      {
        title: 'Veículos',
        items: [
          { title: 'Animais', path: 'Itens/Veículos/Animais.md' },
          { title: 'Bases Móveis', path: 'Itens/Veículos/Bases Movéis.md' },
          { title: 'Maquinários Comuns', path: 'Itens/Veículos/Maquinários Comuns.md' },
        ]
      },
    ]
  },
  {
    id: 'magia',
    label: 'Magia',
    items: [
      { title: 'Círculo 0', path: 'Magia/Círculo 0.md' },
      { title: 'Círculo 1', path: 'Magia/Círculo 1.md' },
      { title: 'Círculo 2', path: 'Magia/Círculo 2.md' },
      { title: 'Círculo 3', path: 'Magia/Círculo 3.md' },
      { title: 'Círculo 4', path: 'Magia/Círculo 4.md' },
      { title: 'Círculo 5', path: 'Magia/Círculo 5.md' },
      { title: 'Círculo 6', path: 'Magia/Círculo 6.md' },
      { title: 'Círculo 7', path: 'Magia/Círculo 7.md' },
    ]
  },
];