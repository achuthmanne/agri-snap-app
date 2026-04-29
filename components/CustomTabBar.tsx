import AppText from "@/components/AppText";
import { LinearGradient } from "expo-linear-gradient";
import {
  MaterialIcons,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

const { width } = Dimensions.get("window");

export default function CustomTabBar({ state, navigation, language }: any) {

  const TabItem = ({ icon, label, isFocused, onPress }: any) => {
    return (
      <TouchableOpacity onPress={onPress} style={styles.tabItem} activeOpacity={0.85}>

        <View style={styles.iconWrapper}>
          {icon}
        </View>

        <AppText
          style={[
            styles.label,
            { color: isFocused ? "#14532D" : "#9CA3AF" }
          ]}
          language={language}
        >
          {label}
        </AppText>

      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>

        {/* HOME */}
        <TabItem
          icon={
            <MaterialIcons
              name="home-filled"
              size={22}
              color={state.index === 0 ? "#14532D" : "#9CA3AF"}
            />
          }
          label={language === "te" ? "హోమ్" : "Home"}
          isFocused={state.index === 0}
          onPress={() => navigation.navigate("index")}
        />

        {/* ATTENDANCE */}
        <TabItem
          icon={
            <MaterialIcons
              name="event-available"
              size={22}
              color={state.index === 1 ? "#14532D" : "#9CA3AF"}
            />
          }
          label={language === "te" ? "హాజరు" : "Attendance"}
          isFocused={state.index === 1}
          onPress={() => navigation.navigate("attendance-history")}
        />

      {/* 🔥 AI BUTTON (CENTER) - FUTURISTIC VERSION */}
<TouchableOpacity
  activeOpacity={0.8}
  onPress={() => navigation.navigate("ai")}
  style={styles.aiWrapper}
>
  <LinearGradient
    // Deep Forest Green nundi Neon Lime ki gradient - Real AI energy!
   colors={["#065F46", "#10B981", "#6EE7B7"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.aiButton}
  >
    <View style={styles.iconContainer}>
      {/* Main Center Icon */}
      <MaterialCommunityIcons name="leaf" size={26} color="#fff" />

      {/* Floating Sparkles (More Dynamic) */}
      <MaterialCommunityIcons
        name="star-four-points"
        size={12}
        color="#fff"
        style={{ position: "absolute", top: -3, left: -2, opacity: 0.9 }}
      />
      
      <MaterialCommunityIcons
        name="star-four-points"
        size={8}
        color="rgba(255, 255, 255, 0.7)"
        style={{ position: "absolute", bottom: 3,right: -2 }}
      />

      {/* Outer Halo/Ring effect (View mathrame) */}
      <View style={styles.iconHalo} />
    </View>
  </LinearGradient>

  <AppText style={styles.aiLabel} language={language}>
    {language === "te" ? "ఏఐ" : "AI"}
  </AppText>
</TouchableOpacity>

        {/* PAYMENTS (₹ icon) */}
        <TabItem
          icon={
            <MaterialCommunityIcons
              name="currency-inr"
              size={22}
              color={state.index === 2 ? "#14532D" : "#9CA3AF"}
            />
          }
          label={language === "te" ? "పేమెంట్స్" : "Payments"}
          isFocused={state.index === 2}
          onPress={() => navigation.navigate("history")}
        />

        {/* PROFILE */}
        <TabItem
          icon={
            <MaterialIcons
              name="person"
              size={22}
              color={state.index === 3 ? "#14532D" : "#9CA3AF"}
            />
          }
          label={language === "te" ? "ప్రొఫైల్" : "Profile"}
          isFocused={state.index === 3}
          onPress={() => navigation.navigate("profile")}
        />

      </View>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({

  container: {
    position: "absolute",
    bottom: 12,
    width: "100%",
    alignItems: "center"
  },

  navbar: {
    flexDirection: "row",
    height: 70,
    width: width - 20,

    backgroundColor: "#fff",
    borderRadius: 22,

    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,

    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 6
  },

  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },

  iconWrapper: {
    padding: 6
  },

  label: {
    fontSize: 11,
    marginTop: 2
  },
  aiWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    // Button ni konchem paiki lift chesthe Floating feel vasthundi
    marginTop: -10, 
  },
  aiButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    // Glow Effect
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    // Border for depth
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconHalo: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  aiLabel: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '600',
    color: '#059669', // Darker green for text readability
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  

});