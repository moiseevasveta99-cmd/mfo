// sorting
$$('.sort .option').forEach((el) => {
    el.addEventListener('click', () => {
        let selectedItem =  $$('.sort .selected-item')[0];
        let sortType = 'desc';
        if (el.getAttribute('data-type') == 'down') {
            sortType = 'asc';
        }
        window.SORT_TYPE = sortType;

        let sortField = el.getAttribute('data-field');
        window.SORT_FIELD = sortField;

        let priorityField = el.getAttribute('data-priority-field');
        let priorityValue = el.getAttribute('data-priority-value');

        window.PRIORITY_FIELD = priorityField ? priorityField : '';
        window.PRIORITY_VALUE = priorityValue ? priorityValue : '';

        window.NUMBER_PAGE = 1;

        if (selectedItem) {
            selectedItem.innerHTML = el.innerHTML;
            selectedItem.dataset.type = el.getAttribute('data-type');
            selectedItem.dataset.field = sortField;
        }

        cardsDefaultLoad('sorting');

        if (selectedItem) {
            selectedItem.classList.remove('openSelect');
            $$('.sort .selected-dropdown')[0].classList.remove('toggleSelect');
        }
    });
});


// load
if ($$('#load_more').length > 0) {
    $$('#load_more')[0].addEventListener('click', () => {
        window.NUMBER_PAGE++;
        cardsDefaultLoad('load');
    });
}


let cardsDefaultLoad = (action, callback = null) => {
    let token = $$('meta[name="csrf-token"]')[0].getAttribute('content');
    let options = Array();

    var params = {};
    params['field'] = window.SORT_FIELD;
    params['page'] = window.NUMBER_PAGE;
    params['listing_id'] = window.LISTING_ID;
    params['category_id'] = window.CATEGORY_ID;
    params['count_on_page'] = window.COUNT_ON_PAGE;
    if(window.SORT_FIELD == 'km5') {
        params['source_cards'] = window.SOURCE_CARDS;
    }
    // params['options'] = options;
    params['sort_type'] = window.SORT_TYPE;
    params['section_type'] = window.SECTION_TYPE;
    params['user_case'] = window.USER_CASE;
    params['not_showing_bank'] = window.NOT_SHOWING_BANK;
    params['priority_field'] = window.PRIORITY_FIELD ? window.PRIORITY_FIELD : '';
    params['priority_value'] = window.PRIORITY_VALUE ? window.PRIORITY_VALUE : '';
    params['page_listing_id'] = window.PAGE_LISTING_ID ? window.PAGE_LISTING_ID : ''; // A/B тест номер 13
    params['button_type_test'] = window.BUTTON_TYPE_TEST ? window.BUTTON_TYPE_TEST : '';// A/B тест номер 58
    if(window.AB_TEST_68) {
        params['card_type'] = window.AB_TEST_68; // A/B тест номер 68
    }
    params['show_buttons'] = window.SHOW_BUTTONS; // чтобы скрыть кнопки сравнения и избранные
    params['without_cards'] = window.WITHOUT_CARDS ? window.WITHOUT_CARDS : '';
    if (window.HAS_QUIZ_PARAMS || action == 'filter-count') {
        addQuizInputsParams(params);
    }

    if (window.AB_TEST_65) {
        if (window.SUM !== undefined) {
            params['slf_summ_from'] = window.SUM;
        }
        if (window.TERM !== undefined) {
            params['slf_time_from'] = window.TERM;
        }
    }

    fetch('/actions/load_cards_for_listings?' + new URLSearchParams(params), {
        method: 'GET',
    }).then((res) => {
        return res.json().then((data) => {
            if(window.AB_TEST_68) {
                switch (action) {
                    case 'sorting' : $$('.offers-list')[1].innerHTML = data['code']; break;
                    case 'load' : $$('.offers-list')[1].innerHTML += data['code']; break;
                    case 'filter-count': callback(data); return;
                }
            } else {
                switch (action) {
                    case 'sorting' : $$('.offers-list')[0].innerHTML = data['code']; break;
                    case 'load' : $$('.offers-list')[0].innerHTML += data['code']; break;
                    case 'filter-count': callback(data); return;
                }
            }

            if (callback) {
                callback(data);
            }
            if($$('.offers-list')[0].classList.contains('f-card-minimal-block')) {
                //addFCardsBtnsEvents();
                initMinimalCards();
            } else{
                addCardsBtnsEvents();
            }
            updateCardsLoadButton(data['nextPage']);
            addButtonClickHendler();

        }).catch((err) => {
            console.log(err);
        })
    });

};


let updateCardsLoadButton = (count) => {

    if ($$('#load_more').length == 0) {
        return;
    }

    let countOnPage = window.COUNT_ON_PAGE ? window.COUNT_ON_PAGE : 10;
    let cardsForLoadCount = window.cards_count - window.NUMBER_PAGE * countOnPage;
    if(count > 0 && cardsForLoadCount > 0){
        $$('#load_more')[0].style.display = 'flex';
    } else {
        $$('#load_more')[0].style.display = 'none';

    }
}

if($$('.search-by-quiz-btn').length != 0) {
    $$('.search-by-quiz-btn')[0].addEventListener('click', () => {
        window.HAS_QUIZ_PARAMS = true;
        window.NUMBER_PAGE = 1;

        var params = {};
        params['field'] = window.SORT_FIELD;
        params['page'] = window.NUMBER_PAGE;
        params['listing_id'] = window.LISTING_ID;
        params['category_id'] = window.CATEGORY_ID;
        params['count_on_page'] = window.COUNT_ON_PAGE;
        params['options'] = {};
        params['sort_type'] = window.SORT_TYPE;
        params['section_type'] = window.SECTION_TYPE;
        params['priority_field'] = window.PRIORITY_FIELD ? window.PRIORITY_FIELD : '';
        params['priority_value'] = window.PRIORITY_VALUE ? window.PRIORITY_VALUE : '';
        params['page_listing_id'] = window.PAGE_LISTING_ID ? window.PAGE_LISTING_ID : ''; // A/B тест номер 13
        params['show_buttons'] = window.SHOW_BUTTONS; // A/B тест номер 56
        addQuizInputsParams(params);
        fetch('/actions/load_cards_for_listings?' + new URLSearchParams(params), {
            method: 'GET',
        }).then((res) => {
            return res.json().then((data) => {
                let countOffers = wordDeclension(data['count'], [' предложение ', ' предложения ', ' предложений ']);
                let [day, month, year] = getCurrentDate();
                let countOfCards = Number(data['count']);
                if(data['nextPage'] > 0) {
                    countOfCards = Number(data['count']) + Number(data['nextPage']);
                }
                window.cards_count = countOfCards;
                $$('.quiz-count-cards')[0].innerHTML = 'Подобрано ' + countOfCards + ' ' + countOffers + ' на ' +  day + '.' + month + '.' + year;
                $$('.offers-list')[0].innerHTML = data['code'];
                document.getElementsByClassName('sort')[0].scrollIntoView({behavior: "smooth"});
                // var topPos = scrollToElement.offsetTop;
                // document.getElementsByClassName('offers-list')[0].scrollTop = topPos;
                updateCardsLoadButton(data['nextPage']);
                addCardsBtnsEvents();
                addButtonClickHendler();
            }).catch((err) => {
                console.log(err);
            })
        });
    });
}
// updateCardsLoadButton(10);

// ниже идет код для работы (погрзуки) прочих карточек

if ($$('#load_more2').length > 0) {
    $$('#load_more2')[0].addEventListener('click', () => {
        window.OTHER_NUMBER_PAGE++;
        cardsOtherLoad('load');
    });
}

let cardsOtherLoad = (action) => {
    let token = $$('meta[name="csrf-token"]')[0].getAttribute('content');
    let options = Array();

    var params = {};
    //params['field'] = window.SORT_FIELD;
    params['page'] = window.OTHER_NUMBER_PAGE;
    params['listing_id'] = window.LISTING_ID;
    // params['category_id'] = window.CATEGORY_ID;
    // params['count_on_page'] = window.COUNT_ON_PAGE;
    // params['options'] = options;
    // params['sort_type'] = window.SORT_TYPE;
    // params['section_type'] = window.SECTION_TYPE;
    // params['user_case'] = window.USER_CASE;
    // params['not_showing_bank'] = window.NOT_SHOWING_BANK;

    // if (window.HAS_QUIZ_PARAMS) {
    //     addQuizInputsParams(params);
    // }
    fetch('/actions/load_other_cards_for_listings?' + new URLSearchParams(params), {
        method: 'GET',
    }).then((res) => {
        return res.json().then((data) => {
            switch (action) {
                case 'sorting' : $$('.offers-list-2')[0].innerHTML = data['code']; break;
                case 'load' : $$('.offers-list-2')[0].innerHTML += data['code']; break;
            }
            addCardsBtnsEvents();
            updateOtherCardsLoadButton(data['nextPage']);
            addButtonClickHendler();
        }).catch((err) => {
            console.log(err);
        })
    });

};


let updateOtherCardsLoadButton = (count) => {

    if ($$('#load_more2').length == 0) {
        return;
    }

    let countOnPage = window.COUNT_ON_PAGE ? window.COUNT_ON_PAGE : 10;
    let cardsForLoadCount = window.OTHER_CARDS_COUNT - window.OTHER_NUMBER_PAGE * countOnPage;
    if(count > 0 && cardsForLoadCount > 0){
        $$('#load_more2')[0].style.display = 'flex';
    } else {
        $$('#load_more2')[0].style.display = 'none';

    }
}

const loadAdditionalCards = (params, callback) => {
    if (typeof params !== 'object') return;

    params['field'] = params.sort_field ?? window.SORT_FIELD ?? '';
    params['count'] = params.count ?? window.COUNT_ON_PAGE ?? '';
    params['without_cards'] = params.without_cards ?? '';
    params['listing_id'] = params.listing_id ?? window.LISTING_ID ?? '';
    params['field'] = params.sort_field ?? window.SORT_FIELD ?? '';
    params['sort_type'] = params.sort_type ?? window.SORT_TYPE ?? '';
    params['category_id'] = params.category_id ?? window.CATEGORY_ID ?? '';
    params['section_type'] = params.section_type ?? window.SECTION_TYPE ?? '';
    params['priority_field'] = params.priority_field ?? window.PRIORITY_FIELD ?? '';
    params['priority_value'] = params.priority_value ?? window.PRIORITY_VALUE ?? '';

    fetch('/actions/load_cards_additional?' + new URLSearchParams(params), {
        method: 'GET',
    }).then((res) => {
        return res.json().then((data) => {
            callback(data);
            addCardsBtnsEvents();
            addButtonClickHendler();
        }).catch((err) => {
            console.log(err);
        })
    });
}

