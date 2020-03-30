'use strict';

import { micboard, ActivateMessageBoard, updateHash } from './app.js';
import { updateBackground } from './gif.js';
import { initChart, charts } from './chart-smoothie.js';
import { seedTransmitters, autoRandom } from './demodata.js';
import { updateEditor } from './dnd.js';

function allSlots() {
  const slot = micboard.config.slots;
  const out = [];

  if (micboard.url.demo) {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  }

  for (let i = 0; i < slot.length; i += 1) {
    out.push(slot[i].slot);
  }
  return out;
}


// enables info-drawer toggle for mobile clients
function infoToggle() {
  $('.col-sm').click((e) => {
    if ($(window).width() <= 980 && micboard.settingsMode !== 'EXTENDED') {
      $(e.currentTarget).find('.info-drawer').toggle();
    }
  });

  if (micboard.group === 0) {
    $('#go-groupedit').hide();
  } else if (micboard.group !== 0) {
    $('#go-groupedit').show();
  }
}

function updateTXOffset(slotSelector, data) {
  if (data.tx_offset !== 255) {
    slotSelector.querySelector('p.offset').innerHTML = data.tx_offset + ' dB';
  } else {
    slotSelector.querySelector('p.offset').innerHTML = '';
  }
}


function updateRuntime(slotSelector, data) {
  slotSelector.querySelector('p.runtime').innerHTML = data.runtime;
}

function updatePowerlock(slotSelector, data) {
  if (data.power_lock === 'ON') {
    slotSelector.querySelector('p.powerlock').style.display = 'block';
  } else {
    slotSelector.querySelector('p.powerlock').style.display = 'none';
  }


}

function updateQuality(slotSelector, data) {
  const QualityTable = {
    0: '&#9675;&#9675;&#9675;&#9675;&#9675;',
    1: '&#9679;&#9675;&#9675;&#9675;&#9675;',
    2: '&#9679;&#9679;&#9675;&#9675;&#9675;',
    3: '&#9679;&#9679;&#9679;&#9675;&#9675;',
    4: '&#9679;&#9679;&#9679;&#9679;&#9675;',
    5: '&#9679;&#9679;&#9679;&#9679;&#9679;',
    255: '',
  };
  slotSelector.querySelector('p.quality').innerHTML = QualityTable[data.quality];
}

function updateFrequency(slotSelector, data) {
  slotSelector.querySelector('p.frequency').innerHTML = data.frequency + ' Hz';
  if (data.frequency === '000000')
  {
    slotSelector.querySelector('.frequency').style.display = 'none';
  } else {
    slotSelector.querySelector('.frequency').style.display = 'block';
  }
}

function updateID(slotSelector, data) {
  slotSelector.querySelector('p.mic_id').innerHTML = data.id;
}

function updateName(slotSelector, data) {
  slotSelector.querySelector('p.name').innerHTML = data.name;
  updateBackground(slotSelector.querySelector('.mic_name'));
}

function updateStatus(slotSelector, data) {
  slotSelector.querySelector('div.mic_name').className = 'mic_name';
  slotSelector.querySelector('div.mic_name').classList.add(data.status);

  slotSelector.querySelector('div.electrode').className = 'electrode';
  slotSelector.querySelector('div.electrode').classList.add(data.status);

  if (micboard.settingsMode !== 'EXTENDED') {
    if (data.status === 'RX_COM_ERROR') {
      slotSelector.querySelector('.chartzone').style.display = 'none';
      slotSelector.querySelector('.errorzone').style.display = 'block';
    } else {
      slotSelector.querySelector('.chartzone').style.display = 'block';
      slotSelector.querySelector('.errorzone').style.display = 'none';
    }
  }
}


function updateIP(slotSelector, data) {
  slotSelector.querySelector('p.ip').innerHTML = data.ip;
  slotSelector.querySelector('p.rxinfo').innerHTML = data.type + ' CH ' + data.channel;
}

const BatteryTable = {
  0: ['batt_led_off', 'batt_led_off', 'batt_led_off', 'batt_led_off', 'batt_led_off'],
  1: ['batt_led_danger', 'batt_led_off', 'batt_led_off', 'batt_led_off', 'batt_led_off'],
  2: ['batt_led_danger', 'batt_led_danger', 'batt_led_off', 'batt_led_off', 'batt_led_off'],
  3: ['batt_led_warning', 'batt_led_warning', 'batt_led_warning', 'batt_led_off', 'batt_led_off'],
  4: ['batt_led_good', 'batt_led_good', 'batt_led_good', 'batt_led_good', 'batt_led_off'],
  5: ['batt_led_good', 'batt_led_good', 'batt_led_good', 'batt_led_good', 'batt_led_good'],
  255: ['batt_led_off', 'batt_led_off', 'batt_led_off', 'batt_led_off', 'batt_led_off'],
  led: [],
};

function updateBattery(slotSelector, data) {
  const outputBars = BatteryTable[data.battery];

  slotSelector.querySelectorAll('.battery-bar').forEach((b) => {
    b.classList.remove('batt_led_off', 'batt_led_danger', 'batt_led_warning', 'batt_led_good');
  });

  slotSelector.querySelector('.battery-bar-1').classList.add(outputBars[0]);
  slotSelector.querySelector('.battery-bar-2').classList.add(outputBars[1]);
  slotSelector.querySelector('.battery-bar-3').classList.add(outputBars[2]);
  slotSelector.querySelector('.battery-bar-4').classList.add(outputBars[3]);
  slotSelector.querySelector('.battery-bar-5').classList.add(outputBars[4]);

  if (micboard.group !== 0) {
    let hideChart = false;

    if (micboard.groups[micboard.group]) {
      hideChart = micboard.groups[micboard.group]['hide_charts'];
    }

    if (hideChart) {
      if (data.battery === 255) {
        slotSelector.querySelector('.slotgraph').style.display = 'none';
      } else {
        slotSelector.querySelector('.slotgraph').style.display = 'block';
      }
    }
  }
}


function updateDiversity(slotSelector, data) {
  const div = slotSelector.querySelector('.diversity');
  let newBar = '';
  for (let i = 0; i < data.antenna.length; i += 1) {
    const char = data.antenna.charAt(i);
    switch (char) {
      case 'A':
      case 'B': newBar += '<div class="diversity-bar diversity-bar-blue"></div>';
        break;
      case 'R': newBar += '<div class="diversity-bar diversity-bar-red"></div>';
        break;
      case 'X': newBar += '<div class="diversity-bar diversity-bar-off"></div>';
        break;
      default:
        break;
    }
  }
  div.innerHTML = newBar;
}

function updateCheck(data, key, callback) {
  if (key in data) {
    if (micboard.transmitters[data.slot][key] !== data[key]) {
      if (callback) {
        callback();
      }
      micboard.transmitters[data.slot][key] = data[key];
    }
  }
}


function updateSelector(slotSelector, data) {
  updateCheck(data, 'id', () => {
    updateID(slotSelector, data);
  });
  updateCheck(data, 'name', () => {
    updateName(slotSelector, data);
  });
  updateCheck(data, 'name_raw');
  updateCheck(data, 'status', () => {
    updateStatus(slotSelector, data);
  });
  updateCheck(data, 'battery', () => {
    updateBattery(slotSelector, data);
  });
  updateCheck(data, 'runtime', () => {
    updateRuntime(slotSelector, data);
  });
  updateCheck(data, 'antenna', () => {
    updateDiversity(slotSelector, data);
  });
  updateCheck(data, 'tx_offset', () => {
    updateTXOffset(slotSelector, data);
  });
  updateCheck(data, 'quality', () => {
    updateQuality(slotSelector, data);
  });
  updateCheck(data, 'frequency', () => {
    updateFrequency(slotSelector, data);
  });
  updateCheck(data, 'power_lock', () => {
    updatePowerlock(slotSelector, data);
  });
}


export function updateViewOnly(slotSelector, data) {
  if ('status' in data) {
    updateStatus(slotSelector, data);
  }
  if ('id' in data) {
    updateID(slotSelector, data);
  }
  if ('name' in data) {
    updateName(slotSelector, data);
  }
  if ('tx_offset' in data) {
    updateTXOffset(slotSelector, data);
  }
  if ('battery' in data) {
    updateBattery(slotSelector, data);
  }
  if ('runtime' in data) {
    updateRuntime(slotSelector, data);
  }
  if ('quality' in data) {
    updateQuality(slotSelector, data);
  }
  if ('frequency' in data) {
    updateFrequency(slotSelector, data);
  }
  if ('antenna' in data) {
    updateDiversity(slotSelector, data);
  }
  if ('ip' in data) {
    updateIP(slotSelector, data);
  }
  if ('power_lock' in data) {
    updatePowerlock(slotSelector, data);
  }
}

export function updateSlot(data) {
  if (document.getElementById('micboard').classList.contains('uploadmode')) {
    return;
  }

  if (data.slot === 0) {
    return;
  }
  const slot = 'slot-' + data.slot;
  const slotSelector = document.getElementById(slot);
  if (slotSelector) {
    updateSelector(slotSelector, data);
  }
}

export function renderDisplayList(dl) {
  console.log('DL :');
  console.log(dl);
  document.getElementById('micboard').innerHTML = '';

  if (micboard.url.demo) {
    seedTransmitters(dl);
    autoRandom();
  }

  const tx = micboard.transmitters;
  dl.forEach((e) => {
    let t;
    if (e !== 0) {
      if (typeof tx[e] !== 'undefined') {
        t = document.getElementById('column-template').content.cloneNode(true);
        t.querySelector('div.col-sm').id = 'slot-' + tx[e].slot;
        updateViewOnly(t, tx[e]);
        charts[tx[e].slot] = initChart(t, tx[e]);
        document.getElementById('micboard').appendChild(t);
      }
    } else {
      t = document.getElementById('column-template').content.cloneNode(true);
      t.querySelector('p.name').innerHTML = 'BLANK';
      t.querySelector('.col-sm').classList.add('blank');
      document.getElementById('micboard').appendChild(t);
    }
  });

  infoToggle();
}

export function renderGroup(group) {
  if (micboard.settingsMode === 'CONFIG') {
    $('#micboard').show();
    $('.settings').hide();
  }
  micboard.group = group;
  updateHash();
  if (group === 0) {
    micboard.displayList = allSlots();
    renderDisplayList(micboard.displayList);
    updateEditor(group);
    return;
  }
  const out = micboard.groups[group];
  if (out) {
    micboard.displayList = out.slots;
    renderDisplayList(micboard.displayList);
    updateEditor(group);
  } else {
    micboard.displayList = [];
    renderDisplayList(micboard.displayList);
    updateEditor(group);
  }
}
