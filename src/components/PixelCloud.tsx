import React from 'react';
import { ViewStyle, StyleProp, StyleSheet, Animated } from 'react-native';

type Props = {
  variant: 'small' | 'medium' | 'large';
  size: number; // base size unit
  tint: string;
  opacity?: number;
  animatedX?: Animated.AnimatedInterpolation<string | number> | Animated.Value;
  animatedY?: Animated.AnimatedInterpolation<string | number> | Animated.Value;
  style?: StyleProp<ViewStyle>;
};

const PixelCloud: React.FC<Props> = ({ variant, size, tint, opacity = 0.7, animatedX, animatedY, style }) => {
  // derive width/height from variant and size unit
  const unit = Math.max(6, size);
  const dims = {
    small: { w: unit * 8, h: unit * 5 },
    medium: { w: unit * 11, h: unit * 7 },
    large: { w: unit * 14, h: unit * 9 }
  } as const;
  const { w, h } = dims[variant];

  const animatedStyle: any = {
    transform: [
      animatedX ? { translateX: animatedX as any } : { translateX: 0 },
      animatedY ? { translateY: animatedY as any } : { translateY: 0 }
    ]
  };

  return (
    <Animated.View style={[{ width: w, height: h, opacity }, animatedStyle, style]}> 
      {/* Simple blocky cloud: base + top overlaps to hint pixels */}
      <Animated.View style={[styles.block, { backgroundColor: tint, width: w, height: h, borderRadius: 6 }]} />
      <Animated.View style={[styles.block, { backgroundColor: tint, width: w * 0.6, height: h * 0.6, borderRadius: 6, position:'absolute', left: w*0.2, top: -h*0.15 }]} />
      <Animated.View style={[styles.block, { backgroundColor: tint, width: w * 0.35, height: h * 0.45, borderRadius: 6, position:'absolute', left: w*0.05, top: h*0.05 }]} />
      <Animated.View style={[styles.block, { backgroundColor: tint, width: w * 0.3, height: h * 0.4, borderRadius: 6, position:'absolute', right: w*0.05, top: h*0.1 }]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  block: {
    // shadow to lift a little
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  }
});

export default PixelCloud;
