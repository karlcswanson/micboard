import React from 'react';

import { TimeSeries, SmoothieChart } from 'smoothie';


const chartOptions = {
  responsive: true,
  millisPerPixel: 25,
  grid: {
    verticalSections: 0,
    strokeStyle: 'transparent',
    fillStyle: 'transparent',
  },
  labels: {
    disabled: true,
  },
  maxValue: 200,
  minValue: 0,
  // scaleSmoothing:.7,
  limitFPS: 0,
}

class Chart extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  static getDerivedStateFromProps(props, state) {
    // console.log('update:' + props.chart_data)
    return null
  }

  render() {
    // console.log(this.props)
    return (
      <div>
        <p>RF Level: { this.props.data.rf_level}</p>

      </div>
    )
  }
}

export { Chart }
