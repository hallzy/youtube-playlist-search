import scrollToTop from '../functions/scrollToTop.js';
import lazyLoad from '../functions/lazyLoad.js';

import spinner from '../objects/spinner.js';
import storage from '../objects/storage.js';
import matchingVideos from '../objects/matchingVideos.js';

const filterInput = document.querySelector('input');
export default filterInput;

filterInput.value = await storage.filter;
filterInput.addEventListener('change', () => {
    spinner.wrapAround(() => {
        scrollToTop();
        lazyLoad(matchingVideos.update());
    })
});
