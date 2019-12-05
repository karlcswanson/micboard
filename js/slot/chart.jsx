import React from 'react';

import { TimeSeries, SmoothieChart } from 'smoothie';

const IEM_MODELS = ['p10t'];
const MIC_MODELS = ['uhfr', 'qlxd', 'ulxd', 'axtd'];
const chartTimeSrc = 'SERVER';
const chartOptions = {
  // responsive: true,
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
  limitFPS: 0,
}


// prefer server time, but drop back to local time if out of sync
// this is for embedded devices that may not always have an accurate clock
function setTimeMode(servertimeString) {
  const servertime = Date.parse(servertimeString);
  const localtime = new Date().getTime();

  const delta = Math.abs(localtime - servertime);

  if (delta > (30 * 1000)) {
    console.log(`Using local time. time delta: ${delta} ms`);
    micboard.chartTimeSrc = 'LOCAL';
  } else {
    console.log(`Using server time. time delta: ${delta} ms`);
    micboard.chartTimeSrc = 'SERVER';
  }
}


class Chart extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      timestamp: 0.0
    }
    this.initChart = this.initChart.bind(this);
    this.updateChart = this.updateChart.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.data.timestamp !== prevState.timestamp) {
        return { timestamp: nextProps.data.timestamp }
    }
    else return null;
  }

  componentDidUpdate(prevProps, PrevState) {
    this.updateChart(this.props.data)
  }

  initChart(data) {
    const chart = {};

    chart.slotChart = new SmoothieChart(chartOptions);

    if (MIC_MODELS.indexOf(data.type) > -1) {
      chart.audioSeries = new TimeSeries();
      chart.rfSeries = new TimeSeries();
      chart.slotChart.addTimeSeries(chart.audioSeries, {
        strokeStyle: '#69B578',
        fillStyle: '',
        lineWidth: 2,
      });

      chart.slotChart.addTimeSeries(chart.rfSeries, {
        strokeStyle: '#DC493A',
        fillStyle: '',
        lineWidth: 2,
      });
    } else if (IEM_MODELS.indexOf(data.type) > -1) {
      chart.audioLSeries = new TimeSeries();
      chart.audioRSeries = new TimeSeries();
      chart.slotChart.addTimeSeries(chart.audioLSeries, {
        strokeStyle: '#69B578',
        fillStyle: '',
        lineWidth: 2,
      });

      chart.slotChart.addTimeSeries(chart.audioRSeries, {
        strokeStyle: '#69B578',
        fillStyle: '',
        lineWidth: 2,
      });
    }


    chart.slotChart.streamTo(this.chartElement, 100);
    return chart;
  }

  updateChart(data) {
    let timestamp;

    if (chartTimeSrc === 'SERVER') {
      timestamp = new Date(data.timestamp * 1000);
    } else {
      timestamp = new Date().getTime();
    }

    if (MIC_MODELS.indexOf(data.type) > -1) {
      this.chart.audioSeries.append(timestamp, data.audio_level + 100);
      this.chart.rfSeries.append(timestamp, data.rf_level);
    } else if (IEM_MODELS.indexOf(data.type) > -1) {
      this.chart.audioLSeries.append(timestamp, data.audio_level_l + 100);
      this.chart.audioRSeries.append(timestamp, data.audio_level_r);
    }
  }


  componentDidMount() {
    this.chart = this.initChart(this.props.data)
  }

  componentWillUnmount() {
    this.chart.slotChart.stop();
  }

  render() {
    // console.log(this.props)
    return (
      <canvas width={400} height={200} ref={ x => this.chartElement = x } />
    )
  }
}

export { Chart }
