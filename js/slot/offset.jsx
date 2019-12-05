import React from 'react';

function offsetCheck(offset) {
  if (offset !== 255) {
    return `${offset} dB`
  }
  return ''
}

class Offset extends React.Component {
  render() {
    return (
      <p>{ offsetCheck(this.props.data.tx_offset) }</p>
    )
  }
}

export { Offset }
