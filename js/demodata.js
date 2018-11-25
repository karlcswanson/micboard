"use strict";

import { transmitters, displayList } from "./script.js"
import { updateSlot } from "./channelview.js"
import { updateChart } from "./chart-smoothie.js"
// import { charts } from './chart-smoothie.js'


const batterySample = {
  0:{
      battery: 255,
      status: ['CRITICAL','UNASSIGNED','RX_COM_ERROR','TX_COM_ERROR']
    },
  1:{
      battery: 1,
      status: ['CRITICAL','PREV_CRITICAL']
    },
  2:{
      battery: 2,
      status: ['CRITICAL','PREV_CRITICAL']
    },
  3:{
      battery: 3,
      status: ['REPLACE','PREV_REPLACE']
    },
  4:{
      battery: 4,
      status: ['GOOD','GOOD','PREV_GOOD','UNASSIGNED']
    },
  5:{
      battery: 5,
      status: ['GOOD','GOOD','PREV_GOOD']
    }
}

const rfSample = ['AX','XB','XX','BRXX','XRXB','XXBR'];


const name_sample = ['Fatai','Marshall','Delwin','Tracy TB','Backup',
                     'Steve','JE','Sharon','Bob','Del ACU','Troy',
                     'Matt','Matt ACU','Matt Sax','Karl','Jordan','Josue',
                     'Ashlee','Shawn c','James',
                     'Hallie','Rebekah','Dan','Stephen','Max','Tom','Nick',''];

const prefix_sample = ['HH','BP'];

const type_sample = ['uhfr','qlxd','ulxd','axtd']

function randomIPGenerator() {
  return "192.168.103." + getRandomInt(50,150)
}

function randomTypeGenerator() {
  return type_sample[getRandomInt(0,type_sample.length - 1)]
}

// https://gist.github.com/kerimdzhanov/7529623
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomNameGenerator(){
  var prefix = prefix_sample[getRandomInt(0,1)];
  var channel = getRandomInt(1,16).toString().padStart(2,'0');

  var len = name_sample.length;
  var index = getRandomInt(0,len-1);
  var name = name_sample[index]
  return prefix + channel + ' ' + name;
}

function current_names() {
  var names = []

  displayList.forEach(function(e) {
    name = transmitters[e].name
    let prefix = name.substring(0,2)
    let number = name.substring(2,4)
    name = name.substring(5)
    names.push(name)
  })

  return names
}

function uniqueRandomNameGenerator(slot){
  let used_names = current_names()
  let namebank = name_sample.filter( el => !used_names.includes(el));

  let len = namebank.length;
  let index = getRandomInt(0,len-1);
  let name = namebank[index]


  let channel = slot.toString().padStart(2,'0');
  let output = 'HH' + channel + ' ' + name;
  return output
}

function randomRfSampleGenerator() {
  return rfSample[getRandomInt(0,5)];
}

function randomAudioGenerator(){
  return getRandomInt(0,30);
}

function randomTXOffsetGenerator() {
  return getRandomInt(0,21);
}

function randomFrequencyGenerator(){
  let frequency =  getRandomInt(474,597) + (getRandomInt(0,40) * .025)
  return frequency.toFixed(3)
}

function randomRfGenerator(){
  return getRandomInt(0,50);
}

function randomBatteryGenerator() {
  const batt_index = getRandomInt(0,5);
  let battery = batterySample[batt_index];
  let len = battery.status.length;
  let status_index = getRandomInt(0,len-1);

  let res = {
              battery: battery.battery,
              status: battery.status[status_index]
            }
  return res;
}

export function randomDataGenerator(slot){
  var battery = randomBatteryGenerator();

  var res = {
    "name": uniqueRandomNameGenerator(slot),
    "antenna": randomRfSampleGenerator(),
    "audio_level": randomAudioGenerator(),
    "rf_level": randomRfGenerator(),
    "tx_offset": randomTXOffsetGenerator(),
    "frequency": randomFrequencyGenerator(),
    "slot": slot,
    "battery": battery.battery,
    "status": battery.status,
    "ip": randomIPGenerator(),
    "channel": getRandomInt(1,4),
    "type": randomTypeGenerator()
  }
  return res;

}

function meteteredRandomDataGenerator(update){
  var slot = displayList[getRandomInt(0, displayList.length - 1)];
  let data = JSON.parse(JSON.stringify(transmitters[slot]))

  var battery = randomBatteryGenerator();
  data['timestamp'] = unixtimestamp()
  switch(update){
    case "name":        data["name"] = uniqueRandomNameGenerator(slot)
                        break;
    case "antenna":     data["antenna"] = randomRfSampleGenerator()
                        break;
    case "tx_offset":   data["tx_offset"] = randomTXOffsetGenerator()
                        break;
    case "frequency":   data["frequency"] = randomFrequencyGenerator()
                        break;
    case "battery":
    case "status":      data["battery"] = battery.battery
                        data["status"] = battery.status
                        break;

  }
  return data;

}


function unixtimestamp() {
  return new Date()/1000
}

function randomCharts(){
  displayList.forEach(function(n){
    let data = JSON.parse(JSON.stringify(transmitters[n]))
    data.audio_level = randomAudioGenerator()
    data.rf_level = randomRfGenerator()
    data.timestamp = unixtimestamp()
    updateChart(data)
  })
}


export function autoRandom(){
  setInterval(function(){
    updateSlot(meteteredRandomDataGenerator("name"));
  },1250)

  setInterval( function () {
    updateSlot(meteteredRandomDataGenerator("antenna"))
  },90)

  setInterval(function(){
    updateSlot(meteteredRandomDataGenerator("battery"))
  },1250)

  setInterval(function(){
    updateSlot(meteteredRandomDataGenerator("tx_offset"))
  },750)

  setInterval(function(){
    updateSlot(meteteredRandomDataGenerator("frequency"))
  },750)

  setInterval(randomCharts,300);
}
