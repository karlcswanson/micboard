"use strict";
import Chart from 'chart.js'
import moment from 'moment'
import streamingPlugin from 'chartjs-plugin-streaming'

import { transmitters } from './script.js'

export var charts = {};

var color = Chart.helpers.color;

var chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};



export function updateAudioChart(data) {
	// console.log(charts[1])
  charts[data.slot].audioChart.data.datasets[0].data.push({
		x: Date.now(),
		y: data.audio_level
	})
	charts[data.slot].audioChart.update({
		preservation: true
	})
  transmitters[data.slot].audio_level = data.audio_level;
}

export function updateRfChart(data) {
  // charts[data.slot].rfSeries.append(Date.now(), data.rf_level);
  transmitters[data.slot].rf_level = data.rf_level;
}

export function initChart(slotSelector) {
  let chart = {};


  let audioCanvas = slotSelector.querySelector('canvas.audio-graph').getContext('2d');
  let rfCanvas = slotSelector.querySelector('canvas.rf-graph').getContext('2d');

  const rfOptions = {};

  let audioOptions = {
    type: 'line',
    data: {
      datasets: [
        {
          backgroundColor: color(chartColors.red).alpha(0.5).rgbString(),
          borderColor: chartColors.red,
          fill: false,
          lineTension: 0,
          data: []
        }
      ]
    },
    options: {
			maintainAspectRatio: false,
			responsive: false,
      title: {
        display: false,
        text: 'Line chart (hotizontal scroll) sample'
      },
      scales: {
        xAxes: [
          {
						display: false,
            type: 'realtime',
            realtime: {
              duration: 7150,
              delay: 200,
							pause: false,
							ttl: undefined
            }
          }
        ]
      },
      tooltips: {
        enabled: false
      },
      hover: {
        mode: 'nearest',
        intersect: false
      },
			plugins: {
				streaming: {
					frameRate : 20
				}
			}
    }
  };

  chart.audioChart = new Chart(audioCanvas, audioOptions);
  // chart.rfChart = new Chart(rfCanvas, rfOptions);

  return chart;
}
