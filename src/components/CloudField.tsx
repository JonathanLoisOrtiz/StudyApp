import React from 'react';
import { View, Animated, Easing, useWindowDimensions } from 'react-native';
import PixelCloud from './PixelCloud';
import useThemeStore from '../state/themeStore';

interface CloudDef {
  id: number;
  variant: 'small' | 'medium' | 'large';
  tint: string;
  top: number; // y position
  anim: Animated.Value; // 0->1 progress across screen
  dir: 1 | -1; // direction
  duration: number;
  size: number;
}

const variants: Array<'small' | 'medium' | 'large'> = ['small','medium','large'];
 

let cloudIdCounter = 0;

const CloudField: React.FC<{ max?: number; spawnInterval?: [number, number]; }> = ({ max = 7, spawnInterval = [2500, 5000] }) => {
  const { palette } = useThemeStore();
  const tints = React.useMemo(() => [
    palette.pastelBlue,
    palette.pastelPink,
    palette.pastelPeach,
    palette.pastelMint,
    palette.pastelYellow,
    palette.pastelPurple
  ], [palette]);
  const { width, height } = useWindowDimensions();
  const [clouds, setClouds] = React.useState<CloudDef[]>([]);

  // spawn function
  const spawn = React.useCallback(() => {
    setClouds(prev => {
      if (prev.length >= max) return prev; // skip if at max
      const variant = variants[Math.floor(Math.random()*variants.length)];
      const tint = tints[Math.floor(Math.random()*tints.length)];
      const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
      const size = 8 + Math.floor(Math.random()*5); // 8-12
      const top = 40 + Math.random() * (height * 0.5); // upper half area
      const duration = 14000 + Math.random()*10000; // 14-24s
      const anim = new Animated.Value(0);
      const id = cloudIdCounter++;
      const cloud: CloudDef = { id, variant, tint, top, anim, dir, duration, size };
      Animated.timing(anim, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }).start(() => {
        setClouds(p => p.filter(c => c.id !== id));
      });
      return [...prev, cloud];
    });
  }, [height, max]);

  // spawning loop
  React.useEffect(() => {
    let cancelled = false;
    const loop = () => {
      if (cancelled) return;
      spawn();
      const [min,maxI] = spawnInterval;
      const delay = min + Math.random()*(maxI-min);
      setTimeout(loop, delay);
    };
    loop();
    return () => { cancelled = true; };
  }, [spawn, spawnInterval]);

  return (
    <View style={{ position:'absolute', left:0, right:0, top:0, bottom:0 }} pointerEvents="none">
      {clouds.map(c => {
        const startX = c.dir === 1 ? -120 : width + 120;
        const endX = c.dir === 1 ? width + 120 : -120;
        const translateX = c.anim.interpolate({ inputRange: [0,1], outputRange: [startX, endX] });
        const floatY = c.anim.interpolate({ inputRange:[0,0.5,1], outputRange:[0, -12, 0] });
        const opacity = c.anim.interpolate({ inputRange:[0,0.05,0.9,1], outputRange:[0,0.6,0.6,0] });
        return (
          <PixelCloud
            key={c.id}
            variant={c.variant}
            size={c.size}
            tint={c.tint}
            opacity={0.65}
            animatedX={translateX}
            animatedY={floatY}
            style={{ top: c.top }}
          />
        );
      })}
    </View>
  );
};

export default CloudField;
