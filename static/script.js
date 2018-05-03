var prefix = "HH"
var dataURL = '/data';

$(document).ready(function() {
  start_slot = getUrlParameter('start_slot');
  stop_slot = getUrlParameter('stop_slot');
  demo = getUrlParameter('demo');
  console.log('Start: ' + start_slot);
  console.log('Stop:  ' + stop_slot);
  if (demo == 'true') {
    dataURL = '/static/data.json';
    loadJson();
  }
  else {
    setInterval(loadJson, 500);
  }
});

// https://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};


function loadJson(){
  transmitters = [];

  $.getJSON( dataURL, function( data ) {
      for(i in data.receivers){
          for (j in data.receivers[i].tx){
            transmitters.push(data.receivers[i].tx[j]);
          }
      }
      if (start_slot && stop_slot){
        transmitters = transmitters.slice(start_slot-1,stop_slot);
      }
      transmitters.sort(function(a, b){return a.slot - b.slot});
      initialMap();
  });
}

function initialMap(){
  $(".above-mid").text("");
  for(i in transmitters){
    var insert = '<div id="slot-' + transmitters[i].slot + '" class="col-sm ' +
                                    transmitters[i].status + '">\n' +
                 '<p class="mic_id">'+ prefix + ("0" + transmitters[i].slot).slice(-2) + '</p>\n' +
                 '<p class="name">' + transmitters[i].name + '</p></div>';

    $(".above-mid").append(insert);
  }
}
