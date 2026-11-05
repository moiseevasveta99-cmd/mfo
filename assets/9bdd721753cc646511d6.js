// metrika
(function (m, e, t, r, i, k, a) {
    m[i] = m[i] || function () {
        (m[i].a = m[i].a || []).push(arguments)
    };
    m[i].l = 1 * new Date();
    for (var j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r) {
            return;
        }
    }
    k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a)
})(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
ym(38176370, "init", {webvisor: true, clickmap: true, trackLinks: true, accurateTrackBounce: true});

// vk
!function (){var t=document.createElement("script");t.type="text/javascript",t.async=!0,t.src='https://vk.com/js/api/openapi.js?173',t.onload=function(){VK.Retargeting.Init("VK-RTRG-1940342-cKCFc"),VK.Retargeting.Hit()},document.head.appendChild(t)}();

let g = function (goalName) {
    try {
        yaCounter38176370.reachGoal(goalName);
    } catch (err) {
        // Yandex.Metrika counter not yet initialised — drop the goal
        // silently. Previously this dropped event was also POSTed to
        // /actions/save-goal for in-house tracking; that endpoint has
        // been removed (dead feature, see chore/remove-dead-goal-geo-features).
    }
}


