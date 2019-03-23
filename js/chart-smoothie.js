'use strict';

import { TimeSeries, SmoothieChart } from 'smoothie';
import { micboard } from './script.js';

const MIC_MODELS = ['uhfr', 'qlxd', 'ulxd', 'atxd'];
const IEM_MODELS = ['p10t'];
export const charts = {};

export function updateChart(data) {
  if (micboard.displayList.includes(data.slot)) {
    const timestamp = new Date(data.timestamp * 1000);
    if (MIC_MODELS.indexOf(data.type) > -1) {
      charts[data.slot].audioSeries.append(timestamp, data.audio_level + 100);
      charts[data.slot].rfSeries.append(timestamp, data.rf_level);

      micboard.transmitters[data.slot].audio_level = data.audio_level;
      micboard.transmitters[data.slot].rf_level = data.rf_level;
    } else if (IEM_MODELS.indexOf(data.type) > -1) {
      charts[data.slot].audioLSeries.append(timestamp, data.audio_level_l + 100);
      charts[data.slot].audioRSeries.append(timestamp, data.audio_level_r);

      micboard.transmitters[data.slot].audio_level_l = data.audio_level_l;
      micboard.transmitters[data.slot].audio_level_r = data.audio_level_r;
    }
  }
}


export function initChart(slotSelector, data) {
  const chart = {};

  const slotCanvas = slotSelector.querySelector('canvas.slotgraph');

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


  chart.slotChart.streamTo(slotCanvas, 100);
  return chart;
}
