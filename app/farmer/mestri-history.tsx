// app/farmer/mestri-history.tsx

import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList, Modal, SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";

export default function MestriHistory() {

  const { id, name, village } = useLocalSearchParams();

  const [data, setData] = useState<any[]>([]);
  const [grouped, setGrouped] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<"te" | "en">("te");
const [openCrops, setOpenCrops] = useState<any>({});
const [openWorks, setOpenWorks] = useState<any>({});
  const [deleteId, setDeleteId] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSession, setActiveSession] = useState("");

  /* ---------------- LOAD LANG ---------------- */
  useFocusEffect(
    useCallback(() => {
      const loadLang = async () => {
        const lang = await AsyncStorage.getItem("APP_LANG");
        if (lang) setLanguage(lang as any);
      };
      loadLang();
    }, [])
  );

  /* ---------------- LOAD DATA ---------------- */
  const loadData = async () => {
    const userPhone = await AsyncStorage.getItem("USER_PHONE");
    if (!userPhone) return;
if (!activeSession) return;
    setLoading(true);
const userDoc = await firestore()
  .collection("users")
  .doc(userPhone)
  .get();

const session = userDoc.data()?.activeSession;

setActiveSession(session);

if (!session) {
  setLoading(false);
  return;
}
    const snap = await firestore()
      .collection("users")
      .doc(userPhone)
      .collection("mestris")
      .doc(id as string)
      .collection("attendance")
.where("session", "==", session) // 🔥 FIX
.orderBy("createdAt", "desc")
.get();
    

    const list = snap.docs.map(d => ({
  id: d.id,
  ...(d.data() as any)
}));

    setData(list);

    // 🔥 GROUP BY CROP
    const group: any = {};

    list.forEach(item => {
      const crop = item.crop || "Others";

      if (!group[crop]) group[crop] = [];

      group[crop].push(item);
    });

    setGrouped(group);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  /* ---------------- DELETE ---------------- */
  const handleDelete = async () => {
    const userPhone = await AsyncStorage.getItem("USER_PHONE");
    if (!userPhone) return;

    await firestore()
      .collection("users")
      .doc(userPhone)
      .collection("mestris")
      .doc(id as string)
      .collection("attendance")
      .doc(deleteId)
      .delete();

    setModalVisible(false);
    loadData();
  };

  /* ---------------- SHIMMER ---------------- */
 const ShimmerCard = () => (
  <View style={styles.shimmerCard}>
    <ShimmerPlaceholder
      LinearGradient={LinearGradient}
      style={{ height: 14, width: "40%", borderRadius: 6 }}
    />
    <ShimmerPlaceholder
      LinearGradient={LinearGradient}
      style={{ height: 12, width: "60%", marginTop: 10, borderRadius: 6 }}
    />
  </View>
);
const toggleCrop = (crop: string) => {
  setOpenCrops((prev: any )=> ({
    ...prev,
    [crop]: !prev[crop]
  }));
};
const toggleWork = (key: string) => {
  setOpenWorks((prev: any) => ({
    ...prev,
    [key]: !prev[key]
  }));
};
const cropColors = ["#22C55E","#3B82F6","#F59E0B","#EF4444","#8B5CF6"];
const workColors = ["#06B6D4","#84CC16","#F97316","#6366F1","#EC4899"];

const getCropColor = (crop: string) =>
  cropColors[crop.charCodeAt(0) % cropColors.length];

const getWorkColor = (work: string) =>
  workColors[work.charCodeAt(0) % workColors.length];
 const getUsageLabel = () => {
  if (data.length > 10) {
    return language === "te" ? "ఎక్కువ" : "High";
  } else if (data.length > 5) {
    return language === "te" ? "మధ్యస్థ" : "Medium";
  } else if (data.length > 0) {
    return language === "te" ? "తక్కువ" : "Low";
  } 
   else {
    return language === "te" ? "- -" : "- -";
  }
};
  /* ---------------- UI ---------------- */
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

    <AppHeader
  title={name}
  subtitle={village ? `${village}` : ""}
  language={language}
/>
      {/* SUMMARY */}
    <View style={styles.summaryBox}>

  {/* TOTAL DAYS */}
  <View style={styles.summaryItem}>
    <AppText style={styles.summaryLabel} language={language}>
      {language === "te" ? "మొత్తం రోజులు" : "Total Days"}
    </AppText>

    <AppText style={styles.summaryValue}>
      {data.length}
    </AppText>
  </View>

  {/* DIVIDER */}
  <View style={styles.divider} />

  {/* USAGE */}
  <View style={styles.summaryItem}>
    <AppText style={styles.summaryLabel} language={language}>
      {language === "te" ? "వినియోగం" : "Usage"}
    </AppText>

   <AppText
  style={[
    styles.summaryValue,
    {
      color:
        data.length > 10
          ? "#16A34A"
          : data.length > 5
          ? "#F59E0B"
          : data.length > 0 ?  "#EF4444" : "red"
    }
  ]} language={language}
>
  {getUsageLabel()}
</AppText>
  </View>

</View>

      {/* LIST */}
      {loading ? (
        <>
          <ShimmerCard />
          <ShimmerCard />
          <ShimmerCard />
        </>
      ) : (
        <FlatList
          data={Object.keys(grouped)}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingBottom: 100 }}

        renderItem={({ item }) => {

  const cropData = grouped[item];
  const cropColor = getCropColor(item);
  const isCropOpen = openCrops[item];

  // 🔥 GROUP BY WORK
  const workGroups: any = {};

  cropData.forEach((entry: any) => {
    const work = entry.work || "Other";

    if (!workGroups[work]) workGroups[work] = [];
    workGroups[work].push(entry);
  });

  return (
    <View>

      {/* 🌾 CROP HEADER */}
      <TouchableOpacity
        style={[
          styles.cropHeader,
          { borderLeftWidth: 4, borderLeftColor: cropColor }
        ]}
        activeOpacity={0.5}
        onPress={() => toggleCrop(item)}
      >
        <View style={styles.cropLeft}>
          <AppText style={styles.cropName} language={language}>
            {item}
          </AppText>

          <AppText style={styles.cropDays} language={language}>
            {cropData.length} {language === "te" ? "రోజులు" : "days"}
          </AppText>
        </View>

        <Ionicons
          name={isCropOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color="#6B7280"
        />
      </TouchableOpacity>

      {/* 🌾 INSIDE CROP */}
      {isCropOpen && Object.keys(workGroups).map((work) => {

        const workData = workGroups[work];
        const workKey = item + "_" + work;
        const workColor = getWorkColor(work);
        const isWorkOpen = openWorks[workKey];

        return (
          <View key={work}>

            {/* 🔹 WORK HEADER */}
            <TouchableOpacity
              style={[
                styles.workHeader,
                { borderLeftWidth: 3, borderLeftColor: workColor }
              ]}
              activeOpacity={0.5}
              onPress={() => toggleWork(workKey)}
            >
              <AppText style={styles.workName} language={language}>
                {work}
              </AppText>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <AppText style={styles.workDays} language={language}>
                  {workData.length} {language === "te" ? "రోజులు" : "days"}
                </AppText>

                <Ionicons
                  name={isWorkOpen ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#6B7280"
                />
              </View>
            </TouchableOpacity>

            {/* 🧾 CARDS */}
            {isWorkOpen && workData.map((entry: any) => {

              const total =
                (entry.morning || 0) +
                (entry.evening || 0) +
                (entry.full || 0);

              return (
                <View
                  key={entry.id}
                  style={[
                    styles.card,
                    { borderColor: workColor + "30" } // 🔥 work color
                  ]}
                >

                  {/* DATE */}
                  <View style={styles.rowTop}>
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <AppText style={styles.date} language={language}>
                      {entry.date}
                    </AppText>
                  </View>

                  {/* VALUES */}
                  <View style={styles.valuesRow}>

                    <View style={styles.valueItem}>
                      <Ionicons name="sunny-outline" size={14} color="#F59E0B" />
                      <AppText style={styles.label} language={language}>
                        {language === "te" ? "ఉదయం పూట" : "Morning"}
                      </AppText>
                      <AppText style={styles.value}>
                        {entry.morning || 0}
                      </AppText>
                    </View>

                    <View style={styles.valueItem}>
                      <Ionicons name="partly-sunny-outline" size={14} color="#3B82F6" />
                      <AppText style={styles.label} language={language}>
                        {language === "te" ? "సాయంత్రం పూట" : "Evening"}
                      </AppText>
                      <AppText style={styles.value}>
                        {entry.evening || 0}
                      </AppText>
                    </View>

                    <View style={styles.valueItem}>
                      <Ionicons name="moon-outline" size={14} color="#8B5CF6" />
                      <AppText style={styles.label} language={language}>
                        {language === "te" ? "రోజంతా / పూర్తి పూట" : "Full"}
                      </AppText>
                      <AppText style={styles.value}>
                        {entry.full || 0}
                      </AppText>
                    </View>

                  </View>

                  {/* BOTTOM */}
                  <View style={styles.bottomRow}>
                    <AppText style={[styles.total, { color: workColor }]} language={language}>
                      {language === "te" ? "మొత్తం" : "Total"}: {total}
                    </AppText>
<TouchableOpacity
  onPress={() => {
    console.log("DELETE CLICK"); // debug
    setDeleteId(entry.id);
    setModalVisible(true);
  }}
  style={styles.deleteIconWrap}
  activeOpacity={0.6}
  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
>
  <Ionicons name="trash-outline" size={16} color="#DC2626" />
</TouchableOpacity>
                  </View>

                </View>
              );
            })}

          </View>
        );
      })}

    </View>
  );
}}

          ListEmptyComponent={
            <View style={styles.empty}>

  <Ionicons
    name="file-tray-outline"
    size={48}
    color="#9CA3AF"
    style={{ marginBottom: 10 }}
  />

  <AppText style={styles.emptyTitle} language={language}>
    {language === "te" ? "హాజరు లేదు" : "No attendance yet"}
  </AppText>

  <AppText style={styles.emptySub} language={language}>
    {language === "te"
      ? "కొత్త హాజరు నమోదు చేయండి"
      : "Start adding records"}
  </AppText>

</View>
          }

        />
      )}

      {/* DELETE MODAL */}
 <Modal
  visible={modalVisible}
  transparent
  animationType="fade"
  statusBarTranslucent
>

  <View style={styles.overlay}>

    <View style={styles.modalBox}>

      {/* ICON */}
      <View style={styles.iconBg}>
        <Ionicons name="warning" size={34} color="#DC2626" />
      </View>

      {/* TITLE */}
      <AppText style={styles.modalTitle} language={language}>
        {language === "te" ? "తొలగించాలా?" : "Remove Entry?"}
      </AppText>

      {/* MESSAGE */}
      <AppText style={styles.modalSub} language={language}>
        {language === "te"
          ? "ఈ హాజరు వివరాన్ని తొలగించాలా?"
          : "Are you sure you want to delete this attendance record?"}
      </AppText>

      {/* BUTTONS */}
      <View style={styles.modalBtns}>

        <TouchableOpacity
          style={[styles.cancelBtn, {flex: 1}]}
          onPress={() => setModalVisible(false)}
        >
          <AppText style={styles.cancelText} language={language}>
            {language === "te" ? "వద్దు" : "Cancel"}
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteBtn, {flex: 0.5}]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={14} color="#fff" />
          <AppText style={styles.deleteText} language={language}>
            {language === "te" ? "తొలగించు" : "Delete"}
          </AppText>
        </TouchableOpacity>

      </View>

    </View>

  </View>

</Modal>

    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({

  safe: { flex: 1, backgroundColor: "#F6F7F6" },

  summary: {
    paddingHorizontal: 20,
    marginVertical: 10
  },

  cropText: {
    fontSize: 14,
    fontWeight: "600"
  },

cropHeader: {
  marginHorizontal: 20,
  marginTop: 12,
  paddingVertical: 12,
  paddingHorizontal: 14,

  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",

  backgroundColor: "#fff",
  borderRadius: 12,

  borderWidth: 1,
  borderColor: "#E5E7EB"
},
card: {
  marginHorizontal: 20,
  marginVertical: 6,
  padding: 14,

  borderWidth: 1,
  borderRadius: 14,
  backgroundColor: "#fff",
  position: "relative"
},
shimmerCard: {
  marginHorizontal: 20,
  marginVertical: 6,
  padding: 14,

  borderRadius: 14,
  backgroundColor: "#fff",

  // ❌ NO BORDER
},
rowTop: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  marginBottom: 10
},
workHeader: {
  marginHorizontal: 28,
  marginTop: 8,
  paddingVertical: 8,
  paddingHorizontal: 10,

  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",

  backgroundColor: "#fff",
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#E5E7EB"
},

workName: {
  fontSize: 13,
  fontWeight: "600"
},
empty: {
  marginTop: 120,
  alignItems: "center",
  justifyContent: "center"
},

emptyTitle: {
  fontSize: 15,
  fontWeight: "600",
  color: "#111827"
},

emptySub: {
  fontSize: 12,
  color: "#6B7280",
  marginTop: 4
},
workDays: {
  fontSize: 11,
  color: "#6B7280"
},
date: {
  fontSize: 13,
  color: "#374151"
},
deleteBtn: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,

  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 10,
  backgroundColor: "#DC2626"
},

deleteText: {
  fontSize: 13,
  color: "#fff",
  fontWeight: "600",
  textAlign: 'center',
},

cancelText: {
  fontSize: 13,
  color: "#374151",
  fontWeight: "500",
  textAlign: 'center'
},
overlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.35)",
  justifyContent: "center",
  alignItems: "center"
},

modalBox: {
  width: "80%",
  backgroundColor: "#fff",
  borderRadius: 18,
  padding: 20,
  alignItems: "center"
},

iconBg: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: "#FEE2E2",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 10
},
deleteIconWrap: {
  padding: 8,
  borderRadius: 10,
  backgroundColor: "#FEF2F2",

  zIndex: 50,      // 🔥 FIX    // 🔥 ANDROID FIX
},
modalTitle: {
  fontSize: 16,
  fontWeight: "600",
  marginTop: 6
},

modalSub: {
  fontSize: 13,
  color: "#6B7280",
  textAlign: "center",
  marginTop: 6
},

modalBtns: {
  flexDirection: "row",
  marginTop: 18,
  gap: 12
},

cancelBtn: {
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 10,
  backgroundColor: "#F3F4F6"
},


modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.35)",
  justifyContent: "center",
  alignItems: "center"
},

modalContainer: {
  width: "82%",
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 18
},


modalMessage: {
  fontSize: 13,
  color: "#6B7280",
  marginTop: 6,
  lineHeight: 18
},

modalButtons: {
  flexDirection: "row",
  justifyContent: "flex-end",
  marginTop: 18,
  gap: 12
},



deleteBtnModal: {
  paddingVertical: 6,
  paddingHorizontal: 10
},


valuesRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 12
},

valueItem: {
  alignItems: "center"
},

label: {
  fontSize: 11,
  color: "#6B7280",
  marginTop: 2
},

value: {
  fontSize: 14,
  fontWeight: "600",
  marginTop: 2
},

bottomRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center"
},

total: {
  fontSize: 15,
  fontWeight: "600"
},

cropLeft: {
  flexDirection: "column",
  justifyContent: "center"
},

cropName: {
  fontSize: 20,
  fontWeight: "600",
  color: "#111827",
  includeFontPadding: false
},

cropDays: {
  fontSize: 12,
  color: "#6B7280",
  marginTop: 3
},


mestriBox: {
  marginHorizontal: 20,
  marginTop: 10,
  marginBottom: 6,
  alignItems: 'center'
},

mestriName: {
  fontSize: 16,
  fontWeight: "600",
  color: "#111827",
},

mestriSub: {
  fontSize: 13,
  color: "#6B7280",
  marginTop: 2
},
  modalBg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)"
  },

summaryBox: {
  marginHorizontal: 20,
  marginTop: 10,
  paddingVertical: 14,

  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",

  backgroundColor: "#ffffff",
  borderRadius: 14,

  borderWidth: 1,
  borderColor: "#E5E7EB"
},

summaryItem: {
  alignItems: "center"
},

summaryLabel: {
  fontSize: 12,
  color: "#6B7280"
},

summaryValue: {
  fontSize: 16,
  fontWeight: "600",
  marginTop: 2,
  lineHeight: 28,
  includeFontPadding: false
},

divider: {
  width: 1,
  height: 30,
  backgroundColor: "#E5E7EB"
},

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20
  }

});