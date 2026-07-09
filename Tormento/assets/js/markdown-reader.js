// ============================================================
// TORMENTO — Leitor genérico de Markdown
// Lê o manifesto da página (definido em manifest.js, carregado
// ANTES deste script) e renderiza: navegação de categorias no
// topo, lista vertical de entradas, e o conteúdo de cada nota
// (.md) sob demanda — convertido pra HTML com marked.js.
//
// Espera encontrar `window.READER_MANIFEST`, no formato:
// [
//   { id:'glossario', label:'Glossário', items:[{title, path}] },
//   { id:'talentos', label:'Talentos', groups:[
//       { title:'Companheiros', items:[{title, path}] }
//   ]}
// ]
// ============================================================

(function(){
  const cache = {}; // path -> html já renderizado (evita refetch)

  function slugify(str){
    return str.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9]+/g,'-')
      .replace(/(^-|-$)/g,'');
  }

  function flatItems(cat){
    return cat.items || (cat.groups || []).flatMap(g => g.items);
  }

  function findEntryByTitle(title){
    for(const cat of window.READER_MANIFEST){
      for(const it of flatItems(cat)){
        if(it.title.toLowerCase() === title.toLowerCase()){
          return { categoryId: cat.id, slug: slugify(it.title) };
        }
      }
    }
    return null;
  }

  // Converte [[Nome]] ou [[Nome|Rótulo]] (sintaxe do Obsidian) num
  // link interno se a nota existir no manifesto; senão só limpa os colchetes.
  function resolveWikilinks(raw){
    return raw.replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (m, target, _p, label) => {
      const text = (label || target).trim();
      const found = findEntryByTitle(target.trim());
      return found ? `[${text}](#${found.categoryId}/${found.slug})` : text;
    });
  }

  async function fetchMarkdown(path){
    if(cache[path]) return cache[path];
    const res = await fetch(encodeURI(path));
    if(!res.ok) throw new Error('Não encontrado: ' + path);
    const raw = await res.text();
    const html = marked.parse(resolveWikilinks(raw));
    cache[path] = html;
    return html;
  }

  function buildNav(){
    const nav = document.getElementById('categoryNav');
    nav.innerHTML = '';
    window.READER_MANIFEST.forEach(cat => {
      const a = document.createElement('a');
      a.href = '#' + cat.id;
      a.className = 'reader-tab';
      a.textContent = cat.label;
      a.addEventListener('click', () => setActiveTab(cat.id));
      nav.appendChild(a);
    });
  }

  function setActiveTab(id){
    document.querySelectorAll('.reader-tab').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + id);
    });
  }

  function entryRow(item, categoryId){
    const slug = slugify(item.title);
    const wrap = document.createElement('div');
    wrap.className = 'reader-entry';
    wrap.id = categoryId + '/' + slug;
    wrap.innerHTML = `
      <button class="reader-entry-head" type="button" aria-expanded="false">
        <span>${item.title}</span>
        <span class="reader-entry-arrow">▸</span>
      </button>
      <div class="reader-entry-body"><div class="reader-entry-content"></div></div>
    `;
    const head = wrap.querySelector('.reader-entry-head');
    const content = wrap.querySelector('.reader-entry-content');

    head.addEventListener('click', async () => {
      const isOpen = wrap.classList.contains('open');
      if(isOpen){
        wrap.classList.remove('open');
        head.setAttribute('aria-expanded','false');
        return;
      }
      if(!content.dataset.loaded){
        content.innerHTML = '<p class="reader-loading">carregando…</p>';
        try{
          content.innerHTML = await fetchMarkdown(item.path);
          content.dataset.loaded = '1';
        }catch(e){
          content.innerHTML = '<p class="reader-error">Não foi possível carregar este texto. Verifique o caminho no manifesto: ' + item.path + '</p>';
        }
      }
      wrap.classList.add('open');
      head.setAttribute('aria-expanded','true');
    });

    return wrap;
  }

  function buildList(){
    const root = document.getElementById('entryList');
    root.innerHTML = '';
    window.READER_MANIFEST.forEach(cat => {
      const section = document.createElement('section');
      section.className = 'reader-category';
      section.id = cat.id;
      section.innerHTML = `<h2 class="reader-category-title">${cat.label}</h2>`;

      if(cat.items){
        cat.items.forEach(item => section.appendChild(entryRow(item, cat.id)));
      }
      if(cat.groups){
        cat.groups.forEach(group => {
          const gTitle = document.createElement('h3');
          gTitle.className = 'reader-group-title';
          gTitle.textContent = group.title;
          section.appendChild(gTitle);
          group.items.forEach(item => section.appendChild(entryRow(item, cat.id)));
        });
      }
      root.appendChild(section);
    });
  }

  function openFromHash(){
    const hash = decodeURIComponent(location.hash.replace('#',''));
    if(!hash) return;
    const direct = document.getElementById(hash);
    const el = direct || document.getElementById(hash.split('/')[0]);
    if(!el) return;
    el.scrollIntoView({behavior:'smooth', block:'start'});
    if(el.classList.contains('reader-entry') && !el.classList.contains('open')){
      el.querySelector('.reader-entry-head').click();
    }
    if(el.classList.contains('reader-category')) setActiveTab(el.id);
  }

  document.addEventListener('DOMContentLoaded', () => {
    if(!window.READER_MANIFEST){
      console.error('markdown-reader.js: defina window.READER_MANIFEST (manifest.js) antes de carregar este script.');
      return;
    }
    if(typeof marked === 'undefined'){
      console.error('markdown-reader.js: biblioteca marked.js não encontrada. Confira o <script> do CDN no HTML.');
      return;
    }
    buildNav();
    buildList();
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
  });
})();