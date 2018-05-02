var prefix = "HH"
$(document).ready(function() {
  setInterval(loadJson, 500);
});

function loadJson(){
  transmitters = [];
  $.getJSON( "/data.json", function( data ) {
      for(i in data.receivers){
          for (j in data.receivers[i].tx){
            transmitters.push(data.receivers[i].tx[j]);
          }
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
