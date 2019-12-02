import React from 'react';

import { Slot } from './slot.jsx'

class Micboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      slots: []
    }
    this.wsInit = this.wsInit.bind(this);
    this.slotUpdate = this.slotUpdate.bind(this);
  }

  slotUpdate(data) {
    const newSlotList = this.state.slots.slice()

    const out = {}
    for (var key in data) {
      out[key] = data[key];
    }

    if (newSlotList[data.slot]) {
      const existingData = newSlotList[data.slot];
      for (var key in existingData) {
        if (!(key in out)) {
          out[key] = existingData[key];
        }
      }
    }


    console.log(out);
    //
    newSlotList[data.slot] = out
    this.setState({ slots: newSlotList })
  }



  wsInit() {
    const loc = window.location;
    let newUri;

    if (loc.protocol === 'https:') {
      newUri = 'wss:';
    } else {
      newUri = 'ws:';
    }

    // newUri += '//' + loc.host + loc.pathname + 'ws';
    newUri += '//' + loc.host + '/' + 'ws';

    let socket = new WebSocket(newUri);

    socket.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      // console.log(data);
      if (data['chart-update']) {
        data['chart-update'].forEach(this.slotUpdate);
      }
      if (data['data-update']) {
        data['data-update'].forEach(this.slotUpdate);
      }
    };

    socket.onclose = () => {
      console.log('socket closed');
    };

    socket.onerror = () => {
      console.log('socket closed');
    };

    return socket;
  }

  functionTest() {
    console.log("fin");

  }

  componentDidMount() {
    // this.wsInit();
    this.socket = this.wsInit();
    // console.log("hello!");
  }


  render() {
    return (
      <div>
        <h1>THis is a slotlist</h1>
        {
          this.state.slots.map((slot) =>
            <Slot key={slot.slot} data={slot} />
          )
        }
      </div>
    )
  }
}

export { Micboard }
