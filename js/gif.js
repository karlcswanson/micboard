'use strict';

import { micboard } from './app.js';

export function updateBackground(slotSelector) {
  const s = slotSelector;

  const extensions = {
    IMG: '.jpg',
    MP4: '.mp4',
  };

  const name = s.getElementsByClassName('name')[0].innerHTML.toLowerCase() + extensions[micboard.backgroundMode];

  if (micboard.backgroundMode === 'MP4' && micboard.mp4_list.indexOf(name) > -1) {
    const style = 'background: url("bg/' + name + '") center; background-size: cover;';
    s.setAttribute('style', style);
  } else if (micboard.backgroundMode === 'IMG' && micboard.img_list.indexOf(name) > -1) {
    const style = 'background: url("bg/' + name + '") center; background-size: cover;';
    s.setAttribute('style', style);
  } else {
    s.setAttribute('style', "background-image: ''; background-size: ''");
  }
}

export function updateGIFBackgrounds() {
  const slots = document.getElementsByClassName('mic_name');
  for (let i = 0; i < slots.length; i += 1) {
    updateBackground(slots[i]);
  }
}
