$(document).ready(function() {



  var loc = window.location, new_uri;
if (loc.protocol === "https:") {
    new_uri = "wss:";
} else {
    new_uri = "ws:";
}
  new_uri += "//" + loc.host;
  new_uri +=  "/ws";
  // Create a time series
  var series1 = new TimeSeries();
  var series2 = new TimeSeries();
  var series3 = new TimeSeries();
  var series4 = new TimeSeries();

  // Find the canvas
  var canvas1 = document.getElementById('chart-1');
  var canvas2 = document.getElementById('chart-2');
  var canvas3 = document.getElementById('chart-3');
  var canvas4 = document.getElementById('chart-4');

  // Create the chart
  var chart1 = new SmoothieChart();
  chart1.addTimeSeries(series1, {
    strokeStyle: 'rgba(255, 0, 0, 1)'
  });
  chart1.streamTo(canvas1, 100);


  var chart2 = new SmoothieChart();
  chart2.addTimeSeries(series2, {
    strokeStyle: 'rgba(0, 255, 0, 1)'
  });
  chart2.streamTo(canvas2, 100);


  var chart3 = new SmoothieChart();
  chart3.addTimeSeries(series3, {
    strokeStyle: 'rgba(255, 0, 0, 1)'
  });
  chart3.streamTo(canvas3, 100);


  var chart4 = new SmoothieChart();
  chart4.addTimeSeries(series4, {
    strokeStyle: 'rgba(0, 255, 0, 1)'
  });
  chart4.streamTo(canvas4, 100);


  var socket = new WebSocket(new_uri);

  socket.onmessage = function(msg){
    mic_data = JSON.parse(msg.data);
	   console.log(mic_data);	//Awesome!
     if (mic_data['slot'] == 1) {
       series1.append(Date.now(), mic_data['rf_level']);
       series2.append(Date.now(), mic_data['audio_level']);
     }
     else if (mic_data['slot'] == 2) {
       series3.append(Date.now(), mic_data['rf_level']);
       series4.append(Date.now(), mic_data['audio_level']);
     }
  }
});
