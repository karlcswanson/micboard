import React from 'react';

const BatteryTable = {
  0: ['batt_led_off', 'batt_led_off', 'batt_led_off', 'batt_led_off', 'batt_led_off'],
  1: ['batt_led_danger', 'batt_led_off', 'batt_led_off', 'batt_led_off', 'batt_led_off'],
  2: ['batt_led_danger', 'batt_led_danger', 'batt_led_off', 'batt_led_off', 'batt_led_off'],
  3: ['batt_led_warning', 'batt_led_warning', 'batt_led_warning', 'batt_led_off', 'batt_led_off'],
  4: ['batt_led_good', 'batt_led_good', 'batt_led_good', 'batt_led_good', 'batt_led_off'],
  5: ['batt_led_good', 'batt_led_good', 'batt_led_good', 'batt_led_good', 'batt_led_good'],
  255: ['batt_led_off', 'batt_led_off', 'batt_led_off', 'batt_led_off', 'batt_led_off'],
  led: [],
};

function batteryclass(battery, divslot) {
  if (battery === undefined){
    battery = 0;
  }
  return [BatteryTable[battery][divslot], 'battery-bar'].join(' ');
}

class BatteryBars extends React.Component {

  render() {
    return (
      <div className={ 'battery-bars' }>
        <div className={ batteryclass(this.props.data.battery, 0) }></div>
        <div className={ batteryclass(this.props.data.battery, 1) }></div>
        <div className={ batteryclass(this.props.data.battery, 2) }></div>
        <div className={ batteryclass(this.props.data.battery, 3) }></div>
        <div className={ batteryclass(this.props.data.battery, 4) }></div>
      </div>
    )
  }
}

export { BatteryBars }
