"use strict";

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import QRCode from 'qrcode'
import JSONEditor from '@json-editor/json-editor'

import { updateGIFBackgrounds, uploadMode } from './gif.js'
import { randomDataGenerator, autoRandom } from './demodata.js'

import { updateAudioChart, updateRfChart, initChart, charts } from './chart-smoothie.js'
// import { updateAudioChart, updateRfChart, initChart, charts } from './chart-chartjs.js'


// import './transmitter.jsx'

import '../css/style.css'
import '../node_modules/@ibm/plex/css/ibm-plex.css'
import '../node_modules/@json-editor/json-editor/dist/css/jsoneditor.min.css'

var dataURL = '/data';
// export var transmitters = {};
export var transmitters = [];

export var gif_list = {};

var config = {};

var localURL = '';
let start_slot = parseInt(getUrlParameter('start_slot'))
let stop_slot = parseInt(getUrlParameter('stop_slot'))
let preset = getUrlParameter('preset')
let demo = getUrlParameter('demo')
let settings = getUrlParameter('settings')


export let displayList = []

$(document).ready(function() {

  if(demo && (isNaN(start_slot) || isNaN(stop_slot))) {
    start_slot = 1
    stop_slot = 12
  }

  if (window.location['href'].includes('amazonaws')) {
    dataURL = './static/data.json'
    demo = 'true'
  }
  if (demo == 'true') {
    for(var i = start_slot; i <= stop_slot; i++) {
      transmitters[i] = randomDataGenerator(i);
    }
    initialMap();
    autoRandom();
  }

  else {
    initialMap();
    setInterval(JsonUpdate, 1000);
    wsConnect();
  }
  if(settings) {
    setTimeout(settingsView, 50)
  }

  document.addEventListener("keydown", function(e) {
    if ( $('.settings').is(":visible")) {
      return
    }
    if (e.keyCode == 49) {
      window.location.href = demo ? '/?demo=true&preset=1' : '/?preset=1'
    }
    if (e.keyCode == 50) {
      window.location.href = demo ? '/?demo=true&preset=2' : '/?preset=2';
    }
    if (e.keyCode == 51) {
      window.location.href = demo ? '/?demo=true&preset=3' : '/?preset=3';
    }
    if (e.keyCode == 52) {
      window.location.href = demo ? '/?demo=true&preset=4' : '/?preset=4';
    }
    if (e.keyCode == 53) {
      window.location.href = demo ? '/?demo=true&preset=5' : '/?preset=5';
    }
    if (e.keyCode == 54) {
      window.location.href = demo ? '/?demo=true&preset=6' : '/?preset=6';
    }
    if (e.keyCode == 55) {
      window.location.href = demo ? '/?demo=true&preset=7' : '/?preset=7';
    }
    if (e.keyCode == 56) {
      window.location.href = demo ? '/?demo=true&preset=8' : '/?preset=8';
    }
    if (e.keyCode == 57) {
      window.location.href = demo ? '/?demo=true&preset=9' : '/?preset=9';
    }

    if (e.keyCode == 68) {
      if (preset) {
        window.location.href = demo ? '/?preset=' + preset : '/?demo=true&preset=' + preset
      }
      else {
        window.location.href = demo ? '/' : '/?demo=true'
      }
    }

    if (e.keyCode == 70) {
      toggleFullScreen();
    }

    if (e.keyCode == 71) {
      toggleBackgrounds();
    }

    if (e.keyCode == 73) {
      toggleInfoDrawer();
    }

    if (e.keyCode == 81) {
      generateQR();
      $('.modal').modal('toggle');
    }
    if (e.keyCode == 83) {
      settingsView();
    }

    if (e.keyCode == 85) {
      if(!document.getElementById("micboard").classList.contains("uploadmode")) {
        uploadMode();
      }
    }
  }, false);

});

function settingsView() {
  console.log(config)
  $('#micboard').hide();
  $('.settings').show();


  var editor = new JSONEditor(document.getElementById('editor_holder'),{
        // Enable fetching schemas via ajax
        ajax: false,
        theme: 'bootstrap4',

        // The schema for the editor
        schema: {
          "title": " ",
          "type" : "object",
          // "format": "categories",
          "options" : {
            "disable_properties": true,
            "disable_edit_json" : true,
            "disable_collapse": true
          },
          "properties" : {
            "port" : {
              "title": "Server Port",
              "type" : "integer"
            },
            "prefixes": {
              "type": "array",
              "title" : "Prefixes",
              "format" : "table",
              "items" : {
                "title" : "prefix",
                "type" : "string"
              },
              "options" : {
                "collapsed" : true,
                "disable_array_delete_last_row": true,
                "disable_array_delete_all_rows": true,
                "disable_array_reorder": true
              }
            },
            "slots": {
              "title" : "Receivers",
              "type" : "array",
              "format" : "table",
              "options" : {
                "collapsed" : true,
                "disable_array_delete_last_row": true,
                "disable_array_delete_all_rows": true,
                "disable_array_reorder": true
              },
              "items" : {
                "title" : "receiver",
                "type" : "object",
                "properties" : {
                  "slot" : {
                    "type" : "integer"
                  },
                  "ip" : {
                    "type" : "string"
                  },
                  "type" : {
                    "type" : "string",
                    "enum" : ["uhfr","qlxd","ulxd","axtd"]
                  },
                  "channel" : {
                    "type" : "integer",
                    "enum" : [1,2,3,4]
                  }
                }
              }

            },
            "displays" : {
              "type" : "array",
              "title": "Display Presets",
              "format" :"table",
              "options" : {
                "collapsed" : true,
                "disable_array_delete_last_row": true,
                "disable_array_delete_all_rows": true,
                "disable_array_reorder": true
              },
              "items" : {
                "type" : "object",
                "title" : "display preset",
                "properties": {
                  "preset" : {
                    "type" : "integer",
                    "enum" : [1,2,3,4,5,6,7,8,9]
                  },
                  "slots" : {
                    "type" : "array",
                    "format" : "table",
                    "items": {
                      "title": "slot",
                      "type" : "integer"
                    },
                    "options" : {
                      "disable_array_delete_last_row": true,
                      "disable_array_delete_all_rows": true
                    }
                  }
                }
              }
            }
          }
        },

        // Seed the form with a starting value
        startval: config
      });
      document.getElementById('submit').addEventListener('click',function() {
        // Get the value from the editor
        console.log(editor.getValue())
        sendSettings(editor.getValue())
      });

      document.getElementById('download').addEventListener('click',function() {
        var a = document.createElement("a")
        var file = new Blob([JSON.stringify(config)], {type: 'application/json'})
        a.href = URL.createObjectURL(file)
        a.download = 'config.json'
        a.click()
      });
}

function sendSettings(settings) {
  var uri = "/settings";
  var xhr = new XMLHttpRequest()
  xhr.open("POST", uri, true)
  xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var eb = document.getElementsByClassName('server-error')[0]
      eb.querySelector('h1').innerHTML = 'Settings Saved'
      eb.querySelector('p').innerHTML = 'Restart the micboard server and reload the page'
      ActivateErrorBoard()
      console.log(xhr.responseText)
    }
  };
  xhr.send(JSON.stringify(settings))
}

function StartStopSlotList(start,stop) {
  let out = []
  for(let i = start; i <= stop; i++) {
    out.push(i)
  }
	return out
}

// enables info-drawer toggle for mobile clients
function infoToggle() {
  $('.col-sm').click(function() {
    if($(window).width() <= 980) {
      $(this).find(".info-drawer").toggle();
    }
  });
}

// https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
function toggleFullScreen() {
  if (!document.webkitFullscreenElement) {
      document.documentElement.webkitRequestFullscreen();
  } else {
    if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}


function swapClass(selector, currentClass, newClass) {
  selector.classList.remove(currentClass)
  selector.classList.add(newClass)
}


function toggleInfoDrawer() {
  let selector = document.getElementById("micboard")

  if(selector.classList.contains("elinfo00")) {
    swapClass(selector,"elinfo00","elinfo01")
  }

  else if(selector.classList.contains("elinfo01")) {
    swapClass(selector,"elinfo01","elinfo10")
  }

  else if(selector.classList.contains("elinfo10")) {
    swapClass(selector,"elinfo10","elinfo11")
  }

  else if(selector.classList.contains("elinfo11")) {
    swapClass(selector,"elinfo11","elinfo00")
  }

  if (selector.classList.contains("uploadmode")) {
    showDivSize();
  }
}


function toggleBackgrounds() {
  let selector = document.getElementById("micboard")

  if(selector.classList.contains("bg-std")) {
    swapClass(selector,"bg-std","bg-gif")
    updateGIFBackgrounds()
  }
  else if(selector.classList.contains("bg-gif")) {
    swapClass(selector,"bg-gif","bg-img")
    $("#micboard .mic_name").css('background-image', '');
    $("#micboard .mic_name").css('background-size', '');
  }
  else if(selector.classList.contains("bg-img")){
    swapClass(selector,"bg-img","bg-std")

    $("#micboard .mic_name").css('background-image', '');
    $("#micboard .mic_name").css('background-size', '');
  }
}

function generateQR(){
  const qrOptions = {
    width: 600
  };

  let url = localURL + location.pathname + location.search;
  document.getElementById('largelink').href = url;
  document.getElementById('largelink').innerHTML = url;
  QRCode.toCanvas(document.getElementById('qrcode'), url, qrOptions, function (error) {
    if (error) console.error(error)
    console.log('success!');
  })
}


function ActivateErrorBoard(){
  $('#micboard').hide()
  $('.settings').hide()
  $('.server-error').show();
}


function wsConnect(){
  let loc = window.location, new_uri;
  if (loc.protocol === "https:") {
    new_uri = "wss:";
  } else {
    new_uri = "ws:";
  }
  new_uri += "//" + loc.host;
  new_uri +=  "/ws";
  let socket = new WebSocket(new_uri);

  socket.onmessage = function(msg){
    let mic_data = JSON.parse(msg.data)['update'];
    for (var i in mic_data) {
      updateSlot(mic_data[i])
    }
    // updateSlot(mic_data);
  };

  socket.onclose = function(event){
    ActivateErrorBoard();
  };

  socket.onerror = function(event){
    ActivateErrorBoard();
  };
}

// https://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js
// var getUrlParameter = function getUrlParameter(sParam) {
function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function JsonUpdate(){
  fetch(dataURL)
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    for(var i in data.receivers) {
      for (var j in data.receivers[i].tx) {
        updateSlot(data.receivers[i].tx[j]);
      }
    }
  });
}


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

  updateAudioChart(data);
  // transmitters[data.slot].audio_level = data.audio_level;

  updateRfChart(data);
  // transmitters[data.slot].rf_level = data.rf_level;
}


function updateTXOffset(slotSelector, data){
  slotSelector.querySelector('p.offset').innerHTML = data.tx_offset + " dB";
}

function updateFrequency(slotSelector, data){
  slotSelector.querySelector('p.frequency').innerHTML = data.frequency + " Hz";
}


function updateName(slotSelector, data) {
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

function dataFilter(data){
  for(var i in data.receivers){
    for (var j in data.receivers[i].tx){
      var tx = data.receivers[i].tx[j];
      tx.ip = data.receivers[i].ip;
      tx.type = data.receivers[i].type;
      if (start_slot && stop_slot){
        if (start_slot <= tx.slot && tx.slot <= stop_slot) {
          transmitters[tx.slot] = tx;
        }
      }
      else {
        transmitters[tx.slot] = tx;
      }
    }
  }
}

function dataFilterFromList(data){
  for(var i in data.receivers){
    for (var j in data.receivers[i].tx){
      var tx = data.receivers[i].tx[j];
      tx.ip = data.receivers[i].ip;
      tx.type = data.receivers[i].type;
      if (displayList.includes(tx.slot)) {
        transmitters[tx.slot] = tx;
      }
    }
  }
}


function displayListChooser(data) {
  if (!isNaN(preset)) {
    let plist = []
    for (var p in data['config']['displays']) {
      plist[data['config']['displays'][p]['preset']] = data['config']['displays'][p]['slots']
    }

    return plist[preset]
  }
  else if (!isNaN(start_slot) && !isNaN(stop_slot)) {
    if (start_slot < stop_slot) {
      return StartStopSlotList(start_slot,stop_slot)
    }
  }
  else {
    let slot = data['config']['slots']
    console.log(slot)
    let out = []
    for(var i = 0; i < slot.length; i++) {
      out.push(slot[i]['slot'])
    }
    return out
  }
}

function initialMap() {
  fetch(dataURL)
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    gif_list = data['gif']
    localURL = data['url']
    config = data['config']
    displayList = displayListChooser(data)
    console.log(displayList)


    if (getUrlParameter('demo') !== 'true') {

      dataFilterFromList(data)
    }

    document.getElementById("micboard").innerHTML = ""

    var tx = transmitters;
    for(let i in displayList) {
      let j = displayList[i]
      var t = document.getElementById("column-template").content.cloneNode(true);
      t.querySelector('div.col-sm').id = 'slot-' + tx[j].slot;
      updateStatus(t,tx[j]);
      updateName(t,tx[j]);
      updateTXOffset(t,tx[j]);
      updateBattery(t,tx[j]);
      updateFrequency(t,tx[j]);
      updateDiversity(t,tx[j]);
      updateIP(t,tx[j]);
      charts[tx[j].slot] = initChart(t);
      document.getElementById('micboard').appendChild(t);
    }
    infoToggle();
    flexFix();
  });
}


// https://medium.com/developedbyjohn/equal-width-flex-items-a5ba1bfacb77
// Shouldn't be fixing this with js, yet here I am.
function flexFix () {
  var flexFixHTML =   `<div class="col-sm flexfix"></div>
                       <div class="col-sm flexfix"></div>
                       <div class="col-sm flexfix"></div>
                       <div class="col-sm flexfix"></div>`;
  $("#micboard").append(flexFixHTML);
}
