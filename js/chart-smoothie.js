"use strict";
import { TimeSeries, SmoothieChart } from 'smoothie'
import { transmitters } from './script.js'

export var charts = {};

export function updateChart(data) {
  let timestamp = new Date(data.timestamp * 1000)

  charts[data.slot].audioSeries.append(timestamp, data.audio_level * 2 + 100);
  charts[data.slot].rfSeries.append(timestamp, data.rf_level * (100/115));

  transmitters[data.slot].audio_level = data.audio_level;
  transmitters[data.slot].rf_level = data.rf_level;
}

export function initChart(slotSelector) {
  let chart = {};
  chart.audioSeries = new TimeSeries();
  chart.rfSeries = new TimeSeries();

  let slotCanvas = slotSelector.querySelector('canvas.slotgraph');

  const chartOptions = {
    responsive:true,
    millisPerPixel: 25,
    grid: {
      verticalSections:0,
      strokeStyle:'transparent',
      fillStyle:'transparent'
    },
    labels:{
      disabled:true
    },
    maxValue:200,
    minValue:0,
    // scaleSmoothing:.7,
    limitFPS:0
  };

  let slotChart = new SmoothieChart(chartOptions);

  slotChart.addTimeSeries(chart.audioSeries, {
    strokeStyle: '#69B578',
    fillStyle: '',
    lineWidth: 2
  });

  slotChart.addTimeSeries(chart.rfSeries, {
    strokeStyle: '#DC493A',
    fillStyle: '',
    lineWidth: 2
  });

  slotChart.streamTo(slotCanvas, 100);
  return chart;
}
