const channelInput = document.querySelector(".channel-filter");
const dropdownOptions = document.querySelector(".channel-filter-options");
let videosByChannel = null;

setupFilter();
setupOptions();

function createChannelFilter(options) {
    let html = '';
    options.forEach(option => {
        html += `
            <li data-value='${option.channel}'>${option.channel} (${option.count})</li>
            `;
    });

    const parent = document.querySelector('.channel-filter-options');
    parent.innerHTML = html;
}

function toggleOptions(force) {
    if (force === undefined) {
        dropdownOptions.classList.toggle('hidden');
    } else {
        dropdownOptions.classList.toggle('hidden', !force);
    }
}

function setupFilter() {
    channelInput.addEventListener('keyup', () => {
        const filters = channelInput.value.toLowerCase().split(' ');
        const options = dropdownOptions.querySelectorAll('li');

        options.forEach(option => {
            const value = option.dataset.value.toLowerCase();
            const matches = filters.every(filter => value.indexOf(filter) > -1);

            option.classList.toggle('hidden', !matches);
        });
    });
}

function setupOptions() {
    channelInput.addEventListener('click', e => {
        if (videosByChannel === null) {
            videosByChannel = getVideosByChannel();
        }
        toggleOptions();
    });

    dropdownOptions.addEventListener('click', e => {
        const clickedOption = e.target;

        const value = clickedOption.dataset.value;

        channelInput.value = `"${value}"`;
        toggleOptions(false);
    });
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
