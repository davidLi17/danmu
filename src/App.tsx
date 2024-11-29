import React from 'react';
import DanmakuSystem from './components/Danmaku/DanmakuSystem'; // 确保路径正确

const App: React.FC = () => {
  return (
    <div className="App">
      <h1 className="text-center text-3xl font-bold my-5">弹幕系统演示</h1>
      <DanmakuSystem />
    </div>
  );
}

export default App;
