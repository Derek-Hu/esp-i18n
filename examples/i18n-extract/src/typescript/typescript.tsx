import React from 'react';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img className="App-logo" alt="logo" />
        <p>
          编辑 <code>src/App.tsx</code> 然后保存。
        </p>
        <input placeholder="请输入名称" />
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          学习React
        </a>
      </header>
    </div>
  );
}

export default App;
