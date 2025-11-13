import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    const { width } = Dimensions.get('window');
    return width < MOBILE_BREAKPOINT;
  });

  useEffect(() => {
    const handler = ({ window }) => {
      setIsMobile(window.width < MOBILE_BREAKPOINT);
    };
    const subscription = Dimensions.addEventListener('change', handler);
    return () => {
      subscription?.remove?.();
    };
  }, []);

  return isMobile;
}

