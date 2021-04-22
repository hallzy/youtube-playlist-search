import storage from '../objects/storage.js';
import spinner from '../objects/spinner.js';

import populatePopup from '../functions/populatePopup.js';

const fetchBtn = document.querySelector('.fetch');
export default fetchBtn;

fetchBtn.addEventListener('click', async () => {
    videos = [];
    await storage.resetVideos();
    spinner.wrapAround(populatePopup);
});
