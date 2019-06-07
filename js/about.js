"use strict";

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import '../css/colors.scss';
import '../css/about.scss';
import '../node_modules/@ibm/plex/css/ibm-plex.css';


$(document).ready(() => {
  document.getElementById('version').innerHTML = 'Micboard ' + VERSION;
});
