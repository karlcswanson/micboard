"use strict";

import '../css/new.scss';
import '../css/colors.scss';

import React from 'react';
import ReactDOM from 'react-dom';

import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';

import { Micboard } from './micboard.jsx';

const App = () => (
  <React.Fragment>
    <CssBaseline />
    <Container maxWidth="sm">
    <div>
      <h1>Hello!</h1>
      <Micboard />
    </div>
    </Container>
  </React.Fragment>


)

ReactDOM.render(<App/>, document.getElementById('root'));
