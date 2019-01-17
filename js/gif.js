'use strict';

import { micboard } from './script.js';


function showDivSize() {
  const e = document.getElementsByClassName('mic_name')[0];
  const width = Math.ceil(parseInt(window.getComputedStyle(e).width, 10));
  const height = window.getComputedStyle(e).height;
  const string = width + ' x ' + height;
  $('.mic_id').html(string);
}

// https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications
function sendFile(file, filename) {
  const uri = '/upload';
  const xhr = new XMLHttpRequest();
  const fd = new FormData();

  xhr.open('POST', uri, true);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      console.log(xhr.responseText); // handle response.
    }
  };
  fd.append('myFile', file);
  fd.append('filename', filename);
  // Initiate a multipart/form-data upload
  xhr.send(fd);
}

export function uploadMode() {
  document.getElementById('micboard').classList.add('uploadmode');
  showDivSize();

  $('.mic_name').each(() => {
    $(this).on('dragover', false);
    $(this).on('drop', (e) => {
      const slot_name = $(this).children('.name').html().toLowerCase();
      e.preventDefault();
      const upload = e.originalEvent.dataTransfer.files[0];
      const extension = upload.name.split(/[\s.]+/).pop().toLowerCase();
      const filename = slot_name + '.' + extension;
      console.log('bin:  ' + slot_name + ' FileName: ' + upload.name + ' newName:  ' + filename);

      sendFile(upload, filename);
    });
  });
  window.addEventListener('resize', showDivSize);
}


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
