import matchingVideos from '../objects/matchingVideos.js';

export default function updateMatchCount() {
    const matchCountEl = document.querySelector('.match-count');
    matchCountEl.innerText = `${matchingVideos.count} / ${videos.length} matches`;
}
