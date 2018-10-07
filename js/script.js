"use strict";

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import QRCode from 'qrcode'
import { updateGIFBackgrounds, uploadMode } from './gif.js'
import { initChart, charts } from './chart-smoothie.js'
import { randomDataGenerator, autoRandom } from './demodata.js'
import '../css/style.css'
import '../node_modules/@ibm/plex/css/ibm-plex.css'

var dataURL = '/data';
export var transmitters = {};

export var gif_list = {};

var config = {};

var localURL = '';
let start_slot = parseInt(getUrlParameter('start_slot'));
let stop_slot = parseInt(getUrlParameter('stop_slot'));
let demo = getUrlParameter('demo');

$(document).ready(function() {
  let start_slot = parseInt(getUrlParameter('start_slot'));
  let stop_slot = parseInt(getUrlParameter('stop_slot'));
  let demo = getUrlParameter('demo');

  if(isNaN(start_slot)) {
    start_slot = 1
  }
  if(isNaN(stop_slot)) {
    stop_slot = 12
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
    setInterval(JsonUpdate, 500);
    wsConnect();
  }

  document.addEventListener("keydown", function(e) {
    if (e.keyCode == 68) {
      window.location.href = '/?demo=true&start_slot=1&stop_slot=8';
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

    if (e.keyCode == 85) {
      if(!$("#micboard").hasClass("uploadmode")) {
        uploadMode();
      }
    }
  }, false);



  $(document).ajaxError(function( event, request, settings ) {
    ActivateErrorBoard();
  });


});



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



function toggleInfoDrawer() {
  if($("#micboard").hasClass("elinfo00")){
    $("#micboard").removeClass("elinfo00");
    $("#micboard").addClass("elinfo01");
  }
  else if($("#micboard").hasClass("elinfo01")){
    $("#micboard").removeClass("elinfo01");
    $("#micboard").addClass("elinfo10");
  }
  else if($("#micboard").hasClass("elinfo10")){
    $("#micboard").removeClass("elinfo10");
    $("#micboard").addClass("elinfo11");
  }
  else if($("#micboard").hasClass("elinfo11")){
    $("#micboard").removeClass("elinfo11");
    $("#micboard").addClass("elinfo00");
  }

  if ($("#micboard").hasClass("uploadmode")) {
    showDivSize();
  }
}


function toggleBackgrounds() {
  if($("#micboard").hasClass("bg-std")){
    $("#micboard").removeClass("bg-std");
    $("#micboard").addClass("bg-gif");
    updateGIFBackgrounds();
  }
  else if($("#micboard").hasClass("bg-gif")){
    $("#micboard").removeClass("bg-gif");
    $("#micboard").addClass("bg-img");
    $("#micboard .mic_name").css('background-image', '');
    $("#micboard .mic_name").css('background-size', '');
  }
  else if($("#micboard").hasClass("bg-img")){
    $("#micboard").removeClass("bg-img");
    $("#micboard").addClass("bg-std");
    $("#micboard .mic_name").css('background-image', '');
    $("#micboard .mic_name").css('background-size', '');
  }
}

function generateQR(){
  var qrOptions = {
    width: 600
  };
  $.getJSON( '/data', function(data) {
    var url = data['url'];
    url = url + location.pathname + location.search;
    document.getElementById('largelink').href = url;
    document.getElementById('largelink').innerHTML = url;
    QRCode.toCanvas(document.getElementById('qrcode'), url, qrOptions, function (error) {
      if (error) console.error(error)
      console.log('success!');
    })
  });
}


function ActivateErrorBoard(){
  $('#micboard').hide();
  $('.server-error').show();
}


function wsConnect(){
  var loc = window.location, new_uri;
  if (loc.protocol === "https:") {
    new_uri = "wss:";
  } else {
    new_uri = "ws:";
  }
  new_uri += "//" + loc.host;
  new_uri +=  "/ws";
  var socket = new WebSocket(new_uri);

  socket.onmessage = function(msg){
    var mic_data = JSON.parse(msg.data);
    updateSlot(mic_data);
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
  $.getJSON( dataURL, function( data ) {
    for(var i in data.receivers) {

      // console.log("IP: " + ip + " TYPE: " + type + " STATUS: " + status);
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
  if (start_slot && stop_slot) {
    if (start_slot <= data.slot && data.slot <= stop_slot) {
      updateSelector(data);
    }
  }
  else {
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
  transmitters[data.slot].audio_level = data.audio_level;

  updateRfChart(data);
  transmitters[data.slot].rf_level = data.rf_level;
}

function updateAudioChart(data) {
  charts[data.slot].audioSeries.append(Date.now(), data.audio_level);
}

function updateTXOffset(slotSelector, data){
  slotSelector.querySelector('p.offset').innerHTML = data.tx_offset + " dB";
}

function updateFrequency(slotSelector, data){
  slotSelector.querySelector('p.frequency').innerHTML = data.frequency + " Hz";
}

function updateRfChart(data) {
  charts[data.slot].rfSeries.append(Date.now(), data.rf_level);
}

function updateName(slotSelector, data) {
  var prefix = data.name.substring(0,2);
  var number = data.name.substring(2,4);
  var name = data.name.substring(5);
  if(config['prefixes'].indexOf(prefix) >= 0 && !isNaN(number))
  {
    slotSelector.querySelector('p.mic_id').innerHTML = prefix + number;
    slotSelector.querySelector('p.name').innerHTML = name;
  }
  else {
    slotSelector.querySelector('p.mic_id').innerHTML = '';
    slotSelector.querySelector('p.name').innerHTML = data.name;
  }

  if($("#micboard").hasClass("bg-gif")){
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


function initialMap() {
  $.getJSON( dataURL, function(data) {
    gif_list = data['gif']
    localURL = data['url']
    config = data['config']
    if (getUrlParameter('demo') !== 'true') {
      dataFilter(data)
    }

    $("#micboard").text("");
    var tx = transmitters;
    for(let i in tx) {
      var t = document.getElementById("column-template").content.cloneNode(true);
      t.querySelector('div.col-sm').id = 'slot-' + tx[i].slot;
      updateStatus(t,tx[i]);
      updateName(t,tx[i]);
      updateTXOffset(t,tx[i]);
      updateBattery(t,tx[i]);
      updateFrequency(t,tx[i]);
      updateIP(t,tx[i]);
      charts[tx[i].slot] = initChart(t);
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
