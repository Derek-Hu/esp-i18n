import React from 'react';

export default class ReportPage extends React.Component {
  state = {
    list: []
  };

  componentDidMount() { }

  render() {
    const { list } = this.state;
    const msg = '这是中文';
    const msg2 = "这是中文";
    const msg3 = `这是中文`;
    return (
      <ul>这是中文
        {
          list.map(li => <li key={li}>{li}</li>)
        }
      </ul>
    );
  }
}
