import React from 'react';

function frequency(input) {
  if (input === '000000') {
    return ''
  }
  return `${input} Hz`
}

class Frequency extends React.Component {

  render() {
    return (
      <p>{ frequency(this.props.data.frequency) }</p>
    )
  }
}

export { Frequency }
