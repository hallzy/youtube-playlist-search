import lazyLoad from '../functions/lazyLoad.js';

const scrollable = document.querySelector('#scrollable');
export default scrollable;

let lastScrollHeight = 0;
scrollable.addEventListener('scroll', e => {
    const scrollHeight = scrollable.scrollHeight;
    const scrollDistance = scrollable.scrollTop;

    const newScrollHeight = scrollHeight !== lastScrollHeight;

    const percentScrolled = scrollDistance / scrollHeight;

    const triggerUpdate = newScrollHeight && percentScrolled > 0.80;
    if (triggerUpdate) {
        lastScrollHeight = scrollHeight;
        lazyLoad();
    }
});
