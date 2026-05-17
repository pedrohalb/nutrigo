import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Send } from 'lucide-react-native';
import { colors } from '../../styles/colors';
import type { Message } from '../../types/chat';
import { styles } from './styles';
import { chatApi } from '../../services/api/chat';

interface AIChatProps {
  unitId: string;
}

const AIChat = ({ unitId }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    chatApi.getMessages(unitId).then(({ messages: msgs }) => {
      setMessages(msgs);
    }).catch(() => {});
  }, [unitId]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const tempUserMsg: Message = { id: Date.now(), role: 'user', content: text };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInput('');
    setSending(true);

    try {
      const { userMessage, assistantMessage } = await chatApi.sendMessage(unitId, text);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        userMessage,
        assistantMessage,
      ]);
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setSending(false);
    }
  };

  if (messages.length === 0 && !sending) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCenterContent}>
          <Text style={styles.emptyTitle}>
            Como posso te ajudar hoje?
          </Text>
          <View style={styles.mascotCircle}>
            <Image
              source={require('../../../assets/images/broccoli-mascot.png')}
              style={styles.mascotImage}
              resizeMode="contain"
            />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <ChatInput input={input} setInput={setInput} onSend={send} sending={sending} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.chatContainer}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        renderItem={({ item: m }) => (
          <View
            style={[
              styles.messageBubbleRow,
              m.role === 'user' ? styles.userRow : styles.assistantRow,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                m.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  m.role === 'user' ? styles.userText : styles.assistantText,
                ]}
              >
                {m.content}
              </Text>
            </View>
          </View>
        )}
        ListFooterComponent={
          sending ? (
            <View style={[styles.messageBubbleRow, styles.assistantRow]}>
              <View style={[styles.messageBubble, styles.assistantBubble]}>
                <ActivityIndicator size="small" color={colors.mutedForeground} />
              </View>
            </View>
          ) : null
        }
      />
      <ChatInput input={input} setInput={setInput} onSend={send} sending={sending} />
    </View>
  );
};

const ChatInput = ({
  input,
  setInput,
  onSend,
  sending,
}: {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  sending: boolean;
}) => (
  <View style={styles.inputRow}>
    <TextInput
      value={input}
      onChangeText={setInput}
      onSubmitEditing={onSend}
      returnKeyType="send"
      placeholder="Pergunte algo ..."
      placeholderTextColor={colors.mutedForeground}
      style={styles.textInput}
      editable={!sending}
    />
    <TouchableOpacity
      onPress={onSend}
      style={[styles.sendButton, sending && { opacity: 0.5 }]}
      activeOpacity={0.7}
      disabled={sending}
    >
      <Send size={18} color={colors.primaryForeground} />
    </TouchableOpacity>
  </View>
);

export default AIChat;
