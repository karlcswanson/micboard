'use strict';

import { micboard } from './script.js';


function showDivSize() {
  const e = document.getElementsByClassName('mic_name')[0];
  const width = Math.ceil(parseInt(window.getComputedStyle(e).width));
  const height = window.getComputedStyle(e).height;
  const string = width + ' x ' + height;
  $('.mic_id').html(string);
}

export function uploadMode() {
  document.getElementById('micboard').classList.add('uploadmode')
  showDivSize()

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


export function updateGIFBackgrounds() {
  $('.mic_name').each((key, value) => {

    name = $(this).children('.name').html().toLowerCase() + '.mp4';
    if (micboard.mp4_list.indexOf(name) > -1) {
      $(this).css('background-image', 'url("bg/' + name + '")');
      $(this).css('background-size', 'cover');
      console.log(name);
    } else {
      $(this).css('background-image', '');
      $(this).css('background-size', '');
    }
  });
}
