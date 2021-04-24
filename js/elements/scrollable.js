import lazyLoad from '../functions/lazyLoad.js';

const scrollable = document.querySelector('#scrollable');
export default scrollable;

let lastScrollHeight = 0;
scrollable.addEventListener('scroll', e => {
    const scrollHeight = scrollable.scrollHeight;
    const scrollDistance = scrollable.scrollTop + scrollable.offsetHeight;

    const newScrollHeight = scrollHeight !== lastScrollHeight;

    const scrollDistanceLeft = scrollHeight - scrollDistance;

    const triggerUpdate = newScrollHeight && scrollDistanceLeft <= 600;
    if (triggerUpdate) {
        lastScrollHeight = scrollHeight;
        lazyLoad();
    }
});
