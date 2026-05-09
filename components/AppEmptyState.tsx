import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "./AppText"; // నీ AppText పాత్ ని బట్టి మార్చుకో

interface AppEmptyStateProps {
  iconName: any;
  title: string;
  subtitle?: string;
  onRetry?: () => void;
  retryText?: string;
  language?: "te" | "en";
  marginTop?: number;
}

export default function AppEmptyState({
  iconName,
  title,
  subtitle,
  onRetry,
  retryText,
  language = "te",
  marginTop = 0,
}: AppEmptyStateProps) {
  return (
    <View style={[styles.container, { marginTop }]}>
      {/* రౌండ్ ఐకాన్ బ్యాక్ గ్రౌండ్ */}
      <View style={styles.iconBg}>
        <Ionicons name={iconName} size={45} color="#9CA3AF" />
      </View>

      {/* మెయిన్ టైటిల్ */}
      <AppText style={styles.title} language={language}>
        {title}
      </AppText>

      {/* సబ్ టైటిల్ (ఉంటేనే చూపిస్తుంది) */}
      {subtitle && (
        <AppText style={styles.subtitle} language={language}>
          {subtitle}
        </AppText>
      )}

      {/* Retry బటన్ (onRetry ఫంక్షన్ పాస్ చేస్తేనే వస్తుంది) */}
      {onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
          <AppText style={styles.retryText} language={language}>
            {retryText || (language === "te" ? "మళ్ళీ ప్రయత్నించండి" : "Try Again")}
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    minHeight: 250, // FlatList లోపల కరెక్ట్ గా కనపడటానికి
  },
  iconBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 10,
  },
  retryBtn: {
    backgroundColor: "#2E7D32", // నీ weather screen లో ఉన్న సేమ్ బటన్ కలర్
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 15,
  },
  retryText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
});