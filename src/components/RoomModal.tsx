/**
 * RoomModal: Real-time couple synchronization modal.
 * Lets couples pair across dual phones using a simple 4-digit room code.
 * Supports light & dark themes, copy invite, and instant disconnect.
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
  Share,
} from 'react-native';
import { Users, Copy, Check, LogOut, Sparkles } from 'lucide-react-native';
import { I18nService } from '../services/i18n';
import { RoomService, RoomState } from '../services/room';
import { LocaleKey, ThemeColors, ThemeMode } from '../types';

interface RoomModalProps {
  visible: boolean;
  locale: LocaleKey;
  theme: ThemeMode;
  colors: ThemeColors;
  currentRoom: RoomState | null;
  currentCategory: string;
  currentQuestionText: string;
  currentQuestionQid?: string;
  isPlus?: boolean;
  onToggleReveal?: (next: boolean) => void;
  onClose: () => void;
  onRoomConnected: (room: RoomState) => void;
  onLeaveRoom: () => void;
}

export const RoomModal: React.FC<RoomModalProps> = ({
  visible,
  locale,
  theme,
  colors,
  currentRoom,
  currentCategory,
  currentQuestionText,
  currentQuestionQid = '',
  isPlus = false,
  onToggleReveal,
  onClose,
  onRoomConnected,
  onLeaveRoom,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isDark = theme === 'dark';

  const handleCreateRoom = async () => {
    setLoading(true);
    setFeedback(null);
    const res = await RoomService.createRoom(currentCategory, currentQuestionText, currentQuestionQid);
    setLoading(false);
    if (res.success && res.room) {
      onRoomConnected(res.room);
    } else {
      setFeedback(I18nService.t(locale, res.error || 'err_room_create'));
    }
  };

  const handleJoinRoom = async () => {
    const code = inputCode.trim();
    if (code.length !== 4 && code.length !== 6) {
      setFeedback(I18nService.t(locale, 'room_code_placeholder'));
      return;
    }
    setLoading(true);
    setFeedback(null);
    const res = await RoomService.joinRoom(code);
    setLoading(false);
    if (res.success && res.room) {
      onRoomConnected(res.room);
      setInputCode('');
    } else {
      setFeedback(I18nService.t(locale, res.error || 'err_room_join'));
    }
  };

  const handleCopyInvite = async () => {
    if (!currentRoom) return;
    const baseUrl =
      Platform.OS === 'web' && typeof window !== 'undefined'
        ? window.location.origin.includes('localhost')
          ? window.location.origin
          : 'https://between-us.ark-studio.app'
        : 'https://between-us.ark-studio.app';
    const shareUrl = `${baseUrl}/?room=${currentRoom.code}`;

    const inviteText = `💌 在我們之間 · 雙人連線\n房間代碼：${currentRoom.code}\n加入連結：${shareUrl}`;

    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(inviteText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } else {
      try {
        await Share.share({
          message: inviteText,
          title: '在我們之間 · 雙人連線',
          url: shareUrl,
        });
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch {
        // Ignore cancel
      }
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
            <View style={styles.titleRow}>
              <Users size={20} color={colors.clay} />
              <Text style={[styles.title, { color: colors.ink }]}>
                {I18nService.t(locale, 'room_sync_title')}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={I18nService.t(locale, 'a11y_close')}
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
            {I18nService.t(locale, 'room_sync_desc')}
          </Text>

          {/* Connected State */}
          {currentRoom ? (
            <View
              style={[
                styles.activeRoomCard,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
                  borderColor: colors.clay,
                },
              ]}
            >
              <View style={styles.activeStatusRow}>
                <View style={styles.greenPulse} />
                <Text style={[styles.activeStatusText, { color: colors.clay }]}>
                  {I18nService.t(locale, 'room_connected_status')}
                </Text>
              </View>

              <Text style={[styles.roomCodeLabel, { color: colors.muted }]}>
                {I18nService.t(locale, 'room_code_label')}
              </Text>
              <Text style={[styles.bigCodeText, { color: colors.ink }]}>
                {currentRoom.code.split('').join(' ')}
              </Text>

              {/* Copy Invite Button */}
              <Pressable
                onPress={handleCopyInvite}
                style={[styles.copyBtn, { borderColor: colors.clay }]}
              >
                {copied ? (
                  <Check size={14} color={colors.clay} />
                ) : (
                  <Copy size={14} color={colors.clay} />
                )}
                <Text style={[styles.copyBtnText, { color: colors.clay }]}>
                  {copied
                    ? I18nService.t(locale, 'room_copied_invite')
                    : I18nService.t(locale, 'room_copy_invite', '複製邀請碼與連結')}
                </Text>
              </Pressable>

              {/* Answer together (Plus) */}
              {onToggleReveal && (
                <Pressable
                  accessibilityRole="switch"
                  accessibilityState={{ checked: currentRoom.mode === 'reveal' }}
                  onPress={() => onToggleReveal(currentRoom.mode !== 'reveal')}
                  style={[styles.revealRow, { borderColor: currentRoom.mode === 'reveal' ? colors.clay : colors.line }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.revealTitle, { color: colors.ink }]}>
                      {`${isPlus ? '' : '🔒 '}${currentRoom.mode === 'reveal' ? '◉' : '○'}  ${I18nService.t(locale, 'room_reveal_toggle')}`}
                    </Text>
                    <Text style={[styles.revealDesc, { color: colors.muted }]}>{I18nService.t(locale, 'room_reveal_desc')}</Text>
                  </View>
                  {!isPlus && <Text style={[styles.revealBadge, { color: colors.clay }]}>Plus</Text>}
                </Pressable>
              )}

              {/* Leave Button */}
              <Pressable
                onPress={onLeaveRoom}
                style={[
                  styles.leaveBtn,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
                ]}
              >
                <LogOut size={14} color={colors.muted} />
                <Text style={[styles.leaveBtnText, { color: colors.muted }]}>
                  {I18nService.t(locale, 'room_leave_btn')}
                </Text>
              </Pressable>
            </View>
          ) : (
            /* Disconnected State */
            <View style={styles.actionsBox}>
              {/* Option A: Create New Room */}
              <Pressable
                onPress={handleCreateRoom}
                disabled={loading}
                style={[styles.createBtn, { backgroundColor: colors.clay }]}
              >
                <Sparkles size={16} color="#FFFFFF" />
                <Text style={styles.createBtnText}>
                  {loading
                    ? I18nService.t(locale, 'room_connecting', '連線中...')
                    : I18nService.t(locale, 'room_create_btn')}
                </Text>
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: colors.line }]} />
                <Text style={[styles.dividerText, { color: colors.muted }]}>
                  {I18nService.t(locale, 'or_divider', '或')}
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.line }]} />
              </View>

              {/* Option B: Join Existing Room */}
              <View style={styles.joinRow}>
                <TextInput
                  value={inputCode}
                  onChangeText={(val) => setInputCode(val.replace(/\D/g, '').slice(0, 6))}
                  placeholder={I18nService.t(locale, 'room_code_placeholder')}
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={[
                    styles.joinInput,
                    {
                      color: colors.ink,
                      borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
                      backgroundColor: isDark ? '#141211' : '#FFFFFF',
                    },
                  ]}
                />
                <Pressable
                  onPress={handleJoinRoom}
                  disabled={loading || (inputCode.length !== 4 && inputCode.length !== 6)}
                  style={[
                    styles.joinBtn,
                    {
                      backgroundColor:
                        inputCode.length === 4 || inputCode.length === 6 ? colors.clay : colors.card,
                      borderColor: colors.clay,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.joinBtnText,
                      { color: inputCode.length === 4 || inputCode.length === 6 ? '#FFFFFF' : colors.muted },
                    ]}
                  >
                    {I18nService.t(locale, 'room_join_btn')}
                  </Text>
                </Pressable>
              </View>

              {feedback && (
                <Text style={[styles.feedbackText, { color: colors.clay }]}>
                  {feedback}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  revealRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, padding: 12, marginTop: 14, alignSelf: 'stretch' },
  revealTitle: { fontSize: 14.5, fontWeight: '600' },
  revealDesc: { fontSize: 12, lineHeight: 17, marginTop: 3 },
  revealBadge: { fontSize: 12, fontWeight: '700', marginLeft: 8 },
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
    borderRadius: 20,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  desc: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 18,
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
  activeRoomCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 12,
  },
  activeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greenPulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  activeStatusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  roomCodeLabel: {
    fontSize: 12,
    letterSpacing: 1,
  },
  bigCodeText: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 4,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    marginTop: 8,
  },
  leaveBtnText: {
    fontSize: 12,
  },
  actionsBox: {
    gap: 14,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
  },
  joinRow: {
    flexDirection: 'row',
    gap: 10,
  },
  joinInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    letterSpacing: 2,
    textAlign: 'center',
  },
  joinBtn: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  joinBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  feedbackText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
