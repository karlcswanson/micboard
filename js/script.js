"use strict";

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import QRCode from 'qrcode'

import { updateGIFBackgrounds, uploadMode } from './gif.js'
import { randomDataGenerator, autoRandom } from './demodata.js'
import { settingsView } from './settings.js'
import { updateSlot, updateViewOnly } from './channelview.js'
import { initLiveData } from './data.js'

import { initChart, charts } from './chart-smoothie.js'


import '../css/style.css'
import '../node_modules/@ibm/plex/css/ibm-plex.css'

export var dataURL = '/data';
// export var transmitters = {};
export var transmitters = [];

export var gif_list = {};
export var discovered = []

export var config = {};

var localURL = '';
let start_slot = parseInt(getUrlParameter('start_slot'))
let stop_slot = parseInt(getUrlParameter('stop_slot'))
let group = getUrlParameter('group')
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
    initialMap()
    autoRandom()
  }

  else if(settings) {
    fetch(dataURL)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      let config = data['config']
      mapGroups(data)
      settingsView(config)
    });
  }

  else {
    initialMap()
    setTimeout(function() {
      initLiveData()
    },25)

  }


  document.addEventListener("keydown", function(e) {
    if ( $('.settings').is(":visible")) {
      return
    }
    if (e.keyCode == 49) {
      window.location.href = demo ? '/?demo=true&group=1' : '/?group=1'
    }
    if (e.keyCode == 50) {
      window.location.href = demo ? '/?demo=true&group=2' : '/?group=2';
    }
    if (e.keyCode == 51) {
      window.location.href = demo ? '/?demo=true&group=3' : '/?group=3';
    }
    if (e.keyCode == 52) {
      window.location.href = demo ? '/?demo=true&group=4' : '/?group=4';
    }
    if (e.keyCode == 53) {
      window.location.href = demo ? '/?demo=true&group=5' : '/?group=5';
    }
    if (e.keyCode == 54) {
      window.location.href = demo ? '/?demo=true&group=6' : '/?group=6';
    }
    if (e.keyCode == 55) {
      window.location.href = demo ? '/?demo=true&group=7' : '/?group=7';
    }
    if (e.keyCode == 56) {
      window.location.href = demo ? '/?demo=true&group=8' : '/?group=8';
    }
    if (e.keyCode == 57) {
      window.location.href = demo ? '/?demo=true&group=9' : '/?group=9';
    }

    if (e.keyCode == 68) {
      if (group) {
        window.location.href = demo ? '/?group=' + group : '/?demo=true&group=' + group
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
      window.location.href = '/?settings'
    }

    if (e.keyCode == 85) {
      if(!document.getElementById("micboard").classList.contains("uploadmode")) {
        uploadMode();
      }
    }
  }, false);

});

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


export function ActivateErrorBoard(){
  $('#micboard').hide()
  $('.settings').hide()
  $('.server-error').show();
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
  if (!isNaN(group)) {
    let plist = []
    for (var p in data['config']['groups']) {
      plist[data['config']['groups'][p]['group']] = data['config']['groups'][p]['slots']
    }

    return plist[group]
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
    discovered = data['discovered']
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
      let t
      if (j != 0) {
        t = document.getElementById("column-template").content.cloneNode(true);
        t.querySelector('div.col-sm').id = 'slot-' + tx[j].slot;
        updateViewOnly(t,tx[j])
        charts[tx[j].slot] = initChart(t);
      }
      else {
        t = document.createElement('div')
        t.className = "col-sm"
      }

      document.getElementById('micboard').appendChild(t);
    }
    infoToggle();
    mapGroups(data)
    flexFix();
  });
}

function mapGroups(data) {
  let plist = []
  let div = document.getElementById('grouplist')
  let str = ''
  for (var p in data['config']['groups']) {
    plist[data['config']['groups'][p]['group']] = data['config']['groups'][p]['title']
  }
  for(var p in plist) {
    str += '<p class="text-muted"><a class="nav-link" href="/?group=' + p + '">' + plist[p] + '</a></p>'
  }
  div.innerHTML += str
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
