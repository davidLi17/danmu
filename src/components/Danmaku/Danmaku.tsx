import React from 'react';
import { DanmakuProps } from '@/types/danmakuTypes';

const Danmaku: React.FC<DanmakuProps> = React.memo(({ danmaku, fontSize, opacity, onHover, style }) => {
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
export default Danmaku;  
