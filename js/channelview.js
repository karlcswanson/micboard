"use strict"

import { transmitters, displayList, config } from "./script.js"
import { updateGIFBackgrounds } from "./gif.js"
// import { updateAudioChart } from './chart-smoothie.js'

export function updateSlot(data) {
  if (document.getElementById("micboard").classList.contains("uploadmode")) {
    return
  }
  if (displayList.includes(data.slot)){
    updateSelector(data);
  }
}

function updateSelector(data) {
  var slot = "slot-" + data.slot;
  var slotSelector = document.getElementById(slot);

  if (transmitters[data.slot].name != data.name) {
    updateName(slotSelector, data);
    transmitters[data.slot].name = data.name;
  }

  if (transmitters[data.slot].status != data.status) {
    updateStatus(slotSelector, data);
    transmitters[data.slot].status = data.status;
  }

  if (transmitters[data.slot].battery != data.battery) {
    updateBattery(slotSelector, data);
    transmitters[data.slot].battery = data.battery;
  }

  if (transmitters[data.slot].antenna != data.antenna) {
    updateDiversity(slotSelector, data);
    transmitters[data.slot].antenna = data.antenna;
  }

  if (transmitters[data.slot].tx_offset != data.tx_offset) {
    updateTXOffset(slotSelector, data);
    transmitters[data.slot].tx_offset = data.tx_offset;
  }
  if (transmitters[data.slot].frequency != data.frequency) {
    updateFrequency(slotSelector, data);
    transmitters[data.slot].frequency = data.frequency;
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

  if(document.getElementById("micboard").classList.contains("bg-gif")) {
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

var BatteryTable = {
  '0':  ['batt_led_off', 'batt_led_off', 'batt_led_off', 'batt_led_off', 'batt_led_off'],
  '1':  ['batt_led_danger', 'batt_led_off', 'batt_led_off', 'batt_led_off', 'batt_led_off'],
  '2':  ['batt_led_danger', 'batt_led_danger', 'batt_led_off', 'batt_led_off', 'batt_led_off'],
  '3':  ['batt_led_warning', 'batt_led_warning', 'batt_led_warning', 'batt_led_off', 'batt_led_off'],
  '4':  ['batt_led_good', 'batt_led_good', 'batt_led_good', 'batt_led_good', 'batt_led_off'],
  '5':  ['batt_led_good', 'batt_led_good', 'batt_led_good', 'batt_led_good', 'batt_led_good'],
  '255':['batt_led_off', 'batt_led_off', 'batt_led_off', 'batt_led_off', 'batt_led_off'],
  'led':[]
}

function updateBattery(slotSelector, data){
  var outputBars = BatteryTable[data.battery];

  slotSelector.querySelectorAll('.battery-bar').forEach(function (data) {
    data.classList.remove('batt_led_off', 'batt_led_danger','batt_led_warning','batt_led_good');
  });

  slotSelector.querySelector('.battery-bar-1').classList.add(outputBars[0]);
  slotSelector.querySelector('.battery-bar-2').classList.add(outputBars[1]);
  slotSelector.querySelector('.battery-bar-3').classList.add(outputBars[2]);
  slotSelector.querySelector('.battery-bar-4').classList.add(outputBars[3]);
  slotSelector.querySelector('.battery-bar-5').classList.add(outputBars[4]);
}


function updateDiversity(slotSelector, data){
  let div = slotSelector.querySelector('.diversity')
  var newBar = ""
  for(var i = 0; i < data.antenna.length; i++) {
    let char = data.antenna.charAt(i)
    switch (char) {
      case 'A':
      case 'B': newBar += '<div class="diversity-bar diversity-bar-blue"></div>'
                break;
      case 'R': newBar += '<div class="diversity-bar diversity-bar-red"></div>'
                break;
      case 'X': newBar += '<div class="diversity-bar diversity-bar-off"></div>'
                break;
    }
  }
  div.innerHTML = newBar
}
