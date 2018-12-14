'use strict';

import 'whatwg-fetch';
import { dataURL, ActivateMessageBoard, micboard } from './script.js';
import { renderGroup, updateSlot } from './channelview.js';
import { updateChart } from './chart-smoothie.js';

function wsConnect() {
  let loc = window.location;
  let new_uri;

  if (loc.protocol === 'https:') {
    new_uri = 'wss:';
  } else {
    new_uri = 'ws:';
  }

  new_uri += '//' + loc.host;
  new_uri += '/ws';
  micboard.socket = new WebSocket(new_uri);

  micboard.socket.onmessage = function (msg) {
    const chart_data = JSON.parse(msg.data)['chart-update'];
    const mic_data = JSON.parse(msg.data)['data-update'];
    const group_update = JSON.parse(msg.data)['group-update'];

    // for (var i in chart_data) {
    //   updateChart(chart_data[i]);
    // }

    chart_data.forEach((data) => {
      updateChart(data);
    });

    for (var i in mic_data) {
      updateSlot(mic_data[i]);
    }

    for (var i in group_update) {
      updateGroup(group_update[i]);
    }
  };

  micboard.socket.onclose = function(event) {
    ActivateMessageBoard();
  };

  micboard.socket.onerror = function(event) {
    ActivateMessageBoard();
  };
}


function JsonUpdate() {
  fetch(dataURL)
    .then(response => response.json())
    .then((data) => {
      for (let i in data.receivers) {
        for (var j in data.receivers[i].tx) {
          updateSlot(data.receivers[i].tx[j]);
        }
      }
    });
}


function updateGroup(data) {
  console.log('dgroup: ' + data.group + ' mgroup: ' + micboard.group);
  micboard.groups[data.group].title = data.title;
  micboard.groups[data.group].slots = data.slots;
  if (micboard.group === data.group) {
    renderGroup(data.group);
  }
}

export function initLiveData() {
  setInterval(JsonUpdate, 1000);
  wsConnect();
}
