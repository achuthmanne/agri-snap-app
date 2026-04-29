import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import AppText from "./AppText";

export default function AppHeader({ title, subtitle, language, onDownload }: any) {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#1B5E20", "#2E7D32"]}
      style={styles.header}
    >
      {/* TOP ROW */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>

        <AppText style={styles.title} language={language}>
          {title}
        </AppText>

        {/* 📥 DOWNLOAD BUTTON - SAME AS BACK BUTTON STYLE */}
        {onDownload ? (
          <TouchableOpacity onPress={onDownload} style={styles.iconBtn}>
            <Ionicons name="cloud-download-outline" size={20} color="white" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} /> // Space maintainer
        )}
      </View>

      {/* SUBTITLE CENTER */}
      {subtitle && (
        <AppText style={styles.subtitle} language={language}>
          {subtitle}
        </AppText>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)", // నీ పాత స్టైల్ నే వాడాను బ్రో
    justifyContent: "center",
    alignItems: "center"
  },

  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    flex: 1
  },

  subtitle: {
    marginTop: 4,
    textAlign: "center",
    color: "rgba(255,255,255,0.8)",
    fontSize: 12
  }
});