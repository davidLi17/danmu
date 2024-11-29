import React from 'react';
import { DanmakuControlsProps } from '@/types/danmakuTypes';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { log } from 'console';

const DanmakuControls: React.FC<DanmakuControlsProps> = ({ 
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
      {/* 速度控制滑块 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">速度控制</label>
        <Slider
          value={[speed]}
          onValueChange={([value]) => {

            setSpeed(value);
          }}
          min={1}
          max={8}
          step={0.5}
          className="w-full"
        />
      </div>
      
      {/* 透明度滑块 */}
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
      
      {/* 字体大小滑块 */}
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

      {/* 输入框和发送按钮 */}
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

export default DanmakuControls;
