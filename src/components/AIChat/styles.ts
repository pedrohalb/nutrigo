import { StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';
import { radius } from '../../styles/spacing';

export const styles = StyleSheet.create({
  /* Empty state */
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyCenterContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 24,
    textAlign: 'center',
  },
  mascotCircle: {
    width: 224,
    height: 224,
    borderRadius: 112,
    backgroundColor: '#2b6646',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotImage: {
    width: 188,
    height: 188,
  },
  inputContainer: {
    width: '100%',
    paddingTop: 12,
    paddingBottom: 12,
  },
  /* Chat */
  chatContainer: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  messageList: {
    paddingVertical: 12,
    gap: 12,
  },
  messageBubbleRow: {
    paddingHorizontal: 4,
  },
  userRow: {
    alignItems: 'flex-end',
  },
  assistantRow: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: colors.primaryForeground,
  },
  assistantText: {
    color: colors.foreground,
  },
  /* Input */
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
  },
  textInput: {
    flex: 1,
    borderRadius: radius.full,
    backgroundColor: colors.muted,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.foreground,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
