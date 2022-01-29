'use strict';

import { Sortable, Plugins } from '@shopify/draggable';

import { micboard, updateHash } from './app.js';
import { postJSON } from './data.js';

const NET_DEVICE_TYPES = ['axtd', 'ulxd', 'qlxd', 'uhfr', 'p10t'];

function updateEditEntry(slotSelector, data) {
  if (data.ip) {
    slotSelector.querySelector('.cfg-ip').value = data.ip;
  }
  slotSelector.querySelector('.cfg-type').value = data.type;
  slotSelector.querySelector('.cfg-channel').value = data.channel;
  console.log(data);
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


function updateSlotID() {
  const configList = document.querySelectorAll('#editor_holder .cfg-row');
  let i = 1;
  configList.forEach((t) => {
    t.querySelector('.slot-number label').innerHTML = 'slot ' + i;
    t.id = 'editslot-' + i;
    i += 1;
  });
}

function dragSetup() {
  const containerSelector = '#discovered_list, #editor_holder';
  const containers = document.querySelectorAll(containerSelector);

  if (containers.length === 0) {
    return false;
  }

  const sortable = new Sortable(containers, {
    draggable: '.cfg-row',
    handle: '.navbar-dark',
    mirror: {
      constrainDimensions: true,
    },
    plugins: [Plugins.ResizeMirror],
  });

  // sortable.on('sortable:start', () => console.log('drag:start'));
  // sortable.on('sortable:move', () => console.log('drag:move'));
  sortable.on('drag:stop', () => {
    setTimeout(updateSlotID, 125);
  });
}

function renderSlotList() {
  const config = micboard.config.slots;
  const slotCount = getMaxSlot() + 4;
  let t;

  document.getElementById('editor_holder').innerHTML = '';

  for (let i = 1; i <= slotCount; i += 1) {
    t = document.getElementById('config-slot-template').content.cloneNode(true);
    t.querySelector('label').innerHTML = 'slot ' + i;
    t.querySelector('.cfg-row').id = 'editslot-' + i;
    document.getElementById('editor_holder').append(t);
  }

  config.forEach((e) => {
    const slotID = 'editslot-' + e.slot;
    t = document.getElementById(slotID);
    updateEditEntry(t, e);
  });
}


function discoverFilter(item, currentSlotList) {
  let out = true;
  currentSlotList.forEach((e) => {
    if ((e.ip === item.ip) && (e.type === item.type) && (e.channel === item.channel)) {
      out = false;
    }
  });
  return out;
}

function renderDiscoverdDeviceList() {
  const discovered = micboard.discovered;
  const currentSlotList = generateJSONConfig();

  let t;

  document.getElementById('discovered_list').innerHTML = '';

  discovered.forEach((e) => {
    for (let i = 1; i <= e.channels; i += 1) {
      e.channel = i;
      if (discoverFilter(e, currentSlotList)) {
        t = document.getElementById('config-slot-template').content.cloneNode(true);
        updateEditEntry(t, e);
        document.getElementById('discovered_list').append(t);
      }
    }
  });
}

function generateJSONConfig() {
  const slotList = [];
  const configBoard = document.getElementById('editor_holder').getElementsByClassName('cfg-row');

  for (let i = 0; i < configBoard.length; i += 1) {
    const slot = parseInt(configBoard[i].id.replace(/[^\d.]/g, ''), 10);
    if (slot && (slotList.indexOf(slot) === -1)) {
      const output = {};

      output.slot = slot;
      output.type = configBoard[i].querySelector('.cfg-type').value;

      if (NET_DEVICE_TYPES.indexOf(output.type) > -1) {
        output.ip = configBoard[i].querySelector('.cfg-ip').value;
        output.channel = parseInt(configBoard[i].querySelector('.cfg-channel').value, 10);
      }

      if (output.type) {
        slotList.push(output);
      }
    }
  }
  return slotList;
}


function addAllDiscoveredDevices() {
  const devices = document.querySelectorAll('#discovered_list .cfg-row');
  const cfg_list = document.getElementById('editor_holder');
  const top = cfg_list.querySelector('.cfg-row');

  devices.forEach((e) => {
    cfg_list.insertBefore(e, top);
  });
  updateSlotID();
}

function updateHiddenSlots() {
  const cfgRows = document.querySelectorAll('#editor_holder .cfg-row')
  Array.from(cfgRows).forEach((e) => {
    const type = e.querySelector('.cfg-type').value
    if ( type === 'offline' || type === '') {
      e.querySelector('.cfg-ip').style.display = "none"
      e.querySelector('.cfg-channel').style.display = "none"
    } else {
      e.querySelector('.cfg-ip').style.display = "block"
      e.querySelector('.cfg-channel').style.display = "block"
    }
  })
}

export function initConfigEditor() {
  if (micboard.settingsMode === 'CONFIG') {
    console.log('oh that explains it!')
    return;
  }

  micboard.settingsMode = 'CONFIG';
  updateHash();
  document.getElementById('micboard').style.display = "none"
  document.querySelector('.settings').style.display = "block"

  renderSlotList();
  renderDiscoverdDeviceList();

  dragSetup();



  updateHiddenSlots();
  
  const cfgTypeInputs = document.getElementsByClassName('cfg-type')
  Array.from(cfgTypeInputs).forEach((e) => {
    e.addEventListener('change', () => updateHiddenSlots())
  })

  document.getElementById('add-discovered').addEventListener('click', () => {
    addAllDiscoveredDevices();
  });

  document.getElementById('save').addEventListener('click', ()=> {
    const data = generateJSONConfig();
    const url = 'api/config';
    console.log(data);
    postJSON(url, data, () => {
      micboard.settingsMode = 'NONE';
      updateHash();
      window.location.reload();
    });
  });

  const delBtns = document.querySelectorAll('#editor_holder .del-btn')
  Array.from(delBtns).forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const row = e.target.closest('.cfg-row').remove()
      updateSlotID();
      renderDiscoverdDeviceList();
    })
  });

  document.getElementById('clear-config').addEventListener('click', () => {
    const cfg_list = document.querySelectorAll('#editor_holder .cfg-row')
    Array.from(cfg_list).forEach(e => e.remove())
    let t;
    for (let i = 0; i < 4; i += 1) {
      t = document.getElementById('config-slot-template').content.cloneNode(true);
      document.getElementById('editor_holder').append(t);
    }
    updateSlotID();
    updateHiddenSlots();
    renderDiscoverdDeviceList();
  });

  document.getElementById('add-config-row').addEventListener('click', () => {
    const t = document.getElementById('config-slot-template').content.cloneNode(true);
    document.getElementById('editor_holder').append(t);
    updateSlotID();
    updateHiddenSlots();
  });
}
