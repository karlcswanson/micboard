'use strict';

import { Swappable, Plugins } from '@shopify/draggable';

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
  const containerSelector = '.slot_edit_holder';
  const containers = document.querySelectorAll(containerSelector);

  if (containers.length === 0) {
    return false;
  }

  const swappable = new Swappable(containers, {
    draggable: '.cfg-row',
    handle: '.navbar-dark',
  });

  swappable.on('drag:start', () => console.log('drag:start'));
  swappable.on('drag:move', () => console.log('drag:move'));
  swappable.on('drag:stop', () => console.log('drag:stop'));
}

function renderSlotList() {
  const config = micboard.config.slots;
  const slotCount = getMaxSlot() + 4;
  let t;
  for (let i = 1; i <= slotCount; i += 1) {
    t = document.getElementById('config-slot-template').content.cloneNode(true);
    t.querySelector('span').innerHTML = 'slot ' + i;
    t.querySelector('.cfg-row').id = 'editslot-' + i;
    document.getElementById('editor_holder').append(t);
  }

  config.forEach((e) => {
    const slotID = 'editslot-' + e.slot;
    t = document.getElementById(slotID);
    updateEditEntry(t, e);
  });

  $('.cfg-type').change(function() {
    if ($(this).val() === 'offline') {
      $(this).closest('.cfg-row').find('.cfg-ip').hide()
      $(this).closest('.cfg-row').find('.cfg-channel').hide();
    } else {
      $(this).closest('.cfg-row').find('.cfg-ip').show();
      $(this).closest('.cfg-row').find('.cfg-channel').show();
    }
  }).change();

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
  // renderConfigList();
  console.log("Max Slot: " + getMaxSlot());
  renderSlotList();
  dragSetup();
}
