import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const Haptics = {
  triggerLight: (enabled = true) => {
    if (!enabled) return;
    ReactNativeHapticFeedback.trigger('impactLight', options);
  },
  
  triggerError: (enabled = true) => {
    if (!enabled) return;
    ReactNativeHapticFeedback.trigger('notificationError', options);
  },
  
  triggerSuccess: (enabled = true) => {
    if (!enabled) return;
    ReactNativeHapticFeedback.trigger('notificationSuccess', options);
  },
  
  triggerSelection: (enabled = true) => {
    if (!enabled) return;
    ReactNativeHapticFeedback.trigger('selection', options);
  }
};
