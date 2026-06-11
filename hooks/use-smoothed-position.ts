import { LatLng, lerp } from '@/constants/delivery';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Eases a map marker toward a target that arrives in discrete jumps (e.g.
 * throttled Firestore location updates), so the marker glides instead of
 * teleporting.
 */
export function useSmoothedPosition(target: LatLng | null | undefined, initial: LatLng): LatLng {
  const [pos, setPos] = useState(initial);
  const posRef = useRef(initial);
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!target) return;
    const from = posRef.current;
    if (from.latitude === target.latitude && from.longitude === target.longitude) return;

    anim.stopAnimation();
    anim.setValue(0);
    const listenerId = anim.addListener(({ value }) => {
      const next = lerp(from, target, value);
      posRef.current = next;
      setPos(next);
    });
    Animated.timing(anim, {
      toValue: 1,
      duration: 2000,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();

    return () => anim.removeListener(listenerId);
  }, [target?.latitude, target?.longitude]);

  return pos;
}
