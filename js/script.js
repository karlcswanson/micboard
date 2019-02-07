"use strict";

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import QRCode from 'qrcode';
import 'whatwg-fetch';


import { updateGIFBackgrounds, uploadMode } from './gif.js';
import { autoRandom, seedTransmitters } from './demodata.js';
import { settingsView } from './settings.js';
import { renderGroup, renderDisplayList, updateSlot } from './channelview.js';
import { initLiveData } from './data.js';
import { groupEditToggle, initEditor } from './dnd.js';

import '../css/style.scss';
import '../node_modules/@ibm/plex/css/ibm-plex.css';


export var dataURL = '/data';

export var config = {};

export var micboard = [];

micboard.url = [];
micboard.url.start_slot = parseInt(getUrlParameter('start_slot'), 10);
micboard.url.stop_slot = parseInt(getUrlParameter('stop_slot'), 10);
micboard.url.group = getUrlParameter('group');
micboard.url.demo = getUrlParameter('demo');
micboard.url.settings = getUrlParameter('settings');
micboard.url.tvmode = getUrlParameter('tvmode');
micboard.displayMode = 'deskmode';
micboard.infoDrawerMode = 'elinfo00';
micboard.backgroundMode = 'NONE';

micboard.transmitters = [];

micboard.displayList = [];


export function ActivateMessageBoard(h1, p) {
  if (!h1) {
    h1 = 'Connection Error!';
    p = 'Could not connect to the micboard server. Please refresh the page.';
  }

  $('#micboard').hide();
  $('.settings').hide();
  const eb = document.getElementsByClassName('message-board')[0];
  eb.querySelector('h1').innerHTML = h1;
  eb.querySelector('p').innerHTML = p;

  $('.message-board').show();
}

export function DeactivateMessageBoard() {
  $('#micboard').show();
  $('.settings').hide();
  $('.message-board').hide();
}


function StartStopSlotList(start, stop) {
  const out = [];
  for (let i = start; i <= stop; i += 1) {
    out.push(i);
  }
  return out;
}


// https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
function toggleFullScreen() {
  if (!document.webkitFullscreenElement) {
    document.documentElement.webkitRequestFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}


function swapClass(selector, currentClass, newClass) {
  selector.classList.remove(currentClass);
  selector.classList.add(newClass);
}


function setDisplayMode(mode) {
  const selector = document.getElementById('container');
  swapClass(selector, micboard.displayMode, mode);
  micboard.displayMode = mode;
}

export function toggleDisplayMode() {
  switch (micboard.displayMode) {
    case 'deskmode': setDisplayMode('tvmode');
      break;
    case 'tvmode': setDisplayMode('deskmode');
      break;
    default:
      break;
  }
}


function toggleBackgrounds() {
  const selector = document.getElementById('micboard');
  switch (micboard.backgroundMode) {
    case 'NONE': micboard.backgroundMode = 'MP4';
      $('#micboard .mic_name').css('background-image', '');
      $('#micboard .mic_name').css('background-size', '');
      break;
    case 'MP4': micboard.backgroundMode = 'IMG';
      $('#micboard .mic_name').css('background-image', '');
      $('#micboard .mic_name').css('background-size', '');
      break;
    case 'IMG': micboard.backgroundMode = 'NONE';
      $('#micboard .mic_name').css('background-image', '');
      $('#micboard .mic_name').css('background-size', '');
      break;
    default: break;
  }
  updateGIFBackgrounds();
}

function setInfoDrawer(mode) {
  const selector = document.getElementById('micboard');
  swapClass(selector, micboard.infoDrawerMode, mode);
  micboard.infoDrawerMode = mode;
  setDisplayMode('tvmode');
}

function toggleInfoDrawer() {
  const selector = document.getElementById('micboard');

  switch (micboard.infoDrawerMode) {
    case 'elinfo00': setInfoDrawer('elinfo01');
      break;
    case 'elinfo01': setInfoDrawer('elinfo10');
      break;
    case 'elinfo10': setInfoDrawer('elinfo11');
      break;
    case 'elinfo11': setInfoDrawer('elinfo00');
      break;
    default:
      break;
  }

  if (selector.classList.contains('uploadmode')) {
    showDivSize();
  }
}

function generateQR() {
  const qrOptions = {
    width: 600,
  };

  const url = micboard.localURL + location.pathname + location.search;
  document.getElementById('largelink').href = url;
  document.getElementById('largelink').innerHTML = url;
  QRCode.toCanvas(document.getElementById('qrcode'), url, qrOptions, (error) => {
    if (error) console.error(error)
    console.log('success!');
  });
}

function groupTableBuilder(data) {
  const plist = {};

  data.config.groups.forEach((e) => {
    const entry = {
      slots: e.slots,
      title: e.title,
    };
    plist[e.group] = entry;
  });
  return plist;
}

function mapGroups() {
  const div = document.getElementById('grouplist');
  let str = '';

  for (var p in micboard.groups) {
    str += '<p class="text-muted"><a class="nav-link preset-link" id="go-group-'+ p +'" href="#">' + p + ': ' + micboard.groups[p]['title'] + '</a></p>';
  }
  str += '<p class="text-muted"><a class="nav-link" id="test-button" href="#">test button</a></p>';
  div.innerHTML += str;

  $('a#go-settings').click(() => {
    settingsView(config);
    $('.collapse').collapse('hide');
  });

  $('a#go-groupedit').click(() => {
    if (micboard.group !== 0) {
      groupEditToggle();
      $('.collapse').collapse('hide');
    }
  });

  $('a.preset-link').each(function(index) {
    const id = parseInt($(this).attr('id')[9], 10);

    $(this).click(() => {
      DeactivateMessageBoard();
      renderGroup(id);
      $('.collapse').collapse('hide');
    });
  });
}

// https://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js
// var getUrlParameter = function getUrlParameter(sParam) {
function getUrlParameter(sParam) {
  const sPageURL = decodeURIComponent(window.location.search.substring(1));
  // const sPageURL = decodeURIComponent(window.location.hash.substring(1));
  const sURLVariables = sPageURL.split('&');
  let sParameterName;
  let i;

  for (i = 0; i < sURLVariables.length; i += 1) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
  return undefined;
}

function dataFilterFromList(data) {
  data.receivers.forEach((rx) => {
    rx.tx.forEach((t) => {
      const tx = t;
      tx.ip = rx.ip;
      tx.type = rx.type;
      micboard.transmitters[tx.slot] = tx;
    });
  });
}

function displayListChooser() {
  if (micboard.url.group) {
    renderGroup(micboard.url.group);
  } else if (micboard.url.start_slot && micboard.url.stop_slot) {
    if (micboard.url.start_slot < micboard.url.stop_slot) {
      micboard.displayList = StartStopSlotList(micboard.url.start_slot, micboard.url.stop_slot);
      renderDisplayList(micboard.displayList);
    }
  } else {
    renderGroup(0);
  }
}

function initialMap(callback) {
  fetch(dataURL)
    .then(response => response.json())
    .then((data) => {
      micboard.discovered = data.discovered;
      micboard.mp4_list = data.mp4;
      micboard.img_list = data.jpg;
      micboard.localURL = data.url;
      micboard.groups = groupTableBuilder(data);
      config = data.config;
      mapGroups();

      if (micboard.url.settings) {
        settingsView(config);
      }

      if (micboard.url.demo !== 'true') {
        dataFilterFromList(data);
      }
      displayListChooser();

      if (callback) {
        callback();
      }
      if (['elinfo00', 'elinfo01', 'elinfo10', 'elinfo11'].indexOf(micboard.url.tvmode) >= 0) {
        setInfoDrawer(micboard.url.tvmode);
      }
      initEditor();
    });
}

$(document).ready(() => {
  if (micboard.url.demo && (isNaN(micboard.url.start_slot) || isNaN(micboard.url.stop_slot))) {
    micboard.url.start_slot = 1;
    micboard.url.stop_slot = 12;
  }

  if (micboard.url.demo === 'true') {
    initialMap(autoRandom);
  } else {
    initialMap(initLiveData);
  }

  document.addEventListener('keydown', (e) => {
    if ($('.settings').is(':visible') || $('.sidebar-nav').is(':visible')) {
      return;
    }
    if (e.keyCode === 48) {
      DeactivateMessageBoard();
      renderGroup(0);
    }
    if (e.keyCode === 49) {
      DeactivateMessageBoard();
      renderGroup(1);
    }
    if (e.keyCode === 50) {
      DeactivateMessageBoard();
      renderGroup(2);
    }
    if (e.keyCode === 51) {
      DeactivateMessageBoard();
      renderGroup(3);
    }
    if (e.keyCode === 52) {
      DeactivateMessageBoard();
      renderGroup(4);
    }
    if (e.keyCode === 53) {
      DeactivateMessageBoard();
      renderGroup(5);
    }
    if (e.keyCode === 54) {
      DeactivateMessageBoard();
      renderGroup(6);
    }
    if (e.keyCode === 55) {
      DeactivateMessageBoard();
      renderGroup(7);
    }
    if (e.keyCode === 56) {
      DeactivateMessageBoard();
      renderGroup(8);
    }
    if (e.keyCode === 57) {
      DeactivateMessageBoard();
      renderGroup(9);
    }

    if (e.keyCode === 68) {
      if (micboard.url.group) {
        window.location.href = micboard.url.demo ? '/?group=' + micboard.url.group : '/?demo=true&group=' + micboard.group;
      } else {
        window.location.href = micboard.url.demo ? '/' : '/?demo=true';
      }
    }

    if (e.keyCode === 69) {
      if (micboard.group !== 0) {
        groupEditToggle();
      }
    }

    if (e.keyCode === 70) {
      toggleFullScreen();
    }

    if (e.keyCode === 71) {
      toggleBackgrounds();
    }

    if (e.keyCode === 73) {
      toggleInfoDrawer();
    }

    if (e.keyCode === 81) {
      generateQR();
      $('.modal').modal('toggle');
    }
    if (e.keyCode === 83) {
      DeactivateMessageBoard();
      settingsView(config);
    }

    if (e.keyCode === 84) {
      toggleDisplayMode();
    }

    if (e.keyCode === 85) {
      if (!document.getElementById('micboard').classList.contains('uploadmode')) {
        uploadMode();
      }
    }
  }, false);
});
