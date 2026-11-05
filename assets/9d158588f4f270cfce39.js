function initDragScroll(scrollableContainer, scrollableContainerItems){
    const container = scrollableContainer;
    const containerItems = scrollableContainerItems;

    if(!container || containerItems.length === 0) {
        console.log('Error init drag-scroll.')
        return;
    }

    let startY;
    let startX;
    let scrollLeft;
    let scrollTop;
    let isDown;
    let isMoving;

    containerItems.forEach(containerItem => {
        // for scroll in firefox
        containerItem.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });

        containerItem.addEventListener('click', (e) => {
            if(isMoving){
                e.preventDefault();
            }
        });
    })

    container.addEventListener('mousedown',e => mouseIsDown(e));
    container.addEventListener('mouseup',e => mouseUp(e))
    container.addEventListener('mouseleave',e=>mouseLeave(e));
    container.addEventListener('mousemove',e=>mouseMove(e));


    function mouseIsDown(e){
        isDown = true;
        startY = e.pageY - container.offsetTop;
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
        scrollTop = container.scrollTop;
    }
    function mouseUp(e){
        isDown = false;
        setTimeout(()=>{
            isMoving = false;
        }, 100);
    }
    function mouseLeave(e){
        isDown = false;
        isMoving = false;
    }
    function mouseMove(e){
        if(isDown){
            isMoving = true;
            e.preventDefault();
            //Move vertcally
            const y = e.pageY - container.offsetTop;
            const walkY = y - startY;
            container.scrollTop = scrollTop - walkY;

            //Move Horizontally
            const x = e.pageX - container.offsetLeft;
            const walkX = x - startX;
            container.scrollLeft = scrollLeft - walkX;
        }
    }
}(function() {
   let button = $$('.menu-organisation.no-scroll-for-mobile');

   if (button.length > 0) {
       button[0].addEventListener('click', (event) => {
           let menu = $$('.menu-organisation ul');
           if (menu.length > 0) {
               menu[0].classList.toggle('opened');
           }
       });
   }

    let orgMenuBankProducts = $$('.org-menu-bank-products');
    if(orgMenuBankProducts.length != 0) {
        orgMenuBankProducts = orgMenuBankProducts[0];

        orgMenuBankProducts.addEventListener('click',function (e){
            orgMenuBankProducts.classList.toggle('opened');
        })

        document.addEventListener( 'click', (e) => {
            if(!e.target.closest('.org-menu-bank-products')){
                orgMenuBankProducts.classList.remove('opened');
            }
        })
    }
})();
// vzo t3 (20260720): клэмп в 1 ряд + «Ещё +N».
// Отличия от старой версии: гарды на отсутствие .tags-list/.tag-all (JS не падает на страницах
// без модуля), поддержка нескольких .tags-list на странице (hero .lth-related + .tags-list-wrap),
// пересчёт после document.fonts.ready и на resize — старый расчёт на window.load до раскладки
// шрифтов показывал «+0»/прятал теги, из-за чего клэмп в 20260718 временно заменяли на show-all.
function initTagsListMore(list) {
    const allBtn = list.querySelector('.tag-all');
    if (!allBtn) return;
    if (list.dataset.tagsExpanded === '1') return;

    // сброс к исходному состоянию перед пересчётом
    allBtn.style.display = '';
    allBtn.style.visibility = 'hidden';
    list.appendChild(allBtn);

    if (window.innerWidth < 993 || list.offsetHeight >= list.scrollHeight) {
        allBtn.style.display = 'none';
        return;
    }

    const chips = list.querySelectorAll('.btn');
    if (!chips.length) {
        allBtn.style.display = 'none';
        return;
    }

    const firstTop = chips[0].getBoundingClientRect().top;
    let lastShowed = chips[0];
    chips.forEach((chip) => {
        if (chip.getBoundingClientRect().top === firstTop) lastShowed = chip;
    });

    allBtn.style.visibility = 'inherit';
    list.insertBefore(allBtn, lastShowed);

    // если кнопка уместилась в первый ряд — вернуть её сразу после последнего видимого тега
    if (lastShowed.getBoundingClientRect().top === firstTop) {
        list.insertBefore(allBtn, lastShowed.nextElementSibling);
    }

    let hidden = 0;
    let afterAllButton = false;
    for (const item of list.children) {
        if (item === allBtn) {
            afterAllButton = true;
            continue;
        }
        if (afterAllButton) hidden++;
    }

    const counter = allBtn.querySelector('span');
    if (counter) counter.innerHTML = hidden;
    if (!hidden) allBtn.style.display = 'none';
}

function initAllTagsLists() {
    document.querySelectorAll('.tags-list').forEach(initTagsListMore);
}

window.addEventListener('load', () => {
    document.querySelectorAll('.tags-list').forEach((list) => {
        const allBtn = list.querySelector('.tag-all');
        if (!allBtn) return;
        allBtn.addEventListener('click', () => {
            list.dataset.tagsExpanded = '1';
            allBtn.style.display = 'none';
            list.style.maxHeight = 'inherit';
        });
    });

    initAllTagsLists();

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(initAllTagsLists);
    }

    let resizeTimeout = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(initAllTagsLists, 300);
    });
});
function initQuiz() {
    document.addEventListener('DOMContentLoaded', setQuizRangeValues);

    let quizBlock = document.querySelector('.quiz');
    let inputQuizNum, inputQuizRangeSum, inputQuizDays, inputQuizRangeDays, searchButton, loadSearchButton;

    let resetButtonShowing = false;
    let multiselectCounterInit = false;

    let defaultQuizNum = null;
    let defaultQuizDays = null;

    if (quizBlock) {
        inputQuizNum = quizBlock.querySelector('.inputQuizNum');
        inputQuizRangeSum = quizBlock.querySelector('.inputQuizRangeSum');
        inputQuizDays = quizBlock.querySelector('.inputQuizDays');
        inputQuizRangeDays = quizBlock.querySelector('.inputQuizRangeDays');

        searchButton = quizBlock.querySelector('button.search-btn');
        loadSearchButton = quizBlock.querySelector('div.search-btn');
    }

    if (inputQuizNum) {
        defaultQuizNum = inputQuizNum.value;

        formattedNumberInputAction(inputQuizNum);
        initQuizInput(inputQuizNum);

        inputQuizNum.addEventListener('change',function(){
            setQuizInputRangeValue(inputQuizNum);
            updateFilters(0, 'quizRangeSum', inputQuizNum.value);
        });

        if (inputQuizRangeSum) {
            inputQuizRangeSum.addEventListener('change',function(){
                updateFilters(0, 'quizRangeSum', inputQuizRangeSum.value);
            });
        }
    }

    if (inputQuizDays) {
        defaultQuizDays = inputQuizDays.value;

        formattedNumberInputAction(inputQuizDays);
        initQuizInput(inputQuizDays);
        inputQuizDays.addEventListener('change',function(){
            setQuizInputRangeValue(inputQuizDays);
            // на страницах без range-инпута (листинги/теги) inputQuizRangeDays отсутствует —
            // без гварда change падал и счётчик не реагировал на смену срока
            updateFilters(0, 'quizRangePeriod', inputQuizRangeDays ? inputQuizRangeDays.value : parseInputNumber(inputQuizDays.value));
        });
        // inputQuizRangeDays.addEventListener('change',function(){
        //     updateFilters(0, 'quizRangePeriod', inputQuizRangeDays.value);
        // });
    }

    if (quizBlock) {
        initSelect();
        initQuickFilters();
        initAllFiltersShowing();
        initShowingSelect();
        initMultiselect();
        initResetButton();
        initSearchButton();
        initCurrencySelect();
    }

    let filtersWithFoundData = JSON.parse(JSON.stringify(setFilters));

    let lastFoundData = null;

    function updateFilters(filterId, type, value) {

        showResetButton();

        if (!setFilters[type] && type != 'quizRangeSum' && type != 'quizRangePeriod') {
            setFilters['otherFiltersNames'].push(type);
            setFilters[type] = {};
        }

        if (type == 'quizRangeSum' || type == 'quizRangePeriod') {
            setFilters[type] = value;
        } else if (setFilters[type][filterId]) {
            setFilters[type][filterId] = value;
        } else {
            Object.assign(setFilters[type], {[filterId]: value});
        }

        searchButton.classList.add('hiddenStyle');
        loadSearchButton.classList.remove('hiddenStyle');

        cardsDefaultLoad('filter-count', (data) => {
            let cardsCount = data.count;
            cardsCount += data.nextPage > 0 ? data.nextPage : 0;

            if (cardsCount > 0) {
                searchButton.querySelector('.search-btn-count').innerHTML = cardsCount;
                lastFoundData = data;
                filtersWithFoundData = JSON.parse(JSON.stringify(setFilters));

            } else {
                searchButton.querySelector('.search-btn-count').innerHTML = ' похожие';
            }

            searchButton.classList.remove('hiddenStyle');
            loadSearchButton.classList.add('hiddenStyle');
        });
    }

    function initSearchButton() {
        searchButton.addEventListener('click', () => {
            window.HAS_QUIZ_PARAMS = true;
            window.NUMBER_PAGE = 1;

            setTimeout(function () {
                quizBlock.querySelectorAll('.filters-category.active').forEach(item => {item.classList.remove('active')});
                quizBlock.querySelector('.show-more-filters.active')?.click();
            }, 1000);

            if (lastFoundData) {
                loadCards(lastFoundData);
                setFilters = JSON.parse(JSON.stringify(filtersWithFoundData));
                return;
            }

            cardsDefaultLoad('filter-count', loadCards);
        })

        function loadCards(data) {
            let [day, month, year] = getCurrentDate();
            let countOfCards = Number(data['count']);
            if(data['nextPage'] > 0) {
                countOfCards = Number(data['count']) + Number(data['nextPage']);
            }
            // let countOffers = wordDeclension(countOfCards, [' предложение ', ' предложения ', ' предложений ']);
            window.cards_count = countOfCards;
            // $$('.quiz-count-cards')[0].innerHTML = 'Подобрано ' + countOfCards + ' ' + countOffers + ' на ' +  day + '.' + month + '.' + year;
            $$('.offers-list')[0].innerHTML = data['code'];
            document.getElementsByClassName('offers-list')[0].scrollIntoView({behavior: "smooth"});

            updateCardsLoadButton(data['nextPage']);
            if($$('.offers-list')[0].classList.contains('f-card-minimal-block')) {
                // addFCardsBtnsEvents нигде не определена: ReferenceError оставлял новые
                // карточки без «Подробнее» и сравнения. Как в load.js — initMinimalCards().
                if (typeof initMinimalCards === 'function') {
                    initMinimalCards();
                }
            } else{
                addCardsBtnsEvents();
            }

            addButtonClickHendler();
            // cardsDefaultLoad('sorting');
        }
    }


    function initQuickFilters() {
        quizBlock.querySelectorAll('.quick-filter').forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('active');

                updateFilters(
                    item.dataset.filterId,
                    item.dataset.filterBy,
                    item.classList.contains('active') ? item.dataset.listing : 0
                )
            })
        })
    }

    function initAllFiltersShowing() {
        let allFiltersBlock = quizBlock.querySelector('.quiz-filters-all');
        let showFiltersBtn = quizBlock.querySelector('.show-more-filters');

        if (!showFiltersBtn) {
            return;
        }

        showFiltersBtn.addEventListener('click', () => {
            showFiltersBtn.classList.toggle('active');
            allFiltersBlock.classList.toggle('active');

            quizBlock.querySelectorAll('.filters-category.active').forEach(item => {item.classList.remove('active')});

            if (!multiselectCounterInit) {
                initMultiselectCounter();
            }
        })
    }

    function initShowingSelect() {
        quizBlock.querySelectorAll('.filters-category-header').forEach((item, index, items) => {
            let categoryFilter = item.parentElement;
            let multiselect = categoryFilter.querySelector('.category-multi-select');

            let selectCount = item.querySelector('.select-count');
            let selectStatus = item.querySelector('.select-status');

            let defaultLeftValue = null;

            item.addEventListener('click', () => {
                if (!categoryFilter.classList.contains('active')) {
                    items.forEach(item => {item.parentElement.classList.remove('active')})
                }

                categoryFilter.classList.toggle('active');

                if (categoryFilter.classList.contains('active') && multiselect) {
                    if (defaultLeftValue === null) {
                        defaultLeftValue = selectCount.style.left;
                    }

                    if (+selectCount.style.left.replace('px', '') < selectStatus.offsetWidth + 30) {
                        selectCount.style.left = selectStatus.offsetWidth + 30 + 'px';
                    }
                } else if (multiselect) {
                    selectCount.style.left = defaultLeftValue;
                }
            })

            document.addEventListener('click', (event) => {
                if (event.target.closest('.filters-category') == null && quizBlock.querySelectorAll('.filters-category.active').length !== 0) {
                    quizBlock.querySelectorAll('.filters-category.active .filters-category-header').forEach(item => {
                        item.dispatchEvent(new Event('click'));
                    })
                }
            })
        })
    }

    function initSelect() {
        quizBlock.querySelectorAll('.filters-category-select').forEach(select => {
            let filtersCategory = select.parentElement;

            select.querySelectorAll('li').forEach((item, index, items) => {
                item.addEventListener('click', () => {
                    items.forEach(item => item.classList.remove('hiddenStyle'));
                    item.classList.add('hiddenStyle');
                    filtersCategory.classList.add('selected');
                    filtersCategory.classList.remove('active');
                    filtersCategory.querySelector('.select-status').innerHTML = item.innerHTML;

                    if (select.dataset.customType && setFilters[select.dataset.customType] && setFilters[select.dataset.customType][select.dataset.filterId]) {
                        setFilters[select.dataset.customType][select.dataset.filterId] = '';
                    }

                    if (item.dataset.type) {
                        //записываем название последнего установленного фильтра на select для правильного обнуления
                        select.dataset.customType = item.dataset.type;
                        updateFilters(select.dataset.filterId, item.dataset.type, item.dataset.listing);
                    } else if (select.dataset.filterBy) {
                        updateFilters(select.dataset.filterId, select.dataset.filterBy, item.dataset.listing);
                    } else {
                        updateFilters(select.dataset.filterId, 'listings', item.dataset.listing);
                    }
                })
            })
        })
    }
    function initMultiselect() {
        initMultiselectCounter();

        quizBlock.querySelectorAll('.category-multi-select').forEach(item => {
            let checkboxes = item.querySelectorAll('input');
            let selectStatus = item.parentElement.querySelector('.select-status');
            let selectCount = item.parentElement.querySelector('.select-count');

            let border = item ? item.querySelector('.border') : null;

            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    let checkedBoxes = Array.from(checkboxes).filter(checkbox => checkbox.checked);

                    Array.from(item.querySelectorAll('.filter-checkbox'))
                        .reverse()
                        .filter(checkbox => checkbox.querySelector('input').checked)
                        .forEach((checkbox) => {
                            item.prepend(checkbox);
                        });

                    let firstUnchecked = item.querySelector('input:not(:checked)')
                    if (firstUnchecked && checkedBoxes.length) {
                        border.classList.remove('hiddenStyle');
                        border.after(firstUnchecked.parentElement);
                    } else {
                        border.classList.add('hiddenStyle');
                    }

                    if (checkedBoxes.length) {
                        selectStatus.innerHTML = 'Выбрано';

                        selectCount.classList.add('active');
                        selectCount.innerHTML = checkedBoxes.length;

                    } else {
                        selectStatus.innerHTML = '';

                        selectCount.classList.remove('active');
                    }

                    let options = checkedBoxes.map(checkbox => checkbox.dataset.option);
                    updateFilters(item.dataset.filterId, item.dataset.filterBy, options);
                })
            })
        })
    }

    function initMultiselectCounter() {
        quizBlock.querySelectorAll('.select-count').forEach(item => {
            let addPx = 30;

            item.style.left = item.parentElement.querySelector('.select-title').offsetWidth + addPx + 'px';
        })
    }

    function initResetButton() {
        let resetButton = quizBlock.querySelector('.reset-button');

        resetButton.addEventListener('click', () => {
            // временно
            location.reload();
            return;


            // reset filters
            quizBlock.querySelectorAll('input').forEach(item => {item.checked = false;})
            quizBlock.querySelectorAll('.active').forEach(item=> {item.classList.remove('active')})
            quizBlock.querySelectorAll('.selected').forEach(item=> {item.classList.remove('selected')})
            quizBlock.querySelectorAll('.border').forEach(item=> {item.classList.add('hiddenStyle')})

            if (inputQuizRangeSum) {
                inputQuizRangeSum.value = defaultQuizNum;
                inputQuizRangeSum.dispatchEvent(new Event('input'));
            }

            if (inputQuizRangeDays) {
                inputQuizRangeDays.value = defaultQuizDays;
                inputQuizRangeDays.dispatchEvent(new Event('input'));
            }

            setFilters = {
                listings : {},
                options: {}
            }

            resetButton.classList.add('hiddenStyle');
        })

    }

    function showResetButton() {
        if (!resetButtonShowing) {
            quizBlock.querySelector('.reset-button').classList.remove('hiddenStyle');
        }
    }

    function setQuizRangeValues() {
        if (!quizBlock) return;

        let quizNumInput = quizBlock.querySelectorAll('.quiz-num-value');
        let quizRangeInput = quizBlock.querySelectorAll('.quiz-range-value');

        if (!quizNumInput.length || !quizRangeInput.length) {
            return;
        }

        quizRangeInput.forEach(input => {
            input.addEventListener('input', quizInpChange)
        });
        quizNumInput.forEach(input => {
            input.addEventListener('input', quizInpChange)
        });
        for (let i = 0; i < quizNumInput.length; i++) {
            quizRangeInput[i].style.backgroundSize = (quizRangeInput[i].value - quizRangeInput[i].min) * 100  / (quizRangeInput[i].max - quizRangeInput[i].min) + '% 100%';
        }
    }
    function quizInpChange(e) {
        let target = e.target;
        let val = parseInputNumber(target.value);
        let min = target.min ? target.min : target.dataset.min;
        let max = target.max ? target.max : target.dataset.max;
        if (e.target.type == 'range') {
            let formattedValue = getFormattedNumber(val, max);

            if (val >= max) {
                formattedValue += '+';
            }

            target.parentElement.getElementsByClassName('quiz-num-value')[0].value = formattedValue;
            setRepeatBlock(target.parentElement.querySelector('.quiz-num-repeat'), formattedValue);
        } else {
            target = target.parentElement.getElementsByClassName('quiz-range-value')[0];
            if(val == '') {
                val = 0;
            }
            target.value = val;
        }
        let backgroundSize = (val - min) * 100 / (max - min);

        if (backgroundSize < 0) {
            backgroundSize = 0
        }

        target.style.backgroundSize = backgroundSize + '% 100%';
    }

    function setQuizInputRangeValue(input) {

        let minValue = parseInt(input.getAttribute('data-min'));
        let maxValue = parseInt(input.getAttribute('data-max'));
        let inputValue = parseInputNumber(input.value)
        input.setAttribute('valuebeforechange',inputValue);

        if (inputValue >= maxValue) {
            input.value = getFormattedNumber(maxValue) + '+';
        } else if (inputValue < minValue) {
            input.value = getFormattedNumber(minValue);
        }
    }


    function formattedNumberInputAction(input) {
        let repeatBlock = input.parentElement.querySelector('.quiz-num-repeat');

        input.addEventListener('input', () => {setFormattedNumberInput(input); setRepeatBlock(repeatBlock, input.value);});
        input.addEventListener('focus', () => {setRepeatBlock(repeatBlock, input.value)});
        input.addEventListener('blur', () => {setRepeatBlock(repeatBlock, input.value)});
    }

    function setFormattedNumberInput(input) {
        if (!input.value) {
            return;
        }

        input.value = getFormattedNumber(input.value, input.getAttribute('data-max'));
    }

    function getFormattedNumber(number, max = null, ending = '') {
        number = number.toString().replace(/[^0-9.]/g, '');
        number = Number(number);

        if (max && number > Number(max)) {
            return max.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + '+';
        }

        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ending;
    }

    function setRepeatBlock(element, value) {
        let ending = element.dataset.ending.split(',');


        if (ending.length === 3) {
            if (value == 1) ending = ending[0];
            else if (value > 1 && value < 5) ending = ending[1];
            else ending = ending[2];
        } else {
            ending = ending[0];
        }

        if (value) {
            element.innerHTML = `<span class="number">${value}</span><span> ${ending}</span>`;
        } else {
            element.innerHTML = '';
        }
    }

    function initQuizInput(input) {
        if (!input.value) {
            return;
        }

        setFormattedNumberInput(input);
        setRepeatBlock(input.parentElement.querySelector('.quiz-num-repeat'), input.value);
    }

    function initCurrencySelect() {
        let currencyFilter = quizBlock.querySelector('.currency-filter');

        if (!currencyFilter) {
            return;
        }

        let selector = currencyFilter.querySelector('.filters-category-select');
        let filterId = selector.dataset.filterId;

        setFilters.listings[filterId] = currencyFilter.dataset.defaultListing;
    }
}

function addQuizInputsParams(params) {
    if($$('.inputQuizNum').length != 0) {
        if ($$('.inputQuizNum')[0].name) {
            params[$$('.inputQuizNum')[0].name] =
                ($$('.inputQuizNum')[0].value != 0) ? parseInputNumber($$('.inputQuizNum')[0].value) : '';
        } else {
            params['slf_summ'] =
                ($$('.inputQuizNum')[0].value != 0) ? parseInputNumber($$('.inputQuizNum')[0].value) : '';
        }
    }
    if($$('.inputQuizDays').length != 0) {
        params['slf_time'] = ($$('.inputQuizDays')[0].value != 0) ? parseInputNumber($$('.inputQuizDays')[0].value) : parseInputNumber($$('.inputQuizDays')[0].dataset.max/2);
    } else if ('quizRangePeriod' in setFilters) {
        params['slf_time'] = setFilters.quizRangePeriod;
    }

    let selectedListrings = Object.values(setFilters.listings).filter(item => item != 0).toString();

    // QUIZ_SCOPE_LISTING выставляют теговые страницы с hero-подборщиком (lead/loan-tag-hero):
    // счётчик и выдача квиза считаются в рамках текущего листинга, а не всей категории
    if (!selectedListrings && (window.SECTION_TYPE == 15 || window.QUIZ_SCOPE_LISTING) && window.LISTING_ID) {
        params['listing_id'] = window.LISTING_ID;
        params['is_quiz_count'] = 0;
    } else {
        params['listing_id'] =  selectedListrings ? selectedListrings + ',' + window.CATEGORY_ID : -window.CATEGORY_ID;
        params['is_quiz_count'] = true;
    }
    params['filters'] = [].concat.apply([], Object.values(setFilters.options)).toString();

    // others params
    setFilters.otherFiltersNames.forEach(filterName => {
        params[filterName] = [].concat.apply([], Object.values(setFilters[filterName])).toString();
    })
}

function parseInputNumber(number) {
    return Number(number.replace(/[ +]/g, ''))
}

let setFilters = {
    listings : {},
    options: {},
    quizRangeSum: {},
    otherFiltersNames: []
}

initQuiz();

if ($$('.quiz-mobile').length > 0) {
    $$('.quiz-mobile')[0].addEventListener('click', () => {
       if ($$('.quiz'). length > 0) {
           $$('.quiz')[0].style.display = 'flex';
       }
        $$('.quiz-mobile')[0].style.display = 'none';
    });
}
/* loan-tag-hero: синхронизация счётчика/склонений, кнопка «Фильтры», аналитика.
   Состояние фильтров и загрузка карточек остаются в модуле quiz (setFilters/updateFilters) —
   здесь только чтение его DOM-вывода (.search-btn-count) и вспомогательный UI hero. */
function initLoanTagHero() {
    var hero = document.querySelector('.loan-tag-hero');

    if (!hero) {
        return;
    }

    var quizBlock = hero.querySelector('.quiz');
    var countNode = hero.querySelector('.search-btn-count');
    var ctaWord = hero.querySelector('.lth-cta-word');
    var panelCount = hero.querySelector('.lth-panel-count');
    var panelWord = hero.querySelector('.lth-panel-word');
    var metaCount = hero.querySelector('.lth-panel-count-m');
    var metaWord = hero.querySelector('.lth-panel-word-m');
    var metricSum = hero.querySelector('.lth-metric-sum');
    var filtersBtn = hero.querySelector('.lth-filters-btn');
    var filtersCount = hero.querySelector('.lth-filters-count');
    var sumInput = quizBlock ? quizBlock.querySelector('.inputQuizNum') : null;
    var termInput = quizBlock ? quizBlock.querySelector('.inputQuizDays') : null;

    // true после первого изменения параметров: до этого CTA просто ведёт к списку,
    // не перезагружая выдачу (серверный список и так соответствует странице)
    var heroDirty = false;

    function reachGoal(name) {
        if (typeof g === 'function') {
            g(name);
        }
    }

    function offersWord(count) {
        var forms = ['предложение', 'предложения', 'предложений'];
        var n = Math.abs(count) % 100;
        var rem = n % 10;

        if (n > 10 && n < 20) return forms[2];
        if (rem > 1 && rem < 5) return forms[1];
        if (rem == 1) return forms[0];
        return forms[2];
    }

    function syncCount() {
        if (!countNode) {
            return;
        }

        var raw = countNode.textContent.trim().replace(/\s/g, '');
        var count = parseInt(raw, 10);

        if (isNaN(count)) {
            // квиз написал « похожие» — точного количества нет, слово убираем
            if (ctaWord) ctaWord.textContent = '';
            return;
        }

        var word = offersWord(count);

        if (ctaWord) ctaWord.textContent = word;
        if (panelCount) panelCount.textContent = count;
        if (panelWord) panelWord.textContent = word;
        if (metaCount) metaCount.textContent = count;
        if (metaWord) metaWord.textContent = word;
    }

    if (countNode) {
        new MutationObserver(function () {
            heroDirty = true;
            syncCount();
        }).observe(countNode, {childList: true, characterData: true, subtree: true});
    }

    // метрика «К возврату от N ₽» (только для 0%-подборки) следует за полем суммы
    if (metricSum && sumInput) {
        var syncMetric = function () {
            var value = sumInput.value.replace(/[^0-9]/g, '');

            if (value) {
                metricSum.textContent = Number(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
            }
        };

        sumInput.addEventListener('input', syncMetric);
        sumInput.addEventListener('change', syncMetric);
        syncMetric();
    }

    // поле (Сумма/Срок) очищается при фокусе — удобнее вписать своё значение с нуля.
    // Если ушли, ничего не введя, возвращаем прежнее: пустой параметр сломал бы подбор.
    [sumInput, termInput].forEach(function (input) {
        if (!input) {
            return;
        }

        var repeat = input.parentElement.querySelector('.quiz-num-repeat');

        input.addEventListener('focus', function () {
            input.dataset.lthPrev = input.value;
            input.value = '';

            if (repeat) {
                repeat.innerHTML = '';
            }
        });

        input.addEventListener('blur', function () {
            if (input.value === '' && input.dataset.lthPrev) {
                input.value = input.dataset.lthPrev;
                // штатный обработчик quiz переформатирует значение и вернёт суффикс (₽/дней)
                input.dispatchEvent(new Event('input'));
            }
        });
    });

    // кнопка «Фильтры»: aria-expanded и счётчик активных доп. фильтров;
    // само открытие делает обработчик .show-more-filters из модуля quiz
    function updateFiltersButton() {
        if (!filtersBtn || !quizBlock) {
            return;
        }

        filtersBtn.setAttribute('aria-expanded', filtersBtn.classList.contains('active') ? 'true' : 'false');

        if (filtersCount) {
            var checked = quizBlock.querySelectorAll('.quiz-filters-all .filter-checkbox input:checked').length;
            var selected = quizBlock.querySelectorAll('.quiz-filters-all .filters-category.selected').length;
            var total = checked + selected;

            filtersCount.textContent = total > 0 ? '· ' + total : '';
        }
    }

    if (filtersBtn) {
        filtersBtn.addEventListener('click', function () {
            setTimeout(function () {
                updateFiltersButton();

                if (filtersBtn.classList.contains('active')) {
                    reachGoal('tag_hero_filters_open');
                }
            }, 0);
        });
    }

    if (quizBlock) {
        quizBlock.addEventListener('change', function (event) {
            heroDirty = true;

            if (sumInput && event.target === sumInput) {
                reachGoal('tag_hero_sum_change');
            } else if (termInput && event.target === termInput) {
                reachGoal('tag_hero_term_change');
            }

            setTimeout(updateFiltersButton, 0);
        });

        quizBlock.addEventListener('click', function (event) {
            if (event.target.closest('.filters-items li')) {
                heroDirty = true;
                setTimeout(updateFiltersButton, 0);
            }
        });
    }

    // CTA: пока параметры не менялись, ведём к уже отрендеренному списку без перезагрузки
    // выдачи (capture-фаза срабатывает раньше обработчика кнопки в модуле quiz)
    document.addEventListener('click', function (event) {
        var cta = event.target.closest('button.search-btn');

        if (!cta || !hero.contains(cta)) {
            return;
        }

        reachGoal('tag_hero_show_offers');

        if (heroDirty) {
            return;
        }

        event.stopPropagation();

        var target = document.getElementById('best-offers-title')
            || document.getElementById('all-offers-title')
            || document.querySelector('.offers-list');

        if (target) {
            target.setAttribute('tabindex', '-1');
            // focus раньше scrollIntoView: вызов focus() после отменил бы smooth-прокрутку
            target.focus({preventScroll: true});
            target.scrollIntoView({behavior: 'smooth'});
        }
    }, true);

    // переходы по «Другим подборкам»
    var related = document.querySelector('.lth-related');

    if (related) {
        related.addEventListener('click', function (event) {
            if (event.target.closest('a.btn')) {
                reachGoal('tag_hero_tag_click');
            }
        });
    }

    updateFiltersButton();
}

initLoanTagHero();
function initHiddenCardRating() {

    // function setHiddenBlockPosition() {
    //     if (window.innerWidth > 992) {
    //         ratingWithSort.parentNode.insertBefore(hiddenCardRatingBlock, ratingWithSort.nextSibling)
    //     } else {
    //         // ratingWithSort.parentNode.insertBefore(hiddenCardRatingBlock, hiddenCardRating.nextElementSibling)
    //         hiddenCardRating.insertAdjacentElement('afterend', hiddenCardRatingBlock);
    //     }
    // }
    //
    // if (document.querySelector('.with-quiz')) return;
    //
    // let ratingWithSort = document.querySelector('.rating-with-sort');
    let hiddenCardRating = document.querySelector('.hidden-card-rating');
    //
    if (!hiddenCardRating) return;
    //
    let hiddenCardRatingBlock = hiddenCardRating.querySelector('.hidden-card-rating-block');
    //
    const ratingMore = hiddenCardRating.querySelector('.rating-more');

    ratingMore.addEventListener('click', () => {
        hiddenCardRatingBlock.classList.toggle('show')
        ratingMore.classList.toggle('show')
    })
    //
    // setHiddenBlockPosition();
    //
    // window.addEventListener('resize', setHiddenBlockPosition);
}

initHiddenCardRating();
const INPUTS_MOBILE_BREAKPOINT = 992;

function initAmountInputs() {
    document.querySelectorAll('.amount-input-block').forEach(amountInputBlock => {
        let input = amountInputBlock.querySelector('input');

        if (amountInputBlock.querySelector('.dropdown')) {
            initInputDropdown(amountInputBlock);
        }

        if (input.dataset.mask) {
            initMaskForInputBlock(amountInputBlock);
            return;
        }

        if (input.dataset.type == 'text') {
            formattedTextInput(input);
            return;
        } else if (input.dataset.type == 'text-ru') {
            formattedTextInput(input, true);
            return;
        }

        let repeatBlock = amountInputBlock.querySelector('.amount-input-repeat');

        if (!repeatBlock) {
            return;
        }

        if (input.value) {
            input.dataset.focusOuted = true;
        } else {
            input.addEventListener('focusout', function () {
                if (!input.value) return;
                input.dataset.focusOuted = true;
                input.dispatchEvent(new Event('input'));
            });
        }

        setFormattedNumberInput(input);
        setRepeatBlock(repeatBlock, input.value);
        formattedNumberInputAction(input, repeatBlock);

        initInputRange(amountInputBlock, input);

    })
}

function formattedTextInput(input, onlyRuText = false) {
    function setTextInputValue(input, onlyRuText) {
        const engToRu = {
            'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е', 'y': 'н', 'u': 'г', 'i': 'ш', 'o': 'щ', 'p': 'з',
            'a': 'ф', 's': 'ы', 'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р', 'j': 'о', 'k': 'л', 'l': 'д',
            'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и', 'n': 'т', 'm': 'ь',
            'Q': 'Й', 'W': 'Ц', 'E': 'У', 'R': 'К', 'T': 'Е', 'Y': 'Н', 'U': 'Г', 'I': 'Ш', 'O': 'Щ', 'P': 'З',
            'A': 'Ф', 'S': 'Ы', 'D': 'В', 'F': 'А', 'G': 'П', 'H': 'Р', 'J': 'О', 'K': 'Л', 'L': 'Д',
            'Z': 'Я', 'X': 'Ч', 'C': 'С', 'V': 'М', 'B': 'И', 'N': 'Т', 'M': 'Ь'
        };

        let formattedInputText = input.value.replace(/[0-9]/g, '');

        if (onlyRuText) {
            formattedInputText = formattedInputText.split('').map(char => engToRu[char] || char).join('')
        }

        input.value = formattedInputText;
    }

    input.addEventListener('input', () => {
        setTextInputValue(input, onlyRuText)

        if (input.value) {
            input.closest('.amount-input-block').classList.remove('error');
        }
    });
    input.addEventListener('focus', () => {setTextInputValue(input, onlyRuText)});
    input.addEventListener('blur', () => {setTextInputValue(input, onlyRuText)});
}

function initInputRange(amountInputBlock, amountInput) {
    let inputRange = amountInputBlock.querySelector('.amount-input-range-value');

    if (!inputRange) return;

    inputRange.addEventListener('input', inputRangeEvent);
    amountInput.addEventListener('input', inputRangeEvent);

    inputRange.style.backgroundSize = (inputRange.value - inputRange.min) * 100  / (inputRange.max - inputRange.min) + '% 100%';

    function inputRangeEvent(e) {
        let target = e.target;
        let val = parseInputNumber(target.value);
        let min = inputRange.min;
        let max = inputRange.max;

        if (e.target.type === 'range') {
            amountInput.value = val;
            amountInput.dispatchEvent(new Event('input'));
        } else {
            if(val == '') {
                val = 0;
            }
            inputRange.value = val;
        }

        let backgroundSize = (+val - min) * 100 / (max - min);

        if (backgroundSize < 0) {
            backgroundSize = 0
        }

        inputRange.style.backgroundSize = backgroundSize + '% 100%';
    }
}

function formattedNumberInputAction(input, repeatBlock) {
    input.addEventListener('input', () => {
        if (!input.dataset.focusOuted) return;

        setFormattedNumberInput(input);
        setRepeatBlock(repeatBlock, input.value);
        input.closest('.amount-input-block').classList.remove('error');
    });
    input.addEventListener('focus', () => {setRepeatBlock(repeatBlock, input.value)});
    input.addEventListener('blur', () => {setRepeatBlock(repeatBlock, input.value)});

    if (input.dataset.min) {
        input.addEventListener('change', () => {
            if (parseInputNumber(input.value) >= +input.dataset.min) return;

            input.value = input.dataset.min;

            setRepeatBlock(repeatBlock, input.value)
        });
    }
}
function setFormattedNumberInput(input) {
    if (!input.value) {
        return;
    }

    // input.value — строка, поэтому Number.isInteger по ней всегда false и разрядка
    // никогда не применялась (в поле было «100000» вместо «100 000»). Парсим число:
    // целые форматируем разрядкой, дробные (напр. «% в день» 0.01) пропускаем как есть.
    if (!Number.isInteger(parseInputNumber(input.value))) {
        return;
    }

    input.value = getFormattedNumber(input.value, input.dataset.max, input.dataset.decimal);
}

function parseInputNumber(number) {
    return Number(number.replace(/[ +]/g, ''))
}

function getFormattedNumber(number, max = null, decimalPlaces) {
    number = number.toString().replace(/,/g, '.'); // Заменяем запятые точками

    let integerPart = number.split('.')[0].replace(/[^0-9]/g, '');
    let decimalPart = '';

    if (decimalPlaces > 0 && number.indexOf('.') !== -1) {
        decimalPart = number.split('.')[1].replace(/[^0-9]/g, '');

        decimalPart = '.' + decimalPart.substring(0, decimalPlaces);
    }

    number = Number(integerPart) + decimalPart;

    if (max && number > Number(max)) {
        return max.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + '+';
    }

    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}


function setRepeatBlock(element, value) {
    let ending = element.dataset.ending.split(',');


    if (ending.length === 3) {
        if (value == 1) ending = ending[0];
        else if (value > 1 && value < 5) ending = ending[1];
        else ending = ending[2];
    } else {
        ending = ending[0];
    }

    if (value) {
        element.innerHTML = `<span class="number">${value}</span><span> ${ending}</span>`;
    } else {
        element.innerHTML = '';
    }
}

function initSelect(selectBlock, callbackSelected) {
    let select = selectBlock.querySelector('.select-filters-border');
    let filtersCategory = selectBlock.querySelector('.select-filters');

    select.querySelectorAll('li').forEach((item, index, items) => {
        item.addEventListener('click', () => {
            items.forEach(item => item.classList.remove('hiddenStyle'));
            item.classList.add('hiddenStyle');
            filtersCategory.classList.add('selected');
            filtersCategory.classList.remove('active');

            if (item.dataset.onSelectedValue) {
                filtersCategory.querySelector('.select-status').innerHTML = item.dataset.onSelectedValue;
            } else {
                filtersCategory.querySelector('.select-status').innerHTML = item.innerHTML;
            }

            callbackSelected(item.dataset.value, item);
        })
    })
}

function initShowingNewSelect() {
    document.querySelectorAll('.select-filters-header').forEach((item, index, items) => {
        let categoryFilter = item.parentElement;
        let multiselect = categoryFilter.querySelector('.category-multi-select');

        let selectCount = item.querySelector('.select-count');
        let selectStatus = item.querySelector('.select-status');

        let defaultLeftValue = null;

        item.addEventListener('click', () => {
            if (categoryFilter.classList.contains('filter-blocked')) {
                return;
            }

            if (!categoryFilter.classList.contains('active')) {
                items.forEach(item => {item.parentElement.classList.remove('active')})
            }

            categoryFilter.classList.toggle('active');

            if (categoryFilter.classList.contains('active') && multiselect) {

                if (defaultLeftValue === null) {
                    defaultLeftValue = selectCount.style.left;
                }

                if (+selectCount.style.left.replace('px', '') < selectStatus.offsetWidth + 30) {
                    selectCount.style.left = selectStatus.offsetWidth + 30 + 'px';
                }
            } else if (multiselect) {
                selectCount.style.left = defaultLeftValue;
            }
        })

        document.addEventListener('click', (event) => {
            if ((event.target.closest('.select-filters') == null || !event.target.closest('.select-filters').isEqualNode(item.closest('.select-inputs'))) && document.querySelectorAll('.select-filters.active').length !== 0) {
                document.querySelectorAll('.select-filters.active .select-filters-header').forEach(itemAll => {
                    if (!itemAll.isEqualNode(item)) return;
                    // itemAll.dispatchEvent(new Event('click'));
                })
            } else if ((event.target.closest('.select-inputs') == null || !event.target.closest('.select-inputs').isEqualNode(item.closest('.select-inputs'))) && document.querySelectorAll('.select-inputs.active').length !== 0) {
                document.querySelectorAll('.select-inputs.active .select-filters-header').forEach(itemAll => {
                    if (!itemAll.isEqualNode(item)) return;
                    itemAll.dispatchEvent(new Event('click'));
                })
            }
        })
    })
}

initAmountInputs();

initShowingNewSelect();

// пример инициализации
// document.querySelectorAll('.select-block').forEach(selectBlock => {
//     initSelect(selectBlock, (value) => {
//         console.log(value);
//     })
// });
//
// document.querySelectorAll('.amount-input-filter').forEach(selectBlock => {
//     initSelect(selectBlock, (value) => {
//         console.log(value);
//     })
// });


// select quiz
function initShowingSelectFilters(elements = null) {
    if (elements === null) elements = document.querySelectorAll('.select-filters-headline');

    elements.forEach((item) => {
        let categoryFilter = item.parentElement;
        const overlaySwipe = categoryFilter.querySelector('.overlay-swipe');
        const draggableBlock = categoryFilter.querySelector('.draggable-block');

        item.addEventListener('click', () => {
            if (categoryFilter.classList.contains('filter-blocked')) {
                return;
            }
            if (!categoryFilter.classList.contains('active')) {
                document.querySelectorAll('.select-filters-headline').forEach(item => {
                    item.parentElement.classList.remove('active')
                })
            }
            categoryFilter.classList.toggle('active');
        })

        item.addEventListener('keydown', (event) => {
            if ((event.key === 'Enter' || event.key === ' ') && item.hasAttribute('tabindex')) {
                event.preventDefault();
                item.click();
            }
        })

        document.addEventListener('click', (event) => {
            if (event.target.closest('.select-inputs') == null && document.querySelectorAll('.select-inputs.active').length !== 0) {
                document.querySelectorAll('.select-inputs.active .select-filters-headline').forEach(item => {
                    item.dispatchEvent(new Event('click'));
                })
            }
        })

        if (!overlaySwipe || !draggableBlock) return;

        overlaySwipe.addEventListener('click', (e) => {
            if (e.target !== draggableBlock && !e.target.closest('.draggable-block')) {
                document.querySelectorAll('.select-inputs.active .select-filters-headline').forEach(item => {
                    item.dispatchEvent(new Event('click'));
                })
            }
        })

        setSelectDraggable(draggableBlock, categoryFilter);
    })
}

initShowingSelectFilters();

function setSelectDraggable(draggableBlock, selectInput) {
    if (!draggableBlock || !selectInput) return;
    let dragItem = draggableBlock;
    let container = draggableBlock.closest('.overlay-swipe');
    const dragBlockBtn = draggableBlock.querySelector('button');
    const overlaySwipe = draggableBlock.closest('.overlay-swipe');

    let active = false;
    let currentY;
    let initialY;
    let yOffset = 0;


    dragBlockBtn.addEventListener('click', () => {
        selectInput.classList.remove('active');

        document.querySelectorAll('.select-inputs.active .select-filters-headline').forEach(item => {
            item.dispatchEvent(new Event('click'));
        })
    });

    overlaySwipe.addEventListener('click', (e) => {
        if (e.target !== draggableBlock && !e.target.closest('.draggable-block')) {
            selectInput.classList.remove('active');
        }
    })

    container.addEventListener("touchstart", dragStart, false);
    container.addEventListener("touchend", dragEnd, false);
    container.addEventListener("touchmove", drag, false);

    container.addEventListener("mousedown", dragStart, false);
    container.addEventListener("mouseup", dragEnd, false);
    container.addEventListener("mousemove", drag, false);

    function dragStart(e) {
        if (window.innerWidth >= INPUTS_MOBILE_BREAKPOINT) return;

        if (e.type === "touchstart") {
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialY = e.clientY - yOffset;
        }

        if (e.target === dragItem || e.target.closest('.draggable-block')) {
            active = true;
        }
    }

    function dragEnd(e) {
        if (window.innerWidth >= INPUTS_MOBILE_BREAKPOINT) return;

        if (yOffset > 20) {
            selectInput.classList.remove('active');
        }

        currentY = null;
        initialY = null;
        yOffset = 0;

        dragItem.classList.remove('dragged');
        dragItem.style.transform = null;
        dragItem.style.paddingBottom = null;
        active = false;
    }

    function drag(e) {
        if (window.innerWidth >= INPUTS_MOBILE_BREAKPOINT) return;

        let contentBlock = e.target.closest('.draggable-content');

        let contentBlockIsScrolled = contentBlock && contentBlock.scrollHeight > contentBlock.offsetHeight;

        if (active && !contentBlockIsScrolled) {
            e.preventDefault();

            if (e.type === "touchmove") {
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentY = e.clientY - initialY;
            }

            // if (!contentBlockIsScrolled || (currentY > 150 && contentBlock.scrollTop === 0)) {
            //     e.preventDefault();
            // } else {
            //     return;
            // }

            yOffset = currentY;

            setTranslate(currentY, dragItem);
        }
    }

    function setTranslate(yPos, el) {
        el.classList.add('dragged');
        if (yPos < 0) {
            el.style.paddingBottom = (Math.abs(yPos) / 5) + 'px';
        } else {
            el.style.transform = 'translateY(' + yPos / 5 + 'px)';
        }
    }
}

function initSelectNew(selectBlock, callbackSelected) {
    let select = selectBlock.querySelector('.select-inputs-items');
    let filtersCategory = select.closest('.select-inputs');

    if(!filtersCategory) {
        filtersCategory = select.parentElement;
    }

    let selectStatus = filtersCategory.querySelector('.select-inputs-status');
    const draggableBlock = selectBlock.querySelector('.draggable-block');

    if( selectStatus !== null ) {
        let preSetSelect = Array.from(select.querySelectorAll('li'))
            .filter(li => li.innerHTML == selectStatus.innerHTML);
        preSetSelect.forEach(el => {el.classList.add('r-active')});
    }

    select.querySelectorAll('li').forEach((item, index, items) => {
        item.addEventListener('click', (e) => {
            items.forEach(item => item.classList.remove('r-active'));
            item.classList.add('r-active');
            filtersCategory.classList.add('selected');

            if (window.innerWidth > INPUTS_MOBILE_BREAKPOINT) {
                filtersCategory.classList.remove('active');
            }

            if (item.dataset.onSelectedValue) {
                selectStatus.innerHTML = item.dataset.onSelectedValue;
            } else {
                selectStatus.innerHTML = item.innerHTML;
            }

            if (e.target.closest('.client-sort')) {

                let sortSelectInputs = document.querySelector('.sort .select-inputs');
                if(sortSelectInputs != null) {
                    initSelectNew(sortSelectInputs, (item) => {
                        document.querySelectorAll('.fixed-quiz-sort  .select-options li').forEach(sortItem => {
                            if (sortItem.innerHTML === item.innerHTML) {
                                sortItem.click();
                            }
                        });

                    });
                }

                //alert('CLIENT SORT REMOVED!') // TODO
                //getSort(e);//для страницы mfo клиентская сортировка
            }else{
                callbackSelected(item);
            }
        })
    })
    setSelectDraggable(draggableBlock, filtersCategory);
}

function initMultiSelectNew(multiSelBlock, callBackFunc) {
    let checkboxes = multiSelBlock.querySelectorAll('input');
    let selectCount = multiSelBlock.querySelector('.select-inputs-count');
    let filterCheckboxes = multiSelBlock.querySelector('.filter-checkboxes');
    let headline = multiSelBlock.querySelector('.select-filters-headline')
    let selectInputStatus = multiSelBlock.querySelector('.select-inputs-status')
    const draggableBlock = multiSelBlock.querySelector('.draggable-block');

    headline.addEventListener('click', () => {
        if (!multiSelBlock.classList.contains('active')) {
            return;
        }

        moveCheckedBoxesToTop();
        filterCheckboxes.scrollTo(0, 0);
    })

    setInputStatusWidthEvent()

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            let checkedBoxes = Array.from(checkboxes).filter(checkbox => checkbox.checked);

            setInputStatusText(checkbox);

            if (!selectCount) {
                callBackFunc(checkedBoxes);
                return;
            }

            // if (filterCheckboxes.scrollHeight <= filterCheckboxes.clientHeight) {
            //     moveCheckedBoxesToTop();
            // }

            if (checkedBoxes.length) {
                selectCount.innerHTML = checkedBoxes.length;
                if (!selectInputStatus) selectCount.classList.add('active');
                multiSelBlock.classList.add('selected');
            } else {
                selectCount.classList.remove('active');
                selectCount.innerHTML = '';
                multiSelBlock.classList.remove('selected');
            }
            callBackFunc(checkedBoxes);

            if (selectInputStatus && !selectInputStatus.style.maxWidth) {
                selectInputStatus.style.maxWidth = selectInputStatus.clientWidth + 'px';
            }
        });
    });

    function moveCheckedBoxesToTop() {
        Array.from(multiSelBlock.querySelectorAll('.filter-checkbox'))
            .reverse()
            .filter(checkbox => checkbox.querySelector('input').checked)
            .forEach((checkbox) => {
                filterCheckboxes.prepend(checkbox);
            });
    }

    function setInputStatusText(checkbox) {
        if (!selectInputStatus) return;

        let selectedCheckboxesNames = selectInputStatus.innerHTML.split(', ').filter(item => item !== '');

        let checkboxName = checkbox.parentElement.querySelector('label').innerHTML;

        if (checkbox.checked) {
            selectedCheckboxesNames.push(checkboxName);
        } else {
            selectedCheckboxesNames = selectedCheckboxesNames.filter(item => item !== checkboxName);
        }

        selectInputStatus.innerHTML = selectedCheckboxesNames.join(', ');
    }

    function setInputStatusWidthEvent() {
        if (!selectInputStatus) return;

        window.addEventListener('resize', () => {
            if (!selectInputStatus.style.maxWidth) return;

            selectInputStatus.style.maxWidth = '';
            selectInputStatus.style.whiteSpace = 'initial';
            selectInputStatus.style.maxWidth = selectInputStatus.clientWidth + 'px';

            selectInputStatus.style.whiteSpace = '';
        })
    }

    setSelectDraggable(draggableBlock);
}

function formatCurrencyValue(num) {
    num = parseFloat(num);

    if (num >= 1) {
        return num.toFixed(2);
    }

    let str = num.toString();
    let match = str.match(/0\.(0*)[1-9]{2}/);

    if (match) {
        return parseFloat(match[0]);
    }

    return num.toFixed(2);
}

function addErrorToInputBlock(inputBlock, errorMessage) {
    if (!inputBlock.classList.contains('amount-input-block')) return;

    inputBlock.classList.add('error');
    let errorMessageBlock = inputBlock.querySelector('.err-msg');

    if (!errorMessageBlock) {
        errorMessageBlock = document.createElement('div');
        errorMessageBlock.classList.add('err-msg');
        inputBlock.append(errorMessageBlock);
    }

    errorMessageBlock.innerHTML = errorMessage;
}

function setMaskForInput(input, maskElem, mask, startMask = null) {
    if (!input.value) {
        input.parentElement.classList.add('focused');
        input.removeAttribute("placeholder");
    }

    let i = 0,
        val = input.value.replace(/\D/g, '');

    input.value = mask.replace(/(?!\+)./g, function(a) {
        return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? '' : a;
    });

    if (startMask && !input.value.startsWith(startMask)) {
        input.value = startMask;
    }

    let maskMainValue = input.value;

    maskElem.innerHTML = '<i>' + maskMainValue + '</i>' + mask.substring(maskMainValue.length);

    input.setSelectionRange(input.value.length,input.value.length);
}

function initMaskForInputBlock(inputBlock) {
    const maskElem = inputBlock.querySelector('.input-mask')
    const input = inputBlock.querySelector('input')

    if (!maskElem || !input) return;

    let mask = input.dataset.mask;
    let startMask = input.dataset.maskStart;

    input.addEventListener('input', () => {
        setMaskForInput(input, maskElem, mask, startMask)
        input.closest('.amount-input-block').classList.remove('error');
    });
    input.addEventListener('focus', () => {setMaskForInput(input, maskElem, mask, startMask)});
    // input.addEventListener('blur', () => {setMask(input,maskElem, mask, startMask)}); // баг на сафари

    input.addEventListener('click', function () {
        if (!input.value) {
            input.value = mask;
            maskElem.innerHTML = mask;
            if (startMask) {
                this.setSelectionRange(startMask.length,startMask.length);
            } else {
                this.setSelectionRange(0,0);
            }
            return;
        }

        this.setSelectionRange(this.value.length,this.value.length);
    })
}

function initInputDropdown(inputBlock) {
    const input = inputBlock.querySelector('.amount-input-value');

    inputBlock.querySelectorAll('.dropdown-item').forEach(dropdownItem => {
        dropdownItem.addEventListener('click', () => {
            input.value = dropdownItem.textContent.trim();
        })
    })
}


// document.querySelectorAll('.select-inputs').forEach(selectBlock => {
//     initSelectNew(selectBlock, (value) => {});
// });
//
// document.querySelectorAll('.select-inputs').forEach(item => {
//     initMultiSelectNew(item, function (items) {
//         console.log(items);
//     });
// });

function initSort() {
    let sortSelectInputs = document.querySelector('.sort .select-inputs');
    let fixedQuizSortTitle = document.querySelector('.fixed-quiz-sort  .fixed-quiz-title');

    initSelectNew(sortSelectInputs, (item) => {
        // load.js

        if (fixedQuizSortTitle) {
            fixedQuizSortTitle.innerHTML = item.innerHTML;
        }

        window.scrollBy({
            top: document.querySelector('.offers-list').getBoundingClientRect().top,
            behavior: "smooth"
        });
    });
}

initSort();function formatPrice(price) {
    if (price == 0) return "0 ₽";

    let result = price.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });

    return result.replace(',00', '');
}

function initOverpaymentCalculator() {
    let calculatorBlock = document.querySelector('.overpayment-calculator');

    if (!calculatorBlock || !calculatorBlock.dataset.plans) return;

    let calculatorData = JSON.parse(calculatorBlock.dataset.plans).sort((a,b) => a.percent - b.percent);

    let calculateBtn = calculatorBlock.querySelector('.overpayment-calculator-inputs button');

    let inputSum = calculatorBlock.querySelector('.overpayment-calculator-sum');
    let inputTerm = calculatorBlock.querySelector('.overpayment-calculator-term');
    let inputPercent = calculatorBlock.querySelector('.overpayment-calculator-percent');

    // При нажатии на поле оно обнуляется и готово для ввода. Если пользователь ушёл,
    // ничего не введя, — возвращаем прежнее значение (пустое поле сломало бы расчёт).
    [inputSum, inputTerm, inputPercent].forEach(input => {
        if (!input) return;

        input.addEventListener('focus', () => {
            input.dataset.prevValue = input.value;
            input.value = '';
            let repeat = input.closest('.amount-input-block').querySelector('.amount-input-repeat');
            if (repeat) repeat.innerHTML = '';
        });

        input.addEventListener('blur', () => {
            if (input.value.trim() === '' && input.dataset.prevValue !== undefined) {
                input.value = input.dataset.prevValue;
                input.dispatchEvent(new Event('input'));
            }
        });
    });

    calculateBtn.addEventListener('click', () => {
        let sum = parseInputNumber(inputSum.value);
        let term = parseInputNumber(inputTerm.value);

        calculate(sum, term);
    });

    setDefaultCalculating();

    function setDefaultCalculating() {
        // Pick first plan with non-zero percent so initial render never shows «Переплата 0 ₽» (audit v3 Item 1.3).
        // vzo-calc-real-ranges-20260722: «первый» план запросто оказывается выбросом (заём под
        // залог на 15 000 000 ₽), и калькулятор МФО стартовал с нереальной суммы. Берём медианный
        // план из тех, что укладываются в отрисованные сервером границы поля.
        let candidates = calculatorData.filter(p => parseFloat(p.percent) > 0);
        if (!candidates.length) {
            candidates = calculatorData.slice();
        }
        let maxAllowed = parseInputNumber(inputSum.dataset.max || '') || Infinity;
        let fits = candidates.filter(p => parseFloat(p.sum_max) <= maxAllowed);
        let pool = fits.length ? fits : candidates;
        let sorted = pool.slice().sort((a, b) => parseFloat(a.sum_max) - parseFloat(b.sum_max));
        let defaultPlan = sorted[Math.floor((sorted.length - 1) / 2)] || calculatorData[0];

        inputSum.value = defaultPlan.sum_max;
        inputTerm.value = defaultPlan.term_max;

        inputSum.dispatchEvent(new Event('input'));
        inputTerm.dispatchEvent(new Event('input'));

        calculate(parseFloat(defaultPlan.sum_max), parseFloat(defaultPlan.term_max));
    }

    function calculate(sum, term) {
        let plan = findPlan(sum, term);

        if (!plan) return

        sum = parseInputNumber(inputSum.value);
        term = parseInputNumber(inputTerm.value);

        if ($$('.overpayment-calculator-percent').length) {
            plan.percent = parseInputNumber($$('.overpayment-calculator-percent')[0].value);
        }
        let sumWithPercent = +(sum + (sum * plan.percent * term / 100)).toFixed(2);


        let pieElement = calculatorBlock.querySelector('.pie');
        // pieElement.style.setProperty('--p', 100 - plan.percent * term);
        pieElement.style.setProperty('--p', (sum / sumWithPercent) * 100);
        pieElement.querySelector('.overpayment-sum').innerHTML = formatPrice(sum);
        pieElement.querySelector('.overpayment-return-sum').innerHTML = formatPrice(sumWithPercent);

        let detailsElement = calculatorBlock.querySelector('.overpayment-calculator-details');

        detailsElement.querySelector('.result-sum').innerHTML = formatPrice(sum);
        //detailsElement.querySelector('.result-overpayment').innerHTML = +(sumWithPercent - sum).toFixed(2) + ' ₽';
        detailsElement.querySelector('.result-overpayment').innerHTML = formatPrice(sumWithPercent - sum);
        detailsElement.querySelector('.result-day-percent').innerHTML = plan.percent + '%';
        detailsElement.querySelector('.result-psk').innerHTML = plan.total_loan_cost;
        detailsElement.querySelector('.result-total-sum').innerHTML = formatPrice(sumWithPercent);

    }

    function findPlan(sum, term) {
        let lastPlanWithValidSum = null;

        for (const plan of Object(calculatorData).values()) {
            let isValidSum = sum >= plan.sum_min && sum <= plan.sum_max;
            let isValidTerm = term >= plan.term_min && term <= plan.term_max;

            if (isValidSum && isValidTerm) {
                return plan;
            }

            if (isValidSum) {
                lastPlanWithValidSum = plan;
            }
        }

        if (lastPlanWithValidSum) {

            inputTerm.value = inputTerm.value > lastPlanWithValidSum.term_max ? lastPlanWithValidSum.term_max : lastPlanWithValidSum.term_min;
            inputTerm.dispatchEvent(new Event('input'));

            return lastPlanWithValidSum;
        }

        return null;
    }
}

initOverpaymentCalculator();document.addEventListener('DOMContentLoaded', function () {
    let isMoved = false;

    if(window.innerWidth <= 1200 && !isMoved) {
        isMoved = true;
        moveElement('mobile');
    }

    window.addEventListener('resize', function () {
        if(window.innerWidth <= 1200 && !isMoved) {
            isMoved = true;
            moveElement('mobile');
        } else if(window.innerWidth > 1200 && isMoved) {
            isMoved = false
            moveElement();
        }
    });
});

function moveElement(type = '') {
    let leadText = document.querySelector('.lead-wrap .lead p');
    let authorBlock = document.querySelector('.author-module');
    let reviewsBannerBlock = document.querySelector('.reviews-banner');

    if(authorBlock == null || leadText == null || reviewsBannerBlock == null) {
        return;
    }

    let cloneAuthorBlock = authorBlock.cloneNode(true);
    authorBlock.remove();

    if(type == 'mobile') {
        leadText.insertAdjacentElement('afterend', cloneAuthorBlock);
    } else {
        reviewsBannerBlock.insertAdjacentElement('beforebegin', cloneAuthorBlock);
    }
}
/* table-compare-offers: клиентская сортировка столбцов.
   Кликабельные заголовки .main-td (кроме .without-sort) сортируют строки таблицы
   по значению столбца. Первый клик — по возрастанию, повторный — по убыванию.
   Числовые столбцы (сумма/срок/ставка) сортируются как числа, текстовые —
   локализованным сравнением. Исходный порядок с сервера (по рейтингу) сохраняется,
   пока пользователь не кликнет по заголовку. */
(function () {
    'use strict';

    function cellText(td) {
        if (!td) return '';
        if (td.hasAttribute('data-sortvalue')) return td.getAttribute('data-sortvalue');
        return (td.textContent || '').trim();
    }

    function toNumber(value) {
        if (value == null) return NaN;
        var normalized = String(value)
            .replace(/[   \s]/g, '') // обычные и узкие пробелы-разделители
            .replace(',', '.');
        var match = normalized.match(/-?\d+(?:\.\d+)?/);
        return match ? parseFloat(match[0]) : NaN;
    }

    function isNumericColumn(rows, idx) {
        var seen = 0;
        for (var i = 0; i < rows.length; i++) {
            var td = rows[i].children[idx];
            var value = cellText(td);
            if (value === '') continue;
            seen++;
            if (isNaN(toNumber(value))) return false;
        }
        return seen > 0;
    }

    function sortTable(table, idx, asc) {
        var tbody = table.tBodies[0];
        if (!tbody) return;

        var rows = Array.prototype.slice.call(tbody.rows);
        var numeric = isNumericColumn(rows, idx);

        // стабильная сортировка: запоминаем исходную позицию
        rows.forEach(function (row, i) { row._sortIndex = i; });

        rows.sort(function (a, b) {
            var av = cellText(a.children[idx]);
            var bv = cellText(b.children[idx]);
            var result;

            if (numeric) {
                var an = toNumber(av);
                var bn = toNumber(bv);
                an = isNaN(an) ? -Infinity : an;
                bn = isNaN(bn) ? -Infinity : bn;
                result = an - bn;
            } else {
                result = av.localeCompare(bv, 'ru', { numeric: true, sensitivity: 'base' });
            }

            if (result === 0) return a._sortIndex - b._sortIndex;
            return asc ? result : -result;
        });

        var frag = document.createDocumentFragment();
        rows.forEach(function (row) {
            delete row._sortIndex;
            frag.appendChild(row);
        });
        tbody.appendChild(frag);
    }

    function toggleSort(table, th, idx) {
        var asc = th.getAttribute('data-sort') !== 'asc';
        var headCells = table.tHead.querySelectorAll('th');

        Array.prototype.forEach.call(headCells, function (cell) {
            if (cell !== th) {
                cell.removeAttribute('data-sort');
                cell.removeAttribute('aria-sort');
            }
        });

        th.setAttribute('data-sort', asc ? 'asc' : 'desc');
        th.setAttribute('aria-sort', asc ? 'ascending' : 'descending');
        sortTable(table, idx, asc);
    }

    function initTable(table) {
        if (table._sortInit) return;
        var head = table.tHead;
        if (!head) return;
        var rows = table.tBodies[0] ? table.tBodies[0].rows.length : 0;
        if (rows < 2) return;

        table._sortInit = true;

        var headCells = head.querySelectorAll('th');
        Array.prototype.forEach.call(headCells, function (th, idx) {
            if (th.classList.contains('without-sort')) return;

            th.classList.add('is-sortable');
            th.setAttribute('role', 'button');
            th.setAttribute('tabindex', '0');

            th.addEventListener('click', function () {
                toggleSort(table, th, idx);
            });
            th.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                    toggleSort(table, th, idx);
                }
            });
        });
    }

    function boot() {
        var tables = document.querySelectorAll('.table-compare-offers table');
        Array.prototype.forEach.call(tables, initTable);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
function initMinimalCards() {

    let colorIconForDarkMode = '#b0a7a7';
    let colorIconForLightMode = '#0E1117';

    function checkCardsAddedToCompare() {
        if (window.CATEGORY_ID) {
            let cardsAddedToCompare = localStorage.getItem('vzo_compare_' + window.CATEGORY_ID);
            if (cardsAddedToCompare != null || cardsAddedToCompare === '') {
                let compareItemsArr = cardsAddedToCompare.split(',');
                compareItemsArr.forEach(el => {
                    let card = document.querySelector('.card-minimal[data-id="' + el + '"]');
                    if(card) {
                        card.querySelectorAll('.btn-compare path').forEach(path => {
                            path.setAttribute('stroke', '#4590f3');
                            path.classList.add('highlighted-path');
                        });
                        card.querySelectorAll('.btn-compare svg').forEach(svg => svg.classList.add('highlighted-icon'));
                    }
                });
            }
        }
    }
    checkCardsAddedToCompare();

    let cards = $$('.card-minimal');
    cards.forEach((item) => {
        addToCompareBtnsClick(item);
        initCardMoreBlock(item);
    });

    function addTabsSlider(card) {
        if(!card) return;
        let tabWrap = card.querySelector('.tab');
        let tabItems = card.querySelectorAll('.tab .tab-links');
        if(!tabWrap || !tabItems || typeof initDragScroll !== "function") return;

        tabWrap.classList.add('horizontal-drag-scroll');
        initDragScroll(tabWrap, tabItems);
    }

    function addToCompareBtnsClick (e, secondButton = false){
        let elem = e.getElementsByClassName('btn-compare')[0];
        if (secondButton) {
            elem = e.getElementsByClassName('btn-compare')[1];
        }

        if(elem !== undefined) {
            elem.onclick = (e) => {
                let currenColor = colorIconForLightMode;
                if ($$('body')[0].classList.contains('dark-mode')) {
                    currenColor = colorIconForDarkMode;
                }

                let categoryId = e.target.closest('.card').attributes['data-category'].value;
                let compareItems = localStorage.getItem('vzo_compare_' + Math.abs(categoryId));
                let compareItemsArr;
                if (compareItems == null || compareItems === '') {
                    compareItemsArr = Array();
                } else {
                    compareItemsArr = compareItems.split(',');
                    if (compareItemsArr.length === 50) {
                        alert('Нельзя добавлять более 50 карточек в сравнение');
                        return;
                    }
                }

                let id = e.target.closest('.card').attributes['data-id'].value;
                if (!compareItemsArr.includes(id)) {
                    // добавляем карточку к сравнению
                    compareItemsArr.push(id);
                    localStorage.setItem('vzo_compare_' + Math.abs(categoryId), compareItemsArr.join(','));

                    elem.querySelectorAll('path').forEach(path => {
                        path.setAttribute('stroke', '#4590f3');
                        path.classList.add('highlighted-path');
                    });
                    elem.querySelectorAll('svg').forEach(svg => svg.classList.add('highlighted-icon'));
                } else {
                    // убираем карточку из сравнения
                    compareItemsArr.splice(compareItemsArr.indexOf(id), 1);
                    (compareItemsArr.length === 0)
                        ? localStorage.removeItem('vzo_compare_' + Math.abs(categoryId))
                        : localStorage.setItem('vzo_compare_' + Math.abs(categoryId), compareItemsArr.join(','));

                    elem.querySelectorAll('path').forEach(path => {
                        path.setAttribute('stroke', currenColor);
                        path.classList.remove('highlighted-path');
                    });
                    elem.querySelectorAll('svg').forEach(svg => svg.classList.remove('highlighted-icon'));
                }

                if (typeof setCompareBlockDynamicData === 'function') {
                    let compareItemsCount = (typeof getCountAllCompareItems === 'function' ? getCountAllCompareItems() : 0);
                    setCompareBlockDynamicData(compareItemsCount);
                }
            }
        }
    }


    function initCardMoreBlock(card) {
        const showMoreButton = card.querySelector('.btn-more');
        if (!showMoreButton) return;
        // initMinimalCards() перезапускается после сортировки и подбора; карточки вне
        // перерисованного списка (блок «Лучшие») не должны получать второй обработчик.
        if (showMoreButton.dataset.vzoMoreBound) return;
        showMoreButton.dataset.vzoMoreBound = '1';

        showMoreButton.addEventListener('click', () => {
            loadDetailsModal(card).then((result) => {
                console.log(0);
                if (!result) return;
                hideScrollbar();

                const moreModal = card.querySelector('.card-more-block');

                moveCardHeaderToModal(card, moreModal);

                moreModal.classList.add('open');

                if (moreModal.dataset.inited) return;

                addTabsClick(card);
                addPrintBtnsClick(card, moreModal);
                checkCardsAddedToCompare();
                addToCompareBtnsClick(card, true);
                console.log(1);
                if ( typeof initTooltips === 'function') {
                    console.log(2);
                    initTooltips(moreModal);
                }

                card.querySelector('.card-more-block-close').addEventListener('click', () => {
                    moreModal.classList.remove('open');
                    showScrollbar();
                })

                moreModal.addEventListener('click', (e) => {
                    if (!e.target.closest('.card-more-block-container') && !e.target.classList.contains('card-more-block-container')) {
                        moreModal.classList.remove('open');
                        showScrollbar();
                    }
                });

                let modals = card.querySelectorAll('[data-modal]');
                modals.forEach(function (trigger) {
                    trigger.addEventListener('click', function (event) {
                        event.preventDefault();
                        let modal = document.getElementById(trigger.dataset.modal);
                        modal.classList.add('open');
                        hideScrollbar();
                    });
                });

                // VB accordion toggle (guarded — no-op for non-VB modals; other 8 categories unaffected)
                if (moreModal.classList.contains('card-more-block--vb')) {
                    moreModal.querySelectorAll('.vb-section-header').forEach((header) => {
                        header.addEventListener('click', () => {
                            const open = header.parentElement.classList.toggle('vb-section--open');
                            header.setAttribute('aria-expanded', open ? 'true' : 'false');
                        });
                    });
                    // VB footer overflow toggle (mobile only via CSS; desktop hides the trigger)
                    const vbOverflow = moreModal.querySelector('.vb-footer-overflow');
                    const vbActions = moreModal.querySelector('.vb-footer-actions');
                    if (vbOverflow && vbActions) {
                        vbOverflow.addEventListener('click', () => {
                            const open = vbActions.classList.toggle('open');
                            vbOverflow.setAttribute('aria-expanded', open ? 'true' : 'false');
                        });
                    }
                }

                moreModal.dataset.inited = 'true';
            })
        });

        function addPrintBtnsClick(card, modal) {
            let button = modal.querySelector('.print-btn');
            if (!button) return;
            let id = card.getAttribute('data-id');
            button.addEventListener('click', () => {
                if (id != null) {
                    window.open('/card-print/' + id, '_blank').focus();
                }
            });

        }


        function  addTabsClick(e) {
            let tabTabs = e.querySelectorAll('.tab .tab-links');
            let tabItems = e.querySelectorAll('.tabs-items .tab-content');
            for(let i =0;i<tabTabs.length;i++) {
                tabTabs.forEach((e)  => { e.classList.remove('on') });
                tabItems.forEach((e)  => { e.classList.remove('on') });
                tabTabs[0].classList.add('on');
                tabItems[0].classList.add('on');

                tabTabs[i].onclick = () => {
                    tabTabs.forEach((e)  => { e.classList.remove('on') });
                    tabItems.forEach((e)  => { e.classList.remove('on') });
                    tabTabs[i].classList.add('on');
                    tabItems[i].classList.add('on');
                }
            }
        }


        function moveCardHeaderToModal(card, modal) {
            if (modal.classList.contains('card-more-block--vb')) return; // VB renders its own header in Blade
            if (modal.querySelector('.card-more-block-header .card-min-top-block')) return;

            const cardTopBlock = card.querySelector('.card-min-top-block');
            let cardHeader = cardTopBlock.cloneNode(true);

            let headerGroup = document.createElement('div');
            headerGroup.className = 'f-card-min-col-group';

            let elementsToMove = cardHeader.querySelectorAll('.f-card-min-col:last-of-type, .f-card-min-rating');
            elementsToMove.forEach(element => {
                headerGroup.appendChild(element);
            });

            cardHeader.appendChild(headerGroup);

            modal.querySelector('.card-more-block-header').append(cardHeader);

            cardHeader.querySelectorAll('[data-modal-link]').forEach(item => {
                if (item.dataset.modalLink) {
                    item.href = item.dataset.modalLink;
                    return;
                }

                let span = document.createElement('span');

                span.innerHTML = item.innerHTML;
                span.className = item.className;

                item.parentNode.replaceChild(span, item);
            });
        }


    }


    async function loadDetailsModal(card) {
        if (card.querySelector('.card-more-block')) return true;

        const moreModalToLoad = card.querySelector('.card-more-block-to-load');

        if (!moreModalToLoad) return null;

        let result = await fetch('/actions/load_card_details_modal', {
            method: 'POST',
            body: JSON.stringify({
                cardId: moreModalToLoad.dataset.cardId,
                link: moreModalToLoad.dataset.link,
                onClick: moreModalToLoad.dataset.onClick,
                isMinimalCard: true,
            }),
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'X-CSRF-TOKEN': document.getElementsByName('csrf-token')[0].attributes[1].nodeValue
            },
        });

        result = await result.json();

        if (result.status !== 'ok') {
            return null;
        }

        moreModalToLoad.innerHTML = result.code;
        addTabsSlider(card);

        return true;
    }

}

initMinimalCards();

// VB modal focus trap + Esc handler (M-VB-MODAL-A11Y-FOCUS-TRAP, Q-98-2 follow-up of PR #100).
// Open-state selector adapted from ACK §C `:not([hidden])` to `.open` — this codebase toggles
// the modal via the `.open` class (initCardMoreBlock above adds/removes it); no element ever
// sets [hidden], so the literal selector would match all inline-card modals on page load.
(function () {
    var lastFocusedElement = null;
    var activeModal = null;
    function getFocusableElements(modal) {
        return modal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
    }
    function trapFocus(e) {
        if (!activeModal || e.key !== 'Tab') return;
        var focusable = getFocusableElements(activeModal);
        if (focusable.length === 0) return;
        var firstEl = focusable[0];
        var lastEl = focusable[focusable.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === firstEl) { lastEl.focus(); e.preventDefault(); }
        } else {
            if (document.activeElement === lastEl) { firstEl.focus(); e.preventDefault(); }
        }
    }
    function handleEsc(e) {
        if (activeModal && e.key === 'Escape') {
            var closeBtn = activeModal.querySelector('.vb-close, [aria-label*="Закрыть"], [data-close]');
            if (closeBtn) closeBtn.click();
        }
    }
    var observer = new MutationObserver(function () {
        var modals = document.querySelectorAll('.card-more-block--vb.open');
        if (modals.length > 0 && !activeModal) {
            lastFocusedElement = document.activeElement;
            activeModal = modals[0];
            var closeBtn = activeModal.querySelector('.vb-close, [aria-label*="Закрыть"]');
            if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 50);
            document.addEventListener('keydown', trapFocus);
            document.addEventListener('keydown', handleEsc);
        } else if (modals.length === 0 && activeModal) {
            document.removeEventListener('keydown', trapFocus);
            document.removeEventListener('keydown', handleEsc);
            if (lastFocusedElement) { lastFocusedElement.focus(); lastFocusedElement = null; }
            activeModal = null;
        }
    });
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class', 'aria-hidden'] });
    }
})();
document.addEventListener('DOMContentLoaded', function() {

    let colorIconForDarkMode = '#b0a7a7';
    let colorIconForLightMode = '#0E1117';

    const clearCompareButton = $$('.clear-compare')[0];
    if (clearCompareButton) {
        clearCompareButton.addEventListener('click', function() {
            let currenColor = colorIconForLightMode;
            if ($$('body')[0].classList.contains('dark-mode')) {
                currenColor = colorIconForDarkMode;
            }

            $$('.card').forEach(card => {
                card.querySelectorAll('.btn-compare path').forEach(path => {
                    path.classList.remove('highlighted-path');
                    path.setAttribute('stroke', currenColor);
                });
                card.querySelectorAll('.btn-compare svg').forEach(svg => svg.classList.remove('highlighted-icon'));
            });

            for (let i = 1; i < 15; i++) {
                localStorage.removeItem("vzo_compare_" + i);
            }

            setCompareBlockDynamicData(0);
        });
    }

    let compareItemsCount = 0;

    // Если CATEGORY_ID существует и является числом
    // if (typeof window.CATEGORY_ID !== 'undefined' && !isNaN(window.CATEGORY_ID)) {
    //     let compareItemsByCat = localStorage.getItem('vzo_compare_' + window.CATEGORY_ID);
    //     if (compareItemsByCat) {
    //         // Если карточки есть в категории, считаем их
    //         compareItemsCount = compareItemsByCat.split(',').length;
    //     } else {
    //         // Если карточек в этой категории нет, считаем все карточки
    //         compareItemsCount = getCountAllCompareItems();
    //     }
    // } else {
    //     // Если CATEGORY_ID не задан или не число, считаем все карточки
    //     compareItemsCount = getCountAllCompareItems();
    // }

    compareItemsCount = getCountAllCompareItems();
    setCompareBlockDynamicData(compareItemsCount);
});

function getCountAllCompareItems() {
    let totalCount = 0;
    for (let i = 1; i < 15; i++) {
        let compareItemsByCat = localStorage.getItem('vzo_compare_' + i);
        if (compareItemsByCat) {
            totalCount += compareItemsByCat.split(',').length; // добавляем количество карточек из каждой категории
        }
    }
    return totalCount;
}

function setCompareBlockDynamicData(count) {
    const compareBlock = $$('.compare-block')[0];
    const countElement = $$('.count-of-comparing-items')[0];
    const compareItemsCountBlock = $$('.compare-items-count')[0];
    if (!compareBlock || !countElement || !compareItemsCountBlock) {
        return;
    }

    const compareItemsMenuItem = compareItemsCountBlock.closest('.more-info-el');

    if (count > 0) {
        compareBlock.style.display = 'block';
        if (compareItemsMenuItem) {
            compareItemsMenuItem.classList.remove('hiddenStyle');
        }
        compareItemsCountBlock.style.display = 'flex';
    } else {
        if (compareItemsMenuItem) {
            compareItemsMenuItem.classList.add('hiddenStyle');
        }
        compareItemsCountBlock.style.display = 'none';
        compareBlock.style.display = 'none';
    }

    compareItemsCountBlock.innerHTML = count;
    countElement.innerHTML = count;
}
let jsSelectBody = $$(".claim-select");
for (let i = 0; i < jsSelectBody.length; i++) {
    let selEl = jsSelectBody[i].getElementsByTagName("select")[0];
    let selItem = document.createElement("div");
    selItem.setAttribute("class", "selected-item");
    selItem.setAttribute("tabindex", "0");
    selItem.setAttribute("role", "button");
    selItem.setAttribute("aria-haspopup", "listbox");
    selItem.innerHTML = selEl.options[selEl.selectedIndex].innerHTML;
    jsSelectBody[i].appendChild(selItem);
    let selItems = document.createElement("div");
    selItems.setAttribute("class", "select-items select-hide");
    for (let j = 1; j < selEl.length; j++) {
        let selItemEl = document.createElement("div");
        selItemEl.innerHTML = selEl.options[j].innerHTML;
        selItemEl.addEventListener("click", function(e) {
            let selItemElPar = this.parentNode.parentNode.getElementsByTagName("select")[0];
            let prevSelItemEl = this.parentNode.previousSibling;
            for (let i = 0; i < selItemElPar.length; i++) {
                if (selItemElPar.options[i].innerHTML === this.innerHTML) {
                    selItemElPar.selectedIndex = i;
                    prevSelItemEl.innerHTML = this.innerHTML;
                    let selectedEl = this.parentNode.getElementsByClassName("same-as-selected");
                    for (let k = 0; k < selectedEl.length; k++) {
                        selectedEl[k].removeAttribute("class");
                    }
                    this.setAttribute("class", "same-as-selected");
                    break;
                }
            }
            prevSelItemEl.click();
        });
        selItems.appendChild(selItemEl);
    }
    jsSelectBody[i].appendChild(selItems);
    selItem.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            selItem.click();
        }
    });
    selItem.addEventListener("click", function(e) {
        e.stopPropagation();
        closeAllSelect(this);
        this.nextSibling.classList.toggle("select-hide");
        this.classList.toggle("select-arrow-active");
    });
}


function closeAllSelect(el) {
    let arrSel = [];
    let jsSelectItems = $$(".select-items");
    let jsSelectedItem = $$(".selected-item")[0];
    if(jsSelectedItem != undefined && jsSelectedItem.length != 0) {
        for (let i = 0; i < jsSelectedItem.length; i++) {
            if (el == jsSelectedItem[i]) {
                arrSel.push(i)
            } else {
                jsSelectedItem[i].classList.remove("select-arrow-active");
                if (arrSel.indexOf(i)) {
                    jsSelectItems[i].classList.add("select-hide");
                }
            }
        }
    }
}
document.addEventListener("click", closeAllSelect);

if($$('.select-items').length != 0) {
    var selectItemsArr = $$('.select-items')[0].childNodes,
        hiddenBlock = $$('.hidden-claim-el')[0];
    for (let i = 0;i<selectItemsArr.length;i++) {
        selectItemsArr[i].addEventListener('click', function () {
            if (selectItemsArr[i].textContent === 'Другое') {
                hiddenBlock.style.display = 'block';
            } else
                hiddenBlock.style.display = 'none';
        }, false)
    }
}

var modalComplain = $$('#modalComplainForm');
if(modalComplain.length !=0) {

    let modalComplainBlock = document.querySelector('.modal-block[id="modal-complain"]');
    let modalComplainExits = modalComplainBlock.querySelectorAll('.modal-exit');
    modalComplainExits.forEach(function (exitItem){
        exitItem.addEventListener('click', function (e){
            e.preventDefault();
            modalComplainBlock.classList.remove('open');
        });
    });

    modalComplain[0].addEventListener('submit',function (e) {
        e.preventDefault();
        var type_complaint = $$('#modal-complain .selected-item')[0].innerText;
        var comment = $$('.hidden-claim-el')[0].value;
        var isEmail = $$('.isEmail')[0].value;
        if (isEmail == ''){
            $$('.email-confirm')[0].style.display = "block";
            return false;
        }

        console.log(type_complaint);

        if (type_complaint === 'Выберите тип жалобы') {
            alert('Выберите тип жалобы');
            return false;
        }

        if (type_complaint === 'Другое' && comment == '') {
            alert('Вы не указали причину жалобы');
            return false;
        }

        grecaptcha.confirmed(function () {
            let data = {
                '_token': document.getElementsByName('csrf-token')[0].attributes[1].nodeValue,
                'g-recaptcha-response': grecaptcha.getResponse(),
                'h1': ($$('.org-title').length != 0) ? $$('.org-title')[0].innerHTML.trim() : '',
                'type_complaint': type_complaint,
                'email': $$('#ttt')[0].value,
                'comment': comment
            };

            fetch('/forms/phone_complaint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(data)
            }).then((res) => {
                $$('#modal-complain')[0].classList.remove('open');
                var modalBack =  $$('#modal-back')[0];
                modalBack.classList.add('open');
                let exits = [].slice.call(modalBack.getElementsByClassName('modal-exit'));
                exits.forEach(function (exit) {
                    exit.addEventListener('click', function (event) {
                        event.preventDefault();
                        modalBack.classList.remove('open');
                    });
                });
                grecaptcha.reset();
            }).catch((err) => {
                console.log(err);
                grecaptcha.reset();
            });
        })
        
        return false;
    })
}
if($$('.isEmail').length != 0){
    $$('.isEmail')[0].addEventListener('input',function () {
        if ($$('.email-confirm')[0].style.display = "block") {
            $$('.email-confirm')[0].style.display = "none";
        }
    })
}


if(document.querySelectorAll('.bank-listing-links-block').length !== 0) {

    document.querySelectorAll('.bank-listing-links-block').forEach(listingBlock => {
        let banksListingHiddenLinks = listingBlock.querySelectorAll('.bank-listing-link.hiddenStyle');
        let banksListingLinksShowMore = listingBlock.querySelector('.bank-listing-links-more');

        if (banksListingLinksShowMore) {
            let banksListingLinksShowLess = listingBlock.querySelector('.bank-listing-links-less');

            banksListingLinksShowMore.addEventListener('click', function () {
                banksListingHiddenLinks.forEach((listingLink) => {
                    listingLink.classList.remove('hiddenStyle');
                })
                banksListingLinksShowLess.classList.remove('hiddenStyle');
                banksListingLinksShowMore.classList.add('hiddenStyle');
            })

            banksListingLinksShowLess.addEventListener('click', function () {
                banksListingHiddenLinks.forEach((listingLink) => {
                    listingLink.classList.add('hiddenStyle');
                })
                banksListingLinksShowLess.classList.add('hiddenStyle');
                banksListingLinksShowMore.classList.remove('hiddenStyle');
            })
        }
    });

}
document.addEventListener('DOMContentLoaded', function() {
    const ratingContainer = document.querySelector('.rating');

    if (ratingContainer && !ratingContainer.classList.contains('no-rate-poss')) {
        const iconsWrap = ratingContainer.querySelector('.icons-wrap');
        const svgStars = iconsWrap.querySelectorAll('svg');

        // Сохраняем начальное состояние fill для каждой звезды
        const initialFillStyles = Array.from(svgStars).map(star => {
            const path = star.querySelector('path');
            return path.style.fill;
        });

        // Функция для восстановления начального состояния
        const restoreInitialState = () => {
            svgStars.forEach((star, index) => {
                const path = star.querySelector('path');
                // Удаляем временные стили, если они есть
                path.removeAttribute('style');

                // Восстанавливаем сохранённое начальное значение fill
                path.style.fill = initialFillStyles[index];

                // Если это половинчатая звезда, нужно заново добавить defs
                if (initialFillStyles[index].includes('url(#rate_')) {
                    // Важно: нужно найти правильный id градиента
                    const gradId = initialFillStyles[index].match(/url\(#(.*?)\)/)[1];
                    let defs = star.querySelector('defs');
                    if (!defs) {
                        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
                        star.prepend(defs);

                        const linearGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
                        linearGradient.setAttribute('id', gradId);
                        linearGradient.setAttribute('x1', '0');
                        linearGradient.setAttribute('y1', '0');
                        linearGradient.setAttribute('x2', '25');
                        linearGradient.setAttribute('y2', '0');
                        linearGradient.setAttribute('gradientUnits', 'userSpaceOnUse');

                        const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
                        stop1.setAttribute('offset', '50%');
                        stop1.setAttribute('stop-color', '#F29100');

                        const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
                        stop2.setAttribute('offset', '50%');
                        stop2.setAttribute('stop-color', '#E5E5E5');

                        linearGradient.appendChild(stop1);
                        linearGradient.appendChild(stop2);
                        defs.appendChild(linearGradient);
                    }
                }
            });
        };

        // Обработчик для наведения курсора
        iconsWrap.addEventListener('mouseover', (e) => {
            const star = e.target.closest('svg');
            if (!star) return;

            const selectedRating = parseInt(star.dataset.item, 10);

            // Заливаем звёзды до выбранного значения
            svgStars.forEach((s, index) => {
                const path = s.querySelector('path');

                if (index < selectedRating) {
                    path.style.fill = '#F29100'; // Цвет полной звезды при наведении
                } else {
                    path.style.fill = '#F7F7F7'; // Цвет пустой звезды
                }
            });
        });

        // Обработчик для ухода курсора
        iconsWrap.addEventListener('mouseout', () => {
            restoreInitialState();
        });

        // Обработчик для клика (голосования)
        iconsWrap.addEventListener('click', (e) => {
            const star = e.target.closest('svg');
            if (!star) return;

            const selectedRating = star.dataset.item;
            const data = {
                '_token': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'rating': selectedRating,
                'id': iconsWrap.dataset.id,
                'type': iconsWrap.dataset.type,
            };

            fetch('/forms/rating_add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                    'X-CSRF-TOKEN': data._token
                },
                body: JSON.stringify(data)
            })
                .then(res => res.text())
                .then(value => {
                    const ratingDiv = document.querySelector('.rating');
                    if (ratingDiv) {
                        iconsWrap.remove();
                        ratingDiv.querySelector('.rating-val').remove();
                        ratingDiv.innerHTML += `<div class="result-rating-vote">${value}</div>`;
                    }
                })
                .catch(err => {
                    console.error('Ошибка при отправке рейтинга:', err);
                });
        });
    }
});// (function(){
//     let loadCards = function() {
//         let loadBtn = $$('#load_more');
//         if (loadBtn.length === 0) {
//             return;
//         }
//         loadBtn.addEventListener()
//     }
//
//     loadCards();
// })();

(function(){
    function initTagsListSlider() {
        let tagsListWrap = document.querySelector('.tags-list');
        if(!tagsListWrap) return;
        let tagsLinks = tagsListWrap.querySelectorAll('a');
        initDragScroll(tagsListWrap, tagsLinks);
    }

    function initBestCardsSlider() {
        let bestCardsWrap = document.querySelector('.bests-offers-inner');
        if(!bestCardsWrap) return;
        bestCardsWrap.classList.add('horizontal-drag-scroll');
        let bestCards = bestCardsWrap.querySelectorAll('.card-minimal');
        initDragScroll(bestCardsWrap, bestCards);
    }

    function initMfoSlider() {
        let mfoCardsWrap = document.querySelector('.mfo-compact-inner');
        if(!mfoCardsWrap) return;
        mfoCardsWrap.classList.add('horizontal-drag-scroll');
        let mfoCards = mfoCardsWrap.querySelectorAll('.mfo-compact');
        initDragScroll(mfoCardsWrap, mfoCards);
    }

    function initReviewsSlider() {
        let reviewsWrap = document.querySelector('.reviews');
        if(!reviewsWrap) return;
        reviewsWrap.classList.add('horizontal-drag-scroll');
        let reviewsCards = reviewsWrap.querySelectorAll('.review');
        initDragScroll(reviewsWrap, reviewsCards);
    }

    function initEmployeesSlider() {
        let employeesWrap = document.querySelector('.employee-short-card-inner');
        if(!employeesWrap) return;
        employeesWrap.classList.add('horizontal-drag-scroll');
        let employeesCards = employeesWrap.querySelectorAll('.employee-short-card');
        initDragScroll(employeesWrap, employeesCards);
    }

    initTagsListSlider();
    initBestCardsSlider();
    initMfoSlider();
    initReviewsSlider();
    initEmployeesSlider();
})();let getCurrentDate = () => {
    let Data = new Date();
    let year = Data.getFullYear();
    let Month = Data.getMonth();
    let month = Month < 9 ? '0' + (Month + 1) : Month + 1;
    let day = Data.getDate();
    return [day, month, year];
}

let wordDeclension = (val, el) => {
    val = Math.abs(val) % 100;
    let sumVal = val % 10;
    if(val > 10 && val < 20){
        return el[2];
    }
    if(sumVal > 1 && sumVal < 5){
        return el[1];
    }
    if(sumVal === 1){
        return el[0];
    }
    return el[2];
}

var hiddenRecaptchaCallback = function () {
    console.log('captcha not loaded');
}


function maybeInitHiddenRecaptcha() {
    if (!document.querySelector(".g-recaptcha[data-size='invisible']")) {
        loadCaptchaScripts();
        initHiddenRecaptcha();
    }
}

// The login form initialises immediately (no user gesture needed there).
if (document.querySelector('.g-hidden-recaptcha-login')) {
    maybeInitHiddenRecaptcha();
}

// Every other hidden-captcha form initialises on first interaction. `mouseenter`
// alone misses keyboard users (focusin) and touch users (pointerdown/touchstart),
// whose submit would otherwise throw "grecaptcha is not defined".
['mouseenter', 'focusin', 'pointerdown', 'touchstart'].forEach(function (evt) {
    document.querySelectorAll('.g-hidden-recaptcha, .captcha-submit').forEach(function (item) {
        item.addEventListener(evt, maybeInitHiddenRecaptcha, { passive: true });
    });
});

function loadCaptchaScripts() {
    let scriptEl = document.createElement("script");
    scriptEl.src = 'https://www.google.com/recaptcha/api.js';
    document.head.appendChild(scriptEl);
}

function initHiddenRecaptcha() {
    let hiddenCaptchaElement = document.createElement('div');
    hiddenCaptchaElement.classList.add('g-recaptcha');
    hiddenCaptchaElement.dataset.sitekey = '6LdyDPQjAAAAAApILG4zu-QDa9h4UsVLCzlwrC_Q';
    hiddenCaptchaElement.dataset.callback = 'hiddenRecaptchaCallback';
    hiddenCaptchaElement.dataset.size = 'invisible';
    hiddenCaptchaElement.style.position = 'absolute';
    hiddenCaptchaElement.style.top = '0';
    // Clip the injected container to a 0×0 off-screen box. When reCAPTCHA can't
    // reach Google (ad-blockers, restricted networks) it renders a "Could not
    // connect to the reCAPTCHA service" message INSIDE this div, which sits at
    // the top of <body> and painted over the header. The invisible challenge is
    // a separate overlay Google appends to <body>, so clipping this container
    // hides the error without affecting the challenge/token flow.
    hiddenCaptchaElement.style.left = '-9999px';
    hiddenCaptchaElement.style.width = '0';
    hiddenCaptchaElement.style.height = '0';
    hiddenCaptchaElement.style.overflow = 'hidden';
    document.body.appendChild(hiddenCaptchaElement);

    if(typeof grecaptcha === 'undefined') {
        grecaptcha = {};
    }
    grecaptcha.ready = function(cb){
        if(typeof grecaptcha === 'undefined') {
            // window.__grecaptcha_cfg is a global variable that stores reCAPTCHA's
            // configuration. By default, any functions listed in its 'fns' property
            // are automatically executed when reCAPTCHA loads.
            const c = '___grecaptcha_cfg';
            window[c] = window[c] || {};
            (window[c]['fns'] = window[c]['fns']||[]).push(cb);
        } else {
            cb();
        }
    }

    grecaptcha.ready(function () {
        grecaptcha.confirmed = function (callback) {
            hiddenCaptchaElement.style.top = (document.documentElement.scrollTop + 30) + 'px';
            grecaptcha.executed = callback;
            grecaptcha.execute();
        };
    });

    hiddenRecaptchaCallback = function () {
        grecaptcha.executed();
    };

    document.querySelectorAll('.captcha-submit').forEach(button => {
        let form = button.closest('form');

        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // grecaptcha.confirmed is defined slightly before Google's own
            // grecaptcha.execute/getResponse, so wait for the full API before
            // firing — otherwise a fast (keyboard/touch) submit that only just
            // triggered the loader throws "grecaptcha.execute is not a function".
            whenHiddenCaptchaReady(function () {
                grecaptcha.confirmed(function () {
                    let input = document.createElement("input");
                    input.type = "hidden";
                    input.name = "g-recaptcha-response";
                    input.value = grecaptcha.getResponse();
                    form.appendChild(input);

                    form.submit();
                })
            });
        });
    })
}

function hiddenCaptchaApiReady() {
    return typeof grecaptcha !== 'undefined'
        && typeof grecaptcha.confirmed === 'function'
        && typeof grecaptcha.execute === 'function'
        && typeof grecaptcha.getResponse === 'function';
}

function whenHiddenCaptchaReady(callback) {
    maybeInitHiddenRecaptcha();
    let waited = 0;
    (function poll() {
        if (hiddenCaptchaApiReady()) {
            callback();
        } else if (waited < 8000) {
            waited += 100;
            setTimeout(poll, 100);
        }
    })();
}


function addButtonClickHendler ()
{
    $$('button[data-href]').forEach((button) => {
        button.addEventListener('click', () => {
            let link = button.getAttribute('data-href');

            if (link) {
                window.open(link, '_blank').focus();
            }
        });
    });
}

addButtonClickHendler();

function accessibilityHandler(event, el) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault(); // предотвращаем прокрутку страницы при нажатии пробела
        console.log(event);
        console.log(el);
        el.click();
        //toggleSubmenu();
    }
}

function disableScroll() {
    document.body.style.top = `-${window.pageYOffset}px`;
    document.body.classList.add('fixed-body');
}

function enableScroll() {
    let scrollPosition = Math.abs(parseInt(document.body.style.top));
    document.body.classList.remove('fixed-body');
    document.body.style.removeProperty('top');
    window.scrollTo(0, scrollPosition);
}

/* vzo29-14-native-rail-controls — начало (стрелки и клавиатура для нативных горизонтальных лент) */
(function () {
    'use strict';

    if (typeof window === 'undefined' || typeof document === 'undefined' || !document.querySelectorAll) {
        return;
    }

    var RAIL_SELECTOR = '.employee-short-card-wrap > .employee-short-card-inner, .flamp-slider-wrap > .flamp-slider, .bests-offers-wrap > .bests-offers-inner, .mfo-compact-wrap > .mfo-compact-inner, .reviews-wrap > .reviews-list, .about-page .employee-short-card-wrap, .slider-smi-wrap > .slider-smi, .k5m-slider-wrap > .k5m-slider, .webinars-wrap > .webinar-slider, .reviews-education-wrap > .course-reviews-slider, .bank-page .cards-wrap, .bank-category-page .cards-wrap, .bank-product-page .cards-wrap, .company-page .card-minimal-wrap-cards';
    var READY_CLASS = 'vzo-rail-ready';
    var READY_ATTR = 'data-vzo-rail';
    var EDGE_TOLERANCE = 2;
    var SVG_NS = 'http://www.w3.org/2000/svg';
    var idSeed = 0;
    var states = [];
    var pendingRails = [];
    var initialized = false;

    var raf = window.requestAnimationFrame
        ? function (cb) { return window.requestAnimationFrame(cb); }
        : function (cb) { return window.setTimeout(cb, 16); };

    function scrollBehavior() {
        var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        return reduce ? 'auto' : 'smooth';
    }

    // Улучшаем только реальные горизонтальные ленты; гриды (страницы «О нас») не трогаем.
    function canScrollX(rail) {
        var overflowX = window.getComputedStyle(rail).overflowX;
        return overflowX === 'auto' || overflowX === 'scroll';
    }

    function maxScroll(rail) {
        return Math.max(0, rail.scrollWidth - rail.clientWidth);
    }

    function cleanText(node) {
        return node ? (node.textContent || '').replace(/\s+/g, ' ').trim() : '';
    }

    // Ближайший предшествующий заголовок h2 (не дальше нескольких уровней вверх).
    function findHeading(rail) {
        var node = rail;
        for (var depth = 0; node && node !== document.body && depth < 4; depth++) {
            var sibling = node.previousElementSibling;
            while (sibling) {
                if (sibling.matches && sibling.matches('h2, .h2')) {
                    return sibling;
                }
                var nested = sibling.querySelectorAll ? sibling.querySelectorAll('h2, .h2') : [];
                if (nested.length) {
                    return nested[nested.length - 1];
                }
                sibling = sibling.previousElementSibling;
            }
            node = node.parentElement;
        }
        return null;
    }

    function uniqueId() {
        var id;
        do {
            idSeed += 1;
            id = 'vzo-rail-' + idSeed;
        } while (document.getElementById(id));
        return id;
    }

    function readGap(rail) {
        var style = window.getComputedStyle(rail);
        var gap = parseFloat(style.columnGap || style.gap);
        return isFinite(gap) ? gap : 0;
    }

    function focusNoScroll(el) {
        try {
            el.focus({ preventScroll: true });
        } catch (e) {
            el.focus();
        }
    }

    function createChevron(direction) {
        var svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '20');
        svg.setAttribute('height', '20');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        var path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', direction < 0 ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(path);
        return svg;
    }

    function createButton(direction, label, railId) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn vzo-rail-btn ' + (direction < 0 ? 'vzo-rail-btn-prev' : 'vzo-rail-btn-next');
        button.setAttribute('aria-label', label);
        button.setAttribute('aria-controls', railId);
        button.appendChild(createChevron(direction));
        return button;
    }

    // Добавляем атрибут, только если его не было; запоминаем, что он наш.
    function addAttr(state, name, value) {
        if (state.added[name] || state.rail.hasAttribute(name)) {
            return;
        }
        state.rail.setAttribute(name, value);
        state.added[name] = true;
    }

    function dropAttr(state, name) {
        if (!state.added[name]) {
            return;
        }
        state.rail.removeAttribute(name);
        state.added[name] = false;
    }

    function applyFocusable(state, active) {
        var rail = state.rail;
        if (active) {
            addAttr(state, 'tabindex', '0');
            var labelled = rail.hasAttribute('aria-label') || rail.hasAttribute('aria-labelledby');
            if (!labelled && state.headingText) {
                if (state.heading && state.heading.id) {
                    addAttr(state, 'aria-labelledby', state.heading.id);
                } else {
                    addAttr(state, 'aria-label', state.headingText);
                }
                labelled = true;
            }
            if (labelled) {
                addAttr(state, 'role', 'region');
            }
        } else {
            // Нет переполнения: убираем только то, что добавили сами (без мёртвой табостановки).
            dropAttr(state, 'tabindex');
            dropAttr(state, 'role');
            dropAttr(state, 'aria-labelledby');
            dropAttr(state, 'aria-label');
        }
    }

    function disableKeepingFocus(button, fallback, rail) {
        if (button.disabled) {
            return;
        }
        if (document.activeElement === button) {
            if (!fallback.disabled) {
                focusNoScroll(fallback);
            } else if (rail.hasAttribute('tabindex')) {
                focusNoScroll(rail);
            }
        }
        button.disabled = true;
    }

    function update(state) {
        state.frame = 0;
        var rail = state.rail;
        if (!rail.isConnected && rail.isConnected !== undefined) {
            return;
        }
        var max = maxScroll(rail);
        var active = canScrollX(rail) && max > EDGE_TOLERANCE;

        state.controls.hidden = !active;
        rail.classList.toggle(READY_CLASS, active);
        applyFocusable(state, active);

        if (!active) {
            state.pending = null;
            return;
        }

        var pos = rail.scrollLeft;
        var atStart = pos <= EDGE_TOLERANCE;
        var atEnd = pos >= max - EDGE_TOLERANCE;

        // Сначала включаем, затем выключаем, чтобы фокус было куда перенести.
        if (!atStart) { state.prev.disabled = false; }
        if (!atEnd) { state.next.disabled = false; }
        if (atStart) { disableKeepingFocus(state.prev, state.next, rail); }
        if (atEnd) { disableKeepingFocus(state.next, state.prev, rail); }
    }

    function schedule(state) {
        if (state.frame) {
            return;
        }
        state.frame = raf(function () {
            update(state);
        });
    }

    // Home/End: удерживаем край ограниченное число кадров, пока не погаснет
    // незавершённая плавная прокрутка (Chromium может продолжить её после instant).
    var BOUNDARY_MAX_FRAMES = 90;
    var BOUNDARY_STABLE_FRAMES = 8;
    var BOUNDARY_TOLERANCE = 1;

    function boundaryTarget(state) {
        return state.boundary && state.boundary.end ? maxScroll(state.rail) : 0;
    }

    // Возвращает true, если пришлось вернуть ленту на край.
    function holdBoundary(state) {
        var hold = state.boundary;
        if (!hold) {
            return false;
        }
        var rail = state.rail;
        var target = boundaryTarget(state);
        if (Math.abs(rail.scrollLeft - target) > BOUNDARY_TOLERANCE) {
            rail.scrollLeft = target;
            hold.stable = 0;
            return true;
        }
        return false;
    }

    function tickBoundary(state, hold) {
        if (state.boundary !== hold) {
            return; // удержание отменено или заменено новым
        }
        hold.frames += 1;
        if (!holdBoundary(state)) {
            hold.stable += 1;
        }
        if (hold.stable >= BOUNDARY_STABLE_FRAMES || hold.frames >= BOUNDARY_MAX_FRAMES) {
            state.boundary = null;
            schedule(state);
            return;
        }
        raf(function () { tickBoundary(state, hold); });
    }

    function cancelBoundary(state) {
        state.boundary = null;
    }

    function jumpToEdge(state, end) {
        var rail = state.rail;
        window.clearTimeout(state.pendingTimer);
        state.pending = null;
        var hold = { end: end, frames: 0, stable: 0 };
        state.boundary = hold;
        var target = boundaryTarget(state);
        if (typeof rail.scrollTo === 'function') {
            try {
                rail.scrollTo({ left: target, behavior: 'instant' });
            } catch (e) {
                // ниже выставим напрямую
            }
        }
        if (Math.abs(rail.scrollLeft - target) > BOUNDARY_TOLERANCE) {
            rail.scrollLeft = target;
        }
        schedule(state);
        raf(function () { tickBoundary(state, hold); });
    }

    // mode === 'instant': мгновенный переход, прерывает текущую плавную прокрутку.
    function scrollToPosition(state, target, mode) {
        state.boundary = null;
        var rail = state.rail;
        var max = maxScroll(rail);
        target = Math.max(0, Math.min(max, Math.round(target)));
        var behavior = mode === 'instant' ? 'instant' : scrollBehavior();

        state.pending = behavior === 'smooth' ? target : null;
        window.clearTimeout(state.pendingTimer);
        state.pendingTimer = window.setTimeout(function () {
            state.pending = null;
        }, 700);

        if (typeof rail.scrollTo === 'function') {
            try {
                rail.scrollTo({ left: target, behavior: behavior });
            } catch (e) {
                rail.scrollLeft = target;
            }
        } else {
            rail.scrollLeft = target;
        }
        schedule(state);
    }

    // Шаг = видимая ширина минус gap; при быстрых кликах считаем от ожидаемой цели (clamp).
    function step(state, direction) {
        var rail = state.rail;
        var page = Math.max(1, rail.clientWidth - readGap(rail));
        var base = state.pending !== null ? state.pending : rail.scrollLeft;
        scrollToPosition(state, base + direction * page);
    }

    function onKeydown(state, event) {
        // Только когда фокус на самой ленте: ссылки/формы внутри не перехватываем.
        if (event.target !== state.rail || state.controls.hidden) {
            return;
        }
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
            return;
        }
        switch (event.key) {
            case 'ArrowLeft':
                step(state, -1);
                break;
            case 'ArrowRight':
                step(state, 1);
                break;
            case 'Home':
                jumpToEdge(state, false);
                break;
            case 'End':
                jumpToEdge(state, true);
                break;
            default:
                return;
        }
        event.preventDefault();
    }

    function enhance(rail) {
        if (rail.getAttribute(READY_ATTR) === 'ready') {
            return true;
        }
        var parent = rail.parentNode;
        if (!parent || !canScrollX(rail)) {
            return false;
        }

        var controls = null;
        var head = null;
        try {
            var railLabel = rail.getAttribute('data-vzo-rail-label');
            var heading = railLabel ? null : findHeading(rail);
            var headingText = railLabel ? railLabel.replace(/\s+/g, ' ').trim() : cleanText(heading);
            if (!rail.id) {
                rail.id = uniqueId();
            }
            var suffix = headingText ? ': ' + headingText : '';
            var prev = createButton(-1, 'Предыдущие карточки' + suffix, rail.id);
            var next = createButton(1, 'Следующие карточки' + suffix, rail.id);

            controls = document.createElement('div');
            controls.className = 'vzo-rail-controls';
            controls.hidden = true;
            controls.appendChild(prev);
            controls.appendChild(next);

            var state = {
                rail: rail,
                controls: controls,
                prev: prev,
                next: next,
                heading: heading,
                headingText: headingText,
                added: {},
                pending: null,
                pendingTimer: 0,
                boundary: null,
                frame: 0
            };

            prev.addEventListener('click', function () { step(state, -1); });
            next.addEventListener('click', function () { step(state, 1); });
            rail.addEventListener('keydown', function (event) { onKeydown(state, event); });
            rail.addEventListener('scroll', function () {
                // Синхронно возвращаем на край, если старая анимация сдвинула ленту.
                holdBoundary(state);
                if (state.pending !== null && Math.abs(rail.scrollLeft - state.pending) <= EDGE_TOLERANCE) {
                    state.pending = null;
                }
                schedule(state);
            }, { passive: true });
            rail.addEventListener('scrollend', function () {
                state.pending = null;
                schedule(state);
            }, { passive: true });

            // Пользовательский ввод отменяет удержание края, чтобы не мешать ручной прокрутке.
            ['wheel', 'touchstart', 'pointerdown'].forEach(function (evt) {
                rail.addEventListener(evt, function () { cancelBoundary(state); }, { passive: true });
            });
            // Фокус на потомке ленты (Tab к ссылке/кнопке) отменяет удержание, чтобы не
            // отменять нативную автопрокрутку к элементу; фокус на самой ленте не трогаем.
            rail.addEventListener('focusin', function (event) {
                if (event.target !== rail) {
                    cancelBoundary(state);
                }
            });

            // Кнопки справа в строке заголовка, если заголовок стоит прямо над лентой.
            // Иначе прежнее место: отдельным блоком над лентой, без наложения на карточки.
            head = placeControls(controls, heading, rail);
            if (!head) {
                parent.insertBefore(controls, rail);
            }
            rail.setAttribute(READY_ATTR, 'ready');

            if (typeof window.ResizeObserver === 'function') {
                var observer = new window.ResizeObserver(function () { schedule(state); });
                observer.observe(rail);
                Array.prototype.forEach.call(rail.children, function (child) {
                    observer.observe(child);
                });
            }

            states.push(state);
            update(state);
            return true;
        } catch (e) {
            if (controls && controls.parentNode) {
                controls.parentNode.removeChild(controls);
            }
            if (head && head.parentNode) {
                // Возвращаем заголовок на прежнее место и убираем строку-обертку.
                while (head.firstChild) {
                    head.parentNode.insertBefore(head.firstChild, head);
                }
                head.parentNode.removeChild(head);
            }
            rail.classList.remove(READY_CLASS);
            return true; // не повторяем попытку; нативная прокрутка остаётся
        }
    }

    // Заголовок h2 непосредственно перед лентой (тот же родитель) получает строку
    // .vzo-rail-head: заголовок слева, кнопки справа. Заголовок, уже занятый другой
    // лентой, и далекий заголовок другой секции не трогаем.
    function placeControls(controls, heading, rail) {
        if (!heading || heading.parentNode !== rail.parentNode || rail.previousElementSibling !== heading) {
            return null;
        }
        if (heading.parentNode.classList && heading.parentNode.classList.contains('vzo-rail-head')) {
            return null;
        }
        var head = document.createElement('div');
        head.className = 'vzo-rail-head';
        heading.parentNode.insertBefore(head, heading);
        head.appendChild(heading);
        head.appendChild(controls);
        return head;
    }

    function init() {
        if (initialized) {
            return;
        }
        initialized = true;

        var rails = document.querySelectorAll(RAIL_SELECTOR);
        if (!rails.length) {
            return; // неподходящая страница: ничего не делаем
        }

        Array.prototype.forEach.call(rails, function (rail) {
            if (!enhance(rail)) {
                pendingRails.push(rail);
            }
        });

        var resizeFrame = 0;
        window.addEventListener('resize', function () {
            if (resizeFrame) {
                return;
            }
            resizeFrame = raf(function () {
                resizeFrame = 0;
                pendingRails = pendingRails.filter(function (rail) {
                    return !enhance(rail);
                });
                states.forEach(function (state) { schedule(state); });
            });
        }, { passive: true });

        window.addEventListener('load', function () {
            states.forEach(function (state) { schedule(state); });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
/* vzo29-14-native-rail-controls — конец */
let fullPage = document.body;

const MOB_HEADER_MAX_WIDTH = 991;

function searchToggle() {
    if (document.querySelector('.ya-site-form_inited_yes')) {
        showSearchBlock();
        if (document.querySelector('header').classList.contains('header-active')) {
            document.querySelector('#menuButton').click();
        }
        return;
    }

    initYandexSearch(window, document, 'yandex_site_callbacks', function () {
        showSearchBlock();
        if (document.querySelector('header').classList.contains('header-active')) {
            document.querySelector('#menuButton').click();
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    let favorites = localStorage.getItem('vzo');
    let favoritesBlock = document.querySelectorAll('.fav-items-block')[0];

    if (favorites != null && favoritesBlock.length != 0) {

        favorites = favorites.split(',');
        if (favorites.length >= 1) {
            favoritesBlock.classList.remove('hiddenStyle')
            document.querySelectorAll('.fav-items-count')[0].innerHTML = favorites.length;
            document.querySelectorAll('.fav-items-count')[0].style.display = 'flex';
        } else {
            favoritesBlock.classList.add('hiddenStyle')
        }
    }
    // let compareItems = localStorage.getItem('vzo_compare'+window.CATEGORY_ID);
    let compareItems = null;
    for (let i = 1; i < 15; i++) {
        let compareItemsByCat = localStorage.getItem('vzo_compare_' + i);
        if (compareItemsByCat != null) {
            compareItems += compareItemsByCat.split(',').length;
        }
    }
    if (document.querySelectorAll('.compare-items-count').length != 0) {
        let compareItemsCountBlock = document.querySelectorAll('.compare-items-count')[0];
        if (compareItems != null && Number(compareItems) >= 1 ) {
            compareItemsCountBlock.innerHTML = compareItems;
            compareItemsCountBlock.style.display = 'flex';
            compareItemsCountBlock.closest('.more-info-el').classList.remove('hiddenStyle');
        } else {
            compareItemsCountBlock.closest('.more-info-el').classList.add('hiddenStyle');
            compareItemsCountBlock.style.display = 'none';
        }
    }

    initSearchBlockLinksPositions();
});

document.querySelectorAll('.search-block > [type=submit]').forEach(button => {
    button.addEventListener('click', () => {
        let yandexSearchButton = document.querySelector('.ya-site-form__submit');

        if (yandexSearchButton) yandexSearchButton.click();
    })
})

let formListenerInterval = setInterval(function () {
    if (document.querySelector('.ya-site-form form')) {
        return;
    }

    const timeout = 500;

    setTimeout(function () {
        let searchBlock = document.querySelector('.search-block.with-links');

        if (!searchBlock) {
            return;
        }

        let searchInput = searchBlock.querySelector('.ya-site-form__input-text');
        let searchClearButton = searchBlock.querySelector('.search-block__clear');
        let searchSubmitButton = searchBlock.querySelector('.search-block .header-search-form-group > [type=submit]')

        searchInput.addEventListener('input', () => {
            if (searchInput.value) {
                searchClearButton.classList.remove('hiddenStyle');
                searchSubmitButton.classList.remove('hiddenStyle');
            } else {
                searchClearButton.classList.add('hiddenStyle');
                searchSubmitButton.classList.add('hiddenStyle');
            }
        })

        searchClearButton.addEventListener('click', () => {
            searchInput.value = '';
            searchClearButton.classList.add('hiddenStyle');
            searchSubmitButton.classList.add('hiddenStyle');
        })
    }, timeout)

    clearInterval(formListenerInterval);
}, 300);

function initYandexSearch(w, d, c, callback) {
    let s = d.createElement('script'), h = d.getElementsByTagName('script')[0], e = d.documentElement;
    if ((' ' + e.className + ' ').indexOf(' ya-page_js_yes ') === -1) {
        e.className += ' ya-page_js_yes';
    }
    s.type = 'text/javascript';
    s.async = true;
    s.charset = 'utf-8';
    s.src = (d.location.protocol === 'https:' ? 'https:' : 'http:') + '//site.yandex.net/v2.0/js/all.js';
    h.parentNode.insertBefore(s, h);
    (w[c] || (w[c] = [])).push(function () {
        Ya.Site.Form.init();
    });
    (w[c] || (w[c] = [])).push(function () {
        callback();
    });
}

function showSearchBlock() {
    let searchBlock = document.querySelectorAll('.search-block')[0];
    let closeBtn = document.querySelectorAll('.search-close-btn')[0];
    let iconSearch = document.querySelectorAll('.icon-search')[0];

    let searchBlockWithLinks = document.querySelector('.search-block.with-links');

    let searchInput = document.querySelector('.ya-site-form__input-text');
    if (searchBlock.classList.contains('open-search-block')) {
        searchBlock.closest('.header-nav').classList.remove('search')
        searchBlock.classList.remove('open-search-block');
        closeBtn.style.display = 'none';
        iconSearch.style.display = 'inline-block';

        if (searchBlockWithLinks) {
            document.querySelector('body').classList.remove('search-fixed-body');
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            searchBlockWithLinks.querySelector('.search-block-links .container').classList.remove('animate');
            document.querySelector('body').style.paddingRight = '0';
            document.querySelector('body').style.removeProperty('padding-right');
        }

    } else {
        searchBlock.closest('.header-nav').classList.add('search')
        searchBlock.classList.add('open-search-block');
        closeBtn.style.display = 'block';
        iconSearch.style.display = 'none';
        focusInputAfterLoad();

        if (searchBlockWithLinks) {
            if (window.innerWidth > 991 && document.body.scrollHeight > window.innerHeight) {
                let scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
                document.querySelector('body').style.paddingRight = scrollbarWidth + 'px';
            }

            document.querySelector('body').classList.add('search-fixed-body')
            searchBlockWithLinks.querySelector('.search-block-links .container').classList.add('animate');
        }
    }
}

function focusInputAfterLoad() {
    let searchInput = document.querySelector('.ya-site-form__input-text')

    if (!searchInput) {
        let inputLoadListener = setInterval(function () {
            let searchInput = document.querySelector('.ya-site-form__input-text')

            if (searchInput) {
                searchInput.focus();
                clearInterval(inputLoadListener);
            }
        }, 200)

        return;
    }

    searchInput.focus();
}

function initSearchBlockLinksPositions() {
    let searchBlockLinks = document.querySelector('.search-block-links');
    let headerTopBlock = document.querySelector('.header-top-block');

    if (!searchBlockLinks || !headerTopBlock) return;

    searchBlockLinks.style.top = headerTopBlock.offsetHeight + headerTopBlock.offsetTop - 2 + 'px';
}

function initImgLazyLoading() {
    document.querySelectorAll('.hl-item').forEach(hlItem => {
        hlItem.addEventListener('mouseover', () => {
            if (hlItem.dataset.inited) return;


            hlItem.querySelectorAll('.h-wrap-sub-menu img').forEach(img => {
                img.style.display = 'inherit';
            })

            hlItem.dataset.inited = true;
        })
    })
}

initImgLazyLoading();

function initHeaderTabs() {
    const tabButtons = document.querySelectorAll('[data-target-tab]');
    const tabs = document.querySelectorAll('[data-menu]');

    tabButtons.forEach(tabButton => {
        tabButton.addEventListener('click', () => {
            tabButton.parentElement.querySelectorAll('.ht-active')
                .forEach(button => button.classList.remove('ht-active'));

            (tabButton.querySelector('.ht-item-title') || tabButton).classList.add('ht-active')

            // tabs.forEach(tab => {
            //     if (tab.getAttribute('data-menu') === tabButton.getAttribute('data-target-tab')) {
            //         tab.classList.remove('h-bottom-hidden')
            //     } else {
            //         tab.classList.add('h-bottom-hidden')
            //     }
            // })

            tabButtons.forEach(button => {
                if (button.getAttribute('data-target-tab') === tabButton.getAttribute('data-target-tab')) {
                    button.classList.add('ht-active')
                } else {
                    button.classList.remove('ht-active')
                }
            })
        })
    })
}

initHeaderTabs();

function initHeaderMenuMob() {



    const subMenus = document.querySelectorAll('.h-wrap-sub-menu');

    subMenus.forEach(subMenu => {
        const htItem = subMenu.closest('.hl-item');
        const htItemTitle = htItem.querySelector('.hl-item-title');

        htItemTitle.addEventListener('click', (e) => {
            if (window.innerWidth <= MOB_HEADER_MAX_WIDTH) {
                e.preventDefault();
            }

            htItem.classList.toggle('active');
        })
    });
}

initHeaderMenuMob();


document.querySelector('#menuButton').addEventListener('click', (e) => {
    e.target.closest('#menuButton').classList.toggle('is-active');

    let header = document.querySelector('header');
    header.classList.toggle('header-active');

    document.body.classList.toggle('fixed-body');
    g('header_new');
});


function darkModeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    toggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');

        // сохранить выбор в localStorage
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });
}

if ($$('#theme-toggle').length > 0) {
    darkModeToggle();
}if(document.querySelectorAll('.footer-s-link').length !== 0) {
    document.querySelectorAll('.footer-s-link').forEach((el) => {
        // Native anchors already handle navigation, keyboard and modified clicks.
        if (el.closest('a[href]')) {
            return;
        }

        el.addEventListener('click', (event) => {
            if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
                return;
            }

            let link = el.getAttribute('data-href');
            if (!link) {
                return;
            }

            const popup = window.open(link, '_blank');
            if (popup) {
                popup.focus();
            }
        });
    });
}

let toTopBtn = $$('#toTop')[0];
if (toTopBtn !== undefined) {
    window.addEventListener('scroll', () => {
        window.scrollY > 100 ? toTopBtn.style.display = 'inline-block' : toTopBtn.style.display = 'none';
    });

    toTopBtn.addEventListener('click', () => {
        console.log('click');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
function showModalBlock() {
    let modals = document.querySelectorAll('[data-modal]');
    modals.forEach(function (trigger) {
        trigger.addEventListener('click', function (event) {
            event.preventDefault();
            let modal = document.getElementById(trigger.dataset.modal);
            modal.classList.add('open');

            hideScrollbar();

            let exits = document.querySelectorAll('.modal-exit');
            exits.forEach(function (exit) {
                exit.addEventListener('click', function (event) {
                    event.preventDefault();
                    modal.classList.remove('open');

                    showScrollbar();
                },false);
            });
        });
    });
}

function openedModalBlock() {
    document.querySelectorAll('.modal-block.open').forEach(modal => {
        let exits = document.querySelectorAll('.modal-exit');
        exits.forEach(function (exit) {
            exit.addEventListener('click', function (event) {
                event.preventDefault();
                modal.classList.remove('open');

                showScrollbar();
            });
        });
    })
}

document.addEventListener('DOMContentLoaded', showModalBlock);
document.addEventListener('DOMContentLoaded', openedModalBlock);

if ($$('.mob-like-curtain').length > 0) {
    $$('.mob-like-curtain').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.classList.contains('mob-like-curtain')) {
                el.classList.remove('open');

                showScrollbar();
            }
        });
    });
}

function showScrollbar() {
    document.body.classList.remove('body-fixed');
    document.body.style.removeProperty('padding-right');
}

function hideScrollbar() {
    let scrollbarWidth = getScrollbarWidth();
    document.body.style.paddingRight = scrollbarWidth + 'px';
    document.body.classList.add('body-fixed');
}

function getScrollbarWidth() {
    let outer = document.createElement('div');

    outer.style.position = 'absolute';
    outer.style.top = '-9999px';
    outer.style.width = '50px';
    outer.style.overflow = 'scroll';
    outer.style.visibility = 'hidden';

    document.body.appendChild(outer);
    let scrollBarWidth = outer.offsetWidth - outer.clientWidth;
    document.body.removeChild(outer);

    return scrollBarWidth;
};if($$('#backCallForm').length != 0 && $$('#backCallForm')[0].getElementsByClassName('btn').length != 0) {
    $$('#backCallForm')[0].getElementsByClassName('btn')[0].addEventListener('click',function (e) {

        if (!$$('#backCallForm')[0].checkValidity()) {
            alert('Неверный формат номера телефона');
            return false;
        }

        e.preventDefault();
        var token = document.getElementsByName('csrf-token')[0].attributes[1].nodeValue;
        var name = $$('#cName')[0].value;
        var phone = $$('#cPhone')[0].value;
        var description = $$('#cDescription')[0].value;
        var currentPageUrl = window.location.pathname;

        // ^\+?[0-9 ()-]*


        // var email = $$('#c_email')[0].value;
        if (!phone) {
            alert('Вы не заполнили все поля');
            return false;
        }
        // if (!$$('#confirm-checkbox')[0].checked) {
        //     alert('Вы не подтвердили согласие на обработку персональных данных');
        //     return false;
        // }
        grecaptcha.confirmed(function () {
            let data = {
                'g-recaptcha-response': grecaptcha.getResponse(),
                _token: token,
                name: name,
                phone: phone,
                description: description,
                currentPageUrl: currentPageUrl
            };
            fetch('/forms/call_me', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                    'X-CSRF-TOKEN': token
                },
                body: JSON.stringify(data)
            }).then((res) => {
                return res.json()
                    .then((data) => {
                        grecaptcha.reset();
                        $$('#modal_call_back')[0].classList.remove('open');
                        if (data.status === 'success' && data.message != null) {
                            showSuccessModal(data.message)
                            $$('#backCallForm')[0].reset();
                        } else if (data.status === 'error' && data.message != null) {
                            showErrorModal(data.message)
                            $$('#backCallForm')[0].reset();
                        }
                    }).catch((err) => {
                        grecaptcha.reset();
                        console.log(err);
                        $$('#modal_call_back')[0].classList.remove('open');
                        showErrorModal("Что-то пошло не так. <br> Пожалуйста, попробуйте снова.")
                    })
            });
        })
    },false);
}

function showSuccessModal(description = '', title = '') {
    let modal = document.querySelector('#modal-notify-success');

    modal.querySelector('#modal-notify-success-btn').click();

    modal.querySelector('.notify-message').innerHTML = description;

    if (title) {
        modal.querySelector('.notify-title').innerHTML = title;
    }
}

function showErrorModal(description = '', title = '') {
    let modal = document.querySelector('#modal-notify-error');

    modal.querySelector('#modal-notify-error-btn').click();

    modal.querySelector('.notify-message').innerHTML = description;

    if (title) {
        modal.querySelector('.notify-title').innerHTML = title;
    }
}
let citiesForCategory = {};

if($$('.modal-list-container a').length != 0) {
    $$('.modal-list-container a').forEach(item => {
        item.addEventListener('click', function () {
            document.cookie = "GEO_CITY=" + this.dataset.city + "; path=/;";
        });
    });

    $$('.modal-list-container .modal-list__el > span').forEach(item => {
        item.addEventListener('click', function () {
            document.cookie = "GEO_CITY=" + this.dataset.city + "; path=/;";
            document.querySelector('#modal-city').classList.remove('open');
        });
    });
}


if($$('[data-modal="modal-city"]').length != 0) {
    $$('[data-modal="modal-city"]').forEach(item => {
        item.addEventListener('click', function () {
            loadCitiesInStorageByPage();
        })
    });
}

let pageCitiesLoaded = false;
function loadCitiesInStorageByPage() {
    if (window.location.pathname.startsWith('/zalogi')) {
        let params = {};

        if (document.querySelector('#zalogi-geo-modal')) {
            params = {
                breadcrumb: document.querySelector('#zalogi-geo-modal').dataset.breadcrumb
            }
        }

        loadCitiesInStorage('/actions/zalogi_cities_new', 'getCitiesZalogi', !pageCitiesLoaded, params);
        pageCitiesLoaded = true;

        return 'getCitiesZalogi';
    }

    loadCitiesInStorage('/actions/zaimy/geo/get_all_cities', 'geoCities');

    return 'geoCities';
}

function loadCitiesInStorage(actionUrl, storageName, update = false, params = {}) {
    if(localStorage.getItem(storageName) == null || localStorage.getItem(storageName) == '' || localStorage.getItem(storageName) == '{}' || update) {
        fetch(actionUrl + '?' + new URLSearchParams(params), {
            method: 'GET',
        }).then((res) => {
            return res.json().then((data) => {
                var geoCities = {};
                data.forEach(function(items) {
                    for (var key in items) {
                        // skip loop if the property is from prototype
                        if (!items.hasOwnProperty(key)) continue;
                        var value = items[key];
                        value.forEach((item) => {
                            geoCities[item[1]] = item;
                        })
                    }
                });
                localStorage.setItem(storageName,JSON.stringify(geoCities));

                loadCitiesForCategory();
            }).catch((err) => {
                console.log(err);
            });
        })
    } else {
        loadCitiesForCategory();
    }

    return false;
}

function loadCitiesForCategory() {
    if (Object.keys(citiesForCategory).length > 0) return;

    if (window.location.pathname.startsWith('/zalogi')) {
        console.log(JSON.parse(localStorage.getItem('getCitiesZalogi')));
        citiesForCategory = JSON.parse(localStorage.getItem('getCitiesZalogi'));
        setCitiesInModal();
        return;
    }

    let pageType = 'listing';
    let categoryId = window.CATEGORY_ID;

    if (window.location.pathname.includes('business/franchise')) {
        pageType = 'franchise';
    } else if (window.location.pathname.includes('currency')) {
        pageType = 'currency';
        categoryId = window.CURRENCY_CATEGORY_ID;
    }

    let data = {
        pageType: pageType,
        category: categoryId
    };
    let token = document.getElementsByName('csrf-token')[0].attributes[1].nodeValue;

    fetch('/actions/geo/get_cities', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'X-CSRF-TOKEN': token
        },
        body: JSON.stringify(data)
    }).then((res) => {
        return res.json().then(value => {

            value.forEach(item => {
                citiesForCategory[item[1]] = item;
            })
            setCitiesInModal();
        });
    }).catch((err) => {
        console.log(err);
    });

}

if($$('#searchCity').length != 0) {
    $$('#searchCity')[0].addEventListener('keyup', function (e) {
        let storageNameByPage = loadCitiesInStorageByPage();

        searchCityInputEvent(e, storageNameByPage);
    },false)
}

function searchCityInputEvent(e, cityStorageName) {
    var elem = e.target;
    var modalBlock = elem.closest('.modal-block');

    var resetSearchHint = modalBlock.querySelector('.reset-search-hint');
    var citySearchIcon = modalBlock.querySelector('.city-search-icon');
    var modalListContainer = modalBlock.querySelector('.modal-list-container');
    if(modalBlock.querySelector('.modal-searched-data-block')) {
        var modalSearchedDataBlock = modalBlock.querySelector('.modal-searched-data-block');
    }
    var searchHint = elem.value;
    if(searchHint.length != 0 && resetSearchHint) {
        citySearchIcon.classList.add('display_none');
        resetSearchHint.classList.remove('display_none');
        resetSearchHint.addEventListener('click',function (){
            elem.value = '';
            elem.classList.remove('focusedInp');
            modalListContainer.classList.remove('hidden');
            if(modalSearchedDataBlock != undefined) {
                modalSearchedDataBlock.style.display = 'none';
            }
            citySearchIcon.classList.remove('display_none');
            resetSearchHint.classList.add('display_none');
        })
    }
    if(searchHint && modalSearchedDataBlock) {
        var matchesWithSearch = '';
        var cities = {
            ...JSON.parse(localStorage.getItem(cityStorageName)),
            ...citiesForCategory
        };

        // var counter = 0;
        // var maxElements = 5;

        if(cities != '' || cities != null) {
            for (var key in cities) {
                // skip loop if the property is from prototype
                if (!cities.hasOwnProperty(key)) continue;
                var city = cities[key];
                key = key.trim();
                searchHint = searchHint.trim();
                if(key.toLowerCase().indexOf(searchHint.toLowerCase()) == 0) {
                    var regexp = new RegExp( `(^${searchHint})(.*)`, 'gi' );
                    var matchesCity = [...key.matchAll(regexp)];
                    if(matchesCity.length != 0) {
                        matchesCity = matchesCity[0];

                        if (window.CATEGORY_ID == 1 || citiesForCategory[city[1]]) {
                            matchesWithSearch += `<div class="modal-list__el"><a href="${city[0]}" data-name="${city[1]}" data-city="${city[2]}"><span>${matchesCity[1]}</span><span class="not-matches-with-search">${matchesCity[2]}</span></a></div>`;
                        } else {
                            matchesWithSearch += `<div class="modal-list__el"><span data-name="${city[1]}" data-city="${city[2]}"><span>${matchesCity[1]}</span><span class="not-matches-with-search">${matchesCity[2]}</span></span></div>`;
                        }

                        // counter++;
                        // if (counter == maxElements) break;
                    }
                }
            }
            if(matchesWithSearch != '') {
                modalSearchedDataBlock.innerHTML = matchesWithSearch;
                modalListContainer.classList.add('hidden');
                modalSearchedDataBlock.style.display = 'flex';
                elem.classList.add('focusedInp');

                updateEvents();
            }
        }
    } else {
        elem.classList.remove('focusedInp');
        if (resetSearchHint) {
            resetSearchHint.classList.add('display_none');
        }
        if (citySearchIcon) {
            citySearchIcon.classList.remove('display_none');
        }
        modalSearchedDataBlock.style.display = 'none';
        modalListContainer.classList.remove('hidden');
    }
}

// Regoin
var YMapsLocal = localStorage.getItem('YMaps');
if (YMapsLocal == null) {
    var script = document.createElement("script");
    script.src = 'https://api-maps.yandex.ru/1.1/index.xml';
    document.head.appendChild(script);
    script.onload = function () {
        localStorage.setItem('YMaps', JSON.stringify(YMaps.location));
        window.city = YMaps.location.city;
    }
} else {
    YMapsLocal = JSON.parse(YMapsLocal);
    window.city = YMapsLocal.city;
}

// MetrikaID
var MetrikaID = localStorage.getItem('MetrikaID');
if (MetrikaID == null) {
    document.addEventListener("DOMContentLoaded", function(event) {
        if (typeof yaCounter38176370 !== 'undefined' && yaCounter38176370 != null) {
            MetrikaID = yaCounter38176370.getClientID();
            window.clientID = MetrikaID;
            localStorage.setItem('MetrikaID', MetrikaID);
        }
    });
} else {
    window.clientID = MetrikaID;
}
// Removed: DOMContentLoaded handler that fetched /actions/zaimy/geo/find_city_by_name
// on every page load and back-filled `.your-geo-location` / `.geo_cities_check`
// with the visitor's Yandex.Maps-resolved city. The endpoint and the auto-geo
// feature were dead in the UI for ~year. See chore/remove-dead-goal-geo-features.

function updateEvents() {
    $$('.modal-list-container a').forEach(item => {
        item.addEventListener('click', function () {
            document.cookie = "GEO_CITY=" + this.dataset.city + "; path=/;";
        });
    });

    $$('.modal-list-container .modal-list__el > span').forEach(item => {
        item.addEventListener('click', function () {
            document.cookie = "GEO_CITY=" + this.dataset.city + "; path=/;";
            document.querySelector('.choose-city').innerHTML = this.innerHTML;
            document.querySelector('#modal-city').classList.remove('open');
        });
    });

    $$('.modal-searched-data-block a').forEach(item => {
        item.addEventListener('click', function () {
            document.cookie = "GEO_CITY=" + this.dataset.city + "; path=/;";
        });
    });

    $$('.modal-searched-data-block .modal-list__el > span').forEach(item => {
        item.addEventListener('click', function () {
            document.cookie = "GEO_CITY=" + this.dataset.city + "; path=/;";
            document.querySelector('.choose-city').innerHTML = this.dataset.name;
            document.querySelector('#modal-city').classList.remove('open');
        });
    });
}

function setCitiesInModal() {
    let modalListElements = document.querySelectorAll('.modal-list-container .modal-list__el > *');

    if (!modalListElements.length) return;

    let cities = null;
    if (window.CATEGORY_ID == 1) {
        cities = JSON.parse(localStorage.getItem('geoCities'));
    }

    modalListElements.forEach(modalListElement => {
        let city = citiesForCategory[modalListElement.innerHTML];

        if (cities && !city) {
            city = cities[modalListElement.innerHTML];
        }

        if (!city) return;

        modalListElement.parentElement.innerHTML = `
            <a href="${city[0]}" data-city="${city[2]}">${city[1]}</a>
        `;
    });

    updateEvents();
}

/**
 * @popperjs/core v2.11.8 - MIT License
 */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).Popper={})}(this,(function(e){"use strict";function t(e){if(null==e)return window;if("[object Window]"!==e.toString()){var t=e.ownerDocument;return t&&t.defaultView||window}return e}function n(e){return e instanceof t(e).Element||e instanceof Element}function r(e){return e instanceof t(e).HTMLElement||e instanceof HTMLElement}function o(e){return"undefined"!=typeof ShadowRoot&&(e instanceof t(e).ShadowRoot||e instanceof ShadowRoot)}var i=Math.max,a=Math.min,s=Math.round;function f(){var e=navigator.userAgentData;return null!=e&&e.brands&&Array.isArray(e.brands)?e.brands.map((function(e){return e.brand+"/"+e.version})).join(" "):navigator.userAgent}function c(){return!/^((?!chrome|android).)*safari/i.test(f())}function p(e,o,i){void 0===o&&(o=!1),void 0===i&&(i=!1);var a=e.getBoundingClientRect(),f=1,p=1;o&&r(e)&&(f=e.offsetWidth>0&&s(a.width)/e.offsetWidth||1,p=e.offsetHeight>0&&s(a.height)/e.offsetHeight||1);var u=(n(e)?t(e):window).visualViewport,l=!c()&&i,d=(a.left+(l&&u?u.offsetLeft:0))/f,h=(a.top+(l&&u?u.offsetTop:0))/p,m=a.width/f,v=a.height/p;return{width:m,height:v,top:h,right:d+m,bottom:h+v,left:d,x:d,y:h}}function u(e){var n=t(e);return{scrollLeft:n.pageXOffset,scrollTop:n.pageYOffset}}function l(e){return e?(e.nodeName||"").toLowerCase():null}function d(e){return((n(e)?e.ownerDocument:e.document)||window.document).documentElement}function h(e){return p(d(e)).left+u(e).scrollLeft}function m(e){return t(e).getComputedStyle(e)}function v(e){var t=m(e),n=t.overflow,r=t.overflowX,o=t.overflowY;return/auto|scroll|overlay|hidden/.test(n+o+r)}function y(e,n,o){void 0===o&&(o=!1);var i,a,f=r(n),c=r(n)&&function(e){var t=e.getBoundingClientRect(),n=s(t.width)/e.offsetWidth||1,r=s(t.height)/e.offsetHeight||1;return 1!==n||1!==r}(n),m=d(n),y=p(e,c,o),g={scrollLeft:0,scrollTop:0},b={x:0,y:0};return(f||!f&&!o)&&(("body"!==l(n)||v(m))&&(g=(i=n)!==t(i)&&r(i)?{scrollLeft:(a=i).scrollLeft,scrollTop:a.scrollTop}:u(i)),r(n)?((b=p(n,!0)).x+=n.clientLeft,b.y+=n.clientTop):m&&(b.x=h(m))),{x:y.left+g.scrollLeft-b.x,y:y.top+g.scrollTop-b.y,width:y.width,height:y.height}}function g(e){var t=p(e),n=e.offsetWidth,r=e.offsetHeight;return Math.abs(t.width-n)<=1&&(n=t.width),Math.abs(t.height-r)<=1&&(r=t.height),{x:e.offsetLeft,y:e.offsetTop,width:n,height:r}}function b(e){return"html"===l(e)?e:e.assignedSlot||e.parentNode||(o(e)?e.host:null)||d(e)}function x(e){return["html","body","#document"].indexOf(l(e))>=0?e.ownerDocument.body:r(e)&&v(e)?e:x(b(e))}function w(e,n){var r;void 0===n&&(n=[]);var o=x(e),i=o===(null==(r=e.ownerDocument)?void 0:r.body),a=t(o),s=i?[a].concat(a.visualViewport||[],v(o)?o:[]):o,f=n.concat(s);return i?f:f.concat(w(b(s)))}function O(e){return["table","td","th"].indexOf(l(e))>=0}function j(e){return r(e)&&"fixed"!==m(e).position?e.offsetParent:null}function E(e){for(var n=t(e),i=j(e);i&&O(i)&&"static"===m(i).position;)i=j(i);return i&&("html"===l(i)||"body"===l(i)&&"static"===m(i).position)?n:i||function(e){var t=/firefox/i.test(f());if(/Trident/i.test(f())&&r(e)&&"fixed"===m(e).position)return null;var n=b(e);for(o(n)&&(n=n.host);r(n)&&["html","body"].indexOf(l(n))<0;){var i=m(n);if("none"!==i.transform||"none"!==i.perspective||"paint"===i.contain||-1!==["transform","perspective"].indexOf(i.willChange)||t&&"filter"===i.willChange||t&&i.filter&&"none"!==i.filter)return n;n=n.parentNode}return null}(e)||n}var D="top",A="bottom",L="right",P="left",M="auto",k=[D,A,L,P],W="start",B="end",H="viewport",T="popper",R=k.reduce((function(e,t){return e.concat([t+"-"+W,t+"-"+B])}),[]),S=[].concat(k,[M]).reduce((function(e,t){return e.concat([t,t+"-"+W,t+"-"+B])}),[]),V=["beforeRead","read","afterRead","beforeMain","main","afterMain","beforeWrite","write","afterWrite"];function q(e){var t=new Map,n=new Set,r=[];function o(e){n.add(e.name),[].concat(e.requires||[],e.requiresIfExists||[]).forEach((function(e){if(!n.has(e)){var r=t.get(e);r&&o(r)}})),r.push(e)}return e.forEach((function(e){t.set(e.name,e)})),e.forEach((function(e){n.has(e.name)||o(e)})),r}function C(e,t){var n=t.getRootNode&&t.getRootNode();if(e.contains(t))return!0;if(n&&o(n)){var r=t;do{if(r&&e.isSameNode(r))return!0;r=r.parentNode||r.host}while(r)}return!1}function N(e){return Object.assign({},e,{left:e.x,top:e.y,right:e.x+e.width,bottom:e.y+e.height})}function I(e,r,o){return r===H?N(function(e,n){var r=t(e),o=d(e),i=r.visualViewport,a=o.clientWidth,s=o.clientHeight,f=0,p=0;if(i){a=i.width,s=i.height;var u=c();(u||!u&&"fixed"===n)&&(f=i.offsetLeft,p=i.offsetTop)}return{width:a,height:s,x:f+h(e),y:p}}(e,o)):n(r)?function(e,t){var n=p(e,!1,"fixed"===t);return n.top=n.top+e.clientTop,n.left=n.left+e.clientLeft,n.bottom=n.top+e.clientHeight,n.right=n.left+e.clientWidth,n.width=e.clientWidth,n.height=e.clientHeight,n.x=n.left,n.y=n.top,n}(r,o):N(function(e){var t,n=d(e),r=u(e),o=null==(t=e.ownerDocument)?void 0:t.body,a=i(n.scrollWidth,n.clientWidth,o?o.scrollWidth:0,o?o.clientWidth:0),s=i(n.scrollHeight,n.clientHeight,o?o.scrollHeight:0,o?o.clientHeight:0),f=-r.scrollLeft+h(e),c=-r.scrollTop;return"rtl"===m(o||n).direction&&(f+=i(n.clientWidth,o?o.clientWidth:0)-a),{width:a,height:s,x:f,y:c}}(d(e)))}function _(e,t,o,s){var f="clippingParents"===t?function(e){var t=w(b(e)),o=["absolute","fixed"].indexOf(m(e).position)>=0&&r(e)?E(e):e;return n(o)?t.filter((function(e){return n(e)&&C(e,o)&&"body"!==l(e)})):[]}(e):[].concat(t),c=[].concat(f,[o]),p=c[0],u=c.reduce((function(t,n){var r=I(e,n,s);return t.top=i(r.top,t.top),t.right=a(r.right,t.right),t.bottom=a(r.bottom,t.bottom),t.left=i(r.left,t.left),t}),I(e,p,s));return u.width=u.right-u.left,u.height=u.bottom-u.top,u.x=u.left,u.y=u.top,u}function F(e){return e.split("-")[0]}function U(e){return e.split("-")[1]}function z(e){return["top","bottom"].indexOf(e)>=0?"x":"y"}function X(e){var t,n=e.reference,r=e.element,o=e.placement,i=o?F(o):null,a=o?U(o):null,s=n.x+n.width/2-r.width/2,f=n.y+n.height/2-r.height/2;switch(i){case D:t={x:s,y:n.y-r.height};break;case A:t={x:s,y:n.y+n.height};break;case L:t={x:n.x+n.width,y:f};break;case P:t={x:n.x-r.width,y:f};break;default:t={x:n.x,y:n.y}}var c=i?z(i):null;if(null!=c){var p="y"===c?"height":"width";switch(a){case W:t[c]=t[c]-(n[p]/2-r[p]/2);break;case B:t[c]=t[c]+(n[p]/2-r[p]/2)}}return t}function Y(e){return Object.assign({},{top:0,right:0,bottom:0,left:0},e)}function G(e,t){return t.reduce((function(t,n){return t[n]=e,t}),{})}function J(e,t){void 0===t&&(t={});var r=t,o=r.placement,i=void 0===o?e.placement:o,a=r.strategy,s=void 0===a?e.strategy:a,f=r.boundary,c=void 0===f?"clippingParents":f,u=r.rootBoundary,l=void 0===u?H:u,h=r.elementContext,m=void 0===h?T:h,v=r.altBoundary,y=void 0!==v&&v,g=r.padding,b=void 0===g?0:g,x=Y("number"!=typeof b?b:G(b,k)),w=m===T?"reference":T,O=e.rects.popper,j=e.elements[y?w:m],E=_(n(j)?j:j.contextElement||d(e.elements.popper),c,l,s),P=p(e.elements.reference),M=X({reference:P,element:O,strategy:"absolute",placement:i}),W=N(Object.assign({},O,M)),B=m===T?W:P,R={top:E.top-B.top+x.top,bottom:B.bottom-E.bottom+x.bottom,left:E.left-B.left+x.left,right:B.right-E.right+x.right},S=e.modifiersData.offset;if(m===T&&S){var V=S[i];Object.keys(R).forEach((function(e){var t=[L,A].indexOf(e)>=0?1:-1,n=[D,A].indexOf(e)>=0?"y":"x";R[e]+=V[n]*t}))}return R}var K={placement:"bottom",modifiers:[],strategy:"absolute"};function Q(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return!t.some((function(e){return!(e&&"function"==typeof e.getBoundingClientRect)}))}function Z(e){void 0===e&&(e={});var t=e,r=t.defaultModifiers,o=void 0===r?[]:r,i=t.defaultOptions,a=void 0===i?K:i;return function(e,t,r){void 0===r&&(r=a);var i,s,f={placement:"bottom",orderedModifiers:[],options:Object.assign({},K,a),modifiersData:{},elements:{reference:e,popper:t},attributes:{},styles:{}},c=[],p=!1,u={state:f,setOptions:function(r){var i="function"==typeof r?r(f.options):r;l(),f.options=Object.assign({},a,f.options,i),f.scrollParents={reference:n(e)?w(e):e.contextElement?w(e.contextElement):[],popper:w(t)};var s,p,d=function(e){var t=q(e);return V.reduce((function(e,n){return e.concat(t.filter((function(e){return e.phase===n})))}),[])}((s=[].concat(o,f.options.modifiers),p=s.reduce((function(e,t){var n=e[t.name];return e[t.name]=n?Object.assign({},n,t,{options:Object.assign({},n.options,t.options),data:Object.assign({},n.data,t.data)}):t,e}),{}),Object.keys(p).map((function(e){return p[e]}))));return f.orderedModifiers=d.filter((function(e){return e.enabled})),f.orderedModifiers.forEach((function(e){var t=e.name,n=e.options,r=void 0===n?{}:n,o=e.effect;if("function"==typeof o){var i=o({state:f,name:t,instance:u,options:r}),a=function(){};c.push(i||a)}})),u.update()},forceUpdate:function(){if(!p){var e=f.elements,t=e.reference,n=e.popper;if(Q(t,n)){f.rects={reference:y(t,E(n),"fixed"===f.options.strategy),popper:g(n)},f.reset=!1,f.placement=f.options.placement,f.orderedModifiers.forEach((function(e){return f.modifiersData[e.name]=Object.assign({},e.data)}));for(var r=0;r<f.orderedModifiers.length;r++)if(!0!==f.reset){var o=f.orderedModifiers[r],i=o.fn,a=o.options,s=void 0===a?{}:a,c=o.name;"function"==typeof i&&(f=i({state:f,options:s,name:c,instance:u})||f)}else f.reset=!1,r=-1}}},update:(i=function(){return new Promise((function(e){u.forceUpdate(),e(f)}))},function(){return s||(s=new Promise((function(e){Promise.resolve().then((function(){s=void 0,e(i())}))}))),s}),destroy:function(){l(),p=!0}};if(!Q(e,t))return u;function l(){c.forEach((function(e){return e()})),c=[]}return u.setOptions(r).then((function(e){!p&&r.onFirstUpdate&&r.onFirstUpdate(e)})),u}}var $={passive:!0};var ee={name:"eventListeners",enabled:!0,phase:"write",fn:function(){},effect:function(e){var n=e.state,r=e.instance,o=e.options,i=o.scroll,a=void 0===i||i,s=o.resize,f=void 0===s||s,c=t(n.elements.popper),p=[].concat(n.scrollParents.reference,n.scrollParents.popper);return a&&p.forEach((function(e){e.addEventListener("scroll",r.update,$)})),f&&c.addEventListener("resize",r.update,$),function(){a&&p.forEach((function(e){e.removeEventListener("scroll",r.update,$)})),f&&c.removeEventListener("resize",r.update,$)}},data:{}};var te={name:"popperOffsets",enabled:!0,phase:"read",fn:function(e){var t=e.state,n=e.name;t.modifiersData[n]=X({reference:t.rects.reference,element:t.rects.popper,strategy:"absolute",placement:t.placement})},data:{}},ne={top:"auto",right:"auto",bottom:"auto",left:"auto"};function re(e){var n,r=e.popper,o=e.popperRect,i=e.placement,a=e.variation,f=e.offsets,c=e.position,p=e.gpuAcceleration,u=e.adaptive,l=e.roundOffsets,h=e.isFixed,v=f.x,y=void 0===v?0:v,g=f.y,b=void 0===g?0:g,x="function"==typeof l?l({x:y,y:b}):{x:y,y:b};y=x.x,b=x.y;var w=f.hasOwnProperty("x"),O=f.hasOwnProperty("y"),j=P,M=D,k=window;if(u){var W=E(r),H="clientHeight",T="clientWidth";if(W===t(r)&&"static"!==m(W=d(r)).position&&"absolute"===c&&(H="scrollHeight",T="scrollWidth"),W=W,i===D||(i===P||i===L)&&a===B)M=A,b-=(h&&W===k&&k.visualViewport?k.visualViewport.height:W[H])-o.height,b*=p?1:-1;if(i===P||(i===D||i===A)&&a===B)j=L,y-=(h&&W===k&&k.visualViewport?k.visualViewport.width:W[T])-o.width,y*=p?1:-1}var R,S=Object.assign({position:c},u&&ne),V=!0===l?function(e,t){var n=e.x,r=e.y,o=t.devicePixelRatio||1;return{x:s(n*o)/o||0,y:s(r*o)/o||0}}({x:y,y:b},t(r)):{x:y,y:b};return y=V.x,b=V.y,p?Object.assign({},S,((R={})[M]=O?"0":"",R[j]=w?"0":"",R.transform=(k.devicePixelRatio||1)<=1?"translate("+y+"px, "+b+"px)":"translate3d("+y+"px, "+b+"px, 0)",R)):Object.assign({},S,((n={})[M]=O?b+"px":"",n[j]=w?y+"px":"",n.transform="",n))}var oe={name:"computeStyles",enabled:!0,phase:"beforeWrite",fn:function(e){var t=e.state,n=e.options,r=n.gpuAcceleration,o=void 0===r||r,i=n.adaptive,a=void 0===i||i,s=n.roundOffsets,f=void 0===s||s,c={placement:F(t.placement),variation:U(t.placement),popper:t.elements.popper,popperRect:t.rects.popper,gpuAcceleration:o,isFixed:"fixed"===t.options.strategy};null!=t.modifiersData.popperOffsets&&(t.styles.popper=Object.assign({},t.styles.popper,re(Object.assign({},c,{offsets:t.modifiersData.popperOffsets,position:t.options.strategy,adaptive:a,roundOffsets:f})))),null!=t.modifiersData.arrow&&(t.styles.arrow=Object.assign({},t.styles.arrow,re(Object.assign({},c,{offsets:t.modifiersData.arrow,position:"absolute",adaptive:!1,roundOffsets:f})))),t.attributes.popper=Object.assign({},t.attributes.popper,{"data-popper-placement":t.placement})},data:{}};var ie={name:"applyStyles",enabled:!0,phase:"write",fn:function(e){var t=e.state;Object.keys(t.elements).forEach((function(e){var n=t.styles[e]||{},o=t.attributes[e]||{},i=t.elements[e];r(i)&&l(i)&&(Object.assign(i.style,n),Object.keys(o).forEach((function(e){var t=o[e];!1===t?i.removeAttribute(e):i.setAttribute(e,!0===t?"":t)})))}))},effect:function(e){var t=e.state,n={popper:{position:t.options.strategy,left:"0",top:"0",margin:"0"},arrow:{position:"absolute"},reference:{}};return Object.assign(t.elements.popper.style,n.popper),t.styles=n,t.elements.arrow&&Object.assign(t.elements.arrow.style,n.arrow),function(){Object.keys(t.elements).forEach((function(e){var o=t.elements[e],i=t.attributes[e]||{},a=Object.keys(t.styles.hasOwnProperty(e)?t.styles[e]:n[e]).reduce((function(e,t){return e[t]="",e}),{});r(o)&&l(o)&&(Object.assign(o.style,a),Object.keys(i).forEach((function(e){o.removeAttribute(e)})))}))}},requires:["computeStyles"]};var ae={name:"offset",enabled:!0,phase:"main",requires:["popperOffsets"],fn:function(e){var t=e.state,n=e.options,r=e.name,o=n.offset,i=void 0===o?[0,0]:o,a=S.reduce((function(e,n){return e[n]=function(e,t,n){var r=F(e),o=[P,D].indexOf(r)>=0?-1:1,i="function"==typeof n?n(Object.assign({},t,{placement:e})):n,a=i[0],s=i[1];return a=a||0,s=(s||0)*o,[P,L].indexOf(r)>=0?{x:s,y:a}:{x:a,y:s}}(n,t.rects,i),e}),{}),s=a[t.placement],f=s.x,c=s.y;null!=t.modifiersData.popperOffsets&&(t.modifiersData.popperOffsets.x+=f,t.modifiersData.popperOffsets.y+=c),t.modifiersData[r]=a}},se={left:"right",right:"left",bottom:"top",top:"bottom"};function fe(e){return e.replace(/left|right|bottom|top/g,(function(e){return se[e]}))}var ce={start:"end",end:"start"};function pe(e){return e.replace(/start|end/g,(function(e){return ce[e]}))}function ue(e,t){void 0===t&&(t={});var n=t,r=n.placement,o=n.boundary,i=n.rootBoundary,a=n.padding,s=n.flipVariations,f=n.allowedAutoPlacements,c=void 0===f?S:f,p=U(r),u=p?s?R:R.filter((function(e){return U(e)===p})):k,l=u.filter((function(e){return c.indexOf(e)>=0}));0===l.length&&(l=u);var d=l.reduce((function(t,n){return t[n]=J(e,{placement:n,boundary:o,rootBoundary:i,padding:a})[F(n)],t}),{});return Object.keys(d).sort((function(e,t){return d[e]-d[t]}))}var le={name:"flip",enabled:!0,phase:"main",fn:function(e){var t=e.state,n=e.options,r=e.name;if(!t.modifiersData[r]._skip){for(var o=n.mainAxis,i=void 0===o||o,a=n.altAxis,s=void 0===a||a,f=n.fallbackPlacements,c=n.padding,p=n.boundary,u=n.rootBoundary,l=n.altBoundary,d=n.flipVariations,h=void 0===d||d,m=n.allowedAutoPlacements,v=t.options.placement,y=F(v),g=f||(y===v||!h?[fe(v)]:function(e){if(F(e)===M)return[];var t=fe(e);return[pe(e),t,pe(t)]}(v)),b=[v].concat(g).reduce((function(e,n){return e.concat(F(n)===M?ue(t,{placement:n,boundary:p,rootBoundary:u,padding:c,flipVariations:h,allowedAutoPlacements:m}):n)}),[]),x=t.rects.reference,w=t.rects.popper,O=new Map,j=!0,E=b[0],k=0;k<b.length;k++){var B=b[k],H=F(B),T=U(B)===W,R=[D,A].indexOf(H)>=0,S=R?"width":"height",V=J(t,{placement:B,boundary:p,rootBoundary:u,altBoundary:l,padding:c}),q=R?T?L:P:T?A:D;x[S]>w[S]&&(q=fe(q));var C=fe(q),N=[];if(i&&N.push(V[H]<=0),s&&N.push(V[q]<=0,V[C]<=0),N.every((function(e){return e}))){E=B,j=!1;break}O.set(B,N)}if(j)for(var I=function(e){var t=b.find((function(t){var n=O.get(t);if(n)return n.slice(0,e).every((function(e){return e}))}));if(t)return E=t,"break"},_=h?3:1;_>0;_--){if("break"===I(_))break}t.placement!==E&&(t.modifiersData[r]._skip=!0,t.placement=E,t.reset=!0)}},requiresIfExists:["offset"],data:{_skip:!1}};function de(e,t,n){return i(e,a(t,n))}var he={name:"preventOverflow",enabled:!0,phase:"main",fn:function(e){var t=e.state,n=e.options,r=e.name,o=n.mainAxis,s=void 0===o||o,f=n.altAxis,c=void 0!==f&&f,p=n.boundary,u=n.rootBoundary,l=n.altBoundary,d=n.padding,h=n.tether,m=void 0===h||h,v=n.tetherOffset,y=void 0===v?0:v,b=J(t,{boundary:p,rootBoundary:u,padding:d,altBoundary:l}),x=F(t.placement),w=U(t.placement),O=!w,j=z(x),M="x"===j?"y":"x",k=t.modifiersData.popperOffsets,B=t.rects.reference,H=t.rects.popper,T="function"==typeof y?y(Object.assign({},t.rects,{placement:t.placement})):y,R="number"==typeof T?{mainAxis:T,altAxis:T}:Object.assign({mainAxis:0,altAxis:0},T),S=t.modifiersData.offset?t.modifiersData.offset[t.placement]:null,V={x:0,y:0};if(k){if(s){var q,C="y"===j?D:P,N="y"===j?A:L,I="y"===j?"height":"width",_=k[j],X=_+b[C],Y=_-b[N],G=m?-H[I]/2:0,K=w===W?B[I]:H[I],Q=w===W?-H[I]:-B[I],Z=t.elements.arrow,$=m&&Z?g(Z):{width:0,height:0},ee=t.modifiersData["arrow#persistent"]?t.modifiersData["arrow#persistent"].padding:{top:0,right:0,bottom:0,left:0},te=ee[C],ne=ee[N],re=de(0,B[I],$[I]),oe=O?B[I]/2-G-re-te-R.mainAxis:K-re-te-R.mainAxis,ie=O?-B[I]/2+G+re+ne+R.mainAxis:Q+re+ne+R.mainAxis,ae=t.elements.arrow&&E(t.elements.arrow),se=ae?"y"===j?ae.clientTop||0:ae.clientLeft||0:0,fe=null!=(q=null==S?void 0:S[j])?q:0,ce=_+ie-fe,pe=de(m?a(X,_+oe-fe-se):X,_,m?i(Y,ce):Y);k[j]=pe,V[j]=pe-_}if(c){var ue,le="x"===j?D:P,he="x"===j?A:L,me=k[M],ve="y"===M?"height":"width",ye=me+b[le],ge=me-b[he],be=-1!==[D,P].indexOf(x),xe=null!=(ue=null==S?void 0:S[M])?ue:0,we=be?ye:me-B[ve]-H[ve]-xe+R.altAxis,Oe=be?me+B[ve]+H[ve]-xe-R.altAxis:ge,je=m&&be?function(e,t,n){var r=de(e,t,n);return r>n?n:r}(we,me,Oe):de(m?we:ye,me,m?Oe:ge);k[M]=je,V[M]=je-me}t.modifiersData[r]=V}},requiresIfExists:["offset"]};var me={name:"arrow",enabled:!0,phase:"main",fn:function(e){var t,n=e.state,r=e.name,o=e.options,i=n.elements.arrow,a=n.modifiersData.popperOffsets,s=F(n.placement),f=z(s),c=[P,L].indexOf(s)>=0?"height":"width";if(i&&a){var p=function(e,t){return Y("number"!=typeof(e="function"==typeof e?e(Object.assign({},t.rects,{placement:t.placement})):e)?e:G(e,k))}(o.padding,n),u=g(i),l="y"===f?D:P,d="y"===f?A:L,h=n.rects.reference[c]+n.rects.reference[f]-a[f]-n.rects.popper[c],m=a[f]-n.rects.reference[f],v=E(i),y=v?"y"===f?v.clientHeight||0:v.clientWidth||0:0,b=h/2-m/2,x=p[l],w=y-u[c]-p[d],O=y/2-u[c]/2+b,j=de(x,O,w),M=f;n.modifiersData[r]=((t={})[M]=j,t.centerOffset=j-O,t)}},effect:function(e){var t=e.state,n=e.options.element,r=void 0===n?"[data-popper-arrow]":n;null!=r&&("string"!=typeof r||(r=t.elements.popper.querySelector(r)))&&C(t.elements.popper,r)&&(t.elements.arrow=r)},requires:["popperOffsets"],requiresIfExists:["preventOverflow"]};function ve(e,t,n){return void 0===n&&(n={x:0,y:0}),{top:e.top-t.height-n.y,right:e.right-t.width+n.x,bottom:e.bottom-t.height+n.y,left:e.left-t.width-n.x}}function ye(e){return[D,L,A,P].some((function(t){return e[t]>=0}))}var ge={name:"hide",enabled:!0,phase:"main",requiresIfExists:["preventOverflow"],fn:function(e){var t=e.state,n=e.name,r=t.rects.reference,o=t.rects.popper,i=t.modifiersData.preventOverflow,a=J(t,{elementContext:"reference"}),s=J(t,{altBoundary:!0}),f=ve(a,r),c=ve(s,o,i),p=ye(f),u=ye(c);t.modifiersData[n]={referenceClippingOffsets:f,popperEscapeOffsets:c,isReferenceHidden:p,hasPopperEscaped:u},t.attributes.popper=Object.assign({},t.attributes.popper,{"data-popper-reference-hidden":p,"data-popper-escaped":u})}},be=Z({defaultModifiers:[ee,te,oe,ie]}),xe=[ee,te,oe,ie,ae,le,he,me,ge],we=Z({defaultModifiers:xe});e.applyStyles=ie,e.arrow=me,e.computeStyles=oe,e.createPopper=we,e.createPopperLite=be,e.defaultModifiers=xe,e.detectOverflow=J,e.eventListeners=ee,e.flip=le,e.hide=ge,e.offset=ae,e.popperGenerator=Z,e.popperOffsets=te,e.preventOverflow=he,Object.defineProperty(e,"__esModule",{value:!0})}));
//# sourceMappingURL=popper.min.js.map

!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e(require("@popperjs/core")):"function"==typeof define&&define.amd?define(["@popperjs/core"],e):(t=t||self).tippy=e(t.Popper)}(this,(function(t){"use strict";var e="undefined"!=typeof window&&"undefined"!=typeof document,n=!!e&&!!window.msCrypto,r={passive:!0,capture:!0},o=function(){return document.body};function i(t,e,n){if(Array.isArray(t)){var r=t[e];return null==r?Array.isArray(n)?n[e]:n:r}return t}function a(t,e){var n={}.toString.call(t);return 0===n.indexOf("[object")&&n.indexOf(e+"]")>-1}function s(t,e){return"function"==typeof t?t.apply(void 0,e):t}function u(t,e){return 0===e?t:function(r){clearTimeout(n),n=setTimeout((function(){t(r)}),e)};var n}function p(t,e){var n=Object.assign({},t);return e.forEach((function(t){delete n[t]})),n}function c(t){return[].concat(t)}function f(t,e){-1===t.indexOf(e)&&t.push(e)}function l(t){return t.split("-")[0]}function d(t){return[].slice.call(t)}function v(t){return Object.keys(t).reduce((function(e,n){return void 0!==t[n]&&(e[n]=t[n]),e}),{})}function m(){return document.createElement("div")}function g(t){return["Element","Fragment"].some((function(e){return a(t,e)}))}function h(t){return a(t,"MouseEvent")}function b(t){return!(!t||!t._tippy||t._tippy.reference!==t)}function y(t){return g(t)?[t]:function(t){return a(t,"NodeList")}(t)?d(t):Array.isArray(t)?t:d(document.querySelectorAll(t))}function w(t,e){t.forEach((function(t){t&&(t.style.transitionDuration=e+"ms")}))}function x(t,e){t.forEach((function(t){t&&t.setAttribute("data-state",e)}))}function E(t){var e,n=c(t)[0];return null!=n&&null!=(e=n.ownerDocument)&&e.body?n.ownerDocument:document}function O(t,e,n){var r=e+"EventListener";["transitionend","webkitTransitionEnd"].forEach((function(e){t[r](e,n)}))}function C(t,e){for(var n=e;n;){var r;if(t.contains(n))return!0;n=null==n.getRootNode||null==(r=n.getRootNode())?void 0:r.host}return!1}var T={isTouch:!1},A=0;function L(){T.isTouch||(T.isTouch=!0,window.performance&&document.addEventListener("mousemove",D))}function D(){var t=performance.now();t-A<20&&(T.isTouch=!1,document.removeEventListener("mousemove",D)),A=t}function k(){var t=document.activeElement;if(b(t)){var e=t._tippy;t.blur&&!e.state.isVisible&&t.blur()}}var R=Object.assign({appendTo:o,aria:{content:"auto",expanded:"auto"},delay:0,duration:[300,250],getReferenceClientRect:null,hideOnClick:!0,ignoreAttributes:!1,interactive:!1,interactiveBorder:2,interactiveDebounce:0,moveTransition:"",offset:[0,10],onAfterUpdate:function(){},onBeforeUpdate:function(){},onCreate:function(){},onDestroy:function(){},onHidden:function(){},onHide:function(){},onMount:function(){},onShow:function(){},onShown:function(){},onTrigger:function(){},onUntrigger:function(){},onClickOutside:function(){},placement:"top",plugins:[],popperOptions:{},render:null,showOnCreate:!1,touch:!0,trigger:"mouseenter focus",triggerTarget:null},{animateFill:!1,followCursor:!1,inlinePositioning:!1,sticky:!1},{allowHTML:!1,animation:"fade",arrow:!0,content:"",inertia:!1,maxWidth:350,role:"tooltip",theme:"",zIndex:9999}),P=Object.keys(R);function j(t){var e=(t.plugins||[]).reduce((function(e,n){var r,o=n.name,i=n.defaultValue;o&&(e[o]=void 0!==t[o]?t[o]:null!=(r=R[o])?r:i);return e}),{});return Object.assign({},t,e)}function M(t,e){var n=Object.assign({},e,{content:s(e.content,[t])},e.ignoreAttributes?{}:function(t,e){return(e?Object.keys(j(Object.assign({},R,{plugins:e}))):P).reduce((function(e,n){var r=(t.getAttribute("data-tippy-"+n)||"").trim();if(!r)return e;if("content"===n)e[n]=r;else try{e[n]=JSON.parse(r)}catch(t){e[n]=r}return e}),{})}(t,e.plugins));return n.aria=Object.assign({},R.aria,n.aria),n.aria={expanded:"auto"===n.aria.expanded?e.interactive:n.aria.expanded,content:"auto"===n.aria.content?e.interactive?null:"describedby":n.aria.content},n}function V(t,e){t.innerHTML=e}function I(t){var e=m();return!0===t?e.className="tippy-arrow":(e.className="tippy-svg-arrow",g(t)?e.appendChild(t):V(e,t)),e}function S(t,e){g(e.content)?(V(t,""),t.appendChild(e.content)):"function"!=typeof e.content&&(e.allowHTML?V(t,e.content):t.textContent=e.content)}function B(t){var e=t.firstElementChild,n=d(e.children);return{box:e,content:n.find((function(t){return t.classList.contains("tippy-content")})),arrow:n.find((function(t){return t.classList.contains("tippy-arrow")||t.classList.contains("tippy-svg-arrow")})),backdrop:n.find((function(t){return t.classList.contains("tippy-backdrop")}))}}function N(t){var e=m(),n=m();n.className="tippy-box",n.setAttribute("data-state","hidden"),n.setAttribute("tabindex","-1");var r=m();function o(n,r){var o=B(e),i=o.box,a=o.content,s=o.arrow;r.theme?i.setAttribute("data-theme",r.theme):i.removeAttribute("data-theme"),"string"==typeof r.animation?i.setAttribute("data-animation",r.animation):i.removeAttribute("data-animation"),r.inertia?i.setAttribute("data-inertia",""):i.removeAttribute("data-inertia"),i.style.maxWidth="number"==typeof r.maxWidth?r.maxWidth+"px":r.maxWidth,r.role?i.setAttribute("role",r.role):i.removeAttribute("role"),n.content===r.content&&n.allowHTML===r.allowHTML||S(a,t.props),r.arrow?s?n.arrow!==r.arrow&&(i.removeChild(s),i.appendChild(I(r.arrow))):i.appendChild(I(r.arrow)):s&&i.removeChild(s)}return r.className="tippy-content",r.setAttribute("data-state","hidden"),S(r,t.props),e.appendChild(n),n.appendChild(r),o(t.props,t.props),{popper:e,onUpdate:o}}N.$$tippy=!0;var H=1,U=[],_=[];function z(e,a){var p,g,b,y,A,L,D,k,P=M(e,Object.assign({},R,j(v(a)))),V=!1,I=!1,S=!1,N=!1,z=[],F=u(wt,P.interactiveDebounce),W=H++,X=(k=P.plugins).filter((function(t,e){return k.indexOf(t)===e})),Y={id:W,reference:e,popper:m(),popperInstance:null,props:P,state:{isEnabled:!0,isVisible:!1,isDestroyed:!1,isMounted:!1,isShown:!1},plugins:X,clearDelayTimeouts:function(){clearTimeout(p),clearTimeout(g),cancelAnimationFrame(b)},setProps:function(t){if(Y.state.isDestroyed)return;at("onBeforeUpdate",[Y,t]),bt();var n=Y.props,r=M(e,Object.assign({},n,v(t),{ignoreAttributes:!0}));Y.props=r,ht(),n.interactiveDebounce!==r.interactiveDebounce&&(pt(),F=u(wt,r.interactiveDebounce));n.triggerTarget&&!r.triggerTarget?c(n.triggerTarget).forEach((function(t){t.removeAttribute("aria-expanded")})):r.triggerTarget&&e.removeAttribute("aria-expanded");ut(),it(),J&&J(n,r);Y.popperInstance&&(Ct(),At().forEach((function(t){requestAnimationFrame(t._tippy.popperInstance.forceUpdate)})));at("onAfterUpdate",[Y,t])},setContent:function(t){Y.setProps({content:t})},show:function(){var t=Y.state.isVisible,e=Y.state.isDestroyed,n=!Y.state.isEnabled,r=T.isTouch&&!Y.props.touch,a=i(Y.props.duration,0,R.duration);if(t||e||n||r)return;if(et().hasAttribute("disabled"))return;if(at("onShow",[Y],!1),!1===Y.props.onShow(Y))return;Y.state.isVisible=!0,tt()&&($.style.visibility="visible");it(),dt(),Y.state.isMounted||($.style.transition="none");if(tt()){var u=rt(),p=u.box,c=u.content;w([p,c],0)}L=function(){var t;if(Y.state.isVisible&&!N){if(N=!0,$.offsetHeight,$.style.transition=Y.props.moveTransition,tt()&&Y.props.animation){var e=rt(),n=e.box,r=e.content;w([n,r],a),x([n,r],"visible")}st(),ut(),f(_,Y),null==(t=Y.popperInstance)||t.forceUpdate(),at("onMount",[Y]),Y.props.animation&&tt()&&function(t,e){mt(t,e)}(a,(function(){Y.state.isShown=!0,at("onShown",[Y])}))}},function(){var t,e=Y.props.appendTo,n=et();t=Y.props.interactive&&e===o||"parent"===e?n.parentNode:s(e,[n]);t.contains($)||t.appendChild($);Y.state.isMounted=!0,Ct()}()},hide:function(){var t=!Y.state.isVisible,e=Y.state.isDestroyed,n=!Y.state.isEnabled,r=i(Y.props.duration,1,R.duration);if(t||e||n)return;if(at("onHide",[Y],!1),!1===Y.props.onHide(Y))return;Y.state.isVisible=!1,Y.state.isShown=!1,N=!1,V=!1,tt()&&($.style.visibility="hidden");if(pt(),vt(),it(!0),tt()){var o=rt(),a=o.box,s=o.content;Y.props.animation&&(w([a,s],r),x([a,s],"hidden"))}st(),ut(),Y.props.animation?tt()&&function(t,e){mt(t,(function(){!Y.state.isVisible&&$.parentNode&&$.parentNode.contains($)&&e()}))}(r,Y.unmount):Y.unmount()},hideWithInteractivity:function(t){nt().addEventListener("mousemove",F),f(U,F),F(t)},enable:function(){Y.state.isEnabled=!0},disable:function(){Y.hide(),Y.state.isEnabled=!1},unmount:function(){Y.state.isVisible&&Y.hide();if(!Y.state.isMounted)return;Tt(),At().forEach((function(t){t._tippy.unmount()})),$.parentNode&&$.parentNode.removeChild($);_=_.filter((function(t){return t!==Y})),Y.state.isMounted=!1,at("onHidden",[Y])},destroy:function(){if(Y.state.isDestroyed)return;Y.clearDelayTimeouts(),Y.unmount(),bt(),delete e._tippy,Y.state.isDestroyed=!0,at("onDestroy",[Y])}};if(!P.render)return Y;var q=P.render(Y),$=q.popper,J=q.onUpdate;$.setAttribute("data-tippy-root",""),$.id="tippy-"+Y.id,Y.popper=$,e._tippy=Y,$._tippy=Y;var G=X.map((function(t){return t.fn(Y)})),K=e.hasAttribute("aria-expanded");return ht(),ut(),it(),at("onCreate",[Y]),P.showOnCreate&&Lt(),$.addEventListener("mouseenter",(function(){Y.props.interactive&&Y.state.isVisible&&Y.clearDelayTimeouts()})),$.addEventListener("mouseleave",(function(){Y.props.interactive&&Y.props.trigger.indexOf("mouseenter")>=0&&nt().addEventListener("mousemove",F)})),Y;function Q(){var t=Y.props.touch;return Array.isArray(t)?t:[t,0]}function Z(){return"hold"===Q()[0]}function tt(){var t;return!(null==(t=Y.props.render)||!t.$$tippy)}function et(){return D||e}function nt(){var t=et().parentNode;return t?E(t):document}function rt(){return B($)}function ot(t){return Y.state.isMounted&&!Y.state.isVisible||T.isTouch||y&&"focus"===y.type?0:i(Y.props.delay,t?0:1,R.delay)}function it(t){void 0===t&&(t=!1),$.style.pointerEvents=Y.props.interactive&&!t?"":"none",$.style.zIndex=""+Y.props.zIndex}function at(t,e,n){var r;(void 0===n&&(n=!0),G.forEach((function(n){n[t]&&n[t].apply(n,e)})),n)&&(r=Y.props)[t].apply(r,e)}function st(){var t=Y.props.aria;if(t.content){var n="aria-"+t.content,r=$.id;c(Y.props.triggerTarget||e).forEach((function(t){var e=t.getAttribute(n);if(Y.state.isVisible)t.setAttribute(n,e?e+" "+r:r);else{var o=e&&e.replace(r,"").trim();o?t.setAttribute(n,o):t.removeAttribute(n)}}))}}function ut(){!K&&Y.props.aria.expanded&&c(Y.props.triggerTarget||e).forEach((function(t){Y.props.interactive?t.setAttribute("aria-expanded",Y.state.isVisible&&t===et()?"true":"false"):t.removeAttribute("aria-expanded")}))}function pt(){nt().removeEventListener("mousemove",F),U=U.filter((function(t){return t!==F}))}function ct(t){if(!T.isTouch||!S&&"mousedown"!==t.type){var n=t.composedPath&&t.composedPath()[0]||t.target;if(!Y.props.interactive||!C($,n)){if(c(Y.props.triggerTarget||e).some((function(t){return C(t,n)}))){if(T.isTouch)return;if(Y.state.isVisible&&Y.props.trigger.indexOf("click")>=0)return}else at("onClickOutside",[Y,t]);!0===Y.props.hideOnClick&&(Y.clearDelayTimeouts(),Y.hide(),I=!0,setTimeout((function(){I=!1})),Y.state.isMounted||vt())}}}function ft(){S=!0}function lt(){S=!1}function dt(){var t=nt();t.addEventListener("mousedown",ct,!0),t.addEventListener("touchend",ct,r),t.addEventListener("touchstart",lt,r),t.addEventListener("touchmove",ft,r)}function vt(){var t=nt();t.removeEventListener("mousedown",ct,!0),t.removeEventListener("touchend",ct,r),t.removeEventListener("touchstart",lt,r),t.removeEventListener("touchmove",ft,r)}function mt(t,e){var n=rt().box;function r(t){t.target===n&&(O(n,"remove",r),e())}if(0===t)return e();O(n,"remove",A),O(n,"add",r),A=r}function gt(t,n,r){void 0===r&&(r=!1),c(Y.props.triggerTarget||e).forEach((function(e){e.addEventListener(t,n,r),z.push({node:e,eventType:t,handler:n,options:r})}))}function ht(){var t;Z()&&(gt("touchstart",yt,{passive:!0}),gt("touchend",xt,{passive:!0})),(t=Y.props.trigger,t.split(/\s+/).filter(Boolean)).forEach((function(t){if("manual"!==t)switch(gt(t,yt),t){case"mouseenter":gt("mouseleave",xt);break;case"focus":gt(n?"focusout":"blur",Et);break;case"focusin":gt("focusout",Et)}}))}function bt(){z.forEach((function(t){var e=t.node,n=t.eventType,r=t.handler,o=t.options;e.removeEventListener(n,r,o)})),z=[]}function yt(t){var e,n=!1;if(Y.state.isEnabled&&!Ot(t)&&!I){var r="focus"===(null==(e=y)?void 0:e.type);y=t,D=t.currentTarget,ut(),!Y.state.isVisible&&h(t)&&U.forEach((function(e){return e(t)})),"click"===t.type&&(Y.props.trigger.indexOf("mouseenter")<0||V)&&!1!==Y.props.hideOnClick&&Y.state.isVisible?n=!0:Lt(t),"click"===t.type&&(V=!n),n&&!r&&Dt(t)}}function wt(t){var e=t.target,n=et().contains(e)||$.contains(e);"mousemove"===t.type&&n||function(t,e){var n=e.clientX,r=e.clientY;return t.every((function(t){var e=t.popperRect,o=t.popperState,i=t.props.interactiveBorder,a=l(o.placement),s=o.modifiersData.offset;if(!s)return!0;var u="bottom"===a?s.top.y:0,p="top"===a?s.bottom.y:0,c="right"===a?s.left.x:0,f="left"===a?s.right.x:0,d=e.top-r+u>i,v=r-e.bottom-p>i,m=e.left-n+c>i,g=n-e.right-f>i;return d||v||m||g}))}(At().concat($).map((function(t){var e,n=null==(e=t._tippy.popperInstance)?void 0:e.state;return n?{popperRect:t.getBoundingClientRect(),popperState:n,props:P}:null})).filter(Boolean),t)&&(pt(),Dt(t))}function xt(t){Ot(t)||Y.props.trigger.indexOf("click")>=0&&V||(Y.props.interactive?Y.hideWithInteractivity(t):Dt(t))}function Et(t){Y.props.trigger.indexOf("focusin")<0&&t.target!==et()||Y.props.interactive&&t.relatedTarget&&$.contains(t.relatedTarget)||Dt(t)}function Ot(t){return!!T.isTouch&&Z()!==t.type.indexOf("touch")>=0}function Ct(){Tt();var n=Y.props,r=n.popperOptions,o=n.placement,i=n.offset,a=n.getReferenceClientRect,s=n.moveTransition,u=tt()?B($).arrow:null,p=a?{getBoundingClientRect:a,contextElement:a.contextElement||et()}:e,c=[{name:"offset",options:{offset:i}},{name:"preventOverflow",options:{padding:{top:2,bottom:2,left:5,right:5}}},{name:"flip",options:{padding:5}},{name:"computeStyles",options:{adaptive:!s}},{name:"$$tippy",enabled:!0,phase:"beforeWrite",requires:["computeStyles"],fn:function(t){var e=t.state;if(tt()){var n=rt().box;["placement","reference-hidden","escaped"].forEach((function(t){"placement"===t?n.setAttribute("data-placement",e.placement):e.attributes.popper["data-popper-"+t]?n.setAttribute("data-"+t,""):n.removeAttribute("data-"+t)})),e.attributes.popper={}}}}];tt()&&u&&c.push({name:"arrow",options:{element:u,padding:3}}),c.push.apply(c,(null==r?void 0:r.modifiers)||[]),Y.popperInstance=t.createPopper(p,$,Object.assign({},r,{placement:o,onFirstUpdate:L,modifiers:c}))}function Tt(){Y.popperInstance&&(Y.popperInstance.destroy(),Y.popperInstance=null)}function At(){return d($.querySelectorAll("[data-tippy-root]"))}function Lt(t){Y.clearDelayTimeouts(),t&&at("onTrigger",[Y,t]),dt();var e=ot(!0),n=Q(),r=n[0],o=n[1];T.isTouch&&"hold"===r&&o&&(e=o),e?p=setTimeout((function(){Y.show()}),e):Y.show()}function Dt(t){if(Y.clearDelayTimeouts(),at("onUntrigger",[Y,t]),Y.state.isVisible){if(!(Y.props.trigger.indexOf("mouseenter")>=0&&Y.props.trigger.indexOf("click")>=0&&["mouseleave","mousemove"].indexOf(t.type)>=0&&V)){var e=ot(!1);e?g=setTimeout((function(){Y.state.isVisible&&Y.hide()}),e):b=requestAnimationFrame((function(){Y.hide()}))}}else vt()}}function F(t,e){void 0===e&&(e={});var n=R.plugins.concat(e.plugins||[]);document.addEventListener("touchstart",L,r),window.addEventListener("blur",k);var o=Object.assign({},e,{plugins:n}),i=y(t).reduce((function(t,e){var n=e&&z(e,o);return n&&t.push(n),t}),[]);return g(t)?i[0]:i}F.defaultProps=R,F.setDefaultProps=function(t){Object.keys(t).forEach((function(e){R[e]=t[e]}))},F.currentInput=T;var W=Object.assign({},t.applyStyles,{effect:function(t){var e=t.state,n={popper:{position:e.options.strategy,left:"0",top:"0",margin:"0"},arrow:{position:"absolute"},reference:{}};Object.assign(e.elements.popper.style,n.popper),e.styles=n,e.elements.arrow&&Object.assign(e.elements.arrow.style,n.arrow)}}),X={mouseover:"mouseenter",focusin:"focus",click:"click"};var Y={name:"animateFill",defaultValue:!1,fn:function(t){var e;if(null==(e=t.props.render)||!e.$$tippy)return{};var n=B(t.popper),r=n.box,o=n.content,i=t.props.animateFill?function(){var t=m();return t.className="tippy-backdrop",x([t],"hidden"),t}():null;return{onCreate:function(){i&&(r.insertBefore(i,r.firstElementChild),r.setAttribute("data-animatefill",""),r.style.overflow="hidden",t.setProps({arrow:!1,animation:"shift-away"}))},onMount:function(){if(i){var t=r.style.transitionDuration,e=Number(t.replace("ms",""));o.style.transitionDelay=Math.round(e/10)+"ms",i.style.transitionDuration=t,x([i],"visible")}},onShow:function(){i&&(i.style.transitionDuration="0ms")},onHide:function(){i&&x([i],"hidden")}}}};var q={clientX:0,clientY:0},$=[];function J(t){var e=t.clientX,n=t.clientY;q={clientX:e,clientY:n}}var G={name:"followCursor",defaultValue:!1,fn:function(t){var e=t.reference,n=E(t.props.triggerTarget||e),r=!1,o=!1,i=!0,a=t.props;function s(){return"initial"===t.props.followCursor&&t.state.isVisible}function u(){n.addEventListener("mousemove",f)}function p(){n.removeEventListener("mousemove",f)}function c(){r=!0,t.setProps({getReferenceClientRect:null}),r=!1}function f(n){var r=!n.target||e.contains(n.target),o=t.props.followCursor,i=n.clientX,a=n.clientY,s=e.getBoundingClientRect(),u=i-s.left,p=a-s.top;!r&&t.props.interactive||t.setProps({getReferenceClientRect:function(){var t=e.getBoundingClientRect(),n=i,r=a;"initial"===o&&(n=t.left+u,r=t.top+p);var s="horizontal"===o?t.top:r,c="vertical"===o?t.right:n,f="horizontal"===o?t.bottom:r,l="vertical"===o?t.left:n;return{width:c-l,height:f-s,top:s,right:c,bottom:f,left:l}}})}function l(){t.props.followCursor&&($.push({instance:t,doc:n}),function(t){t.addEventListener("mousemove",J)}(n))}function d(){0===($=$.filter((function(e){return e.instance!==t}))).filter((function(t){return t.doc===n})).length&&function(t){t.removeEventListener("mousemove",J)}(n)}return{onCreate:l,onDestroy:d,onBeforeUpdate:function(){a=t.props},onAfterUpdate:function(e,n){var i=n.followCursor;r||void 0!==i&&a.followCursor!==i&&(d(),i?(l(),!t.state.isMounted||o||s()||u()):(p(),c()))},onMount:function(){t.props.followCursor&&!o&&(i&&(f(q),i=!1),s()||u())},onTrigger:function(t,e){h(e)&&(q={clientX:e.clientX,clientY:e.clientY}),o="focus"===e.type},onHidden:function(){t.props.followCursor&&(c(),p(),i=!0)}}}};var K={name:"inlinePositioning",defaultValue:!1,fn:function(t){var e,n=t.reference;var r=-1,o=!1,i=[],a={name:"tippyInlinePositioning",enabled:!0,phase:"afterWrite",fn:function(o){var a=o.state;t.props.inlinePositioning&&(-1!==i.indexOf(a.placement)&&(i=[]),e!==a.placement&&-1===i.indexOf(a.placement)&&(i.push(a.placement),t.setProps({getReferenceClientRect:function(){return function(t){return function(t,e,n,r){if(n.length<2||null===t)return e;if(2===n.length&&r>=0&&n[0].left>n[1].right)return n[r]||e;switch(t){case"top":case"bottom":var o=n[0],i=n[n.length-1],a="top"===t,s=o.top,u=i.bottom,p=a?o.left:i.left,c=a?o.right:i.right;return{top:s,bottom:u,left:p,right:c,width:c-p,height:u-s};case"left":case"right":var f=Math.min.apply(Math,n.map((function(t){return t.left}))),l=Math.max.apply(Math,n.map((function(t){return t.right}))),d=n.filter((function(e){return"left"===t?e.left===f:e.right===l})),v=d[0].top,m=d[d.length-1].bottom;return{top:v,bottom:m,left:f,right:l,width:l-f,height:m-v};default:return e}}(l(t),n.getBoundingClientRect(),d(n.getClientRects()),r)}(a.placement)}})),e=a.placement)}};function s(){var e;o||(e=function(t,e){var n;return{popperOptions:Object.assign({},t.popperOptions,{modifiers:[].concat(((null==(n=t.popperOptions)?void 0:n.modifiers)||[]).filter((function(t){return t.name!==e.name})),[e])})}}(t.props,a),o=!0,t.setProps(e),o=!1)}return{onCreate:s,onAfterUpdate:s,onTrigger:function(e,n){if(h(n)){var o=d(t.reference.getClientRects()),i=o.find((function(t){return t.left-2<=n.clientX&&t.right+2>=n.clientX&&t.top-2<=n.clientY&&t.bottom+2>=n.clientY})),a=o.indexOf(i);r=a>-1?a:r}},onHidden:function(){r=-1}}}};var Q={name:"sticky",defaultValue:!1,fn:function(t){var e=t.reference,n=t.popper;function r(e){return!0===t.props.sticky||t.props.sticky===e}var o=null,i=null;function a(){var s=r("reference")?(t.popperInstance?t.popperInstance.state.elements.reference:e).getBoundingClientRect():null,u=r("popper")?n.getBoundingClientRect():null;(s&&Z(o,s)||u&&Z(i,u))&&t.popperInstance&&t.popperInstance.update(),o=s,i=u,t.state.isMounted&&requestAnimationFrame(a)}return{onMount:function(){t.props.sticky&&a()}}}};function Z(t,e){return!t||!e||(t.top!==e.top||t.right!==e.right||t.bottom!==e.bottom||t.left!==e.left)}return e&&function(t){var e=document.createElement("style");e.textContent=t,e.setAttribute("data-tippy-stylesheet","");var n=document.head,r=document.querySelector("head>style,head>link");r?n.insertBefore(e,r):n.appendChild(e)}('.tippy-box[data-animation=fade][data-state=hidden]{opacity:0}[data-tippy-root]{max-width:calc(100vw - 10px)}.tippy-box{position:relative;background-color:#333;color:#fff;border-radius:4px;font-size:14px;line-height:1.4;white-space:normal;outline:0;transition-property:transform,visibility,opacity}.tippy-box[data-placement^=top]>.tippy-arrow{bottom:0}.tippy-box[data-placement^=top]>.tippy-arrow:before{bottom:-7px;left:0;border-width:8px 8px 0;border-top-color:initial;transform-origin:center top}.tippy-box[data-placement^=bottom]>.tippy-arrow{top:0}.tippy-box[data-placement^=bottom]>.tippy-arrow:before{top:-7px;left:0;border-width:0 8px 8px;border-bottom-color:initial;transform-origin:center bottom}.tippy-box[data-placement^=left]>.tippy-arrow{right:0}.tippy-box[data-placement^=left]>.tippy-arrow:before{border-width:8px 0 8px 8px;border-left-color:initial;right:-7px;transform-origin:center left}.tippy-box[data-placement^=right]>.tippy-arrow{left:0}.tippy-box[data-placement^=right]>.tippy-arrow:before{left:-7px;border-width:8px 8px 8px 0;border-right-color:initial;transform-origin:center right}.tippy-box[data-inertia][data-state=visible]{transition-timing-function:cubic-bezier(.54,1.5,.38,1.11)}.tippy-arrow{width:16px;height:16px;color:#333}.tippy-arrow:before{content:"";position:absolute;border-color:transparent;border-style:solid}.tippy-content{position:relative;padding:5px 9px;z-index:1}'),F.setDefaultProps({plugins:[Y,G,K,Q],render:N}),F.createSingleton=function(t,e){var n;void 0===e&&(e={});var r,o=t,i=[],a=[],s=e.overrides,u=[],f=!1;function l(){a=o.map((function(t){return c(t.props.triggerTarget||t.reference)})).reduce((function(t,e){return t.concat(e)}),[])}function d(){i=o.map((function(t){return t.reference}))}function v(t){o.forEach((function(e){t?e.enable():e.disable()}))}function g(t){return o.map((function(e){var n=e.setProps;return e.setProps=function(o){n(o),e.reference===r&&t.setProps(o)},function(){e.setProps=n}}))}function h(t,e){var n=a.indexOf(e);if(e!==r){r=e;var u=(s||[]).concat("content").reduce((function(t,e){return t[e]=o[n].props[e],t}),{});t.setProps(Object.assign({},u,{getReferenceClientRect:"function"==typeof u.getReferenceClientRect?u.getReferenceClientRect:function(){var t;return null==(t=i[n])?void 0:t.getBoundingClientRect()}}))}}v(!1),d(),l();var b={fn:function(){return{onDestroy:function(){v(!0)},onHidden:function(){r=null},onClickOutside:function(t){t.props.showOnCreate&&!f&&(f=!0,r=null)},onShow:function(t){t.props.showOnCreate&&!f&&(f=!0,h(t,i[0]))},onTrigger:function(t,e){h(t,e.currentTarget)}}}},y=F(m(),Object.assign({},p(e,["overrides"]),{plugins:[b].concat(e.plugins||[]),triggerTarget:a,popperOptions:Object.assign({},e.popperOptions,{modifiers:[].concat((null==(n=e.popperOptions)?void 0:n.modifiers)||[],[W])})})),w=y.show;y.show=function(t){if(w(),!r&&null==t)return h(y,i[0]);if(!r||null!=t){if("number"==typeof t)return i[t]&&h(y,i[t]);if(o.indexOf(t)>=0){var e=t.reference;return h(y,e)}return i.indexOf(t)>=0?h(y,t):void 0}},y.showNext=function(){var t=i[0];if(!r)return y.show(0);var e=i.indexOf(r);y.show(i[e+1]||t)},y.showPrevious=function(){var t=i[i.length-1];if(!r)return y.show(t);var e=i.indexOf(r),n=i[e-1]||t;y.show(n)};var x=y.setProps;return y.setProps=function(t){s=t.overrides||s,x(t)},y.setInstances=function(t){v(!0),u.forEach((function(t){return t()})),o=t,v(!1),d(),l(),u=g(y),y.setProps({triggerTarget:a})},u=g(y),y},F.delegate=function(t,e){var n=[],o=[],i=!1,a=e.target,s=p(e,["target"]),u=Object.assign({},s,{trigger:"manual",touch:!1}),f=Object.assign({touch:R.touch},s,{showOnCreate:!0}),l=F(t,u);function d(t){if(t.target&&!i){var n=t.target.closest(a);if(n){var r=n.getAttribute("data-tippy-trigger")||e.trigger||R.trigger;if(!n._tippy&&!("touchstart"===t.type&&"boolean"==typeof f.touch||"touchstart"!==t.type&&r.indexOf(X[t.type])<0)){var s=F(n,f);s&&(o=o.concat(s))}}}}function v(t,e,r,o){void 0===o&&(o=!1),t.addEventListener(e,r,o),n.push({node:t,eventType:e,handler:r,options:o})}return c(l).forEach((function(t){var e=t.destroy,a=t.enable,s=t.disable;t.destroy=function(t){void 0===t&&(t=!0),t&&o.forEach((function(t){t.destroy()})),o=[],n.forEach((function(t){var e=t.node,n=t.eventType,r=t.handler,o=t.options;e.removeEventListener(n,r,o)})),n=[],e()},t.enable=function(){a(),o.forEach((function(t){return t.enable()})),i=!1},t.disable=function(){s(),o.forEach((function(t){return t.disable()})),i=!0},function(t){var e=t.reference;v(e,"touchstart",d,r),v(e,"mouseover",d),v(e,"focusin",d),v(e,"click",d)}(t)})),l},F.hideAll=function(t){var e=void 0===t?{}:t,n=e.exclude,r=e.duration;_.forEach((function(t){var e=!1;if(n&&(e=b(n)?t.reference===n:t.popper===n.popper),!e){var o=t.props.duration;t.setProps({duration:r}),t.hide(),t.state.isDestroyed||t.setProps({duration:o})}}))},F.roundArrow='<svg width="16" height="6" xmlns="http://www.w3.org/2000/svg"><path d="M0 6s1.796-.013 4.67-3.615C5.851.9 6.93.006 8 0c1.07-.006 2.148.887 3.343 2.385C14.233 6.005 16 6 16 6H0z"></svg>',F}));
// vzo-inp-tooltips-scope-20261005: повторный tippy() на том же элементе в v6
// не переиспользует экземпляр, а вешает ещё один (с поппером и слушателями).
// Поэтому уже инициализированные элементы пропускаем, а вызывающий код может
// передать корень — лист карточки, — чтобы не обходить весь документ в клике.
// [data-modal-title] идёт первым: элемент с обоими атрибутами получает один
// экземпляр, тот, что с zIndex 1111 и виден поверх листа.
// vzo29-a1-contrast: на тач-устройствах tippy показывает тултип по tap'у и
// оставляет его видимым до следующего tap'а — на кнопках-действиях (Подробнее/
// Сравнить/Печать/Жалоба) это лишний слой поверх модалки. Интерактивным
// триггерам отключаем touch: тултип остаётся на hover/focus. Неинтерактивным
// span'ам (К5М-инфо) tap остаётся единственным способом открыть тултип.
function isInteractiveTooltipTrigger(el) {
    return el.matches('button, a, .btn, [role="button"]');
}

function initTooltips(root) {
    root = root || document;

    root.querySelectorAll('[data-modal-title]').forEach(tooltip => {
        if (tooltip._tippy) return;
        tippy(tooltip, {
            content: tooltip.dataset.title,
            placement: tooltip.dataset.titlePosition || 'top',
            theme: 'vzo',
            zIndex: 1111,
            touch: !isInteractiveTooltipTrigger(tooltip),
        });
    });

    root.querySelectorAll('[data-title]').forEach(tooltip => {
        if (tooltip._tippy) return;
        tippy(tooltip, {
            content: tooltip.dataset.title,
            placement: tooltip.dataset.titlePosition || 'top',
            theme: 'vzo',
            zIndex: 1000,
            touch: !isInteractiveTooltipTrigger(tooltip),
        });
    });
}
initTooltips();

document.addEventListener('DOMContentLoaded', function () {
    var cookiesBlock = document.querySelector('.cookies-info');
    if (!cookiesBlock) {
        return;
    }

    var isHidden = false;
    try {
        isHidden = localStorage.getItem('cookies-hide-block') === 'true';
    } catch (error) {
        isHidden = false;
    }

    if (isHidden) {
        return;
    }

    cookiesBlock.classList.remove('hidden');
    var closeButton = cookiesBlock.querySelector('.btn');
    if (!closeButton) {
        return;
    }

    closeButton.addEventListener('click', function () {
        cookiesBlock.classList.add('hidden');
        document.dispatchEvent(new CustomEvent('vzo:cookies-hidden'));
        try {
            localStorage.setItem('cookies-hide-block', 'true');
        } catch (error) {
            // The compact banner still closes when storage is unavailable.
        }
    });
});
(function (window, document) {
    'use strict';

    var config = window.vzoJourneyActionsConfig || {};
    var supportedEvents = {
        official_login_cta_click: true,
        review_return_cta_click: true,
        journey_offer_cta_click: true,
        journey_compare_click: true,
        recommendation_read_50: true,
        recommendation_read_90: true,
        recommendation_engaged_60s: true,
        recommendation_soft_cta_click: true
    };
    var supportedContexts = {
        bank_login: true,
        mfo_login: true,
        mfo_reviews: true,
        service_reviews: true,
        recommendation: true,
        commercial_depth: true
    };
    var supportedActions = {
        official_site: true,
        company_offer: true,
        compare_loans: true,
        compare_cards: true,
        first_offer: true,
        comparison: true
    };

    function safeStorageGet(key) {
        try {
            return window.localStorage.getItem(key);
        } catch (error) {
            return null;
        }
    }

    function recommendationSource() {
        if (!document.referrer) {
            return null;
        }

        var host;
        try {
            host = new window.URL(document.referrer).hostname.toLowerCase();
        } catch (error) {
            return null;
        }

        if (host === 'dzen.ru' || host.endsWith('.dzen.ru') || host === 'zen.yandex.ru') {
            return 'dzen';
        }
        if (host === 'pulse.mail.ru' || host.endsWith('.pulse.mail.ru')) {
            return 'pulse';
        }
        if (host === 'news.google.com' || host.endsWith('.news.google.com')) {
            return 'google_news';
        }

        return null;
    }

    function safeAttribute(element, name, allowList) {
        var value = element && element.getAttribute(name);
        return value && allowList[value] ? value : null;
    }

    function emit(eventName, element, extra) {
        if (!supportedEvents[eventName]) {
            return;
        }

        var payload = {
            event_version: 1,
            page_path: window.location.pathname || '/'
        };
        var context = safeAttribute(element, 'data-vzo-journey-context', supportedContexts);
        var action = safeAttribute(element, 'data-vzo-journey-action', supportedActions);

        if (context) {
            payload.journey_context = context;
        }
        if (action) {
            payload.journey_action = action;
        }
        if (extra && extra.recommendation_source) {
            payload.recommendation_source = extra.recommendation_source;
        }
        if (extra && (extra.read_depth === 50 || extra.read_depth === 90)) {
            payload.read_depth = extra.read_depth;
        }

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: eventName,
            vzo_event_version: payload.event_version,
            page_path: payload.page_path,
            journey_context: payload.journey_context,
            journey_action: payload.journey_action,
            recommendation_source: payload.recommendation_source,
            read_depth: payload.read_depth
        });

        if (typeof window.ym === 'function' && /^\d+$/.test(String(config.metrikaCounterId || ''))) {
            window.ym(Number(config.metrikaCounterId), 'reachGoal', eventName, payload);
        }
    }

    function compareCount() {
        var count = 0;
        for (var category = 1; category < 15; category += 1) {
            var stored = safeStorageGet('vzo_compare_' + category);
            if (stored) {
                count += stored.split(',').filter(Boolean).length;
            }
        }
        return count;
    }

    function initTrackedClicks() {
        document.addEventListener('click', function (event) {
            var trigger = event.target.closest ? event.target.closest('[data-vzo-journey-event]') : null;
            if (trigger) {
                emit(trigger.getAttribute('data-vzo-journey-event'), trigger);
            }
        }, false);
    }

    function initCommercialJourney() {
        var journey = document.querySelector('[data-vzo-commercial-journey]');
        var compareButton = journey && journey.querySelector('[data-vzo-journey-compare]');

        if (!journey || !compareButton || journey.__vzoJourneyInit) {
            return;
        }
        journey.__vzoJourneyInit = true;

        var slot = journey.closest('.commercial-journey-slot') || document.querySelector('.commercial-journey-slot');
        var OBSTACLE_SELECTORS = ['.company-fixed-block.company-fixed', '.cookies-info:not(.hidden)'];
        var CLICK_SELECTORS = '.btn-compare, .clear-compare, .clearCompare, .deleteFromCompare';
        var STORAGE_KEY_RE = /^vzo_compare_\d+$/;
        var GAP = 12;
        var DESKTOP_BOTTOM = 18;
        var MOBILE_BOTTOM = 62;
        var mobileQuery = window.matchMedia ? window.matchMedia('(max-width: 767px)') : null;
        var frameId = 0;
        var lastLabel = null;
        var lastBottom = null;
        var lastShow = null;

        function viewportHeight() {
            return window.innerHeight || document.documentElement.clientHeight || 0;
        }

        function readCount() {
            var count = 0;
            try {
                count = parseInt(compareCount(), 10) || 0;
            } catch (e) {
                count = 0;
            }
            return count > 0 ? count : 0;
        }

        // Top edge (viewport px) of a visible bottom obstacle, or null when not visible.
        function obstacleTop(el, vh) {
            var style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) {
                return null;
            }
            var rect = el.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0 || rect.top >= vh || rect.bottom <= 0) {
                return null;
            }
            return rect.top;
        }

        function computeBottom(vh) {
            var bottom = mobileQuery && mobileQuery.matches ? MOBILE_BOTTOM : DESKTOP_BOTTOM;
            for (var i = 0; i < OBSTACLE_SELECTORS.length; i++) {
                var nodes = document.querySelectorAll(OBSTACLE_SELECTORS[i]);
                for (var j = 0; j < nodes.length; j++) {
                    var top = obstacleTop(nodes[j], vh);
                    if (top !== null) {
                        bottom = Math.max(bottom, vh - top + GAP);
                    }
                }
            }
            return Math.max(0, Math.round(bottom));
        }

        function update() {
            frameId = 0;

            var count = readCount();
            var show = count > 0;
            var label = show ? 'Сравнить (' + count + ')' : 'Сравнить';

            if (label !== lastLabel) {
                compareButton.textContent = label;
                lastLabel = label;
            }

            if (show !== lastShow) {
                journey.classList.toggle('is-visible', show);
                journey.setAttribute('aria-hidden', show ? 'false' : 'true');
                compareButton.tabIndex = show ? 0 : -1;
                if ('inert' in journey) {
                    journey.inert = !show;
                }
                lastShow = show;
            }

            var vh = viewportHeight();
            var bottom = computeBottom(vh);
            if (bottom !== lastBottom) {
                journey.style.setProperty('--vzo-journey-bottom', bottom + 'px');
                lastBottom = bottom;
            }

            // Slot top is a stable anchor: docked content renders after it, so it never shifts the slot's own top.
            var docked = false;
            if (slot) {
                var slotTop = slot.getBoundingClientRect().top;
                docked = slotTop < vh - bottom;
            }
            journey.classList.toggle('is-docked', docked);
        }

        function scheduleUpdate() {
            if (!frameId) {
                frameId = window.requestAnimationFrame(update);
            }
        }

        compareButton.addEventListener('click', function (event) {
            if (event && typeof event.preventDefault === 'function') {
                event.preventDefault();
            }
            var count = readCount();
            update();
            if (count > 0) {
                emit('journey_compare_click', compareButton);
                window.location.assign('/compare');
            }
        });

        // Capture phase so stopPropagation in legacy handlers can't hide the click;
        // the rAF runs after the click task, i.e. after all underlying handlers.
        document.addEventListener('click', function (event) {
            var target = event.target;
            if (target && target.closest && target.closest(CLICK_SELECTORS)) {
                scheduleUpdate();
                window.setTimeout(scheduleUpdate, 0);
            }
        }, true);

        document.addEventListener('transitionend', function (event) {
            var target = event.target;
            if (target && target.closest && target.closest('.company-fixed-block, .cookies-info')) {
                scheduleUpdate();
            }
        }, true);

        window.addEventListener('storage', function (event) {
            if (!event || event.key === null || STORAGE_KEY_RE.test(event.key)) {
                scheduleUpdate();
            }
        });

        window.addEventListener('scroll', scheduleUpdate, {passive: true});
        window.addEventListener('resize', scheduleUpdate, {passive: true});
        window.addEventListener('orientationchange', scheduleUpdate);
        window.addEventListener('pageshow', scheduleUpdate);
        window.addEventListener('popstate', scheduleUpdate);
        window.addEventListener('hashchange', scheduleUpdate);
        window.addEventListener('load', scheduleUpdate);
        document.addEventListener('visibilitychange', function () {
            if (!document.hidden) {
                scheduleUpdate();
            }
        });
        document.addEventListener('vzo:cookies-hidden', scheduleUpdate);

        if (mobileQuery) {
            if (typeof mobileQuery.addEventListener === 'function') {
                mobileQuery.addEventListener('change', scheduleUpdate);
            } else if (typeof mobileQuery.addListener === 'function') {
                mobileQuery.addListener(scheduleUpdate);
            }
        }

        update();
        scheduleUpdate();
    }

    function initRecommendationJourney() {
        var source = recommendationSource();
        var nextStep = document.querySelector('[data-vzo-recommendation-next-step]');
        if (!source || !nextStep) {
            return;
        }

        var sent50 = false;
        var sent90 = false;
        var activeSeconds = 0;

        function readDepth() {
            var root = document.documentElement;
            var scrollable = Math.max(root.scrollHeight - window.innerHeight, 1);
            return Math.min(100, Math.round(((window.scrollY || root.scrollTop || 0) / scrollable) * 100));
        }

        function checkDepth() {
            var depth = readDepth();
            if (depth >= 50 && !sent50) {
                sent50 = true;
                nextStep.hidden = false;
                emit('recommendation_read_50', nextStep, {recommendation_source: source, read_depth: 50});
            }
            if (depth >= 90 && !sent90) {
                sent90 = true;
                emit('recommendation_read_90', nextStep, {recommendation_source: source, read_depth: 90});
            }
        }

        nextStep.addEventListener('click', function (event) {
            var link = event.target.closest ? event.target.closest('a') : null;
            if (link) {
                emit('recommendation_soft_cta_click', link, {recommendation_source: source});
            }
        });

        window.setInterval(function () {
            if (document.visibilityState !== 'visible') {
                return;
            }
            activeSeconds += 5;
            if (activeSeconds === 60) {
                emit('recommendation_engaged_60s', nextStep, {recommendation_source: source});
            }
        }, 5000);

        window.addEventListener('scroll', checkDepth, {passive: true});
        checkDepth();
    }

    function initialize() {
        initTrackedClicks();
        initCommercialJourney();
        initRecommendationJourney();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize, {once: true});
    } else {
        initialize();
    }
})(window, document);
var firstCol = $$('.first-col');
var secondCol = $$('.second-col');

for(let i = 0; i<firstCol.length; i++){
    firstCol[i].addEventListener('mouseenter', function(){
        firstCol[i].style.background = "#D3E4FD";
        secondCol[i].style.background = "#F3F8FF";
    });
    secondCol[i].addEventListener('mouseenter', function(){
        firstCol[i].style.background = "#D3E4FD";
        secondCol[i].style.background = "#F3F8FF";
    });
    firstCol[i].addEventListener('mouseout', function(){
        firstCol[i].style.background = "#E1EDFF";
        secondCol[i].style.background = "#fff";
    });
    secondCol[i].addEventListener('mouseout', function(){
        firstCol[i].style.background = "#E1EDFF";
        secondCol[i].style.background = "#fff";
    });
}

// скрытие таблицы
let addTableWrap = (selector) => {
    selector = document.querySelectorAll('.content table');
    if ((selector).length > 0) {
        (selector).forEach((table) => {
            if (table.classList.contains('total_cards_table_js')) {
                return;
            }
            let tr = table.querySelectorAll('tr');

            let wrapper = document.createElement('div');
            wrapper.className = "table-scroll";
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);

            if(tr.length > 5){
                table.closest('.table-scroll').classList.add('table-toggle-wrap');
                let button = document.createElement('span');
                button.className = 'table-toggle-btn down';
                button.textContent = 'Показать всё';
                table.after(button);
                let i = 0;
                table.querySelectorAll('tr').forEach((tr) => {
                    i++;
                    if (i>5) tr.className = 'hide';
                });
            } else {
                table.closest('.table-scroll').classList.add('without-toggle');
            }
        });
    }
}

if ($$('.content').length > 0) {
    addTableWrap('.content table');

    $$('.table-toggle-btn').forEach((button) => {
        button.addEventListener('click', () => {
            if (button.classList.contains('down')) {
                button.classList.add('up');
                button.classList.remove('down');
                button.textContent = 'Скрыть';
                button.previousSibling.querySelectorAll('tr.hide').forEach((tr) => {
                    tr.classList.add('show');
                    tr.classList.remove('hide');
                });
                if(button.closest('.panel') != null){
                    button.closest('.panel').style.maxHeight = 'fit-content';
                }
            } else {
                button.classList.add('down');
                button.classList.remove('up');
                button.textContent = 'Показать всё';
                button.previousSibling.querySelectorAll('tr.show').forEach((tr) => {
                    tr.classList.add('hide');
                    tr.classList.remove('show');
                });
            }
        });
    });
}
(function () {
    var config = window.vzoLeadsIdConfig || {};

    if (!config.enabled) {
        return;
    }

    var storageKey = 'vzo_leads_id';
    var historyTimer = null;
    var lastHistorySignature = '';

    function isValidLeadsId(value) {
        return typeof value === 'string' && /^[a-zA-Z0-9_-]{3,128}$/.test(value);
    }

    function getStoredLeadsId() {
        try {
            var stored = window.localStorage.getItem(storageKey);
            return isValidLeadsId(stored) ? stored : null;
        } catch (error) {
            return null;
        }
    }

    function setStoredLeadsId(leadsId) {
        try {
            window.localStorage.setItem(storageKey, leadsId);
        } catch (error) {}
    }

    function postJson(url, payload) {
        if (!url || !window.fetch) {
            return Promise.resolve(null);
        }

        return window.fetch(url, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': config.csrfToken || ''
            },
            body: JSON.stringify(payload)
        }).then(function (response) {
            if (!response.ok) {
                return null;
            }

            return response.json();
        }).catch(function () {
            return null;
        });
    }

    function appendParamToUrl(rawUrl, leadsId) {
        if (!rawUrl || !isValidLeadsId(leadsId)) {
            return rawUrl;
        }

        if (/^(mailto:|tel:|javascript:|#)/i.test(rawUrl)) {
            return rawUrl;
        }

        try {
            var url = new URL(rawUrl, window.location.origin);

            if (url.searchParams.has(config.linkParam || 'lfid') || url.searchParams.has('l_fid')) {
                return rawUrl;
            }

            url.searchParams.set(config.linkParam || 'lfid', leadsId);

            if (rawUrl.indexOf('http://') === 0 || rawUrl.indexOf('https://') === 0) {
                return url.toString();
            }

            return url.pathname + url.search + url.hash;
        } catch (error) {
            return rawUrl;
        }
    }

    function enhanceOfferLinks(leadsId) {
        var nodes = document.querySelectorAll([
            '[data-leads-offer-link]',
            '[data-leads-offer-id] .offer-btn',
            '[data-leads-offer-ids] .offer-btn',
            '[data-leads-offer-id] .card-minimal_block-btn a',
            '[data-leads-offer-ids] .card-minimal_block-btn a',
            '[data-leads-offer-id] .card-minimal_block-btn button',
            '[data-leads-offer-ids] .card-minimal_block-btn button',
            '[data-leads-offer-id] .card-more-block-to-load',
            '[data-leads-offer-ids] .card-more-block-to-load',
            '[data-leads-offer-id] .hidden-card-info .btn-primary[href]',
            '[data-leads-offer-ids] .hidden-card-info .btn-primary[href]',
            '[data-leads-offer-id] .hidden-card-info .btn-primary[data-href]',
            '[data-leads-offer-ids] .hidden-card-info .btn-primary[data-href]'
        ].join(','));

        Array.prototype.forEach.call(nodes, function (node) {
            var href = node.getAttribute('href');
            var dataHref = node.getAttribute('data-href');
            var dataLink = node.getAttribute('data-link');

            if (href) {
                node.setAttribute('href', appendParamToUrl(href, leadsId));
            }

            if (dataHref) {
                node.setAttribute('data-href', appendParamToUrl(dataHref, leadsId));
            }

            if (dataLink) {
                node.setAttribute('data-link', appendParamToUrl(dataLink, leadsId));
            }
        });
    }

    function syncPhoneForms(leadsId) {
        if (!isValidLeadsId(leadsId)) {
            return;
        }

        var forms = document.querySelectorAll('form');

        Array.prototype.forEach.call(forms, function (form) {
            if (!form.querySelector('input[name="phone"], input[type="tel"]')) {
                return;
            }

            var input = form.querySelector('input[name="lfid"]');

            if (!input) {
                input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'lfid';
                form.appendChild(input);
            }

            input.value = leadsId;
        });
    }

    function offerIdsForNode(node) {
        var rawIds = [
            node.getAttribute('data-leads-offer-ids') || '',
            node.getAttribute('data-leads-offer-id') || ''
        ].join(',');
        var offerIds = {};

        rawIds.split(/[\s,]+/).forEach(function (value) {
            var offerId = parseInt(value, 10);

            if (offerId > 0) {
                offerIds[offerId] = true;
            }
        });

        return Object.keys(offerIds).map(function (offerId) {
            return parseInt(offerId, 10);
        });
    }

    function collectOffers() {
        var offerIds = {};
        var nodes = document.querySelectorAll('[data-leads-offer-id], [data-leads-offer-ids]');

        Array.prototype.forEach.call(nodes, function (node) {
            offerIdsForNode(node).forEach(function (offerId) {
                offerIds[offerId] = true;
            });
        });

        return Object.keys(offerIds).map(function (offerId) {
            return parseInt(offerId, 10);
        }).filter(function (offerId) {
            return offerId > 0;
        }).sort(function (a, b) {
            return a - b;
        });
    }

    function hideRepeatedOffers(offerIds) {
        if (!offerIds || !offerIds.length) {
            return;
        }

        var shouldHide = {};

        offerIds.forEach(function (offerId) {
            shouldHide[String(offerId)] = true;
        });

        var nodes = document.querySelectorAll('[data-leads-offer-id], [data-leads-offer-ids]');

        Array.prototype.forEach.call(nodes, function (node) {
            var matched = offerIdsForNode(node).some(function (offerId) {
                return shouldHide[String(offerId)];
            });

            if (!matched) {
                return;
            }

            var card = node.closest('[data-leads-card-id], .card') || node;
            card.setAttribute('data-leads-id-hidden', 'true');
            card.style.display = 'none';
        });
    }

    function checkHistorySoon() {
        window.clearTimeout(historyTimer);
        historyTimer = window.setTimeout(checkHistory, 250);
    }

    function checkHistory() {
        var leadsId = getStoredLeadsId();

        if (!leadsId) {
            return;
        }

        enhanceOfferLinks(leadsId);
        syncPhoneForms(leadsId);

        var offers = collectOffers();

        if (!offers.length) {
            return;
        }

        var signature = leadsId + '|' + offers.join(',');

        if (signature === lastHistorySignature) {
            return;
        }

        lastHistorySignature = signature;

        postJson(config.historyUrl, {
            leads_id: leadsId,
            offers: offers,
            page: window.location.href
        }).then(function (payload) {
            if (!payload || !payload.repeated_offer_ids) {
                return;
            }

            hideRepeatedOffers(payload.repeated_offer_ids);
        });
    }

    function saveLeadsId(leadsId) {
        if (!isValidLeadsId(leadsId)) {
            return;
        }

        setStoredLeadsId(leadsId);
        enhanceOfferLinks(leadsId);
        syncPhoneForms(leadsId);

        postJson(config.visitorUrl, {
            leads_id: leadsId,
            page: window.location.href
        });

        checkHistorySoon();
    }

    function consumeEventDetail(detail) {
        if (!detail) {
            return;
        }

        saveLeadsId(detail.lfid || detail.leads_id || detail.leadsId || '');
    }

    window.addEventListener('lfidDataReceived', function (event) {
        consumeEventDetail(event.detail || {});
    });

    (window.vzoLeadsIdQueue || []).forEach(consumeEventDetail);
    window.vzoLeadsIdQueue = [];

    var storedLeadsId = getStoredLeadsId();

    if (storedLeadsId) {
        enhanceOfferLinks(storedLeadsId);
        syncPhoneForms(storedLeadsId);
        checkHistorySoon();
    }

    if (window.MutationObserver) {
        var observer = new MutationObserver(function () {
            checkHistorySoon();
        });

        if (document.body) {
            observer.observe(document.body, {childList: true, subtree: true});
        }
    }
})();
/* Виджет-помощник «Поддержка ВЗО». Vanilla JS, без зависимостей. */
(function () {
    var cfg = window.vzoChatConfig || {};
    if (!cfg.enabled || !window.fetch) {
        return;
    }

    var STORE_OPEN = 'vzo_chat_open';
    var LEGACY_STORE_HIST = 'vzo_chat_history';
    var LEGACY_STORE_HIST_TS = 'vzo_chat_history_saved_at';
    var HISTORY_SCOPE = cfg.historyScope === 'navigator-treatment' ? 'navigator-treatment' : 'navigator-control';
    var STORE_HIST = LEGACY_STORE_HIST + ':' + HISTORY_SCOPE;
    var STORE_HIST_TS = LEGACY_STORE_HIST_TS + ':' + HISTORY_SCOPE;
    var MAX_LEN = cfg.maxLen || 2000;
    var MAX_TURNS = cfg.maxTurns || 10;
    var HISTORY_TTL_MS = Math.max(5 * 60 * 1000, Math.min(Number(cfg.historyTtlMs) || 30 * 60 * 1000, 2 * 60 * 60 * 1000));
    var ALLOWED_URLS = Array.isArray(cfg.allowedUrls) ? cfg.allowedUrls.slice() : [];

    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    onReady(function () {
        var root = document.querySelector('.vzo-chat');
        if (!root || root.dataset.vzoInit === '1') {
            return;
        }
        root.dataset.vzoInit = '1';

        var fab = root.querySelector('.vzo-chat-fab');
        var closeBtn = root.querySelector('.vzo-chat-close');
        var list = root.querySelector('.vzo-chat-list');
        var form = root.querySelector('.vzo-chat-input');
        var input = root.querySelector('textarea');
        var sendBtn = root.querySelector('.vzo-chat-send');
        var availability = root.querySelector('.vzo-chat-subtitle');

        // История по умолчанию живёт только в текущей вкладке и истекает.
        // Удаляем legacy-копию, которая раньше могла сохраняться постоянно.
        try {
            localStorage.removeItem(LEGACY_STORE_HIST);
            localStorage.removeItem(LEGACY_STORE_HIST_TS);
            sessionStorage.removeItem(LEGACY_STORE_HIST);
            sessionStorage.removeItem(LEGACY_STORE_HIST_TS);
        } catch (e) {}
        var history = loadHistory(); // [{role, content}]
        var sending = false;
        var greeted = false;

        // Восстановить историю.
        history.forEach(function (m) {
            render(m.role === 'assistant' ? 'bot' : 'user', m.content);
        });
        if (history.length > 0) {
            greeted = true;
        }
        try {
            if (localStorage.getItem(STORE_OPEN) === '1') {
                open(true);
            }
        } catch (e) {}

        fab.addEventListener('click', function () { open(true); });
        closeBtn.addEventListener('click', function () { open(false); });

        // vzo29-triage-20261031: на мобильных (<992px) FAB не должен
        // перекрывать конверсионный контент первого экрана — показывается
        // после прокрутки. На десктопе класс не имеет визуального эффекта.
        var FAB_REVEAL_AFTER_PX = 240;
        function syncFabReveal() {
            if (fab) {
                fab.classList.toggle('is-revealed', window.scrollY > FAB_REVEAL_AFTER_PX);
            }
        }
        window.addEventListener('scroll', syncFabReveal, { passive: true });
        window.addEventListener('resize', syncFabReveal, { passive: true });
        syncFabReveal();

        document.addEventListener('vzo:chat-open', function (event) {
            open(true);

            var detail = event && event.detail ? event.detail : {};
            var prompt = typeof detail.prompt === 'string' ? detail.prompt.trim() : '';
            if (prompt) {
                input.value = prompt.slice(0, MAX_LEN);
                input.dispatchEvent(new Event('input'));
                input.focus();
            }
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            send();
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
            }
        });

        // Авто-рост textarea.
        input.addEventListener('input', function () {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        });

        function open(state) {
            root.classList.toggle('is-open', state);
            try { localStorage.setItem(STORE_OPEN, state ? '1' : '0'); } catch (e) {}
            if (state) {
                if (!greeted) {
                    greeted = true;
                    render('bot', cfg.greeting || 'Здравствуйте! Подскажу по сайту и займам. Чем помочь?');
                }
                setTimeout(function () { input.focus(); }, 50);
                scrollDown();
            }
        }

        function send() {
            var text = (input.value || '').trim();
            if (!text || sending) {
                return;
            }
            if (text.length > MAX_LEN) {
                text = text.slice(0, MAX_LEN);
            }

            render('user', text);
            history.push({ role: 'user', content: text });

            input.value = '';
            input.style.height = 'auto';
            setSending(true);

            var payload = {
                message: text,
                history: history.slice(0, -1).slice(-2 * MAX_TURNS)
            };

            if (cfg.stream && cfg.streamUrl && window.ReadableStream && window.TextDecoder) {
                sendStreaming(payload, text);
            } else {
                sendJson(payload, text);
            }
        }

        // Обычный режим: один JSON-ответ.
        function sendJson(payload, pendingText) {
            fetch(cfg.url, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken()
                },
                body: JSON.stringify(payload)
            })
                .then(function (r) {
                    return r.json().then(function (j) { return { ok: r.ok, status: r.status, body: j }; });
                })
                .then(function (res) {
                    var body = res.body || {};
                    var reply = body.reply || body.message || cfg.fallback;
                    render('bot', reply);
                    if (res.ok && body.status === 'ok' && body.reply) {
                        setUnavailable(false);
                        history.push({ role: 'assistant', content: body.reply });
                        persist();
                    } else {
                        if (res.status !== 422) { setUnavailable(true); }
                        removePendingTurn(pendingText);
                        persist();
                    }
                })
                .catch(function () {
                    setUnavailable(true);
                    removePendingTurn(pendingText);
                    persist();
                    render('bot', cfg.fallback);
                })
                .then(function () {
                    setSending(false);
                    input.focus();
                });
        }

        // SSE используется как транспорт, но в интерфейс попадает только
        // завершённый ответ из done-события после серверных проверок.
        function sendStreaming(payload, pendingText) {
            var finalReply = '';
            var completed = false;
            var streamFailed = false;

            function handleEvent(ev) {
                if (!ev || typeof ev !== 'object') {
                    return;
                }
                if (ev.error) {
                    streamFailed = true;
                    return;
                }
                if (ev.done === true && typeof ev.reply === 'string' && ev.reply) {
                    finalReply = ev.reply;
                    completed = true;
                }
            }

            function handleBlock(block) {
                var data = block.split('\n').filter(function (line) {
                    return line.indexOf('data:') === 0;
                }).map(function (line) {
                    return line.slice(5).replace(/^\s+/, '');
                }).join('\n');

                if (!data) {
                    return;
                }
                try {
                    handleEvent(JSON.parse(data));
                } catch (e) {
                    streamFailed = true;
                }
            }

            function normalizeStreamNewlines(raw, preserveTrailingCr) {
                var trailingCr = preserveTrailingCr && raw.slice(-1) === '\r';
                var complete = trailingCr ? raw.slice(0, -1) : raw;

                return complete.replace(/\r\n/g, '\n').replace(/\r/g, '\n') + (trailingCr ? '\r' : '');
            }

            fetch(cfg.streamUrl, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'text/event-stream',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken()
                },
                body: JSON.stringify(payload)
            })
                .then(function (resp) {
                    if (!resp.ok || !resp.body) {
                        throw new Error('http ' + resp.status);
                    }
                    var reader = resp.body.getReader();
                    var dec = new TextDecoder();
                    var buf = '';
                    function pump() {
                        return reader.read().then(function (res) {
                            if (res.done) {
                                buf += dec.decode();
                                buf = normalizeStreamNewlines(buf, false);
                                if (buf.trim()) {
                                    handleBlock(buf);
                                }
                                return;
                            }
                            buf += dec.decode(res.value, { stream: true });
                            // Keep a trailing CR until the next chunk so a
                            // split CRLF never becomes two blank lines.
                            buf = normalizeStreamNewlines(buf, true);
                            var idx;
                            while ((idx = buf.indexOf('\n\n')) !== -1) {
                                var block = buf.slice(0, idx);
                                buf = buf.slice(idx + 2);
                                handleBlock(block);
                            }
                            return pump();
                        });
                    }
                    return pump();
                })
                .then(function () {
                    if (streamFailed || !completed || !finalReply) {
                        throw new Error('incomplete stream');
                    }
                    setUnavailable(false);
                    render('bot', finalReply);
                    history.push({ role: 'assistant', content: finalReply });
                    persist();
                })
                .catch(function () {
                    setUnavailable(true);
                    removePendingTurn(pendingText);
                    persist();
                    render('bot', cfg.fallback);
                })
                .then(function () {
                    setSending(false);
                    input.focus();
                });
        }

        function setUnavailable(unavailable) {
            if (availability) {
                availability.textContent = unavailable ? 'Временно недоступен' : 'Помощь по сайту';
            }
        }

        function setSending(state) {
            sending = state;
            root.classList.toggle('is-loading', state);
            if (sendBtn) { sendBtn.disabled = state; }
            if (state) { scrollDown(); }
        }

        function render(kind, text) {
            var el = document.createElement('div');
            el.className = 'vzo-chat-msg vzo-chat-msg--' + kind;
            if (kind === 'bot') {
                el.innerHTML = safeMarkdown(text);
            } else {
                el.textContent = text; // сообщения пользователя — только текстом
            }
            list.appendChild(el);
            scrollDown();
        }

        function scrollDown() {
            list.scrollTop = list.scrollHeight;
        }

        /* Минимальный безопасный markdown: сначала эскейпим ВСЁ, затем
           включаем только **жирный** и [текст](https-ссылка) из белого списка. */
        function safeMarkdown(raw) {
            var s = escapeHtml(String(raw == null ? '' : raw));
            s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            s = s.replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g, function (m, label, url) {
                if (!isAllowedUrl(url)) {
                    return label; // не из белого списка — оставить как текст
                }
                // Кавычки/угловые скобки в URL закодировать, чтобы исключить
                // выход из атрибута href (защита от инъекции в ссылке).
                var safeUrl = url.replace(/"/g, '%22').replace(/'/g, '%27')
                    .replace(/</g, '%3C').replace(/>/g, '%3E');
                return '<a href="' + safeUrl + '" target="_blank" rel="nofollow noopener">' + label + '</a>';
            });
            return s;
        }

        function isAllowedUrl(url) {
            return ALLOWED_URLS.indexOf(url) !== -1;
        }

        function escapeHtml(t) {
            var d = document.createElement('div');
            d.textContent = t;
            return d.innerHTML;
        }

        function csrfToken() {
            var meta = document.querySelector('meta[name="csrf-token"]');
            return (meta && meta.getAttribute('content')) || cfg.csrfToken || '';
        }

        function persist() {
            try {
                sessionStorage.setItem(STORE_HIST, JSON.stringify(history.slice(-2 * MAX_TURNS)));
                sessionStorage.setItem(STORE_HIST_TS, String(Date.now()));
            } catch (e) {}
        }

        function removePendingTurn(text) {
            var last = history[history.length - 1];
            if (last && last.role === 'user' && last.content === text) {
                history.pop();
            }
        }

        function loadHistory() {
            try {
                var savedAt = Number(sessionStorage.getItem(STORE_HIST_TS) || 0);
                var now = Date.now();
                if (!savedAt || savedAt > now || now - savedAt > HISTORY_TTL_MS) {
                    sessionStorage.removeItem(STORE_HIST);
                    sessionStorage.removeItem(STORE_HIST_TS);
                    return [];
                }
                var stored = JSON.parse(sessionStorage.getItem(STORE_HIST) || '[]');
                return Array.isArray(stored) ? stored.slice(-2 * MAX_TURNS) : [];
            } catch (e) {
                return [];
            }
        }
    });
})();
