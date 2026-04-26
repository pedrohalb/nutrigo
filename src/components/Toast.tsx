import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, radius } from '../theme';

export type ToastHandle = {
  /** Exibe o toast e chama `onDone` ao terminar a animação de saída. */
  show: (onDone?: () => void) => void;
};

type Props = {
  message: string;
  /** Ícone exibido à esquerda. Padrão: Check verde. */
  icon?: React.ReactNode;
  /** Tempo em ms que o toast fica visível. Padrão: 2000. */
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

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
