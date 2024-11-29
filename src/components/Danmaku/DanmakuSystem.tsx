import React, { useState, useEffect, useRef, useCallback } from 'react';
import DanmakuPool from './DanmakuPool'; 
import Danmaku from './Danmaku';
import DanmakuControls from './DanmakuControls';
import { Danmaku as DanmakuType } from '@/types/danmakuTypes';
import { log } from 'console';

const DanmakuSystem: React.FC = () => {
  const [danmakus, setDanmakus] = useState<DanmakuType[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [speed, setSpeed] = useState<number>(2);
  const [opacity, setOpacity] = useState<number>(1);
  const [fontSize, setFontSize] = useState<number>(16);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [tracks] = useState<Array<null>>(Array(8).fill(null));
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const { addToPool, getFromPool } = DanmakuPool({ poolSize: 50 });

  // 改进的碰撞检测函数
  const checkCollision = useCallback((newDanmaku: DanmakuType, track: number) => {
    

    const danmakusInTrack = danmakus.filter(d => d.track === track);
    const containerWidth = containerRef.current?.clientWidth || 0;
    const safeDistance = fontSize * 2; // 弹幕之间的安全距离

    return danmakusInTrack.some(d => {
      // 计算弹幕的右边界
      const dRight = d.position + (d.text.length * fontSize);
      // 如果弹幕已经完全离开屏幕左侧，不算作碰撞
      if (dRight < 0) return false;
      // 如果弹幕还没有进入屏幕右侧，不算作碰撞
      if (d.position > containerWidth) return false;
      
      // 检查新弹幕是否会与现有弹幕发生碰撞
      const newDanmakuLeft = containerWidth;
      return Math.abs(newDanmakuLeft - d.position) < safeDistance;
    });
  }, [danmakus, fontSize]);

  // 改进的轨道查找函数
  const findAvailableTrack = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth || 0;

    // 计算每个轨道的拥挤程度
    const trackCongestion = tracks.map((_, trackIndex) => {
      const danmakusInTrack = danmakus.filter(d => d.track === trackIndex);
      return {
        track: trackIndex,
        congestion: danmakusInTrack.length,
        hasCollision: checkCollision({ 
          id: 0, 
          text: inputText, 
          color: '', 
          position: containerWidth, 
          track: trackIndex, 
          speed: speed 
        }, trackIndex)
      };
    });

    // 首先尝试找到没有碰撞的轨道
    const availableTrack = trackCongestion.find(t => !t.hasCollision);
    if (availableTrack) return availableTrack.track;

    // 如果所有轨道都有碰撞，选择拥挤度最低的轨道
    const leastCongestedTrack = trackCongestion.reduce((prev, curr) => 
      prev.congestion < curr.congestion ? prev : curr
    );

    return leastCongestedTrack.track;
  }, [tracks, danmakus, checkCollision, inputText, speed]);

  // 其余代码保持不变...
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
    const newDanmaku: DanmakuType = pooledDanmaku ? {
      ...pooledDanmaku,
      text: inputText,
      position: containerRef.current?.clientWidth || 0,
      track: findAvailableTrack(),
      speed: speed,
    } : {
      id: Date.now(),
      text: inputText,
      color: getRandomColor(),
      track: findAvailableTrack(),
      position: containerRef.current?.clientWidth || 0,
      speed: speed,
    };
  
    setDanmakus(prev => [...prev, newDanmaku]);
    setInputText('');
  }, [inputText, speed, findAvailableTrack, getFromPool, getRandomColor]);

  const handleDanmakuHover = useCallback((_danmaku: DanmakuType) => {
    setIsPaused(true);
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
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
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