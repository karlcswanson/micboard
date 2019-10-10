'use strict';

import { micboard } from './app.js';
import { updateSlot } from './channelview.js';
import { updateChart } from './chart-smoothie.js';

let timers = {};

const batterySample = {
  0: {
    battery: 255,
    status: ['CRITICAL', 'UNASSIGNED', 'RX_COM_ERROR', 'TX_COM_ERROR'],
    runtime_min_max: [0, 0],
  },
  1: {
    battery: 1,
    status: ['CRITICAL', 'PREV_CRITICAL'],
    runtime_min_max: [0, 1],
  },
  2: {
    battery: 2,
    status: ['CRITICAL', 'PREV_CRITICAL'],
    runtime_min_max: [1, 2],
  },
  3: {
    battery: 3,
    status: ['REPLACE', 'PREV_REPLACE'],
    runtime_min_max: [3, 4],
  },
  4: {
    battery: 4,
    status: ['GOOD', 'GOOD', 'PREV_GOOD', 'UNASSIGNED'],
    runtime_min_max: [5, 6],
  },
  5: {
    battery: 5,
    status: ['GOOD', 'GOOD', 'PREV_GOOD'],
    runtime_min_max: [7, 9],
  },
};

const rfSample = ['AX', 'XB', 'XX', 'BRXX', 'XRXB', 'XXBR'];


const name_sample = [
  'Fatai', 'Marsh', 'Delwin', 'Tracy', 'Backup', 'Steve', 'J.E.', 'Lonnie',
  'Sharon', 'Del ACU', 'Troy', 'Matt', 'Karl', 'Anders', 'Mikey', 'Dan',
  'Jordan', 'Josue', 'Ashlee', 'Shawn c', 'James', 'Hallie', 'Rebekah', 'Jazmine',
  'Stephen', 'Aaron', 'Tom', 'Nick', 'Eugene', 'Brittani', 'MattW', 'Natrice',
  'Mollie', 'Albert', 'Gillen', 'Steph', '',
];

const prefix_sample = ['HH', 'BP'];

const type_sample = ['uhfr', 'qlxd', 'ulxd', 'axtd'];

// https://gist.github.com/kerimdzhanov/7529623
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomTypeGenerator() {
  return type_sample[getRandomInt(0, type_sample.length - 1)];
}

function randomNameGenerator() {
  return name_sample[getRandomInt(0, name_sample.length)];
}

function randomIPGenerator() {
  return '192.168.103.' + getRandomInt(50, 150);
}

function current_names() {
  const names = [];

  micboard.displayList.forEach((e) => {
    if (e !== 0) {
      name = micboard.transmitters[e].name;
      const prefix = name.substring(0, 2);
      const number = name.substring(2, 4);
      name = name.substring(5);
      names.push(name);
    }
  });

  return names;
}

function uniqueRandomNameGenerator(slot) {
  const used_names = current_names();
  const namebank = name_sample.filter(el => !used_names.includes(el));

  const len = namebank.length;
  const index = getRandomInt(0, len - 1);
  const name = namebank[index];
  return name;

  // const channel = slot.toString().padStart(2, '0');
  // const output = 'HH' + channel + ' ' + name;
  // return output;
}

function randomRfSampleGenerator() {
  return rfSample[getRandomInt(0, 5)];
}

function randomAudioGenerator() {
  return getRandomInt(0, 30);
}

function randomTXOffsetGenerator() {
  const rand = getRandomInt(0, 27);
  if (rand > 21) {
    return 255;
  }
  return rand;
}

function randomQualityGenerator() {
  let quality = getRandomInt(0, 8);
  if (quality > 5) {
    quality = 255;
  }
  return quality;
}

function randomFrequencyGenerator() {
  const frequency = getRandomInt(474, 597) + (getRandomInt(0, 40) * 0.025);
  return frequency.toFixed(3);
}

function randomRfGenerator() {
  return getRandomInt(0, 50);
}


function randomRuntimeGenerator(battery_minmax) {
  const hours = getRandomInt(battery_minmax[0], battery_minmax[1]);
  const mins = getRandomInt(0, 59).toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

function randomBatteryGenerator() {
  const batt_index = getRandomInt(0, 5);
  const battery = batterySample[batt_index];
  const len = battery.status.length;
  const status_index = getRandomInt(0, len - 1);

  const res = {
    battery: battery.battery,
    status: battery.status[status_index],
    runtime: randomRuntimeGenerator(battery.runtime_min_max),
  };
  return res;
}

function randomDataGenerator() {
  const battery = randomBatteryGenerator();

  const res = {
    name: randomNameGenerator(),
    antenna: randomRfSampleGenerator(),
    audio_level: randomAudioGenerator(),
    rf_level: randomRfGenerator(),
    tx_offset: randomTXOffsetGenerator(),
    frequency: randomFrequencyGenerator(),
    battery: battery.battery,
    status: battery.status,
    ip: randomIPGenerator(),
    channel: getRandomInt(1, 4),
    type: randomTypeGenerator(),
  };
  return res;
}


function unixtimestamp() {
  return new Date() / 1000;
}

function randomNameListGenerator(length) {
  const indexList = [];
  const outputList = [];
  while (indexList.length < length) {
    const r = getRandomInt(0, name_sample.length);
    if (indexList.indexOf(r) < 0) {
      indexList.push(r);
    }
  }
  for (let i = 0; i < length; i += 1) {
    outputList[i] = name_sample[indexList[i]];
  }
  return outputList;
}

export function seedTransmitters(dl) {
  const len = dl.length;
  const names = randomNameListGenerator(len);
  for (let i = 0; i < len; i += 1) {
    const slot = dl[i];
    if (slot !== 0) {
      const r = randomDataGenerator();
      r.slot = slot;
      // const n = 'HH' + slot.toString().padStart(2, '0') + ' ' + names[i];
      const n = names[i];
      r.name = n;
      r.id = 'HH' + slot.toString().padStart(2, '0');
      micboard.transmitters[slot] = r;
    }
  }
}


function meteteredRandomDataGenerator(update) {
  if (micboard.displayList.length === 0) {
    return { slot: 0 };
  }
  const battery = randomBatteryGenerator();
  let slot = 0;
  while (slot === 0) {
    slot = micboard.displayList[getRandomInt(0, micboard.displayList.length - 1)];
  }
  const data = JSON.parse(JSON.stringify(micboard.transmitters[slot]));

  data.id = 'HH' + slot.toString().padStart(2, '0');

  data.timestamp = unixtimestamp();
  switch (update) {
    case 'name': data.name = uniqueRandomNameGenerator(slot);
      break;
    case 'antenna': data.antenna = randomRfSampleGenerator();
      break;
    case 'tx_offset': data.tx_offset = randomTXOffsetGenerator();
      break;
    case 'quality': data.quality = randomQualityGenerator();
      break;
    case 'frequency': data.frequency = randomFrequencyGenerator();
      break;
    case 'battery':
    case 'status': data.battery = battery.battery;
      data.status = battery.status;
      data.runtime = battery.runtime;
      break;
    default:
      break;
  }
  return data;
}


function randomCharts() {
  micboard.displayList.forEach((n) => {
    if (n !== 0) {
      const data = JSON.parse(JSON.stringify(micboard.transmitters[n]));
      data.audio_level = randomAudioGenerator();
      data.rf_level = randomRfGenerator();
      data.timestamp = unixtimestamp();
      updateChart(data);
    }
  });
}


export function autoRandom() {
  for (const key in timers) {
    if (timers.hasOwnProperty(key)) {
      clearInterval(timers[key]);
    }
  }

  timers = {};

  const len = micboard.displayList.length;

  timers.name = setInterval(() => {
    updateSlot(meteteredRandomDataGenerator('name'));
  }, 750 * (12 / len));

  timers.antenna = setInterval(() => {
    updateSlot(meteteredRandomDataGenerator('antenna'));
  }, 90 * (12 / len));

  timers.battery = setInterval(() => {
    updateSlot(meteteredRandomDataGenerator('battery'));
  }, 890 * (12 / len));

  timers.tx_offset = setInterval(() => {
    updateSlot(meteteredRandomDataGenerator('tx_offset'));
  }, 1000 * (12 / len));

  timers.quality = setInterval(() => {
    updateSlot(meteteredRandomDataGenerator('quality'));
  }, 500 * (12 / len));

  timers.frequeny = setInterval(() => {
    updateSlot(meteteredRandomDataGenerator('frequency'));
  }, 750 * (12 / len));
  timers.charts = setInterval(randomCharts, 300);
}
