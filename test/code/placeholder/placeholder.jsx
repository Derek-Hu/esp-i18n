import React from 'react';

export default class ReportPage extends React.Component {
  state = {
    list: []
  };

  componentDidMount() { }

  render() {
    const { list } = this.state;
    return (
      <ul>
        {
          list.map(li => <li key={li}>{li}</li>)
        }
      </ul>
    );
  }
}
