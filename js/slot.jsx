import React from 'react';
import ReactDOM from 'react-dom';

import { Chart } from './slot/chart.jsx';

import { Quality } from './slot/quality.jsx';
import { Frequency } from './slot/frequency.jsx';
import { Offset } from './slot/offset.jsx';
import { BatteryBars } from './slot/batterybars.jsx';
import { Diversity } from './slot/diversity.jsx';


const divStyle = {
  background: '#262626'
}


class Slot extends React.Component {
  render() {
    return (
      <div style={divStyle} >
        <Chart data={this.props.data} />
        <BatteryBars data={ this.props.data } />
        <p>runtime: { this.props.data.runtime }</p>
        <Diversity data={ this.props.data } />
        <Frequency data={ this.props.data } />
        <p>id: { this.props.data.id}</p>
        <p>name: { this.props.data.name}</p>
        <p>status: { this.props.data.status}</p>
        <p>type: { this.props.data.type}</p>
        <Offset data={ this.props.data } />
        <Quality data={ this.props.data } />
      </div>
    )
  }
}

export { Slot }
