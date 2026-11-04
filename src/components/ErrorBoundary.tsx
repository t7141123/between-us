/**
 * ErrorBoundary: prevents a render error from leaving the user with a blank screen.
 * Shows a bilingual recovery screen (no i18n dependency, so it works even if i18n is what failed).
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Unhandled render error:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>發生未預期的錯誤 · Something went wrong</Text>
        <Text style={styles.body}>請重試一次。若問題持續，請聯絡 support@lovebetweenus.app{'\n'}Please try again.</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="重試 Retry"
          onPress={() => this.setState({ hasError: false })}
          style={styles.button}
        >
          <Text style={styles.buttonText}>重試 · Retry</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#FAF7F2' },
  title: { fontSize: 18, fontWeight: '600', color: '#2C2825', textAlign: 'center', marginBottom: 12 },
  body: { fontSize: 14, color: '#8E877F', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  button: { backgroundColor: '#C25B4E', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 999 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
