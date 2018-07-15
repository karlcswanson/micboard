var batterySample = {
  0:{
      battery: 255,
      status: ['CRITICAL','UNASSIGNED']
    },
  1:{
      battery: 1,
      status: ['CRITICAL']
    },
  2:{
      battery: 2,
      status: ['CRITICAL']
    },
  3:{
      battery: 3,
      status: ['REPLACE','PREV_REPLACE']
    },
  4:{
      battery: 4,
      status: ['GOOD','PREV_GOOD','UNASSIGNED']
    },
  5:{
      battery: 5,
      status: ['GOOD','PREV_GOOD']
    }
}

var rfSample = ['AX','XB','XX'];


var name_sample = ['Fatai','Marshall','Delwin','Amaris','Tracy TB','Backup',
                   'Steve','Heather','JE','Sharon','Clary','Bob','Del ACU',
                   'Matt','Matt ACU','Matt Sax','Karl','Jordan','Josue',
                   'Hallie','Rebekah','Dan','Stephen','Max','Tom','Nick',''];


// https://gist.github.com/kerimdzhanov/7529623
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomNameGenerator(){
  var len = name_sample.length;
  var index = getRandomInt(0,len-1);
  return name_sample[index];
}

function randomRfSampleGenerator() {
  return rfSample[getRandomInt(0,2)];
}

function randomAudioGenerator(){
  return getRandomInt(0,50);
}

function randomRfGenerator(){
  return getRandomInt(0,115);
}

function randomBatteryGenerator() {
  var batt_index = getRandomInt(0,5);
  var battery = batterySample[batt_index];
  var len = battery.status.length;
  var status_index = getRandomInt(0,len-1);

  var res = {
              battery: battery.battery,
              status: battery.status[status_index]
            }
  return res;
}

function randomDataGenerator(){
  var slots = Object.keys(transmitters).map(Number);
  var min = Math.min.apply(Math, slots);
  var max = Math.max.apply(Math, slots);
  var slot = getRandomInt(min, max);

  var battery = randomBatteryGenerator();



  var res = {
    "name": randomNameGenerator(),
    "antenna": randomRfSampleGenerator(),
    "audio_level": randomAudioGenerator(),
    "rf_level": randomRfGenerator(),
    "slot": slot,
    "battery": battery.battery,
    "status": battery.status
  }
  return res;

}

function randomCharts(){
  var slots = Object.keys(transmitters).map(Number);
  slots.forEach(function(slot){
    charts[slot].audioSeries.append(Date.now(), randomRfGenerator());
    charts[slot].rfSeries.append(Date.now(), randomAudioGenerator());
  })
}

function autoUpdateNames(){
    updateSlot(randomDataGenerator());
}

function autoRandom(){
  setInterval(autoUpdateNames,500);
  setInterval(randomCharts,125);
}
