'use strict';

import { Sortable, Plugins } from '@shopify/draggable';

import { micboard } from './app.js';
import { postJSON } from './data.js';


function updateEditEntry(slotSelector, data) {
  slotSelector.querySelector('.cfg-ip').value = data.ip;
  slotSelector.querySelector('.cfg-type').value = data.type;
  slotSelector.querySelector('.cfg-channel').value = data.type;
}


function getMaxSlot() {
  let max = 0;
  micboard.config.slots.forEach((e) => {
    if (e.slot > max) {
      max = e.slot;
    }
  });
  return max;
}


function dragSetup() {
  const containerSelector = '#editor_holder';
  const containers = document.querySelectorAll(containerSelector);

  if (containers.length === 0) {
    return false;
  }

  const sortable = new Sortable(containers, {
    draggable: '.cfg-row',
    handle: '.navbar-dark'
  });

  sortable.on('drag:start', () => console.log('drag:start'));
  sortable.on('drag:move', () => console.log('drag:move'));
  sortable.on('drag:stop', () => console.log('drag:stop'));
}

function renderConfigList() {
  const config = micboard.config.slots;
  let t;
  config.forEach((e) => {
    t = document.getElementById('config-template').content.cloneNode(true);
    console.log(e);
    updateEditEntry(t, e);
    document.getElementById('editor_holder').append(t);
  });
}


export function initConfigEditor() {
  $('#micboard').hide();
  $('.settings').show();
  renderConfigList();
  console.log("Max Slot: " + getMaxSlot());
  dragSetup();
}
