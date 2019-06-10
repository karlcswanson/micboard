import { micboard } from './app.js';
import { postJSON } from './data.js';
import { renderGroup } from './channelview.js';
import { setDisplayMode } from './display';

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

    slotSelector.querySelector('.errortype').innerHTML = 'Slot ' + t.slot + ' CH ' + t.channel;
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
  const b = document.getElementsByClassName('flexfix')[0];
  document.getElementById('micboard').insertBefore(t, b);

  $('#slotSave').on('click', () => {
    submitUpdate(slotValues());
  });

  $('#clear-id').on('click', () => {
    $('.ext-id:input').val('');
  });

  $('#clear-name').on('click', () => {
    $('.ext-name:input').val('');
  });
}

export function slotEditToggle() {
  renderGroup(0);
  if (micboard.settingsMode !== 'EXTENDED') {
    if (micboard.displayMode === 'tvmode') {
      setDisplayMode('deskmode');
    }
    micboard.settingsMode = 'EXTENDED';
    initSlotEdit();
  }
}
