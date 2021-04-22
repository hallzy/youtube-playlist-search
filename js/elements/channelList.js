import filterInput from './filterInput.js';
import viewChangeBtn from './viewChangeBtn.js';

import matchingVideos from '../objects/matchingVideos.js';

import lazyLoad from '../functions/lazyLoad.js';
import scrollToTop from '../functions/scrollToTop.js';

const channelList = document.querySelector('.channel-list');
export default channelList;

channelList.addEventListener('click', e => {
    const clickedEl = e.target;
    if (clickedEl.nodeName !== 'LI') {
        return;
    }

    const channel = clickedEl.dataset.channel;
    filterInput.value = channel;
    lazyLoad(matchingVideos.update());
    scrollToTop();
    viewChangeBtn.click();
});
