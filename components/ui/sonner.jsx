import {
    Alert,
    Platform,
    ToastAndroid,
    useColorScheme,
} from 'react-native';

const durations = {
  short: ToastAndroid.SHORT,
  long: ToastAndroid.LONG,
};

const showNativeToast = (message, options = {}) => {
  const {
    title,
    duration = 'short',
    androidPosition = ToastAndroid.BOTTOM,
  } = options;

  if (Platform.OS === 'android') {
    ToastAndroid.showWithGravity(
      message,
      durations[duration] ?? ToastAndroid.SHORT,
      androidPosition,
    );
  } else {
    Alert.alert(title ?? 'Notification', message);
  }
};

export const toast = {
  show: (message, options) => showNativeToast(message, options),
  success: (message, options) =>
    showNativeToast(message, { title: 'Success', ...options }),
  error: (message, options) =>
    showNativeToast(message, { title: 'Error', ...options }),
  info: (message, options) =>
    showNativeToast(message, { title: 'Info', ...options }),
};

export const Toaster = () => {
  useColorScheme(); // hook retained for parity; no UI needed
  return null;
};

