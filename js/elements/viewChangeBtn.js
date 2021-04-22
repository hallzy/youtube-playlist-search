import videoList from './videoList.js';
import channelList from './channelList.js';

const viewChangeBtn = document.querySelector('.view-change-btn');
export default viewChangeBtn;

let view = 'Playlist';
viewChangeBtn.addEventListener('click', e => {
    const btnText = view;
    switch(view) {
        case 'Playlist':
            view = 'By Channel';
            break;
        case 'By Channel':
            view = 'Playlist';
            break;
        default:
            view = 'Playlist';
            break;
    }

    const showVideoList = view === 'Playlist';
    const showChannelList = view === 'By Channel';

    videoList.hidden = !showVideoList;
    channelList.hidden = !showChannelList;

    viewChangeBtn.innerText = btnText;
});
