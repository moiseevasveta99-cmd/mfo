
document.querySelector('[data-menu-toggle]')?.addEventListener('click',()=>document.querySelector('[data-nav]')?.classList.toggle('open'));
const controls=document.querySelector('[data-controls]');
if(controls){
  const form=document.querySelector('[data-filter-form]');
  const amount=form?.querySelector('[name="amount"]');
  const term=form?.querySelector('[name="term"]');
  const amountOutput=form?.querySelector('[data-amount-output]');
  const termOutput=form?.querySelector('[data-term-output]');
  const filterPanel=document.querySelector('[data-filter-panel]');
  const filterTriggers=[...document.querySelectorAll('[data-filter-trigger]')];
  const showButtons=[...document.querySelectorAll('[data-show-offers]')];
  const grid=document.querySelector('[data-loan-grid]');
  const buttons=[...controls.querySelectorAll('[data-filter]')];
  const sort=controls.querySelector('[data-sort]');
  const mainCards=grid?[...grid.children]:[];
  const originalCards=[...mainCards];
  const count=document.querySelector('[data-result-count]');
  const topCards=[...document.querySelectorAll('[data-top-card]')];
  const rows=[...document.querySelectorAll('[data-comparison-row]')];
  const topTitle=document.querySelector('[data-top-title]');
  const topCaption=document.querySelector('[data-top-caption]');
  const empty=document.querySelector('[data-filter-empty]');
  const filterCounts=[...document.querySelectorAll('[data-filter-count]')];
  const showCounts=[...document.querySelectorAll('[data-show-count]')];
  let inputsActive=false;
  const activeByGroup=()=>buttons.filter(button=>button.classList.contains('active')).reduce((groups,button)=>{(groups[button.dataset.filterGroup]??=[]).push(button.dataset.filter);return groups;},{});
  const matches=(item,groups)=>{
    const filtersMatch=Object.values(groups).every(filters=>filters.some(filter=>item.dataset[filter]==='1'));
    if(!filtersMatch||!inputsActive)return filtersMatch;
    return Number(item.dataset.maxAmount||0)>=Number(amount?.value||0)&&Number(item.dataset.maxTerm||0)>=Number(term?.value||0);
  };
  const amountOf=(card)=>Number((card.textContent.match(/\d[\d\s]*(?=\s*₽)/)||['0'])[0].replace(/\s/g,''));
  const updateOutputs=()=>{
    if(amountOutput)amountOutput.textContent=new Intl.NumberFormat('ru-RU').format(amount.value)+' ₽';
    if(termOutput)termOutput.textContent=term.value+' дней';
  };
  const apply=()=>{
    const groups=activeByGroup();
    let visible=0;
    mainCards.forEach(card=>{const show=matches(card,groups);card.classList.toggle('hidden',!show);if(show)visible++;});
    rows.forEach(row=>row.classList.toggle('hidden',!matches(row,groups)));
    let shownTop=0;
    topCards.forEach(card=>{const show=matches(card,groups)&&shownTop<3;card.classList.toggle('hidden',!show);if(show)shownTop++;});
    if(count)count.textContent='Найдено предложений: '+visible;
    showCounts.forEach(node=>node.textContent=visible);
    if(empty)empty.hidden=visible!==0;
    const labels=buttons.filter(button=>button.classList.contains('active')).map(button=>button.textContent.trim().toLowerCase());
    filterCounts.forEach(node=>node.textContent=labels.length?'· '+labels.length:'');
    if(topTitle)topTitle.textContent=labels.length?'Топ МФО: '+labels.join(' · '):'Топ МФО по условиям';
    if(topCaption)topCaption.textContent=labels.length?'Подборка меняется вместе с выбранными условиями.':'Выберите фильтр, чтобы увидеть предложения по нужной категории.';
    const order=sort?.value==='brand'?[...mainCards].sort((a,b)=>a.dataset.brand.localeCompare(b.dataset.brand,'ru')):sort?.value==='amount'?[...mainCards].sort((a,b)=>amountOf(b)-amountOf(a)):originalCards;
    order.forEach(card=>grid?.appendChild(card));
  };
  updateOutputs();
  amount?.addEventListener('input',()=>{inputsActive=true;updateOutputs();apply();});
  term?.addEventListener('input',()=>{inputsActive=true;updateOutputs();apply();});
  filterTriggers.forEach(trigger=>trigger.addEventListener('click',()=>{const willOpen=filterPanel?.hidden; if(filterPanel)filterPanel.hidden=!willOpen; trigger.setAttribute('aria-expanded',String(Boolean(willOpen)));}));
  showButtons.forEach(button=>button.addEventListener('click',()=>{inputsActive=true;apply();}));
  buttons.forEach(button=>button.addEventListener('click',()=>{button.classList.toggle('active');apply();}));
  controls.querySelector('[data-reset-filters]')?.addEventListener('click',()=>{buttons.forEach(button=>button.classList.remove('active'));if(sort)sort.value='default';apply();});
  sort?.addEventListener('change',apply);
  apply();
}
