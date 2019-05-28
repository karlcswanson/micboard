"use strict";

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import QRCode from 'qrcode';
import 'whatwg-fetch';


import { updateGIFBackgrounds } from './gif.js';
import { autoRandom, seedTransmitters } from './demodata.js';
import { renderGroup, renderDisplayList, updateSlot } from './channelview.js';
import { initLiveData } from './data.js';
import { groupEditToggle, initEditor } from './dnd.js';
import { slotEditToggle } from './extended.js';

import '../css/style.scss';
import '../node_modules/@ibm/plex/css/ibm-plex.css';


export var dataURL = 'data';

export var micboard = [];
micboard.MIC_MODELS = ['uhfr', 'qlxd', 'ulxd', 'axtd'];
micboard.IEM_MODELS = ['p10t'];
micboard.url = [];
micboard.url.group = getUrlParameter('group');
micboard.url.demo = getUrlParameter('demo');
micboard.url.settings = getUrlParameter('settings');
micboard.url.tvmode = getUrlParameter('tvmode');
micboard.url.bgmode = getUrlParameter('bgmode');
micboard.displayMode = 'deskmode';
micboard.infoDrawerMode = 'elinfo11';
micboard.backgroundMode = 'NONE';
micboard.settingsMode = 'NONE';

micboard.group = 0;
micboard.connectionStatus = 'CONNECTING';

micboard.transmitters = [];

micboard.displayList = [];


export function ActivateMessageBoard(h1, p) {
  if (!h1) {
    h1 = 'Connection Error!';
    p = 'Could not connect to the micboard server. Please <a href=".">refresh</a> the page.';
  }

  $('#micboard').hide();
  $('.settings').hide();
  const eb = document.getElementsByClassName('message-board')[0];
  eb.querySelector('h1').innerHTML = h1;
  eb.querySelector('p').innerHTML = p;

  $('.message-board').show();

  micboard.connectionStatus = 'DISCONNECTED';
}

export function DeactivateMessageBoard() {
  $('#micboard').show();
  $('.settings').hide();
  $('.message-board').hide();
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


export function setDisplayMode(mode) {
  const selector = document.getElementById('container');
  swapClass(selector, micboard.displayMode, mode);
  micboard.displayMode = mode;
}

export function toggleDisplayMode() {
  switch (micboard.displayMode) {
    case 'deskmode': setDisplayMode('tvmode');
      break;
    case 'tvmode': setDisplayMode('deskmode');
      setBackground('NONE');
      break;
    default:
      break;
  }
  updateHash();
}

function setBackground(mode) {
  micboard.backgroundMode = mode;
  $('#micboard .mic_name').css('background-image', '');
  $('#micboard .mic_name').css('background-size', '');
  updateGIFBackgrounds();
  updateHash();
}

function toggleBackgrounds() {
  if (micboard.displayMode === 'tvmode') {
    switch (micboard.backgroundMode) {
      case 'NONE': setBackground('MP4');
        break;
      case 'MP4': setBackground('IMG');
        break;
      case 'IMG': setBackground('NONE');
        break;
      default: break;
    }
  }
}

function setInfoDrawer(mode) {
  const selector = document.getElementById('micboard');
  swapClass(selector, micboard.infoDrawerMode, mode);
  micboard.infoDrawerMode = mode;
  setDisplayMode('tvmode');
  updateHash();
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

  document.getElementById('micboard-version').innerHTML = 'Micboard version: ' + VERSION;
}

function groupTableBuilder(data) {
  const plist = {};

  data.config.groups.forEach((e) => {
    const entry = {
      slots: e.slots,
      title: e.title,
      hide_charts: e.hide_charts,
    };

    if (entry.hide_charts == null) {
      entry.hide_charts = false;
    }

    plist[e.group] = entry;
  });

  return plist;
}

function mapGroups() {
  const div = document.getElementById('grouplist');
  let str = '';

  // for (var p in micboard.groups) {
  //   str += '<p class="text-muted"><a class="nav-link preset-link" id="go-group-'+ p +'">' + p + ': ' + micboard.groups[p]['title'] + '</a></p>';
  // }
  for (let i = 1; i <= 9; i++) {
    if (micboard.groups[i]) {
      str += '<p class="text-muted"><a class="nav-link preset-link" id="go-group-'+ i +'">' + i + ': ' + micboard.groups[i]['title'] + '</a></p>';
    }  else {
      str += '<p class="text-muted"><a class="nav-link preset-link" id="go-group-'+ i +'">' + i + ':</a></p>';
    }
  }
  div.innerHTML += str;

  $('a#go-extended').click(() => {
    slotEditToggle();
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
  // const sPageURL = decodeURIComponent(window.location.search.substring(1));
  const sPageURL = decodeURIComponent(window.location.hash.substring(1));
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

export function updateHash() {
  let hash = '#';
  if (micboard.url.demo) {
    hash += '&demo=true';
  }
  if (micboard.group !== 0) {
    hash += '&group=' + micboard.group;
  }
  if (micboard.displayMode === 'tvmode') {
    hash += '&tvmode=' + micboard.infoDrawerMode;
  }
  if (micboard.backgroundMode !== 'NONE') {
    hash += '&bgmode=' + micboard.backgroundMode;
  }
  hash = hash.replace('&', '');
  history.replaceState(undefined, undefined, hash);
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
      micboard.config = data.config;
      mapGroups();

      if (micboard.url.settings) {
        settingsView(micboard.config);
      }

      if (micboard.url.demo !== 'true') {
        dataFilterFromList(data);
      }
      displayListChooser();

      if (callback) {
        callback();
      }
      if (['MP4', 'IMG'].indexOf(micboard.url.bgmode) >= 0) {
        setBackground(micboard.url.bgmode);
      }
      if (['elinfo00', 'elinfo01', 'elinfo10', 'elinfo11'].indexOf(micboard.url.tvmode) >= 0) {
        setInfoDrawer(micboard.url.tvmode);
      }
      initEditor();
    });
}

$(document).ready(() => {
  console.log('Starting Micboard version: ' + VERSION);
  if (micboard.url.demo === 'true') {
    initialMap(autoRandom);
  } else {
    initialMap(initLiveData);
  }

  document.addEventListener('keydown', (e) => {
    if (e.keyCode === 27) {
      window.location.reload();
    }
    if ($('.settings').is(':visible')) {
      return;
    }
    if ($('.editzone').is(':visible')) {
      return;
    }
    if ($('.sidebar-nav').is(':visible')) {
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
      micboard.url.demo = !micboard.url.demo;
      updateHash();
      window.location.reload();
    }

    if (e.keyCode === 69) {
      if (micboard.group !== 0) {
        groupEditToggle();
      } else if (micboard.group === 0) {
        slotEditToggle();
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

    if (e.keyCode === 78) {
      slotEditToggle();
    }

    if (e.keyCode === 81) {
      generateQR();
      $('.modal').modal('toggle');
    }

    if (e.keyCode === 84) {
      toggleDisplayMode();
    }
  }, false);
});
