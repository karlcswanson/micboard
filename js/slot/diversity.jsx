import React from 'react';


function updateDiversity(antenna) {
  let newBar = [];
  if (antenna === undefined)
    {
      antenna = 'XX';
    }
  for (let i = 0; i < antenna.length; i += 1) {
    const char = antenna.charAt(i);
    switch (char) {
      case 'A':
      case 'B': newBar.push(<div key={ `${i}b` } className="diversity-bar diversity-bar-blue"></div>);
        break;
      case 'R': newBar.push(<div key={ `${i}r` } className="diversity-bar diversity-bar-red"></div>);
        break;
      case 'X': newBar.push(<div key={ `${i}x` } className="diversity-bar diversity-bar-off"></div>);
        break;
      default:
        break;
    }
  }
  return newBar;
}

class Diversity extends React.Component {

  render() {
    return (
      <div className='diversity'>{ updateDiversity(this.props.data.antenna) }</div>
    )
  }
}

export { Diversity }
