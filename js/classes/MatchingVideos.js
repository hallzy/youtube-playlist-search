import titleFilter from '../elements/titleFilter.js';
import channelFilter from '../elements/channelFilter.js';

import tokenizeFilter from '../functions/tokenizeFilter.js';

import storage from '../objects/storage.js';

export default class MatchingVideos {
    constructor() {
        this.videos = [];
    }

    update() {
        storage.titleFilter = titleFilter.value;
        storage.channelFilter = channelFilter.value;

        const titleWords = tokenizeFilter(titleFilter.value.toLowerCase());
        const channelWord = channelFilter.value.toLowerCase();

        this.videos = videos.filter(video => {
            const videoName = video.videoTitle.toLowerCase();
            const channelName = video.channelName.toLowerCase();

            const channelMatches = channelWord.length === 0 || channelWord === channelName;
            if (!channelMatches) {
                return false;
            }

            const titleMatches = titleWords.every(word => videoName.indexOf(word) !== -1);

            return titleMatches;
        });

        return this.videos;
    }

    reset() {
        this.videos = [];
    }

    get count() {
        return this.videos.length;
    }
}
