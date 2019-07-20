'use strict';

const builder = require("electron-builder");
const Platform = builder.Platform

// Promise is returned
builder.build({
  targets: Platform.MAC.createTarget(),
  config: {
    appId: 'com.micboard.app',
    productName: 'Micboard Server',
    asar: true,
    asarUnpack: [
      'dist/micboard-service',
      'build/trayTemplate.png',
      'build/trayTemplate@2x.png',
    ],
    mac: {
      identity: null,
      category: 'public.app-category.utilities',
      extendInfo: {
        LSBackgroundOnly: 1,
        LSUIElement: 1,
      },
    },
    files: [
      'dist/micboard-service',
      'main.js',
      'build/trayTemplate.png',
      'build/trayTemplate@2x.png',
    ],
  },
})
  .then(() => {
    // handle result
  })
  .catch((error) => {
    // handle error
  })
