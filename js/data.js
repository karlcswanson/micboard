"use strict"

import { dataURL, ActivateErrorBoard } from "./script.js"
import { updateSlot } from "./channelview.js"

export function initLiveData() {
  setInterval(JsonUpdate, 1000);
  wsConnect();
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
  };

  socket.onclose = function(event){
    ActivateErrorBoard();
  };

  socket.onerror = function(event){
    ActivateErrorBoard();
  };
}


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
