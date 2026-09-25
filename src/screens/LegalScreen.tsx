import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import legal from '../data/legal.json';

export const LegalScreen = ({ navigation, route }: any) => {
  const document = route.params?.document === 'terms-of-use' ? 'terms-of-use' : 'privacy-policy';
  return (
    <SafeAreaView style={styles.container}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back to Settings" onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.link}>Back to Settings</Text>
      </Pressable>
      <ScrollView contentContainerStyle={styles.content}>
        <Text selectable style={styles.text}>{legal[document]}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  back: { padding: 20, minHeight: 48 },
  link: { color: '#1d4ed8', fontSize: 17, fontWeight: '600' },
  content: { padding: 24, paddingTop: 8 },
  text: { color: '#1e293b', fontSize: 16, lineHeight: 26 },
});
