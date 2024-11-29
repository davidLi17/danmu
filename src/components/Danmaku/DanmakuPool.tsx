import { useState, useCallback } from 'react';
import { Danmaku } from '@/types/danmakuTypes';

interface DanmakuPoolProps {
  poolSize?: number;
}

const useDanmakuPool = ({ poolSize = 50 }: DanmakuPoolProps) => {
  const [pool, setPool] = useState<Danmaku[]>([]);

  // 添加弹幕到池中
  const addToPool = useCallback((danmaku: Danmaku) => {
    setPool(prev => {
      if (prev.length >= poolSize) {
        return [...prev.slice(1), danmaku];
      }
      return [...prev, danmaku];
    });
  }, [poolSize]);

  // 从池中获取弹幕 - 移除对 pool 的依赖
  const getFromPool = useCallback(() => {
    setPool(prev => {
      if (prev.length === 0) return prev;
      return prev.slice(1);
    });
    return pool.length > 0 ? pool[0] : null;
  }, []); // 移除 pool 依赖
  
  return { pool, addToPool, getFromPool };
};

export default useDanmakuPool;