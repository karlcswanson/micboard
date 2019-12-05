import React from 'react';
import ReactDOM from 'react-dom';

import { Chart } from './slot/chart.jsx';

import { Quality } from './slot/quality.jsx';
import { Frequency } from './slot/frequency.jsx';
import { Offset } from './slot/offset.jsx';

class Slot extends React.Component {
  render() {
    return (
      <div>
        <h1>THis is a slot</h1>
        <Chart data={this.props.data} />
        {/* <p>RF Level: { this.props.data.rf_level }</p>*/}
        <p>Batterys Level: { this.props.data.battery }</p>
        <p>runtime: { this.props.data.runtime }</p>
        <p>antenna: { this.props.data.antenna }</p>
        <Frequency data={ this.props.data} />
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
