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

  new_uri += '//' + loc.host + '/ws';

  micboard.socket = new WebSocket(new_uri);

  micboard.socket.onmessage = (msg) => {
    const data = JSON.parse(msg.data);

    if (data['chart-update']) {
      data['chart-update'].forEach(updateChart);
    }
    if (data['data-update']) {
      data['data-update'].forEach(updateSlot);
    }

    if (data['group-update']) {
      data['group-update'].forEach(updateGroup);
    }
  };

  micboard.socket.onclose = () => {
    ActivateMessageBoard();
  };

  micboard.socket.onerror = () => {
    ActivateMessageBoard();
  };
}


function JsonUpdate() {
  fetch(dataURL)
    .then(response => response.json())
    .then((data) => {
      data.receivers.forEach((rx) => {
        rx.tx.forEach(updateSlot);
      });
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
