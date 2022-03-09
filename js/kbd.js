'use strict';

import { Collapse, Modal } from 'bootstrap'
import { micboard, updateHash, generateQR } from './app.js';
import { toggleInfoDrawer, toggleImageBackground, toggleVideoBackground, toggleDisplayMode } from './display';
import { renderGroup } from './channelview.js';
import { groupEditToggle, initEditor } from './dnd.js';
import { slotEditToggle } from './extended.js';
import { initConfigEditor } from './config.js';


// https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
function toggleFullScreen() {
  if (!document.webkitFullscreenElement) {
    document.documentElement.webkitRequestFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}


function activeDiv(querySelector) {
  const div = document.querySelector(querySelector)
  if (div) {
    if (window.getComputedStyle(div).getPropertyValue('display') === "block") {
      return true
    }
  }
  return false
}


export function keybindings() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      micboard.settingsMode = 'NONE';
      updateHash();
      window.location.reload();
    }

    if (activeDiv('.settings')) {
      return;
    }

    if (activeDiv('.editzone')) {
      return;
    }

    if (activeDiv('.sidebar-nav')) {
      return;
    }

    if (e.key === '0') {
      renderGroup(0);
    }
    if (e.key === '1') {
      renderGroup(1);
    }
    if (e.key === '2') {
      renderGroup(2);
    }
    if (e.key === '3') {
      renderGroup(3);
    }
    if (e.key === '4') {
      renderGroup(4);
    }
    if (e.key === '5') {
      renderGroup(5);
    }
    if (e.key === '6') {
      renderGroup(6);
    }
    if (e.key === '7') {
      renderGroup(7);
    }
    if (e.key === '8') {
      renderGroup(8);
    }
    if (e.key === '9') {
      renderGroup(9);
    }

    if (e.key === 'd') {
      micboard.url.demo = !micboard.url.demo;
      updateHash();
      window.location.reload();
    }

    if (e.key === 'e') {
      if (micboard.group !== 0) {
        groupEditToggle();
      }
    }

    if (e.key === 'f') {
      toggleFullScreen();
    }

    if (e.key === 'g') {
      toggleImageBackground();
    }

    if (e.key === 'i') {
      toggleInfoDrawer();
    }

    if (e.key === 'n') {
      slotEditToggle();
    }

    if (e.key === 'N') {
      slotEditToggle();
      document.getElementById('paste-box').style.display = "block"
    }

    if (e.key === 's') {
      initConfigEditor();
    }

    if (e.key === 'q') {
      generateQR();
      const qrMod = Modal.getOrCreateInstance('#qr-modal')
      qrMod.toggle()
    }

    if (e.key === 't') {
      toggleDisplayMode();
    }

    if (e.key === 'v') {
      toggleVideoBackground();
    }

    if (e.key === '?') {
      new Collapse(document.getElementById('hud'), { toggle: true} )
    }
  }, false);
}
