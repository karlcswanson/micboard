"use strict"

import { config, micboard, ActivateMessageBoard } from "./script.js"
import { updateGIFBackgrounds } from "./gif.js"
import { initChart, charts } from './chart-smoothie.js'
import { seedTransmitters } from './demodata.js'
import { updateEditor } from './dnd.js'


export function renderGroup(group) {
  micboard.group = group;
  console.log("group: " + micboard.group);
  let out = micboard.groups[group];

  if (micboard.url.demo) {
    seedTransmitters(micboard.displayList);
  }

  if (out) {
    micboard.displayList = out.slots;

    renderDisplayList(micboard.displayList);
    updateEditor(group);
  } else {
    micboard.displayList = []
    renderDisplayList(micboard.displayList)
    updateEditor(group)
  }
}


export function renderDisplayList(dl) {
  console.log('DL :');
  console.log(dl);
  document.getElementById('micboard').innerHTML = '';

  let tx = micboard.transmitters;
  for(let i in dl) {
    let j = dl[i];
    let t;
    if (j != 0) {
      t = document.getElementById('column-template').content.cloneNode(true);
      t.querySelector('div.col-sm').id = 'slot-' + tx[j].slot;
      updateViewOnly(t,tx[j]);
      charts[tx[j].slot] = initChart(t);
    } else {
      t = document.createElement('div');
      t.className = "col-sm";
    }

    document.getElementById('micboard').appendChild(t);
  }

  infoToggle();
  flexFix();
}

// enables info-drawer toggle for mobile clients
function infoToggle() {
  $('.col-sm').click(function() {
    if($(window).width() <= 980) {
      $(this).find('.info-drawer').toggle();
    }
  });
}


export function updateSlot(data) {
  if (document.getElementById('micboard').classList.contains('uploadmode')) {
    return;
  }
  if (micboard.displayList.includes(data.slot)) {
    updateSelector(data);
  }
}

function updateSelector(data) {
  const slot = 'slot-' + data.slot;
  const slotSelector = document.getElementById(slot);

  if (micboard.transmitters[data.slot].name != data.name) {
    updateName(slotSelector, data);
    micboard.transmitters[data.slot].name = data.name;
  }

  if (micboard.transmitters[data.slot].status != data.status) {
    updateStatus(slotSelector, data);
    micboard.transmitters[data.slot].status = data.status;
  }

  if (micboard.transmitters[data.slot].battery != data.battery) {
    updateBattery(slotSelector, data);
    micboard.transmitters[data.slot].battery = data.battery;
  }

  if (micboard.transmitters[data.slot].antenna != data.antenna) {
    updateDiversity(slotSelector, data);
    micboard.transmitters[data.slot].antenna = data.antenna;
  }

  if (micboard.transmitters[data.slot].tx_offset != data.tx_offset) {
    updateTXOffset(slotSelector, data);
    micboard.transmitters[data.slot].tx_offset = data.tx_offset;
  }
  if (micboard.transmitters[data.slot].frequency != data.frequency) {
    updateFrequency(slotSelector, data);
    micboard.transmitters[data.slot].frequency = data.frequency;
  }
}

export function updateViewOnly(slotSelector, data) {
  updateStatus(slotSelector, data)
  updateName(slotSelector, data)
  updateTXOffset(slotSelector, data)
  updateBattery(slotSelector, data)
  updateFrequency(slotSelector, data)
  updateDiversity(slotSelector, data)
  updateIP(slotSelector, data)
}

function updateTXOffset(slotSelector, data){
  if (data.type == 'uhfr') {
    slotSelector.querySelector('p.offset').innerHTML = '';
  }
  else {
    slotSelector.querySelector('p.offset').innerHTML = data.tx_offset + " dB";
  }
}

function updateFrequency(slotSelector, data){
  slotSelector.querySelector('p.frequency').innerHTML = data.frequency + " Hz";
}


function updateName(slotSelector, data) {
  if (data.name == 'DEFAULT') {
    data.name = 'SLOT ' + data.slot
  }
  let split = data.name.split(' ')
  var prefix = split[0].replace(/\d+/,'')
  var number = parseInt(split[0].match(/\d+/))
  var name = split.slice(1,split.length).join(' ')
  if(config['prefixes'].indexOf(prefix) >= 0 && !isNaN(number))
  {
    slotSelector.querySelector('p.mic_id').innerHTML = split[0];
    slotSelector.querySelector('p.name').innerHTML = name;
  }
  else {
    slotSelector.querySelector('p.mic_id').innerHTML = '';
    slotSelector.querySelector('p.name').innerHTML = data.name;
  }

  if(document.getElementById('micboard').classList.contains('bg-gif')) {
    updateGIFBackgrounds();
  }
}

function updateStatus(slotSelector, data) {
  slotSelector.querySelector('div.mic_name').className = 'mic_name';
  slotSelector.querySelector('div.mic_name').classList.add(data.status);

  slotSelector.querySelector('div.electrode').className = 'electrode';
  slotSelector.querySelector('div.electrode').classList.add(data.status);


  if (data.status == 'RX_COM_ERROR')
  {
    slotSelector.querySelector('.chartzone').style.display = 'none';
    slotSelector.querySelector('.errorzone').style.display = 'block';
  }
  else
  {
    slotSelector.querySelector('.chartzone').style.display = 'block';
    slotSelector.querySelector('.errorzone').style.display = 'none';
  }
}


function updateIP(slotSelector, data) {
  slotSelector.querySelector('p.ip').innerHTML = data.ip;
  slotSelector.querySelector('p.rxinfo').innerHTML = data.type + " CH " + data.channel;
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

  slotSelector.querySelectorAll('.battery-bar').forEach(function (data) {
    data.classList.remove('batt_led_off', 'batt_led_danger','batt_led_warning','batt_led_good');
  });

  slotSelector.querySelector('.battery-bar-1').classList.add(outputBars[0]);
  slotSelector.querySelector('.battery-bar-2').classList.add(outputBars[1]);
  slotSelector.querySelector('.battery-bar-3').classList.add(outputBars[2]);
  slotSelector.querySelector('.battery-bar-4').classList.add(outputBars[3]);
  slotSelector.querySelector('.battery-bar-5').classList.add(outputBars[4]);
}


function updateDiversity(slotSelector, data) {
  let div = slotSelector.querySelector('.diversity')
  let newBar = '';
  for(var i = 0; i < data.antenna.length; i++) {
    let char = data.antenna.charAt(i);
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

// https://medium.com/developedbyjohn/equal-width-flex-items-a5ba1bfacb77
// Shouldn't be fixing this with js, yet here I am.
function flexFix () {
  const flexFixHTML = `<div class="col-sm flexfix"></div>
                       <div class="col-sm flexfix"></div>
                       <div class="col-sm flexfix"></div>
                       <div class="col-sm flexfix"></div>`;
  $('#micboard').append(flexFixHTML);
}
