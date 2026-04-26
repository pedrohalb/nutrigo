import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { styles } from './styles';

export type ToastHandle = {
  show: (onDone?: () => void) => void;
};

type Props = {
  message: string;
  icon?: React.ReactNode;
  duration?: number;
};

const Toast = forwardRef<ToastHandle, Props>(
  ({ message, icon, duration = 2000 }, ref) => {
    const anim = useRef(new Animated.Value(0)).current;

    useImperativeHandle(ref, () => ({
      show(onDone) {
        anim.setValue(0);
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.delay(duration),
          Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => onDone?.());
      },
    }));

    return (
      <Animated.View
        style={[
          styles.toast,
          {
            opacity: anim,
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <View style={styles.icon}>
          {icon ?? <Check size={16} color="#ffffff" />}
        </View>
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    );
  },
);

export default Toast;
