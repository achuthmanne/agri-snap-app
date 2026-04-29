import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity, View } from "react-native";
import AppText from "./AppText";

export default function EmptyState({
  type = "sales",
  language = "en",
  onAdd
}: any) {

  const isSales = type === "sales";

  const title = isSales
    ? (language === "te" ? "అమ్మకాలు లేవు" : "No Sales Yet")
    : (language === "te" ? "ఖర్చులు లేవు" : "No Expenses Yet");

  const sub = isSales
    ? (language === "te"
        ? "మీ మొదటి అమ్మకాన్ని నమోదు చేయండి"
        : "Start by adding your first sale")
    : (language === "te"
        ? "మీ ఖర్చులను నమోదు చేయండి"
        : "Track your expenses easily");

  const btn = isSales
    ? (language === "te" ? "అమ్మకం జోడించండి" : "Add Sale")
    : (language === "te" ? "ఖర్చు జోడించండి" : "Add Expense");

 const colors = isSales
  ? ["#16A34A", "#166534"] as const
  : ["#DC2626", "#7F1D1D"] as const;
  return (
    <View style={{ marginTop: 120, alignItems: "center", paddingHorizontal: 20 }}>

      {/* ICON */}
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: "#F3F4F6",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Ionicons
          name={isSales ? "cash-outline" : "wallet-outline"}
          size={36}
          color={isSales ? "#16A34A" : "#DC2626"}
        />
      </View>

      {/* TITLE */}
      <AppText style={{ marginTop: 16, fontSize: 16, fontWeight: "600" }} language={language}>
        {title}
      </AppText>

      {/* SUB */}
      <AppText
        style={{ marginTop: 6, fontSize: 13, color: "#6B7280", textAlign: "center" }}
        language={language}
      >
        {sub}
      </AppText>

      {/* BUTTON */}
      <TouchableOpacity onPress={onAdd} style={{ marginTop: 20 }}>
        <LinearGradient
          colors={colors}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 6
          }}
        >
          <Ionicons name="add" size={16} color="#fff" />
          <AppText style={{ color: "#fff", fontWeight: "600" }} language={language}>
            {btn}
          </AppText>
        </LinearGradient>
      </TouchableOpacity>

    </View>
  );
}