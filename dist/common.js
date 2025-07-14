"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestIdleCallback = exports.onClickAway = exports.scrollTo = exports.scrollToInnerSelector = exports.memoize = exports.toggle = exports.withEffect = exports.propWithEffect = exports.prop = exports.notEmpty = exports.isEmpty = exports.notNull = exports.defined = void 0;
exports.hyphenToCamel = hyphenToCamel;
exports.escapeHtml = escapeHtml;
exports.frag = frag;
exports.myUserId = myUserId;
exports.myUsername = myUsername;
exports.repeater = repeater;
const defined = (value) => value !== undefined;
exports.defined = defined;
const notNull = (value) => value !== null && value !== undefined;
exports.notNull = notNull;
const isEmpty = (a) => !a || a.length === 0;
exports.isEmpty = isEmpty;
const notEmpty = (a) => !(0, exports.isEmpty)(a);
exports.notEmpty = notEmpty;
// like mithril prop but with type safety
const prop = (initialValue) => {
    let value = initialValue;
    return (v) => {
        if ((0, exports.defined)(v))
            value = v;
        return value;
    };
};
exports.prop = prop;
const propWithEffect = (initialValue, effect) => {
    let value = initialValue;
    return (v) => {
        if ((0, exports.defined)(v)) {
            value = v;
            effect(v);
        }
        return value;
    };
};
exports.propWithEffect = propWithEffect;
const withEffect = (prop, effect) => (v) => {
    let returnValue;
    if ((0, exports.defined)(v)) {
        returnValue = prop(v);
        effect(v);
    }
    else
        returnValue = prop();
    return returnValue;
};
exports.withEffect = withEffect;
const toggle = (initialValue, effect = () => { }) => {
    const prop = (0, exports.propWithEffect)(initialValue, effect);
    prop.toggle = () => prop(!prop());
    prop.effect = effect;
    return prop;
};
exports.toggle = toggle;
// Only computes a value once. The computed value must not be undefined.
const memoize = (compute) => {
    let computed;
    return () => {
        if (computed === undefined)
            computed = compute();
        return computed;
    };
};
exports.memoize = memoize;
const scrollToInnerSelector = (el, selector, horiz = false) => (0, exports.scrollTo)(el, el.querySelector(selector), horiz);
exports.scrollToInnerSelector = scrollToInnerSelector;
const scrollTo = (el, target, horiz = false) => {
    if (target)
        horiz
            ? (el.scrollLeft = target.offsetLeft - el.offsetWidth / 2 + target.offsetWidth / 2)
            : (el.scrollTop = target.offsetTop - el.offsetHeight / 2 + target.offsetHeight / 2);
};
exports.scrollTo = scrollTo;
const onClickAway = (f) => (el) => {
    const listen = () => document.addEventListener('click', function listener(e) {
        if (!document.body.contains(el))
            document.removeEventListener('click', listener);
        if (el.contains(e.target))
            return;
        f();
    });
    setTimeout(listen, 300);
};
exports.onClickAway = onClickAway;
function hyphenToCamel(str) {
    return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
}
const requestIdleCallback = (f, timeout) => {
    if (window.requestIdleCallback)
        window.requestIdleCallback(f, timeout ? { timeout } : undefined);
    else
        requestAnimationFrame(f);
};
exports.requestIdleCallback = requestIdleCallback;
function escapeHtml(str) {
    if (typeof str !== 'string')
        str = JSON.stringify(str); // throws
    return /[&<>"']/.test(str)
        ? str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&#39;')
            .replace(/"/g, '&quot;')
        : str;
}
function frag(html) {
    const fragment = document.createRange().createContextualFragment(html);
    return (fragment.childElementCount === 1 ? fragment.firstElementChild : fragment);
}
// The username with all characters lowercase
function myUserId() {
    return document.body.dataset.user;
}
function myUsername() {
    return document.body.dataset.username;
}
function repeater(f, e, additionalStopCond) {
    let timeout = undefined;
    const delay = (function* () {
        yield 500;
        for (let d = 350;;)
            yield Math.max(100, (d *= 14 / 15));
    })();
    const repeat = () => {
        f();
        timeout = setTimeout(repeat, delay.next().value);
        if (additionalStopCond === null || additionalStopCond === void 0 ? void 0 : additionalStopCond())
            clearTimeout(timeout);
    };
    repeat();
    const eventName = e.type === 'touchstart' ? 'touchend' : 'mouseup';
    document.addEventListener(eventName, () => clearTimeout(timeout), { once: true });
}
