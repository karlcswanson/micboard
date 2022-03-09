'use strict';

import { Sortable, Plugins } from '@shopify/draggable';


import { micboard } from './app.js';
import { initChart, charts } from './chart-smoothie.js';
import { renderDisplayList, updateViewOnly } from './channelview.js';
import { postJSON } from './data.js';
import { toggleDisplayMode } from './display';

let swappable;

function slotOrder() {
  const slotList = [];
  const currentBoard = document.getElementById('micboard').getElementsByClassName('col-sm');

  for (let i = 0; i < currentBoard.length; i += 1) {
    const slot = parseInt(currentBoard[i].id.replace(/[^\d.]/g, ''), 10);
    if (slot && (slotList.indexOf(slot) === -1)) {
      slotList.push(slot);
    } else if (currentBoard[i].classList.contains('blank')) {
      slotList.push(0);
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

  const b = document.getElementById('column-template').content.cloneNode(true);
  b.querySelector('p.name').innerHTML = 'BLANK';
  b.querySelector('.col-sm').classList.add('blank');
  document.getElementById('eslotlist').appendChild(b);
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

function clearAll() {
  micboard.displayList = [];
  renderDisplayList(micboard.displayList);

  const eslots = calcEditSlots();
  renderEditSlots(eslots);
}

function onDrop(id, src, dst) {
  const slot = parseInt(id.id.replace(/[^\d.]/g, ''), 10);
  console.log('DSLOT: ' + slot);
  micboard.displayList = slotOrder();

  const eslots = calcEditSlots();
  renderEditSlots(eslots);


  // if (src === 'micboard' && dst === 'micboard') {
  // }
  if (src === 'eslotlist' && dst === 'micboard' && slot) {
    charts[slot] = initChart(document.getElementById(id.id), micboard.transmitters[slot]);
  }
  if (src === 'micboard' && dst === 'eslotlist' && slot) {
    charts[slot].slotChart.stop();
  }
}

export function updateEditor(group) {
  let title = '';
  let chartCheck = false;

  if (micboard.groups[group]) {
    title = micboard.groups[group]['title'];
    chartCheck = micboard.groups[group]['hide_charts'];
  }


  document.getElementById('sidebarTitle').innerHTML = 'Group ' + group;
  document.getElementById('groupTitle').value = title;
  document.getElementById('chartCheck').checked = chartCheck;
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
    if (micboard.displayMode === 'tvmode') {
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
    hide_charts: document.getElementById('chartCheck').checked,
    slots: slotOrder(),
  };


  console.log(update);
  postJSON(url, update);
  groupEditToggle();
}

export function initEditor() {
  document.getElementById('editorClose').addEventListener('click', () => {
    groupEditToggle();
  });

  document.getElementById('editorSave').addEventListener('click', () => {
    submitSlotUpdate();
  });
  document.getElementById('editorClear').addEventListener('click', () => {
    clearAll();
  });
}
