
import { useLanguage } from "@/context/LanguageContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function AI() {
 
    const { language } = useLanguage();
  const features = [
    {
      id: "1",
      title: language === "te" ? "AI చాట్" : "AI Chat",
      subtitle:
        language === "te"
          ? "త్వరలో వస్తుంది"
          : "Coming Soon",
      icon: "sparkles-outline",
      disabled: true,
    },
    {
      id: "2",
      title: language === "te" ? "AI పంట సలహాలు" : "AI Crop Tips",
      subtitle:
        language === "te"
          ? "త్వరలో వస్తుంది"
          : "Coming Soon",
      icon: "leaf-outline",
      disabled: true,
    },
    {
      id: "3",
      title: language === "te" ? "AI వాతావరణ విశ్లేషణ" : "AI Weather Analysis",
      subtitle:
        language === "te"
          ? "త్వరలో వస్తుంది"
          : "Coming Soon",
      icon: "cloud-outline",
      disabled: true,
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={["#1B5E20", "#2E7D32"]}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <Ionicons name="sparkles" size={28} color="#fff" />

          <Text style={styles.headerTitle}>
            {language === "te" ? "AI అసిస్టెంట్" : "AI Assistant"}
          </Text>
        </View>

        <Text style={styles.headerSub}>
          {language === "te"
            ? "స్మార్ట్ AI ఫీచర్లు త్వరలో అందుబాటులోకి వస్తాయి"
            : "Smart AI features will be available soon"}
        </Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {features.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            style={styles.card}
            disabled={item.disabled}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name={item.icon as any}
                size={26}
                color="#1B5E20"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>

              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </View>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {language === "te" ? "త్వరలో" : "Soon"}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F6F7F6",
  },

  header: {
    paddingTop: 70,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },

  headerSub: {
    color: "rgba(255,255,255,0.85)",
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
  },

  card: {
    marginHorizontal: 20,
    marginTop: 18,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  cardSubtitle: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 13,
  },

  badge: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },

  badgeText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "700",
  },
});
