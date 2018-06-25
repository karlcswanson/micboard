var prefix = "HH"
var dataURL = '/data';
var transmitters = {};
var charts = {};

$(document).ready(function() {
  start_slot = getUrlParameter('start_slot');
  stop_slot = getUrlParameter('stop_slot');
  demo = getUrlParameter('demo');
  if (demo == 'true') {
    dataURL = 'static/data.json';
    initialMap();
    autoRandom();
  }
  else {
    initialMap();
    setInterval(JsonUpdate, 500);
    // wsConnect();
  }


  document.addEventListener("keydown", function(e) {
    if (e.keyCode == 70) {
      toggleFullScreen();
    }
  }, false);
});


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
    mic_data = JSON.parse(msg.data);
    updateSlot(mic_data);

  }
}

// https://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js
var getUrlParameter = function getUrlParameter(sParam) {
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
    for(i in data.receivers) {
      for (j in data.receivers[i].tx) {
        updateSlot(data.receivers[i].tx[j]);
      }
    }
  });
}


function updateSlot(data) {
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

  if (transmitters[data.slot].battery != data.battery) {
    updateBattery(slotSelector, data);
    transmitters[data.slot].battery = data.battery;
  }

  if (transmitters[data.slot].antenna != data.antenna) {
    updateDiversity(slotSelector, data);
    transmitters[data.slot].antenna = data.antenna;
  }

  if (transmitters[data.slot].audio_level != data.audio_level) {
    updateAudioChart(data);
    transmitters[data.slot].audio_level = data.audio_level;
  }

  if (transmitters[data.slot].rf_level != data.rf_level) {
    updateRfChart(data);
    transmitters[data.slot].rf_level = data.rf_level;
  }
}

function updateAudioChart(data) {
  charts[data.slot].audioSeries.append(Date.now(), data.audio_level);
}

function updateRfChart (data) {
  charts[data.slot].rfSeries.append(Date.now(), data.rf_level);
}

function updateName(slotSelector, data) {
  slotSelector.querySelector('div.mic_name').className = 'mic_name';
  slotSelector.querySelector('div.mic_name').classList.add(data.status);
  slotSelector.querySelector('p.name').innerHTML = data.name;
  slotSelector.querySelector('p.mic_id').innerHTML = prefix + ("0" + data.slot).slice(-2);
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
  var slot = "slot-" + data.slot;
  // var t = document.getElementById(slot);
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

var diversityTable = {
  'AX': ['diversity-bar-on','diversity-bar-off'],
  'XB': ['diversity-bar-off','diversity-bar-on'],
  'XX': ['diversity-bar-off','diversity-bar-off']
}

function updateDiversity(slotSelector, data){
  var outputBars = diversityTable[data.antenna];

  slotSelector.querySelectorAll('.diversity-bar').forEach(function (data) {
    data.classList.remove('diversity-bar-on','diversity-bar-off');
  });

  slotSelector.querySelector('.diversity-bar-1').classList.add(outputBars[0]);
  slotSelector.querySelector('.diversity-bar-2').classList.add(outputBars[1]);
}

function dataFilter(data){
  for(i in data.receivers){
    for (j in data.receivers[i].tx){
      var tx = data.receivers[i].tx[j];
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
    dataFilter(data);
    $(".above-mid").text("");
    var tx = transmitters;
    for(i in tx) {
      var t = document.getElementById("column-template").content.cloneNode(true);
      t.querySelector('div.col-sm').id = 'slot-' + tx[i].slot;
      t.querySelector('div.mic_name').classList.add(tx[i].status);
      t.querySelector('p.mic_id').innerHTML = prefix + ("0" + tx[i].slot).slice(-2);
      t.querySelector('p.name').innerHTML = tx[i].name;
      document.getElementById('micboard').appendChild(t);
      charts[tx[i].slot] = initChart('slot-' + tx[i].slot);
    }
  });
}

function initChart(chartID) {
  var chart = {};
  chart.audioSeries = new TimeSeries();
  chart.rfSeries = new TimeSeries();

  var audioCanvas = document.getElementById(chartID).querySelector('canvas.audio-graph');
  var rfCanvas = document.getElementById(chartID).querySelector('canvas.rf-graph');

  var chartOptions = {
    responsive:true,
    // interpolation:'step',
    millisPerPixel: 25,
    grid: {
      verticalSections:0,
      strokeStyle:'#000000'
    },
    labels:{
      disabled:true
    },
    maxValue:115,
    minValue:0
  };
  var audioChart = new SmoothieChart(chartOptions);
  var rfChart = new SmoothieChart(chartOptions);

  audioChart.addTimeSeries(chart.audioSeries, {
    strokeStyle: 'rgba(0, 255, 0, 1)',
    fillStyle: 'rgba(0, 255, 0, 0.2)',
    lineWidth: 2
  });

  rfChart.addTimeSeries(chart.rfSeries, {
    strokeStyle: 'rgba(255, 0, 0, 1)',
    fillStyle: 'rgba(255, 0, 0, 0.2)',
    lineWidth: 2
  });

  audioChart.streamTo(audioCanvas, 100);
  rfChart.streamTo(rfCanvas, 100);
  return chart;
}
