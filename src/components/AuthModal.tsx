/**
 * AuthModal: Progressive optional login & cross-platform synchronization.
 * Supports Sign in with Apple, Google, and Email quick sync.
 */
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AuthService, AuthUser } from '../services/auth';
import { I18nService } from '../services/i18n';
import { LocaleKey, ThemeColors, ThemeMode } from '../types';

interface AuthModalProps {
  visible: boolean;
  locale: LocaleKey;
  theme: ThemeMode;
  colors: ThemeColors;
  currentUser: AuthUser | null;
  onClose: () => void;
  onUserChanged: (user: AuthUser | null) => void;
  onSyncComplete: (unlockedPacks: string[], isSupporter: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  visible,
  locale,
  theme,
  colors,
  currentUser,
  onClose,
  onUserChanged,
  onSyncComplete,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isDark = theme === 'dark';

  const handleProviderLogin = async (provider: 'apple' | 'google') => {
    setLoading(true);
    // In production web, this triggers OAuth redirect or popup; currently mock/bind
    const simulatedEmail =
      provider === 'apple' ? 'apple.user@icloud.com' : 'google.user@gmail.com';
    const res = await AuthService.login(simulatedEmail, provider);
    setLoading(false);

    if (res.success && res.user) {
      onUserChanged(res.user);
      const syncRes = await AuthService.syncCloudEntitlements(res.user.id);
      if (syncRes) {
        onSyncComplete(syncRes.unlockedPacks, syncRes.isSupporter);
      }
      setFeedback(I18nService.t(locale, 'sync_success'));
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1500);
    } else {
      setFeedback(res.error || 'Login failed');
    }
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !email.includes('@')) {
      setFeedback('請輸入有效的電子信箱');
      return;
    }
    setLoading(true);
    const res = await AuthService.login(email.trim(), 'email');
    setLoading(false);

    if (res.success && res.user) {
      onUserChanged(res.user);
      const syncRes = await AuthService.syncCloudEntitlements(res.user.id);
      if (syncRes) {
        onSyncComplete(syncRes.unlockedPacks, syncRes.isSupporter);
      }
      setFeedback(I18nService.t(locale, 'sync_success'));
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1500);
    } else {
      setFeedback(res.error || 'Login failed');
    }
  };

  const handleLogout = async () => {
    await AuthService.logout();
    onUserChanged(null);
    setFeedback('已解除綁定');
    setTimeout(() => {
      setFeedback(null);
      onClose();
    }, 1000);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.container,
            {
              backgroundColor: isDark ? '#1C1917' : '#FAF6F0',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.ink }]}>
              {I18nService.t(locale, 'auth_modal_title')}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={[
                styles.closeBtn,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
              ]}
            >
              <Text style={[styles.closeBtnText, { color: colors.ink }]}>✕</Text>
            </Pressable>
          </View>

          <Text style={[styles.desc, { color: colors.muted }]}>
            {I18nService.t(locale, 'auth_modal_desc')}
          </Text>

          {feedback && (
            <View
              style={[
                styles.feedbackBanner,
                {
                  backgroundColor: isDark ? 'rgba(196,112,79,0.2)' : '#F5EBE1',
                  borderColor: colors.clay,
                },
              ]}
            >
              <Text style={[styles.feedbackText, { color: colors.clay }]}>{feedback}</Text>
            </View>
          )}

          {/* Already logged in state */}
          {currentUser ? (
            <View
              style={[
                styles.loggedInBox,
                {
                  backgroundColor: isDark ? '#292524' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                },
              ]}
            >
              <Text style={[styles.loggedInLabel, { color: colors.muted }]}>
                {I18nService.t(locale, 'logged_in_as')}
              </Text>
              <Text style={[styles.loggedInEmail, { color: colors.ink }]}>
                {currentUser.email}
              </Text>
              <Pressable
                onPress={handleLogout}
                style={[styles.logoutBtn, { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }]}
              >
                <Text style={[styles.logoutBtnText, { color: colors.muted }]}>
                  {I18nService.t(locale, 'btn_logout')}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.actionsBox}>
              {/* Sign in with Apple */}
              <Pressable
                onPress={() => handleProviderLogin('apple')}
                disabled={loading}
                style={[styles.appleBtn, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}
              >
                <Text style={[styles.appleBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                   {I18nService.t(locale, 'sign_in_apple')}
                </Text>
              </Pressable>

              {/* Sign in with Google */}
              <Pressable
                onPress={() => handleProviderLogin('google')}
                disabled={loading}
                style={[
                  styles.googleBtn,
                  {
                    backgroundColor: isDark ? '#292524' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
                  },
                ]}
              >
                <Text style={[styles.googleBtnText, { color: colors.ink }]}>
                  G  {I18nService.t(locale, 'sign_in_google')}
                </Text>
              </Pressable>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
                  ]}
                />
                <Text style={[styles.dividerText, { color: colors.muted }]}>
                  {I18nService.t(locale, 'or_email')}
                </Text>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
                  ]}
                />
              </View>

              {/* Email Input */}
              <View style={styles.emailRow}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder={I18nService.t(locale, 'email_placeholder')}
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={[
                    styles.emailInput,
                    {
                      color: colors.ink,
                      borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
                      backgroundColor: isDark ? '#292524' : '#FFFFFF',
                    },
                  ]}
                />
                <Pressable
                  onPress={handleEmailLogin}
                  disabled={loading}
                  style={[styles.syncBtn, { backgroundColor: colors.clay }]}
                >
                  <Text style={styles.syncBtnText}>
                    {I18nService.t(locale, 'btn_sync_now')}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
      web: { boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  desc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  feedbackBanner: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
  },
  feedbackText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  loggedInBox: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  loggedInLabel: {
    fontSize: 12,
  },
  loggedInEmail: {
    fontSize: 15,
    fontWeight: '700',
  },
  logoutBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsBox: {
    gap: 12,
  },
  appleBtn: {
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleBtnText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  googleBtn: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
  },
  emailRow: {
    flexDirection: 'row',
    gap: 8,
  },
  emailInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
  },
  syncBtn: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
