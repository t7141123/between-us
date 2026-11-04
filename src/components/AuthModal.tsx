/**
 * AuthModal: Progressive optional login & cross-platform synchronization.
 * Supports Email + Password (Register/Login) and Apple/Google sign-in.
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
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react-native';
import { AuthService, AuthUser } from '../services/auth';
import { APPLE_SIGN_IN_ENABLED, GOOGLE_SIGN_IN_ENABLED } from '../constants/features';
import { getAppleCredential, getGoogleCredential, SocialCredential } from '../services/oauthNative';
import { I18nService } from '../services/i18n';
import { CardSkinId, LocaleKey, ThemeColors, ThemeMode } from '../types';

interface AuthModalProps {
  visible: boolean;
  locale: LocaleKey;
  theme: ThemeMode;
  colors: ThemeColors;
  currentUser: AuthUser | null;
  purchaseGateNotice?: boolean;
  onClose: () => void;
  onUserChanged: (user: AuthUser | null) => void;
  onSyncComplete: (unlockedPacks: string[], isSupporter: boolean, unlockedSkins?: CardSkinId[]) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  visible,
  locale,
  theme,
  colors,
  currentUser,
  purchaseGateNotice = false,
  onClose,
  onUserChanged,
  onSyncComplete,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isDark = theme === 'dark';

  const handleEmailAuth = async () => {
    if (!email.trim() || !email.includes('@')) {
      setFeedback(I18nService.t(locale, 'invalid_email_hint', '請輸入有效的電子信箱'));
      return;
    }
    if (!password || password.length < 6) {
      setFeedback(I18nService.t(locale, 'auth_password_short', '密碼至少需為 6 個字元'));
      return;
    }

    setLoading(true);
    setFeedback(null);
    const res = await AuthService.authenticateWithEmail(email.trim(), password, authMode);
    setLoading(false);

    if (res.success && res.user) {
      onUserChanged(res.user);
      const syncRes = await AuthService.syncCloudEntitlements(res.user.id);
      if (syncRes) {
        onSyncComplete(syncRes.unlockedPacks, syncRes.isSupporter, syncRes.unlockedSkins);
      }
      setFeedback(
        authMode === 'register'
          ? I18nService.t(locale, 'auth_register_success', '註冊成功！已為您啟用跨平台雲端保存。')
          : I18nService.t(locale, 'sync_success', '帳號同步成功！已為您同步雲端權益。')
      );
      setTimeout(() => {
        setFeedback(null);
        setPassword('');
        onClose();
      }, 1200);
    } else {
      setFeedback(I18nService.t(locale, res.error || 'err_generic'));
    }
  };

  const handleOAuth = async (provider: 'apple' | 'google') => {
    setLoading(true);
    setFeedback(null);
    let credential: SocialCredential | null = null;
    try {
      credential = provider === 'apple' ? await getAppleCredential() : await getGoogleCredential();
    } catch {
      setLoading(false);
      setFeedback(I18nService.t(locale, 'oauth_fallback_hint'));
      return;
    }
    if (!credential) {
      setLoading(false); // user cancelled
      return;
    }
    const res = await AuthService.authenticateWithOAuth(provider, credential);
    setLoading(false);

    if (res.success && res.user) {
      onUserChanged(res.user);
      const syncRes = await AuthService.syncCloudEntitlements(res.user.id);
      if (syncRes) {
        onSyncComplete(syncRes.unlockedPacks, syncRes.isSupporter, syncRes.unlockedSkins);
      }
      setFeedback(I18nService.t(locale, 'sync_success'));
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1200);
    } else {
      setFeedback(I18nService.t(locale, res.error === 'err_network' || !res.error ? 'oauth_fallback_hint' : res.error));
    }
  };

  const handleLogout = async () => {
    await AuthService.logout();
    onUserChanged(null);
    setFeedback(I18nService.t(locale, 'auth_unlinked', '已解除綁定'));
    setTimeout(() => {
      setFeedback(null);
      onClose();
    }, 1000);
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    setLoading(true);
    const res = await AuthService.deleteAccount();
    setLoading(false);

    if (res.success) {
      onUserChanged(null);
      setShowDeleteConfirm(false);
      setFeedback(I18nService.t(locale, 'delete_account_success'));
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1500);
    } else {
      setFeedback(I18nService.t(locale, res.error || 'err_delete_failed'));
    }
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
            <View>
              <Text style={[styles.title, { color: colors.ink }]}>
                {currentUser
                  ? I18nService.t(locale, 'auth_logged_in_title', '帳號與跨平台同步')
                  : authMode === 'login'
                  ? I18nService.t(locale, 'auth_login_title', '登入帳號')
                  : I18nService.t(locale, 'auth_register_title', '註冊新帳號')}
              </Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                BETWEEN US CLOUD SYNC
              </Text>
            </View>
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

          {/* Purchase gate notice if opened before checkout */}
          {!currentUser && purchaseGateNotice && (
            <View style={[styles.gateNoticeBox, { backgroundColor: colors.badgeBg, borderColor: colors.clay }]}>
              <ShieldCheck size={16} color={colors.clay} style={{ marginRight: 8, marginTop: 1 }} />
              <Text style={[styles.gateNoticeText, { color: colors.ink }]}>
                {I18nService.t(
                  locale,
                  'auth_gate_desc',
                  '為確保您購買的內容可在手機 App 與網頁版跨平台永久保存，請先登入或註冊帳號。'
                )}
              </Text>
            </View>
          )}

          {!currentUser && !purchaseGateNotice && (
            <Text style={[styles.desc, { color: colors.muted }]}>
              {I18nService.t(locale, 'auth_modal_desc')}
            </Text>
          )}

          {/* Feedback banner */}
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

              {showDeleteConfirm ? (
                <View
                  style={[
                    styles.deleteConfirmBox,
                    {
                      backgroundColor: isDark ? 'rgba(220, 38, 38, 0.12)' : '#FEF2F2',
                      borderColor: isDark ? 'rgba(220, 38, 38, 0.3)' : '#FCA5A5',
                    },
                  ]}
                >
                  <Text style={[styles.deleteConfirmTitle, { color: '#EF4444' }]}>
                    ⚠️ {I18nService.t(locale, 'delete_account_confirm_title')}
                  </Text>
                  <Text style={[styles.deleteConfirmDesc, { color: isDark ? '#FCA5A5' : '#7F1D1D' }]}>
                    {I18nService.t(locale, 'delete_account_confirm_desc')}
                  </Text>
                  <View style={styles.deleteConfirmActions}>
                    <Pressable
                      onPress={() => setShowDeleteConfirm(false)}
                      disabled={loading}
                      style={[
                        styles.deleteCancelBtn,
                        { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' },
                      ]}
                    >
                      <Text style={[styles.deleteCancelBtnText, { color: colors.muted }]}>
                        {I18nService.t(locale, 'checkout_confirm_cancel_btn')}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={handleDeleteAccount}
                      disabled={loading}
                      style={styles.deleteConfirmBtn}
                    >
                      <Text style={styles.deleteConfirmBtnText}>
                        {I18nService.t(locale, 'btn_confirm_delete')}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={styles.loggedInActionsRow}>
                  <Pressable
                    onPress={handleLogout}
                    disabled={loading}
                    style={[styles.logoutBtn, { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }]}
                  >
                    <Text style={[styles.logoutBtnText, { color: colors.muted }]}>
                      {I18nService.t(locale, 'btn_logout')}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setShowDeleteConfirm(true)}
                    disabled={loading}
                    style={[
                      styles.deleteBtn,
                      {
                        borderColor: isDark ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)',
                        backgroundColor: isDark ? 'rgba(239,68,68,0.08)' : '#FEF2F2',
                      },
                    ]}
                  >
                    <Text style={styles.deleteBtnText}>
                      {I18nService.t(locale, 'btn_delete_account')}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.actionsBox}>
              {APPLE_SIGN_IN_ENABLED && (
                <>
                {/* Apple / Google Quick Sign In */}
                <View style={styles.oauthRow}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => handleOAuth('apple')}
                    disabled={loading}
                    style={[styles.oauthBtn, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}
                  >
                    <Text style={[styles.oauthBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                       {I18nService.t(locale, 'sign_in_apple', 'Apple 繼續')}
                    </Text>
                  </Pressable>

                  {GOOGLE_SIGN_IN_ENABLED && (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => handleOAuth('google')}
                      disabled={loading}
                      style={[
                        styles.oauthBtn,
                        {
                          backgroundColor: isDark ? '#292524' : '#FFFFFF',
                          borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <Text style={[styles.oauthBtnText, { color: colors.ink }]}>
                        G {I18nService.t(locale, 'sign_in_google', 'Google 繼續')}
                      </Text>
                    </Pressable>
                  )}
                </View>

                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View
                    style={[
                      styles.dividerLine,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
                    ]}
                  />
                  <Text style={[styles.dividerText, { color: colors.muted }]}>
                    {I18nService.t(locale, 'or_email_password', '或使用 Email + 密碼')}
                  </Text>
                  <View
                    style={[
                      styles.dividerLine,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
                    ]}
                  />
                </View>

                </>
              )}

              {/* Mode Switch (Login vs Register) */}
              <View style={[styles.modeTabs, { backgroundColor: isDark ? '#141211' : 'rgba(0,0,0,0.04)' }]}>
                <Pressable
                  onPress={() => setAuthMode('login')}
                  style={[styles.modeTab, authMode === 'login' && { backgroundColor: colors.card }]}
                >
                  <Text
                    style={[
                      styles.modeTabText,
                      { color: authMode === 'login' ? colors.clay : colors.muted },
                      authMode === 'login' && { fontWeight: '700' },
                    ]}
                  >
                    {I18nService.t(locale, 'auth_tab_login', '帳號登入')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setAuthMode('register')}
                  style={[styles.modeTab, authMode === 'register' && { backgroundColor: colors.card }]}
                >
                  <Text
                    style={[
                      styles.modeTabText,
                      { color: authMode === 'register' ? colors.clay : colors.muted },
                      authMode === 'register' && { fontWeight: '700' },
                    ]}
                  >
                    {I18nService.t(locale, 'auth_tab_register', '註冊新帳號')}
                  </Text>
                </Pressable>
              </View>

              {/* Email Input */}
              <View style={[styles.inputContainer, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)', backgroundColor: isDark ? '#292524' : '#FFFFFF' }]}>
                <Mail size={16} color={colors.muted} style={{ marginRight: 8 }} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder={I18nService.t(locale, 'email_placeholder')}
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={[styles.textInput, { color: colors.ink }]}
                />
              </View>

              {/* Password Input */}
              <View style={[styles.inputContainer, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)', backgroundColor: isDark ? '#292524' : '#FFFFFF' }]}>
                <Lock size={16} color={colors.muted} style={{ marginRight: 8 }} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder={
                    authMode === 'register'
                      ? I18nService.t(locale, 'auth_password_register_placeholder', '設定密碼（至少 6 碼）')
                      : I18nService.t(locale, 'auth_password_placeholder', '輸入密碼')
                  }
                  placeholderTextColor={colors.muted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={[styles.textInput, { color: colors.ink }]}
                />
                <Pressable accessibilityRole="button" accessibilityLabel={I18nService.t(locale, 'a11y_toggle_password')} onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                  {showPassword ? (
                    <EyeOff size={16} color={colors.muted} />
                  ) : (
                    <Eye size={16} color={colors.muted} />
                  )}
                </Pressable>
              </View>

              {/* Submit Button */}
              <Pressable
                onPress={handleEmailAuth}
                disabled={loading}
                style={[styles.submitBtn, { backgroundColor: colors.clay }]}
              >
                <Text style={styles.submitBtnText}>
                  {loading
                    ? I18nService.t(locale, 'loading', '處理中...')
                    : authMode === 'login'
                    ? I18nService.t(locale, 'auth_submit_login', '登入並同步')
                    : I18nService.t(locale, 'auth_submit_register', '建立帳號並登入')}
                </Text>
              </Pressable>
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
    backgroundColor: 'rgba(0, 0, 0, 0.74)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      } as any,
    }),
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
      },
      android: { elevation: 12 },
      web: {
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 255, 255, 0.1)',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '600',
    marginTop: 2,
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
  gateNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  gateNoticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  desc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
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
  loggedInActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  deleteConfirmBox: {
    width: '100%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
    gap: 8,
  },
  deleteConfirmTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  deleteConfirmDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  deleteConfirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  deleteCancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  deleteCancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteConfirmBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#DC2626',
  },
  deleteConfirmBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionsBox: {
    gap: 12,
  },
  oauthRow: {
    flexDirection: 'row',
    gap: 8,
  },
  oauthBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  oauthBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
  },
  modeTabs: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeTabText: {
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  submitBtn: {
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
