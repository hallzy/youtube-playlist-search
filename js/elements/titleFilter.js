import scrollToTop from '../functions/scrollToTop.js';
import lazyLoad from '../functions/lazyLoad.js';

import spinner from '../objects/spinner.js';
import storage from '../objects/storage.js';
import matchingVideos from '../objects/matchingVideos.js';

const titleFilter = document.querySelector('.title-filter');
export default titleFilter;

titleFilter.value = await storage.titleFilter;
titleFilter.addEventListener('change', () => {
    spinner.wrapAround(() => {
        scrollToTop();
        lazyLoad(matchingVideos.update());
    })
});
