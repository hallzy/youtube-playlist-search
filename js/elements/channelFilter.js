import scrollToTop from '../functions/scrollToTop.js';
import lazyLoad from '../functions/lazyLoad.js';

import spinner from '../objects/spinner.js';
import storage from '../objects/storage.js';
import matchingVideos from '../objects/matchingVideos.js';

const channelFilter = document.querySelector('.channel-filter');
export default channelFilter;

const dropdownOptions = document.querySelector(".channel-filter-options");
let videosByChannel = null;

channelFilter.value = await storage.channelFilter;
channelFilter.addEventListener('change', () => {
    spinner.wrapAround(() => {
        scrollToTop();
        lazyLoad(matchingVideos.update());
    })
});

setupFilter();
setupOptions();

function createChannelFilter(options) {
    let html = '';
    options.forEach(option => {
        html += `
            <li data-value="${option.channel}">${option.channel} (${option.count})</li>
            `;
    });

    const parent = document.querySelector('.channel-filter-options');
    parent.innerHTML = html;

    updateDropdown();
}

function toggleOptions(force) {
    if (force === undefined) {
        dropdownOptions.classList.toggle('hidden');
    } else {
        dropdownOptions.classList.toggle('hidden', !force);
    }
}

function setupFilter() {
    channelFilter.addEventListener('keyup', updateDropdown);

    channelFilter.addEventListener('change', () => toggleOptions(false));
}

function setupOptions() {
    channelFilter.addEventListener('click', e => {
        e.stopPropagation();

        if (videosByChannel === null) {
            videosByChannel = getVideosByChannel();
            createChannelFilter(videosByChannel);
        }
        toggleOptions(true);
    });

    dropdownOptions.addEventListener('click', e => {
        e.stopPropagation();
        const clickedOption = e.target;

        const value = clickedOption.dataset.value;

        channelFilter.value = value;
        toggleOptions(false);
        lazyLoad(matchingVideos.update())
    });

    document.addEventListener('click', () => toggleOptions(false));
}

function getVideosByChannel() {
    let hash = {};

    videos.forEach(video => {
        const channel = video.channelName;

        if (channel === '') {
            return;
        }

        if (!hash[channel]) {
            hash[channel] = 0;
        }
        hash[channel]++;
    });

    let sorted = Object
        .entries(hash)
        .sort(([,a], [,b]) => b - a)
        .map(([channel, count]) => ({ channel, count }))
    ;

    return sorted;
}

function updateDropdown() {
    const filters = channelFilter.value.toLowerCase().split(' ');
    const options = dropdownOptions.querySelectorAll('li');

    options.forEach(option => {
        const value = option.dataset.value.toLowerCase();
        const matches = filters.every(filter => value.indexOf(filter) > -1);

        option.classList.toggle('hidden', !matches);
    });
}
