import { micboard } from './app.js';


function deviceCount() {
  const devices = {
    uhfr: 0,
    qlxd: 0,
    ulxd: 0,
    axtd: 0,
    p10t: 0,
  };

  const tx = micboard.config.slots;

  tx.forEach((t) => {
    switch (t.type) {
      case 'uhfr': devices.uhfr += 1;
        break;
      case 'qlxd': devices.qlxd += 1;
        break;
      case 'ulxd': devices.ulxd += 1;
        break;
      case 'axtd': devices.axtd += 1;
        break;
      case 'p10t': devices.p10t += 1;
        break;
      default:
        break;
    }
  });

  return devices;
}


export function analytics_init() {
  let uuid = micboard.config.uuid;
  console.log('Micboard UUID: ' + uuid);
  window.gtag('set', {
    'client_id': uuid,
  });

  let devices = deviceCount();
  window.gtag('config', 'UA-141042301-1', {
    'custom_map': {
      'metric1': 'uhfr',
      'metric2': 'qlxd',
      'metric3': 'ulxd',
      'metric4': 'axtd',
      'metric5': 'p10t',
    },
    'app_name': 'micboard'
  });

  // Sends an event that passes 'avg_page_load_time' as a parameter.
  window.gtag('event', 'device_count', {
    'uhfr': devices.uhfr,
    'qlxd': devices.qlxd,
    'ulxd': devices.ulxd,
    'atxd': devices.axtd,
    'p10t': devices.p10t,
  });

  window.gtag('event', 'screen_view', { 'app_version': micboard.config.micboard_version });
}
