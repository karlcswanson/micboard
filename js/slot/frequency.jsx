import React from 'react';
// import '../../css/slot/frequency.scss';

function frequency(input) {
  if (input === '000000') {
    return ''
  }
  return `${input} Hz`
}

class Frequency extends React.Component {

  render() {
    return (
      <p className='frequency'>{ frequency(this.props.data.frequency) }</p>
    )
  }
}

export { Frequency }
