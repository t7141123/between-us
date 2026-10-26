/**
 * HeaderBar Component containing title, subtitle, and streamlined action triggers (Room, Store, Menu).
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { Sparkles, Users, Menu } from 'lucide-react-native';
import { LocaleKey, ThemeColors } from '../types';
import { I18nService } from '../services/i18n';
import { RoomState } from '../services/room';

interface HeaderBarProps {
  locale: LocaleKey;
  colors: ThemeColors;
  isDark: boolean;
  muted?: boolean;
  isSupporter?: boolean;
  currentRoom?: RoomState | null;
  onOpenStore?: () => void;
  onOpenRoomSync?: () => void;
  onOpenMenu: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  locale,
  colors,
  isDark,
  isSupporter = false,
  currentRoom,
  onOpenStore,
  onOpenRoomSync,
  onOpenMenu,
}) => {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 600 || height < 750;

  const title = I18nService.t(locale, 'title');
  const subtitle = I18nService.t(locale, 'subtitle');

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      {/* Action icons row */}
      <View style={[styles.topRow, isMobile && styles.topRowMobile]}>
        <View style={styles.brandRow}>
          <View style={styles.brandTag}>
            <Text style={[styles.brandText, { color: colors.clay }]}>BETWEEN US</Text>
          </View>
          {isSupporter && (
            <View style={styles.supporterTag}>
              <Text style={styles.supporterTagText}>✦</Text>
            </View>
          )}
        </View>

        <View style={styles.controlsRow}>
          {/* Room Sync button */}
          {onOpenRoomSync && (
            <TouchableOpacity
              onPress={onOpenRoomSync}
              style={[
                styles.storeButton,
                currentRoom
                  ? { borderColor: '#10B981', backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5' }
                  : { borderColor: colors.line, backgroundColor: colors.card },
              ]}
              activeOpacity={0.7}
              accessibilityLabel="雙人連線同步"
            >
              <Users size={13} color={currentRoom ? '#10B981' : colors.muted} />
              <Text
                style={[
                  styles.storeButtonText,
                  { color: currentRoom ? '#10B981' : colors.muted },
                ]}
              >
                {currentRoom ? currentRoom.code : I18nService.t(locale, 'room_sync_btn', '連線')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Store / Atelier button */}
          {onOpenStore && (
            <TouchableOpacity
              onPress={onOpenStore}
              style={[
                styles.storeButton,
                { borderColor: colors.clay, backgroundColor: isDark ? 'rgba(196,112,79,0.15)' : '#FBF3EC' },
              ]}
              activeOpacity={0.7}
              accessibilityLabel="主題商店"
            >
              <Sparkles size={13} color={colors.clay} />
              <Text style={[styles.storeButtonText, { color: colors.clay }]}>
                {I18nService.t(locale, 'store_btn', '主題商店')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Hamburger Menu button */}
          <TouchableOpacity
            onPress={onOpenMenu}
            style={[styles.iconButton, { borderColor: colors.line, backgroundColor: colors.card }]}
            activeOpacity={0.7}
            accessibilityLabel="選單與設定"
          >
            <Menu size={16} color={colors.ink} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Title & Subtitle */}
      <View style={styles.titleContainer}>
        <Text
          style={[
            styles.title,
            {
              color: colors.ink,
              fontSize: isMobile ? 18 : (Platform.OS === 'web' ? 34 : 28),
              lineHeight: isMobile ? 23 : (Platform.OS === 'web' ? 40 : 34),
            },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: colors.muted,
              fontSize: isMobile ? 11 : 13,
              lineHeight: isMobile ? 15 : 20,
              marginTop: isMobile ? 2 : 6,
            },
          ]}
          numberOfLines={2}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 20 : 12,
    paddingBottom: 8,
    alignItems: 'center',
  },
  containerMobile: {
    paddingTop: Platform.OS === 'web' ? 4 : 2,
    paddingBottom: 0,
  },
  topRow: {
    width: '100%',
    maxWidth: 600,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  topRowMobile: {
    marginBottom: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  brandTag: {
    paddingVertical: 2,
    flexShrink: 0,
  },
  brandText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  supporterTag: {
    backgroundColor: '#F59E0B',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supporterTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  storeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
  },
  storeButtonText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
    width: '100%',
  },
  title: {
    fontWeight: '400',
    letterSpacing: 0.5,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 420,
  },
});
