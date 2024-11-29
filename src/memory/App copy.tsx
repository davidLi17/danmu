import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// DanmakuPool 组件 - 管理弹幕池复用
const DanmakuPool = ({ poolSize = 50 }) => {
  const [pool, setPool] = useState([]);

  const addToPool = useCallback((danmaku) => {
    setPool(prev => {
      if (prev.length >= poolSize) {
        prev.shift(); // 移除最老的弹幕
      }
      return [...prev, danmaku];
    });
  }, [poolSize]);

  const getFromPool = useCallback(() => {
    if (pool.length === 0) return null;
    const danmaku = pool[0];
    setPool(prev => prev.slice(1));
    return danmaku;
  }, [pool]);

  return { pool, addToPool, getFromPool };
};

// DanmakuControls 组件 - 控制面板
const DanmakuControls = ({ 
  speed, 
  setSpeed, 
  opacity, 
  setOpacity,
  fontSize,
  setFontSize,
  onSend,
  inputText,
  setInputText 
}) => {
  return (
    <div className="space-y-4 p-4 bg-gray-100 rounded-lg">
      <div className="space-y-2">
        <label className="text-sm font-medium">速度控制</label>
        <Slider
          value={[speed]}
          onValueChange={([value]) => setSpeed(value)}
          min={1}
          max={5}
          step={0.5}
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">透明度</label>
        <Slider
          value={[opacity]}
          onValueChange={([value]) => setOpacity(value)}
          min={0.2}
          max={1}
          step={0.1}
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">字体大小</label>
        <Slider
          value={[fontSize]}
          onValueChange={([value]) => setFontSize(value)}
          min={12}
          max={32}
          step={2}
          className="w-full"
        />
      </div>

      <div className="flex gap-2">
        <Input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSend()}
          className="flex-1"
          placeholder="输入弹幕内容..."
        />
        <Button onClick={onSend} className="bg-blue-500 hover:bg-blue-600">
          发送
        </Button>
      </div>
    </div>
  );
};

// Danmaku 组件 - 单个弹幕
const Danmaku = React.memo(({ 
  danmaku, 
  fontSize, 
  opacity, 
  onHover, 
  style 
}) => {
  return (
    <div
      className="absolute whitespace-nowrap font-bold transition-all duration-100 ease-linear hover:scale-110 cursor-pointer"
      style={{
        ...style,
        color: danmaku.color,
        transform: `translateX(${danmaku.position}px)`,
        top: danmaku.track * 40,
        fontSize: `${fontSize}px`,
        opacity: opacity,
      }}
      onMouseEnter={() => onHover(danmaku)}
    >
      {danmaku.text}
    </div>
  );
});

// DanmakuSystem 主组件
const DanmakuSystem = () => {
  const [danmakus, setDanmakus] = useState([]);
  const [inputText, setInputText] = useState('');
  const [speed, setSpeed] = useState(2);
  const [opacity, setOpacity] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const [isPaused, setIsPaused] = useState(false);
  const [tracks] = useState(Array(8).fill(null));
  
  const containerRef = useRef(null);
  const requestRef = useRef();
  const { addToPool, getFromPool } = DanmakuPool({ poolSize: 50 });

  // 碰撞检测
  const checkCollision = useCallback((newDanmaku, track) => {
    return danmakus.some(d => 
      d.track === track && 
      Math.abs(d.position - newDanmaku.position) < (fontSize * 1.5)
    );
  }, [danmakus, fontSize]);

  // 找到可用轨道（带碰撞检测）
  const findAvailableTrack = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth || 0;
    const newPosition = containerWidth;
    
    for (let i = 0; i < tracks.length; i++) {
      const mockDanmaku = { position: newPosition, track: i };
      if (!checkCollision(mockDanmaku, i)) {
        return i;
      }
    }
    return Math.floor(Math.random() * tracks.length);
  }, [tracks, checkCollision]);

  const getRandomColor = useCallback(() => {
    const colors = [
      '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
      '#ff00ff', '#00ffff', '#ff8800', '#ff0088'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  const sendDanmaku = useCallback(() => {
    if (!inputText.trim()) return;

    const pooledDanmaku = getFromPool();
    const newDanmaku = pooledDanmaku ? {
      ...pooledDanmaku,
      text: inputText,
      position: containerRef.current.clientWidth,
      track: findAvailableTrack(),
    } : {
      id: Date.now(),
      text: inputText,
      color: getRandomColor(),
      track: findAvailableTrack(),
      position: containerRef.current.clientWidth,
      speed: speed,
    };

    setDanmakus(prev => [...prev, newDanmaku]);
    setInputText('');
  }, [inputText, speed, findAvailableTrack, getFromPool, getRandomColor]);

  const handleDanmakuHover = useCallback((danmaku) => {
    setIsPaused(true);
    // 可以添加更多悬停效果
  }, []);

  const animateDanmakus = useCallback(() => {
    if (!isPaused) {
      setDanmakus(prev => {
        const newDanmakus = prev
          .map(danmaku => ({
            ...danmaku,
            position: danmaku.position - (danmaku.speed || speed),
          }))
          .filter(danmaku => {
            if (danmaku.position <= -200) {
              addToPool(danmaku);
              return false;
            }
            return true;
          });
        return newDanmakus;
      });
    }
    requestRef.current = requestAnimationFrame(animateDanmakus);
  }, [isPaused, speed, addToPool]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animateDanmakus);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animateDanmakus]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div 
          ref={containerRef}
          className="relative bg-gray-800 w-full h-96 overflow-hidden rounded-lg mb-4"
          onMouseLeave={() => setIsPaused(false)}
        >
          {danmakus.map(danmaku => (
            <Danmaku
              key={danmaku.id}
              danmaku={danmaku}
              fontSize={fontSize}
              opacity={opacity}
              onHover={handleDanmakuHover}
            />
          ))}
        </div>
        
        <DanmakuControls
          speed={speed}
          setSpeed={setSpeed}
          opacity={opacity}
          setOpacity={setOpacity}
          fontSize={fontSize}
          setFontSize={setFontSize}
          onSend={sendDanmaku}
          inputText={inputText}
          setInputText={setInputText}
        />
      </div>
    </div>
  );
};

export default DanmakuSystem;