(function(){
  const $ = (s,el=document)=>el.querySelector(s);
  const $$ = (s,el=document)=>Array.from(el.querySelectorAll(s));
  const EL = { grid:$('#grid'), empty:$('#empty'), filters:$('#filters')};

  // Known favorite stores (keys) — labels unified to DotASCII
  const KNOWN = [
    {key:'emo.favs.v1',      label:'Kaomoji',       href:'./kaomoji.html'},
    {key:'line.favs.v1',     label:'Line',          href:'./line.html'},
    {key:'replace.favs.v1',  label:'Text Replace',  href:'./replace.html'},
    {key:'emoji.favs.v1',    label:'Emoji',         href:'./emoji.html'},
    {key:'dot.favs.v1',      label:'DotASCII',      href:'./dotart.html'},
    {key:'ascii.favs.v1',    label:'DotASCII',      href:'./dotart.html'}
  ];

  function detectStores(){
    const stores = new Map(KNOWN.map(o=>[o.key,o]));
    try{
      for(let i=0;i<localStorage.length;i++){
        const k = localStorage.key(i);
        if(!/\.favs\.v1$/.test(k)) continue;
        if(!stores.has(k)){
          const label = k.replace(/\..*$/, '').replace(/\b\w/g,c=>c.toUpperCase());
          stores.set(k,{key:k,label,href:'#'});
        }
      }
    }catch(e){/* ignore */}
    return Array.from(stores.values());
  }

  function loadFavsByKey(key){
    try{
      const raw = JSON.parse(localStorage.getItem(key) || '[]');
      // Support both string and object entries
      const toText = (v)=> (v==null) ? '' :
        (typeof v === 'string' ? v :
        (typeof v.t === 'string' ? v.t :
        (typeof v.text === 'string' ? v.text :
        (typeof v.value === 'string' ? v.value : String(v)))));
      return raw.map(toText).filter(Boolean);
    }catch(e){ return []; }
  }

  function aggregate(){
    const stores = detectStores();
    const map = new Map(); // text -> {text, sources:Set<label>}
    for(const st of stores){
      const arr = loadFavsByKey(st.key);
      for(const t of arr){
        if(!map.has(t)) map.set(t,{text:t, sources:new Set()});
        map.get(t).sources.add(st.label);
      }
    }
    const items = Array.from(map.values()).map(o=>({text:o.text, sources:Array.from(o.sources).sort()}));
    items.sort((a,b)=> a.text.localeCompare(b.text));
    return { items, stores };
  }

  async function copy(text){
    try{ await navigator.clipboard.writeText(text); }catch(e){}
    showToast('Copied!');
  }
  function showToast(msg){
    const t = document.getElementById('toast'); if(!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(showToast._t); showToast._t = setTimeout(()=>t.classList.remove('show'), 1000);
  }

  function removeFromAll(text){
    const stores = detectStores();
    for(const st of stores){
      try{
        const arr = loadFavsByKey(st.key);
        const idx = arr.indexOf(text);
        if(idx >= 0){
          arr.splice(idx,1);
          localStorage.setItem(st.key, JSON.stringify(arr));
        }
      }catch(e){/* ignore */}
    }
  }

  function makeCard(it){
    const card = document.createElement('button'); card.type='button'; card.className='card'; card.title='Click to copy';
    // Detect DotASCII to tweak styles
    const isDot = (it.sources||[]).includes('DotASCII');
    if(isDot) card.classList.add('is-dot');

    const text = document.createElement('div'); text.className='t';
    text.textContent = it.text;

    // For DotASCII, use monospace & preserve whitespace
    if(isDot){
      text.classList.add('t-dot');
    }

    const star = document.createElement('button'); star.type='button'; star.className='star'; star.textContent='★'; star.title='Remove from all favorites';
    const badges = document.createElement('div'); badges.className='badges';
    it.sources.forEach(s=>{ const b=document.createElement('span'); b.className='badge'; b.textContent=s; badges.appendChild(b); });

    card.append(star,text,badges);
    card.addEventListener('click',()=>copy(it.text));
    star.addEventListener('click',(e)=>{ e.stopPropagation(); removeFromAll(it.text); render(); });
    return card;
  }


  EL.filters?.addEventListener('click',(e)=>{
    const b = e.target.closest('.chip'); if(!b) return;
    $$('#filters .chip').forEach(x=>x.classList.toggle('is-active', x===b));
    $$('#filters .chip').forEach(x=>x.setAttribute('aria-pressed', String(x===b)));
    render();
  });
  EL.search?.addEventListener('input', render);

  window.addEventListener('DOMContentLoaded', render);
  window.addEventListener('storage', render); // cross-tab sync





  
})();