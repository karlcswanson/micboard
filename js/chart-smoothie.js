'use strict';

import { TimeSeries, SmoothieChart } from 'smoothie'
import { micboard } from './script.js'

export let charts = {};

export function updateChart(data) {
  if (micboard.displayList.includes(data.slot)) {
    const timestamp = new Date(data.timestamp * 1000);

    charts[data.slot].audioSeries.append(timestamp, data.audio_level + 100);
    charts[data.slot].rfSeries.append(timestamp, data.rf_level);

    micboard.transmitters[data.slot].audio_level = data.audio_level;
    micboard.transmitters[data.slot].rf_level = data.rf_level;
  }
}

export function initChart(slotSelector) {
  const chart = {};
  chart.audioSeries = new TimeSeries();
  chart.rfSeries = new TimeSeries();

  const slotCanvas = slotSelector.querySelector('canvas.slotgraph');
  console.log(slotCanvas)
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
  };

  chart.slotChart = new SmoothieChart(chartOptions);

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

  chart.slotChart.streamTo(slotCanvas, 100);
  return chart;
}
