'use strict';

import { micboard, setDisplayMode } from './script.js';
import { postJSON } from './dnd.js';

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

      const extendedId = currentBoard[i].querySelector('.ext-id').value;
      const extendedName = currentBoard[i].querySelector('.ext-name').value;

      if (extendedId) {
        output.slot = slot;
        output.extended_id = extendedId;
      }

      if (extendedName) {
        output.slot = slot;
        output.extended_name = extendedName;
      }

      if (output.slot) {
        slotList.push(output);
      }
    }
  }
  return slotList;
}


function submitUpdate(data) {
  const url = 'api/slot';
  postJSON(url, data);
  // window.location.reload();
}

function initSlotEdit() {
  const tx = micboard.transmitters;
  const slots = configArrayGenerator();

  tx.forEach((t) => {
    const slotSelector = document.getElementById("slot-" + t.slot);

    slotSelector.querySelector('.chartzone').style.display = 'none';
    slotSelector.querySelector('.errorzone').style.display = 'none';
    slotSelector.querySelector('.editzone').style.display = 'block';
    if (slots[t.slot].extended_id) {
      slotSelector.querySelector('.ext-id').value = slots[t.slot].extended_id;
    }
    if (slots[t.slot].extended_name) {
      slotSelector.querySelector('.ext-name').value = slots[t.slot].extended_name;
    }
  });

  let div = document.createElement('div');
  div.classList.add('col-sm');
  let b = document.getElementsByClassName('flexfix')[0];

  div.innerHTML = '<button type="button" class="btn btn-success btn-block" id="slotSave">Save</button>';
  document.getElementById('micboard').insertBefore(div, b);
  $('.info-drawer').css('display', 'block');

  $('#slotSave').on('click', () => {
    submitUpdate(slotValues());
    // console.log(slotValues());
  });
}

export function slotEditToggle() {
  if (micboard.displayMode === 'tvmode') {
    setDisplayMode('deskmode');
  }
  initSlotEdit();
}
