import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Send } from 'lucide-react-native';
import { colors } from '../../styles/colors';
import type { Message } from '../../types/chat';
import { mockResponses } from '../../mocks/aiResponses';
import { styles } from './styles';

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: Date.now(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const key = Object.keys(mockResponses).find(
        (k) => k !== 'default' && text.toLowerCase().includes(k),
      );
      const reply = key ? mockResponses[key] : mockResponses.default;
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'assistant', content: reply },
      ]);
    }, 800);
  };

  if (messages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCenterContent}>
          <Text style={styles.emptyTitle}>
            Olá Pedro! Como posso te ajudar hoje?
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
          <ChatInput input={input} setInput={setInput} onSend={send} />
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
      />
      <ChatInput input={input} setInput={setInput} onSend={send} />
    </View>
  );
};

const ChatInput = ({
  input,
  setInput,
  onSend,
}: {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
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
    />
    <TouchableOpacity onPress={onSend} style={styles.sendButton} activeOpacity={0.7}>
      <Send size={18} color={colors.primaryForeground} />
    </TouchableOpacity>
  </View>
);

export default AIChat;
