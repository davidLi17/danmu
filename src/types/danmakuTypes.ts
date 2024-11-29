// src/types/danmakuTypes.ts
export interface Danmaku {
    id: number;
    text: string;
    color: string;
    track: number;
    position: number;
    speed?: number;
  }
  
  export interface DanmakuPoolProps {
    poolSize?: number;
  }
  
  export interface DanmakuControlsProps {
    speed: number;
    setSpeed: (speed: number) => void;
    opacity: number;
    setOpacity: (opacity: number) => void;
    fontSize: number;
    setFontSize: (fontSize: number) => void;
    onSend: () => void;
    inputText: string;
    setInputText: (text: string) => void;
  }
  
  export interface DanmakuProps {
    danmaku: Danmaku;
    fontSize: number;
    opacity: number;
    onHover: (danmaku: Danmaku) => void;
    style?: React.CSSProperties;
  }
  