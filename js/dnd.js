'use strict';

import { Sortable, Plugins } from '@shopify/draggable';


import { micboard, toggleDisplayMode } from './script.js';
import { initChart, charts } from './chart-smoothie.js';
import { renderDisplayList, updateViewOnly } from './channelview.js';

let swappable;

function slotOrder() {
  const slotList = [];
  const currentBoard = document.getElementById('micboard').getElementsByClassName('col-sm');

  for (let i = 0; i < currentBoard.length; i += 1) {
    const slot = parseInt(currentBoard[i].id.replace(/[^\d.]/g, ''), 10);
    if (slot && (slotList.indexOf(slot) === -1)) {
      slotList.push(slot);
    }
  }

  console.log('slotlist:' + slotList);
  return slotList;
}


function renderEditSlots(dl) {
  document.getElementById('eslotlist').innerHTML = '';

  const tx = micboard.transmitters;
  dl.forEach((e) => {
    let t;
    if (e !== 0) {
      t = document.getElementById('column-template').content.cloneNode(true);
      t.querySelector('div.col-sm').id = 'slot-' + tx[e].slot;
      updateViewOnly(t, tx[e]);
    } else {
      t = document.createElement('div');
      t.className = 'col-sm';
    }

    document.getElementById('eslotlist').appendChild(t);
  });
}


function calcEditSlots() {
  const output = [];
  micboard.config.slots.forEach((slot) => {
    if (micboard.displayList.indexOf(slot.slot) === -1) {
      output.push(slot.slot);
    }
  });

  return output;
}


function onDrop(id, src, dst) {
  const slot = parseInt(id.id.replace(/[^\d.]/g, ''), 10);
  console.log('DSLOT: ' + slot);
  micboard.displayList = slotOrder();

  const eslots = calcEditSlots();
  renderEditSlots(eslots);


  // if (src === 'micboard' && dst === 'micboard') {
  // }
  if (src === 'eslotlist' && dst === 'micboard') {
    charts[slot] = initChart(document.getElementById(id.id));
  }
  if (src === 'micboard' && dst === 'eslotlist') {
    charts[slot].slotChart.stop();
  }
}

export function updateEditor(group) {
  let title = '';

  if (micboard.groups[group]) {
    title = micboard.groups[group]['title'];
  }

  document.getElementById('sidebarTitle').innerHTML = 'Group ' + group;
  document.getElementById('groupTitle').value = title;
}

function postJSON(url, data) {
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(res => res.json())
    .then(response => console.log('Success:', JSON.stringify(response)))
    .catch(error => console.error('Error:', error));
}

function GridLayout() {
  const containerSelector = '.drag-container';
  const containers = document.querySelectorAll(containerSelector);

  if (containers.length === 0) {
    return false;
  }

  swappable = new Sortable(containers, {
    draggable: '.col-sm',
    mirror: {
      appendTo: containerSelector,
      constrainDimensions: true,
    },

    plugins: [Plugins.ResizeMirror],
  });
  renderEditSlots(calcEditSlots());
  swappable.on('sortable:stop', (evt) => {
    console.log('DROP');
    console.log(evt.dragEvent);

    setTimeout(onDrop, 125, evt.dragEvent.source, evt.oldContainer.id, evt.newContainer.id)
  });

  return swappable;
}

export function groupEditToggle() {
  const container = document.getElementsByClassName('container-fluid')[0];
  if (container.classList.contains('sidebar-open')) {
    container.classList.remove('sidebar-open');
    swappable.destroy();
  } else {
    if (micboard.displayMode === 'TV') {
      toggleDisplayMode();
    }
    container.classList.add('sidebar-open');
    GridLayout();
  }
}

function submitSlotUpdate() {
  const url = 'api/group';

  const update = {
    group: micboard.group,
    title: document.getElementById('groupTitle').value,
    slots: slotOrder(),
  };


  console.log(update);
  postJSON(url, update);
  groupEditToggle();
}

export function initEditor() {
  $('#editorClose').on('click', () => {
    groupEditToggle();
  });

  $('#editorSave').on('click', () => {
    submitSlotUpdate();
  });
}
