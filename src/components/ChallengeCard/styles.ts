import { StyleSheet } from 'react-native';
import { colors, radius } from '../../theme';

export const styles = StyleSheet.create({
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    overflow: 'visible',
  },
  challengeCardClaimed: {
    opacity: 0.7,
  },
  claimButton: {
    backgroundColor: '#F5A623',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  xpFly: {
    position: 'absolute',
    right: 16,
    top: 8,
  },
  xpFlyText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F5A623',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  challengeEmoji: {
    fontSize: 24,
  },
  challengeContent: {
    flex: 1,
    minWidth: 0,
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.foreground,
  },
  challengeDesc: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  challengeBarBg: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.muted,
    marginTop: 8,
    overflow: 'hidden',
  },
  challengeBarFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  challengeRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  doneBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  doneBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  expBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  expBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.energy,
  },
  challengeProgress: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
});
