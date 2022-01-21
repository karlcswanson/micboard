import { micboard } from './app.js';
import { postJSON } from './data.js';
import { renderGroup } from './channelview.js';
import { setDisplayMode, setBackground } from './display';

function configArrayGenerator() {
  const slots = [];
  micboard.config.slots.forEach((s) => {
    slots[s.slot] = s;
  });
  return slots;
}

function slotValues() {
  const slotList = [];
  const currentBoard = document.getElementById('micboard').getElementsByClassName('col-sm');

  for (let i = 0; i < currentBoard.length; i += 1) {
    const slot = parseInt(currentBoard[i].id.replace(/[^\d.]/g, ''), 10);
    if (slot && (slotList.indexOf(slot) === -1)) {
      const output = {};

      output.slot = slot;
      output.extended_id = currentBoard[i].querySelector('.ext-id').value;
      output.extended_name = currentBoard[i].querySelector('.ext-name').value;

      slotList.push(output);
    }
  }
  return slotList;
}

function loadBulkNames() {
  const names = document.getElementById('bulkbox').value.split('\n');

  const currentBoard = document.getElementById('micboard').getElementsByClassName('col-sm');

  for (let i = 0; i < currentBoard.length; i += 1) {
    if (typeof names[i] === 'undefined') {
      // does not exist
    } else {
      // does exist
      currentBoard[i].getElementsByClassName('ext-name')[0].value = names[i];
    }
  }
}

function submitUpdate(data) {
  const url = 'api/slot';
  postJSON(url, data, window.location.reload());
}

function initSlotEdit() {
  const tx = micboard.transmitters;
  const slots = configArrayGenerator();

  tx.forEach((t) => {
    const slotSelector = document.getElementById('slot-' + t.slot);

    slotSelector.querySelector('.chartzone').style.display = 'none';
    slotSelector.querySelector('.errorzone').style.display = 'block';
    slotSelector.querySelector('.diversity').style.display = 'none';
    slotSelector.querySelector('.editzone').style.display = 'block';
    slotSelector.querySelector('.info-drawer').style.display = 'block';

    if (t.channel) {
      slotSelector.querySelector('.errortype').innerHTML = 'Slot ' + t.slot + ' CH ' + t.channel;
    } else {
      slotSelector.querySelector('.errortype').innerHTML = 'Slot ' + t.slot;
    }


    slotSelector.querySelector('.ip').innerHTML = t.ip;
    slotSelector.querySelector('.rxinfo').innerHTML = t.name_raw;

    if (slots[t.slot].extended_id) {
      slotSelector.querySelector('.ext-id').value = slots[t.slot].extended_id;
    }
    if (slots[t.slot].extended_name) {
      slotSelector.querySelector('.ext-name').value = slots[t.slot].extended_name;
    }
  });

  const t = document.getElementById('save-template').content.cloneNode(true);
  document.getElementById('micboard').appendChild(t);

  document.getElementById('slotSave').addEventListener('click', () => {
    submitUpdate(slotValues());
  });

  document.getElementById('bulk-name-loader').addEventListener('click', () => {
    loadBulkNames();
  });

  document.getElementById('clear-id').addEventListener('click', () => {
    const elements = document.getElementsByClassName('ext-id')
    Array.from(elements).forEach((e) => {
      e.value = ''
    })
  });

  document.getElementById('clear-name').addEventListener('click', () => {
    const elements = document.getElementsByClassName('ext-name')
    Array.from(elements).forEach((e) => {
      e.value = ''
    })
  });
}

export function slotEditToggle() {
  renderGroup(0);
  setBackground('NONE');
  if (micboard.settingsMode !== 'EXTENDED') {
    if (micboard.displayMode === 'tvmode') {
      setDisplayMode('deskmode');
    }
    micboard.settingsMode = 'EXTENDED';
    initSlotEdit();
  }
}
