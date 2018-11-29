"use strict";

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import QRCode from 'qrcode'
import 'whatwg-fetch'
import { Sortable, Plugins } from '@shopify/draggable';


import { updateGIFBackgrounds, uploadMode } from './gif.js'
import { autoRandom, seedTransmitters } from './demodata.js'
import { settingsView } from './settings.js'
import { renderGroup, renderDisplayList, updateSlot } from './channelview.js'
import { initLiveData } from './data.js'



import '../css/style.css'
import '../node_modules/@ibm/plex/css/ibm-plex.css'


export var dataURL = '/data';

export var transmitters = [];

export var mp4_list = {};
export var discovered = []

export var config = {};



var localURL = ''

export var micboard = []

micboard.url = []
micboard.url.start_slot = parseInt(getUrlParameter('start_slot'))
micboard.url.stop_slot = parseInt(getUrlParameter('stop_slot'))
micboard.url.group = getUrlParameter('group')
micboard.url.demo = getUrlParameter('demo')
micboard.url.settings = getUrlParameter('settings')


micboard.displayList = []

$(document).ready(function() {
  if(micboard.url.demo && (isNaN(micboard.url.start_slot) || isNaN(micboard.url.stop_slot))) {
    micboard.url.start_slot = 1
    micboard.url.stop_slot = 12
  }

  if (!window.location['href'].includes(':8058')) {
    dataURL = 'data.json'
    micboard.url.demo = 'true'
    micboard.url.start_slot = 1
    micboard.url.stop_slot = 12
  }

  if (micboard.url.demo == 'true') {
    initialMap(autoRandom)
  }

  // else if(settings) {
  //   fetch(dataURL)
  //   .then(function(response) {
  //     return response.json();
  //   })
  //   .then(function(data) {
  //     let config = data['config']
  //     mapGroups(data)
  //     settingsView(config)
  //   });
  // }

  else {
    initialMap(initLiveData)
  }


  document.addEventListener("keydown", function(e) {
    if ( $('.settings').is(":visible")) {
      return
    }
    if (e.keyCode == 49) {
      DeactivateMessageBoard()
      renderGroup(1)
    }
    if (e.keyCode == 50) {
      DeactivateMessageBoard()
      renderGroup(2)
    }
    if (e.keyCode == 51) {
      DeactivateMessageBoard()
      renderGroup(3)
    }
    if (e.keyCode == 52) {
      DeactivateMessageBoard()
      renderGroup(4)
    }
    if (e.keyCode == 53) {
      DeactivateMessageBoard()
      renderGroup(5)
    }
    if (e.keyCode == 54) {
      DeactivateMessageBoard()
      renderGroup(6)
    }
    if (e.keyCode == 55) {
      DeactivateMessageBoard()
      renderGroup(7)
    }
    if (e.keyCode == 56) {
      DeactivateMessageBoard()
      renderGroup(8)
    }
    if (e.keyCode == 57) {
      DeactivateMessageBoard()
      renderGroup(9)
    }

    if (e.keyCode == 68) {
      if (micboard.url.group) {
        window.location.href = micboard.url.demo ? '/?group=' + micboard.url.group : '/?demo=true&group=' + group
      }
      else {
        window.location.href = micboard.url.demo ? '/' : '/?demo=true'
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
      DeactivateMessageBoard()
      settingsView(config)
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


export function ActivateMessageBoard(h1, p) {
  if (!h1) {
    h1 = 'Connection Error!'
    p = 'Could not connect to the micboard server. Please refresh the page.'
  }

  $('#micboard').hide()
  $('.settings').hide()
  var eb = document.getElementsByClassName('message-board')[0]
  eb.querySelector('h1').innerHTML = h1
  eb.querySelector('p').innerHTML = p

  $('.message-board').show();
}

export function DeactivateMessageBoard() {
  $('#micboard').show()
  $('.settings').hide()
  $('.message-board').hide();
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
      transmitters[tx.slot] = tx;
    }
  }
}



function displayListChooser(data) {
  if (!isNaN(micboard.url.group)) {
    let plist = []
    for (var p in data['config']['groups']) {
      plist[data['config']['groups'][p]['group']] = data['config']['groups'][p]['slots']
    }
    let out = plist[micboard.url.group]
    if (out) {
      return out
    }
    else {
      const h1 = 'Invalid Group'
      const p = 'Setup groups in <a href="/?settings">settings</a>'
      ActivateMessageBoard(h1,p)
      return []
    }
  }
  else if (!isNaN(micboard.url.start_slot) && !isNaN(micboard.url.stop_slot)) {
    if (micboard.url.start_slot < micboard.url.stop_slot) {
      return StartStopSlotList(micboard.url.start_slot,micboard.url.stop_slot)
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

function initialMap(callback) {
  fetch(dataURL)
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    discovered = data['discovered']
    mp4_list = data['mp4']
    localURL = data['url']
    config = data['config']
    micboard.displayList = displayListChooser(data)

    mapGroups(data)

    if (micboard.url.settings) {
      settingsView(config)
    }

    if (micboard.url.demo !== 'true') {
      dataFilterFromList(data)
    }

    if (micboard.url.demo) {
      seedTransmitters(micboard.displayList)
    }

    if (micboard.displayList.length > 0) {
      renderDisplayList(micboard.displayList);
      if (callback) {
        callback()
      }
    }
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
    // str += '<p class="text-muted"><a class="nav-link" href="/?group=' + p + '">' + plist[p] + '</a></p>'
    str += '<p class="text-muted"><a class="nav-link preset-link" id="go-group-'+ p +'" href="#">' + plist[p] + '</a></p>'

  }
  div.innerHTML += str
  $('a#go-settings').click(function(){
    settingsView(config)
  })

  setTimeout(function(){
    $('a.preset-link').each(function(index){
      let id = parseInt($(this).attr('id')[9])

      $(this).click(function(){
        DeactivateMessageBoard()
        renderGroup(id)
        $('.collapse').collapse("hide")
      })
    })
  },25)

}

export function setdisplayList(list) {
  micboard.displayList = list
}

export function GridLayout() {
  const containerSelector = '#micboard';
  const containers = document.querySelectorAll(containerSelector);

  if (containers.length === 0) {
    return false;
  }

  const swappable = new Sortable(containers, {
    draggable: '.col-sm',
    mirror: {
      appendTo: containerSelector,
      constrainDimensions: true,
    },
    plugins: [Plugins.ResizeMirror],
  });

  return swappable;
}
