import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from "react-native";
import { Send } from "lucide-react-native";
import { colors, radius } from "../theme";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const mockResponses: Record<string, string> = {
  default:
    "Ótima pergunta! Posso te ajudar com isso. O que mais você gostaria de saber sobre nutrição?",
  "alimentação equilibrada":
    "Uma alimentação equilibrada é aquela que oferece ao corpo todos os nutrientes necessários para funcionar bem. Isso significa variar os alimentos e incluir diferentes grupos alimentares — como frutas, verduras, legumes, proteínas, cereais e gorduras saudáveis — nas quantidades adequadas. Consumir apenas um tipo de alimento, exagerar em um único grupo ou excluir completamente nutrientes importantes pode causar deficiências e prejudicar a saúde ao longo do tempo.",
};

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: Date.now(), role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");

    setTimeout(() => {
      const key = Object.keys(mockResponses).find(
        (k) => k !== "default" && text.toLowerCase().includes(k),
      );
      const reply = key ? mockResponses[key] : mockResponses.default;
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "assistant", content: reply },
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
              source={require("../../assets/images/broccoli-mascot.png")}
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
              m.role === "user" ? styles.userRow : styles.assistantRow,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                m.role === "user" ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  m.role === "user" ? styles.userText : styles.assistantText,
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
    <TouchableOpacity
      onPress={onSend}
      style={styles.sendButton}
      activeOpacity={0.7}
    >
      <Send size={18} color={colors.primaryForeground} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  /* Empty state */
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyCenterContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.foreground,
    marginBottom: 24,
    textAlign: "center",
  },
  mascotCircle: {
    width: 224,
    height: 224,
    borderRadius: 112,
    backgroundColor: "#2b6646",
    alignItems: "center",
    justifyContent: "center",
  },
  mascotImage: {
    width: 188,
    height: 188,
  },
  inputContainer: {
    width: "100%",
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
    overflow: "hidden",
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
    alignItems: "flex-end",
  },
  assistantRow: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
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
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AIChat;
