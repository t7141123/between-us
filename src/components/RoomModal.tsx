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
    const res = await RoomService.createRoom(currentCategory, currentQuestionText);
    setLoading(false);
    if (res.success && res.room) {
      onRoomConnected(res.room);
    } else {
      setFeedback(res.error || '建立房間失敗，請稍後再試');
    }
  };

  const handleJoinRoom = async () => {
    const code = inputCode.trim();
    if (code.length !== 4) {
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
      setFeedback(res.error || '加入房間失敗，請確認代碼');
    }
  };

  const handleCopyInvite = async () => {
    if (!currentRoom) return;
    const shareUrl =
      Platform.OS === 'web' && typeof window !== 'undefined'
        ? `${window.location.origin}/?room=${currentRoom.code}`
        : currentRoom.code;

    const inviteText = `💌 在我們之間 · 雙人連線\n房間代碼：${currentRoom.code}\n加入連結：${shareUrl}`;

    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(inviteText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
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
                    : '複製邀請碼與連結'}
                </Text>
              </Pressable>

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
                    ? '連線中...'
                    : I18nService.t(locale, 'room_create_btn')}
                </Text>
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: colors.line }]} />
                <Text style={[styles.dividerText, { color: colors.muted }]}>或</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.line }]} />
              </View>

              {/* Option B: Join Existing Room */}
              <View style={styles.joinRow}>
                <TextInput
                  value={inputCode}
                  onChangeText={(val) => setInputCode(val.replace(/\D/g, '').slice(0, 4))}
                  placeholder={I18nService.t(locale, 'room_code_placeholder')}
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                  maxLength={4}
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
                  disabled={loading || inputCode.length !== 4}
                  style={[
                    styles.joinBtn,
                    {
                      backgroundColor:
                        inputCode.length === 4 ? colors.clay : colors.card,
                      borderColor: colors.clay,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.joinBtnText,
                      { color: inputCode.length === 4 ? '#FFFFFF' : colors.muted },
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
