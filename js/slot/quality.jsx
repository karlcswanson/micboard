import React from 'react';


const QualityTable = {
  0: '&#9675;&#9675;&#9675;&#9675;&#9675;',
  1: '&#9679;&#9675;&#9675;&#9675;&#9675;',
  2: '&#9679;&#9679;&#9675;&#9675;&#9675;',
  3: '&#9679;&#9679;&#9679;&#9675;&#9675;',
  4: '&#9679;&#9679;&#9679;&#9679;&#9675;',
  5: '&#9679;&#9679;&#9679;&#9679;&#9679;',
  255: '',
};

class Quality extends React.Component {
  render() {
    return (
      <p>{QualityTable[this.props.data.quality]}</p>
    )
  }
}

export { Quality }
