'use strict';

import { micboard, updateHash, generateQR } from './app.js';
import { toggleInfoDrawer, toggleImageBackground, toggleVideoBackground, toggleDisplayMode } from './display';
import { renderGroup } from './channelview.js';
import { groupEditToggle, initEditor } from './dnd.js';
import { slotEditToggle } from './extended.js';


// https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
function toggleFullScreen() {
  if (!document.webkitFullscreenElement) {
    document.documentElement.webkitRequestFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}

export function keybindings() {
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
      renderGroup(0);
    }
    if (e.keyCode === 49) {
      renderGroup(1);
    }
    if (e.keyCode === 50) {
      renderGroup(2);
    }
    if (e.keyCode === 51) {
      renderGroup(3);
    }
    if (e.keyCode === 52) {
      renderGroup(4);
    }
    if (e.keyCode === 53) {
      renderGroup(5);
    }
    if (e.keyCode === 54) {
      renderGroup(6);
    }
    if (e.keyCode === 55) {
      renderGroup(7);
    }
    if (e.keyCode === 56) {
      renderGroup(8);
    }
    if (e.keyCode === 57) {
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
      toggleImageBackground();
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

    if (e.keyCode === 86) {
      toggleVideoBackground();
    }
  }, false);
}
