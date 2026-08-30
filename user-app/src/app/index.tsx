import { useEffect } from 'react';
import {
  Image,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const SPLASH_DURATION = 2800;

export default function SplashScreen() {
  const { width, height } = useWindowDimensions();

  useEffect(() => {
   const timer = setTimeout(() => {
  router.replace('/auth');
}, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <Image
        source={require('@/assets/images/ridex-splash.png')}
        style={{
          width,
          height,
        }}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});