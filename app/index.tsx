import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  useEffect(() => {
    (async () => {
      const accepted = await AsyncStorage.getItem('MANUAL_ACCEPTED');

      if (accepted === 'YES') {
        router.replace('/login');
      } else {
        router.replace('/manual');
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
