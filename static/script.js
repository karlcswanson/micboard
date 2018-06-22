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
  }
  else {
    initialMap();
    setInterval(JsonUpdate, 500);
    // wsConnect();
  }

});


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

function updateSlot(data){
  if (start_slot && stop_slot){
    if (start_slot <= data.slot && data.slot <= stop_slot) {
      transmitters[data.slot] = data;
    }
  }
  else {
    transmitters[data.slot] = data;
  }

  var slot = "slot-" + data.slot;
  var t = document.getElementById(slot);
  t.querySelector('div.mic_name').className = 'mic_name';
  t.querySelector('div.mic_name').classList.add(data.status);
  t.querySelector('p.name').innerHTML = data.name;
  t.querySelector('p.mic_id').innerHTML = prefix + ("0" + data.slot).slice(-2);
  updateBattery(data);
  updateDiversity(data);
  charts[data.slot].audioSeries.append(Date.now(), data.audio_level);
  charts[data.slot].rfSeries.append(Date.now(), data.rf_level);
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

function updateBattery(data){
  var slot = "slot-" + data.slot;
  var t = document.getElementById(slot);
  var outputBars = BatteryTable[data.battery];

  t.querySelectorAll('.battery-bar').forEach(function (data) {
    data.classList.remove('batt_led_off', 'batt_led_danger','batt_led_warning','batt_led_good');
  });

  t.querySelector('.battery-bar-1').classList.add(outputBars[0]);
  t.querySelector('.battery-bar-2').classList.add(outputBars[1]);
  t.querySelector('.battery-bar-3').classList.add(outputBars[2]);
  t.querySelector('.battery-bar-4').classList.add(outputBars[3]);
  t.querySelector('.battery-bar-5').classList.add(outputBars[4]);

}

var diversityTable = {
  'AX': ['diversity-bar-on','diversity-bar-off'],
  'XB': ['diversity-bar-off','diversity-bar-on'],
  'XX': ['diversity-bar-off','diversity-bar-off']
}

function updateDiversity(data){
  var slot = "slot-" + data.slot;
  var t = document.getElementById(slot);
  var outputBars = diversityTable[data.antenna];

  t.querySelectorAll('.diversity-bar').forEach(function (data) {
    data.classList.remove('diversity-bar-on','diversity-bar-off');
  });

  t.querySelector('.diversity-bar-1').classList.add(outputBars[0]);
  t.querySelector('.diversity-bar-2').classList.add(outputBars[1]);
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
    lineWidth: 4
  });

  rfChart.addTimeSeries(chart.rfSeries, {
    strokeStyle: 'rgba(255, 0, 0, 1)',
    fillStyle: 'rgba(255, 0, 0, 0.2)',
    lineWidth: 4
  });

  audioChart.streamTo(audioCanvas, 100);
  rfChart.streamTo(rfCanvas, 100);
  return chart;
}
