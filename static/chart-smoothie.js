var charts = {};

function initChart(slotSelector) {
  var chart = {};
  chart.audioSeries = new TimeSeries();
  chart.rfSeries = new TimeSeries();

  var audioCanvas = slotSelector.querySelector('canvas.audio-graph');
  var rfCanvas = slotSelector.querySelector('canvas.rf-graph');

  var rfOptions = {
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

  var audioOptions = {
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

  var audioChart = new SmoothieChart(audioOptions);
  var rfChart = new SmoothieChart(rfOptions);

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
