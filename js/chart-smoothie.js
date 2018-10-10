"use strict";
import { TimeSeries, SmoothieChart } from 'smoothie'

export var charts = {};

export function initChart(slotSelector) {
  let chart = {};
  chart.audioSeries = new TimeSeries();
  chart.rfSeries = new TimeSeries();

  let audioCanvas = slotSelector.querySelector('canvas.audio-graph');
  let rfCanvas = slotSelector.querySelector('canvas.rf-graph');

  const rfOptions = {
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
    maxValue:115,
    minValue:0,
    // scaleSmoothing:.7,
    limitFPS:20
  };

  const audioOptions = {
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
    maxValue:50,
    minValue:0,
    // scaleSmoothing:.7,
    limitFPS:20
  };

  let audioChart = new SmoothieChart(audioOptions);
  let rfChart = new SmoothieChart(rfOptions);

  audioChart.addTimeSeries(chart.audioSeries, {
    strokeStyle: '#69B578',
    fillStyle: '',
    lineWidth: 2
  });

  rfChart.addTimeSeries(chart.rfSeries, {
    strokeStyle: '#DC493A',
    fillStyle: '',
    lineWidth: 2
  });

  audioChart.streamTo(audioCanvas, 100);
  rfChart.streamTo(rfCanvas, 100);
  return chart;
}
