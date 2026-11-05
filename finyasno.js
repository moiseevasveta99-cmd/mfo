// Local catalogue behavior; source layout and source component scripts are retained.
document.addEventListener('DOMContentLoaded',()=>{
 const header=document.querySelector('.header-nav');
 const searchIcon=document.querySelector('header .icon-search');
 if(header&&searchIcon){
   const panel=document.createElement('form');panel.className='fin-header-search';panel.hidden=true;panel.setAttribute('role','search');
   const input=document.createElement('input');input.type='search';input.placeholder='Поиск МФО';input.setAttribute('aria-label','Поиск МФО');
   const submit=document.createElement('button');submit.type='submit';submit.textContent='Найти';
   const close=document.createElement('button');close.type='button';close.textContent='Закрыть';
   panel.append(input,submit,close);header.append(panel);
   searchIcon.setAttribute('role','button');searchIcon.setAttribute('aria-label','Открыть поиск');
   const open=()=>{panel.hidden=false;input.focus()};
   searchIcon.addEventListener('click',open);searchIcon.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});
   close.addEventListener('click',()=>{panel.hidden=true;searchIcon.focus()});
   panel.addEventListener('keydown',e=>{if(e.key==='Escape'){panel.hidden=true;searchIcon.focus()}});
   panel.addEventListener('submit',e=>{
     e.preventDefault();const query=input.value.trim().toLocaleLowerCase('ru');
     const matches=[...document.querySelectorAll('.card-minimal')].filter(c=>{
       const match=c.querySelector('.bank-name')?.textContent.toLocaleLowerCase('ru').includes(query);
       c.hidden=!match;c.style.display=match?'':'none';return match;
     });
     document.querySelectorAll('.lth-panel-count-m,.search-btn-count').forEach(el=>el.textContent=matches.length);
     if(matches.length){panel.hidden=true;matches[0].scrollIntoView({behavior:'smooth',block:'center'})}
     else{input.setCustomValidity('МФО с таким названием не найдена');input.reportValidity()}
   });
   input.addEventListener('input',()=>input.setCustomValidity(''));
 }
 const cards=[...document.querySelectorAll('.card-minimal:not(.fin-archive)')];
 const lists=[...new Set(cards.map(c=>c.parentElement))];
 const number=s=>Number((s||'').replace(/[^0-9.]/g,''));
 const value=(card,title)=>title==='Сумма'&&card.dataset.maxAmount?card.dataset.maxAmount:[...card.querySelectorAll('.card-min-info-el')].find(e=>e.querySelector('.card-min-label-title')?.textContent.trim()===title)?.querySelector('.card-min-label')?.textContent.trim()||'';
 const apply=()=>{
   const amount=number(document.querySelector('.inputQuizNum')?.value);
   const days=number(document.querySelector('.inputQuizDays')?.value);
   let count=0;
   const selected=[...document.querySelectorAll('.loan-tag-hero input[data-option]:checked')].map(e=>e.dataset.option);
   const aliases={'card':'Банковская карта','nal':'Наличными','yandex-money':'ЮМани','pasport':'паспорт','bez-procentov':'Без процентов','history':'С плохой КИ'};
   cards.forEach(c=>{let match=number(value(c,'Сумма'))>=amount&&number(value(c,'Срок'))>=days;selected.forEach(key=>{const input=document.querySelector(`[data-option="${key}"]`);const label=document.querySelector(`label[for="${input.id}"]`);const term=aliases[key]||label?.textContent.trim();if(term&&!c.textContent.toLowerCase().includes(term.toLowerCase()))match=false});c.hidden=!match;c.style.display=match?'':'none';if(match)count++});
   document.querySelectorAll('.lth-panel-count-m,.search-btn-count').forEach(e=>e.textContent=count);
   document.querySelector('#all-offers-title')?.scrollIntoView({behavior:'smooth',block:'start'});
 };
 document.addEventListener('click',e=>{
   if(e.target.closest('.sorting-wrap button')){e.preventDefault();e.stopImmediatePropagation();document.querySelector('.sorting-wrap .select-inputs')?.classList.remove('active');return;}
   const btn=e.target.closest('.loan-tag-hero .search-btn');
   if(btn){e.preventDefault();e.stopImmediatePropagation();apply();}
 },true);
 document.querySelectorAll('form').forEach(f=>f.addEventListener('submit',e=>{if(f.closest('.loan-tag-hero')){e.preventDefault();apply()}}));
 // Source sort controls use server requests; replace those requests with local sorting.
 document.querySelectorAll('.sorting-wrap li').forEach((el,i)=>el.addEventListener('click',e=>{
   e.preventDefault();e.stopImmediatePropagation();
   document.querySelectorAll('.sorting-wrap li').forEach(x=>x.classList.toggle('r-active',x===el));
   document.querySelectorAll('.select-inputs-status').forEach(x=>x.textContent=el.textContent.trim());
   if(innerWidth>767)document.querySelector('.sorting-wrap .select-inputs')?.classList.remove('active');
   lists.forEach(list=>[...list.querySelectorAll(':scope > .card-minimal')].sort((a,b)=>i===2?number(value(b,'Сумма'))-number(value(a,'Сумма')):i===1?number(value(a,'Ставка'))-number(value(b,'Ставка')):cards.indexOf(a)-cards.indexOf(b)).forEach(c=>list.append(c)));
 },true));
});
