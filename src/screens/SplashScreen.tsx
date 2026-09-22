import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Video, { ResizeMode } from 'react-native-video';
import { useUserStore } from '../store/useUserStore';

export const SplashScreen = ({ navigation }: any) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const finished = useRef(false);
  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    Animated.timing(opacity, { toValue: 0, duration: 240, useNativeDriver: true }).start(() => {
      navigation.replace(useUserStore.getState().hasSeenOnboarding ? 'Home' : 'Onboarding');
    });
  };
  useEffect(() => {
    const fallback = setTimeout(finish, 12000);
    return () => clearTimeout(fallback);
  });
  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Video source={require('../../splash.mp4')} style={styles.video} resizeMode={ResizeMode.CONTAIN}
        paused={false} repeat={false} muted onEnd={finish} onError={finish} />
      <View style={styles.footer}>
        <Text style={styles.name}>TAP AWAY ARROWS</Text>
        <Pressable onPress={finish} accessibilityRole="button" accessibilityLabel="Skip intro">
          <Text style={styles.skip}>SKIP  →</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090f25' },
  video: { ...StyleSheet.absoluteFill },
  footer: { position: 'absolute', bottom: 40, left: 26, right: 26, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 2.5 },
  skip: { color: '#dbeafe', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
});
