(function (window, document) {
    'use strict';

    var config = window.vzoProductEventsConfig || {};
    if (!config.enabled || window.vzoProductEventsLoaded) {
        return;
    }
    window.vzoProductEventsLoaded = true;

    var supportedEvents = {
        product_card_view: true,
        product_cta_click: true,
        external_offer_click: true,
        navigator_pilot_exposure: true,
        navigator_start: true,
        navigator_entry_click: true,
        navigator_profile_complete: true,
        navigator_results_view: true,
        navigator_explanation_open: true,
        navigator_offer_click: true
    };
    var allowedEvents = {};
    var configuredEvents = Array.isArray(config.events) ? config.events : [];

    configuredEvents.forEach(function (eventName) {
        if (supportedEvents[eventName]) {
            allowedEvents[eventName] = true;
        }
    });

    function closest(element, selector) {
        while (element && element.nodeType === 1) {
            if (element.matches ? element.matches(selector) : element.msMatchesSelector(selector)) {
                return element;
            }
            element = element.parentElement;
        }

        return null;
    }

    function numericAttribute(element, name) {
        var value = element ? element.getAttribute(name) : '';
        return /^\d{1,12}$/.test(value || '') ? Number(value) : null;
    }

    function experimentAttribute(element, name, pattern) {
        var value = element ? String(element.getAttribute(name) || '') : '';
        return pattern.test(value) ? value : null;
    }

    function payloadFor(element) {
        var card = closest(element, '[data-vzo-product-card]');
        var payload = {
            event_version: Number(config.version) || 1,
            page_path: window.location.pathname || '/'
        };
        var cardId = numericAttribute(card, 'data-vzo-card-id');
        var categoryId = numericAttribute(card, 'data-vzo-category-id');
        var experimentRoot = closest(element, '[data-vzo-experiment]');
        var experiment = experimentAttribute(experimentRoot, 'data-vzo-experiment', /^[a-z0-9_-]{1,64}$/);
        var experimentVariant = experimentAttribute(
            experimentRoot,
            'data-vzo-experiment-variant',
            /^(?:control|treatment)$/
        );
        var experimentBucket = numericAttribute(experimentRoot, 'data-vzo-experiment-bucket');

        if (cardId !== null) {
            payload.card_id = cardId;
        }
        if (categoryId !== null) {
            payload.category_id = categoryId;
        }
        if (experiment !== null && experimentVariant !== null) {
            payload.experiment = experiment;
            payload.experiment_variant = experimentVariant;
            if (experimentBucket !== null && experimentBucket >= 0 && experimentBucket <= 9999) {
                payload.experiment_bucket = experimentBucket;
            }
        }

        return payload;
    }

    function dispatchBrowserEvent(eventName, payload) {
        var browserEvent;

        if (typeof window.CustomEvent === 'function') {
            browserEvent = new window.CustomEvent('vzo:product-event', {
                detail: {name: eventName, payload: payload}
            });
        } else {
            browserEvent = document.createEvent('CustomEvent');
            browserEvent.initCustomEvent('vzo:product-event', false, false, {
                name: eventName,
                payload: payload
            });
        }

        document.dispatchEvent(browserEvent);
    }

    function emit(eventName, element) {
        if (!allowedEvents[eventName]) {
            return;
        }

        var payload = payloadFor(element);
        var dataLayerPayload = {
            event: eventName,
            vzo_event_version: payload.event_version,
            page_path: payload.page_path
        };

        if (payload.card_id !== undefined) {
            dataLayerPayload.card_id = payload.card_id;
        }
        if (payload.category_id !== undefined) {
            dataLayerPayload.category_id = payload.category_id;
        }
        if (payload.experiment !== undefined) {
            dataLayerPayload.experiment = payload.experiment;
            dataLayerPayload.experiment_variant = payload.experiment_variant;
        }
        if (payload.experiment_bucket !== undefined) {
            dataLayerPayload.experiment_bucket = payload.experiment_bucket;
        }

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(dataLayerPayload);

        if (config.metrikaEnabled && typeof window.ym === 'function' && /^\d+$/.test(String(config.metrikaCounterId || ''))) {
            window.ym(Number(config.metrikaCounterId), 'reachGoal', eventName, payload);
        }

        dispatchBrowserEvent(eventName, payload);
    }

    function markCardViewed(card) {
        if (card.getAttribute('data-vzo-product-viewed') === 'true') {
            return;
        }

        card.setAttribute('data-vzo-product-viewed', 'true');
        emit('product_card_view', card);
    }

    function markExperimentExposed(element) {
        var eventName = experimentAttribute(
            element,
            'data-vzo-product-exposure',
            /^[a-z0-9_]{1,64}$/
        );
        if (!eventName || !allowedEvents[eventName] || element.getAttribute('data-vzo-product-exposed') === 'true') {
            return;
        }

        var payload = payloadFor(element);
        if (!payload.experiment || !payload.experiment_variant) {
            return;
        }

        var storageKey = 'vzo:experiment-exposure:' + payload.experiment + ':' + payload.experiment_variant;
        element.setAttribute('data-vzo-product-exposed', 'true');
        try {
            if (window.sessionStorage && window.sessionStorage.getItem(storageKey) === '1') {
                return;
            }
            if (window.sessionStorage) {
                window.sessionStorage.setItem(storageKey, '1');
            }
        } catch (error) {
            // The event still remains useful when storage is unavailable.
        }

        emit(eventName, element);
    }

    window.vzoProductEvents = {
        emit: function (eventName, element) {
            emit(eventName, element || document.body);
        }
    };

    function observeCards(root) {
        var cards = root.matches && root.matches('[data-vzo-product-card]')
            ? [root]
            : Array.prototype.slice.call(root.querySelectorAll('[data-vzo-product-card]'));

        if (!cards.length) {
            return;
        }

        if ('IntersectionObserver' in window) {
            if (!observeCards.observer) {
                observeCards.observer = new window.IntersectionObserver(function (entries, observer) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
                            observer.unobserve(entry.target);
                            markCardViewed(entry.target);
                        }
                    });
                }, {threshold: [0.25]});
            }

            cards.forEach(function (card) {
                observeCards.observer.observe(card);
            });
            return;
        }

        cards.forEach(markCardViewed);
    }

    function observeExperimentExposures(root) {
        var exposures = root.matches && root.matches('[data-vzo-product-exposure]')
            ? [root]
            : Array.prototype.slice.call(root.querySelectorAll('[data-vzo-product-exposure]'));

        exposures.forEach(markExperimentExposed);
    }

    function initialize() {
        observeCards(document);
        observeExperimentExposures(document);

        document.addEventListener('click', function (event) {
            var trigger = closest(event.target, '[data-vzo-product-event]');
            if (!trigger) {
                return;
            }

            emit(trigger.getAttribute('data-vzo-product-event'), trigger);

            var secondaryEvent = trigger.getAttribute('data-vzo-secondary-event');
            if (secondaryEvent) {
                emit(secondaryEvent, trigger);
            }
        }, false);

        if ('MutationObserver' in window) {
            new window.MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    Array.prototype.forEach.call(mutation.addedNodes, function (node) {
                        if (node.nodeType === 1) {
                            observeCards(node);
                            observeExperimentExposures(node);
                        }
                    });
                });
            }).observe(document.body, {childList: true, subtree: true});
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize, {once: true});
    } else {
        initialize();
    }
})(window, document);
