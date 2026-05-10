// app/farmer/mestri-history.tsx

import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";
import AppEmptyState from "@/components/AppEmptyState"; 
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
import { opacity } from "react-native-reanimated/lib/typescript/Colors";

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

  // 🔥 NEW STATE: పేమెంట్ అయిపోయిన హాజరు ఐడీలు సేవ్ చేసుకోవడానికి
  const [paidIds, setPaidIds] = useState<string[]>([]);
  // 🔥 NEW STATE: "Already Paid" వార్నింగ్ మోడల్ కోసం
  const [showPaidWarning, setShowPaidWarning] = useState(false);

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
    // 🔥 FIX: id లేదా ఫోన్ నంబర్ లేకపోతే ముందే రిటర్న్ చేయాలి. లేదంటే Firestore ఎర్రర్ వస్తుంది.
    if (!id) return;

    const userPhone = await AsyncStorage.getItem("USER_PHONE");
    if (!userPhone) return;

    setLoading(true);

    const userDoc = await firestore()
      .collection("users")
      .doc(userPhone)
      .get();

    const session = userDoc.data()?.activeSession;

    if (!session) {
      setLoading(false);
      return;
    }

    setActiveSession(session);

    try {
      // 1️⃣ ముందుగా పేమెంట్ అయిన రికార్డ్స్ తెచ్చుకుందాం (LOGIC ADDED)
      const paymentsSnap = await firestore()
        .collection("users")
        .doc(userPhone)
        .collection("payments")
        .where("mestriId", "==", id as string)
        .where("session", "==", session)
        .get();

      let paidSet = new Set<string>();
      paymentsSnap.forEach(doc => {
         const selectedIds = doc.data().selectedAttendanceIds || [];
         selectedIds.forEach((attId: string) => paidSet.add(attId));
      });
      setPaidIds(Array.from(paidSet)); // స్టేట్ లో సేవ్ చేశాం

      // 2️⃣ ఇప్పుడు మామూలుగా హాజరు లిస్ట్ తెచ్చుకుందాం
      const snap = await firestore()
        .collection("users")
        .doc(userPhone)
        .collection("mestris")
        .doc(id as string)
        .collection("attendance")
        .where("session", "==", session)
        .where("createdAt", "!=", null)
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
    } catch (error) {
      console.log("Error loading attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
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
    loadData(); // మళ్ళీ డేటా లోడ్ చేస్తాం
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
    setOpenCrops((prev: any )=> ({ ...prev, [crop]: !prev[crop] }));
  };

  const toggleWork = (key: string) => {
    setOpenWorks((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const cropColors = ["#22C55E","#3B82F6","#F59E0B","#EF4444","#8B5CF6"];
  const workColors = ["#06B6D4","#84CC16","#F97316","#6366F1","#EC4899"];

  const getCropColor = (crop: string) => cropColors[crop.charCodeAt(0) % cropColors.length];
  const getWorkColor = (work: string) => workColors[work.charCodeAt(0) % workColors.length];

  const getUsageLabel = () => {
    if (data.length > 10) return language === "te" ? "ఎక్కువ" : "High";
    if (data.length > 5) return language === "te" ? "మధ్యస్థ" : "Medium";
    if (data.length > 0) return language === "te" ? "తక్కువ" : "Low";
    return language === "te" ? "- -" : "- -";
  };

  /* ---------------- UI ---------------- */
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <AppHeader
        title={language === "te" ? "హాజరు వివరాలు" : "Attendance Details"}
        subtitle={language === "te" ? `సీజన్: ${activeSession}` : `Season: ${activeSession}`}
        language={language}
      />

      {/* SUMMARY */}
      <View style={styles.summaryBox}>
        {/* TOTAL DAYS */}
        <View style={styles.summaryItem}>
          <AppText style={styles.summaryLabel} language={language}>
            {language === "te" ? "మొత్తం రోజులు" : "Total Days"}
          </AppText>
          <AppText style={styles.summaryValue}>{data.length}</AppText>
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
              { color: data.length > 10 ? "#16A34A" : data.length > 5 ? "#F59E0B" : data.length > 0 ? "#EF4444" : "red" }
            ]} language={language}
          >
            {getUsageLabel()}
          </AppText>
        </View>
      </View>

      {/* LIST */}
      {loading ? (
        <View style={{ paddingTop: 10 }}>
          <ShimmerCard />
          <ShimmerCard />
          <ShimmerCard />
        </View>
      ) : (
        <FlatList
          data={Object.keys(grouped)}
          keyExtractor={(item) => item}
          contentContainerStyle={[
            { paddingBottom: 100 },
            Object.keys(grouped).length === 0 && { flexGrow: 1, justifyContent: 'center' }
          ]}
          ListEmptyComponent={
            <AppEmptyState
              iconName="file-tray-outline"
              title={language === "te" ? "హాజరు లేదు" : "No Attendance Yet"}
              subtitle={language === "te" ? "కొత్త హాజరు నమోదు చేయండి" : "Start adding records"}
              language={language}
            />
          }
        // app/farmer/mestri-history.tsx లో మార్చాల్సిన RenderItem భాగం

renderItem={({ item }) => {
  const cropData = grouped[item];
  const cropColor = getCropColor(item);
  const isCropOpen = openCrops[item];

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
        style={[styles.cropHeader, { borderLeftWidth: 4, borderLeftColor: cropColor }]}
        activeOpacity={0.5}
        onPress={() => toggleCrop(item)}
      >
        <View style={styles.cropLeft}>
          <AppText style={styles.cropName} language={language}>{item}</AppText>
          <AppText style={styles.cropDays} language={language}>
            {cropData.length} {language === "te" ? "రోజులు" : "days"}
          </AppText>
        </View>
        <Ionicons name={isCropOpen ? "chevron-up" : "chevron-down"} size={18} color="#6B7280" />
      </TouchableOpacity>

      {/* 🌾 INSIDE CROP */}
      {isCropOpen && Object.keys(workGroups).map((work) => {
        const workData = workGroups[work];
        const workKey = item + "_" + work;
        const workColor = getWorkColor(work);
        const isWorkOpen = openWorks[workKey];

        return (
          <View key={work}>
            {/* 🔹 WORK HEADER (మార్పు ఇక్కడ జరిగింది బ్రో) */}
            <TouchableOpacity
              style={[styles.workHeader, { borderLeftWidth: 3, borderLeftColor: workColor }]}
              activeOpacity={0.5}
              onPress={() => toggleWork(workKey)}
            >
              {/* ఇక్కడ Left సైడ్ కి టెక్స్ట్ ని Column లో పెట్టాను */}
              <View style={{ flex: 1, flexDirection: "column" }}>
                <AppText style={styles.workName} language={language}>{work}</AppText>
                <AppText style={styles.workDaysText} language={language}>
                  {workData.length} {language === "te" ? "రోజులు" : "days"}
                </AppText>
              </View>
              
              <Ionicons name={isWorkOpen ? "chevron-up" : "chevron-down"} size={16} color="#6B7280" />
            </TouchableOpacity>

            {/* 🧾 CARDS */}
            {isWorkOpen && workData.map((entry: any) => {
              const total = (entry.morning || 0) + (entry.evening || 0) + (entry.full || 0);
              const isPaid = paidIds.includes(entry.id);

              return (
                <View key={entry.id} style={[styles.card, { borderColor: workColor + "30" }]}>
                  {/* ... మిగతా కార్డ్ కోడ్ సేమ్ ... */}
                  <View style={styles.rowTop}>
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <AppText style={styles.date} language={language}>{entry.date}</AppText>
                  </View>

                  <View style={styles.valuesRow}>
                    <View style={styles.valueItem}>
                      <Ionicons name="sunny-outline" size={14} color="#F59E0B" />
                      <AppText style={styles.label} language={language}>{language === "te" ? "ఉదయం" : "Morning"}</AppText>
                      <AppText style={styles.value}>{entry.morning || 0}</AppText>
                    </View>
                    <View style={styles.valueItem}>
                      <Ionicons name="partly-sunny-outline" size={14} color="#3B82F6" />
                      <AppText style={styles.label} language={language}>{language === "te" ? "సాయంత్రం" : "Evening"}</AppText>
                      <AppText style={styles.value}>{entry.evening || 0}</AppText>
                    </View>
                    <View style={styles.valueItem}>
                      <Ionicons name="moon-outline" size={14} color="#8B5CF6" />
                      <AppText style={styles.label} language={language}>{language === "te" ? "రోజంతా" : "Full"}</AppText>
                      <AppText style={styles.value}>{entry.full || 0}</AppText>
                    </View>
                  </View>

                  <View style={styles.bottomRow}>
                    <AppText style={[styles.total, { color: workColor }]} language={language}>
                      {language === "te" ? "మొత్తం" : "Total"}: {total}
                    </AppText>
                    
                    <TouchableOpacity
                      onPress={() => {
                        if (isPaid) {
                          setShowPaidWarning(true);
                        } else {
                          setDeleteId(entry.id);
                          setModalVisible(true);
                        }
                      }}
                      style={[styles.deleteIconWrap, isPaid && { backgroundColor: '#FEF3C7' }]}
                      activeOpacity={0.6}
                    >
                      {isPaid ? <Ionicons name="lock-closed" size={16} color="#F59E0B" /> : <Ionicons name="trash-outline" size={16} color="#DC2626" />}
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
        />
      )}

      {/* 🔴 STANDARD DELETE MODAL (For Unpaid records) */}
      <Modal visible={modalVisible} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.iconBg}>
              <Ionicons name="warning" size={34} color="#DC2626" />
            </View>
            <AppText style={styles.modalTitle} language={language}>
              {language === "te" ? "తొలగించాలా?" : "Remove Entry?"}
            </AppText>
            <AppText style={styles.modalSub} language={language}>
              {language === "te"
                ? "ఈ హాజరు వివరాన్ని తొలగించాలా?"
                : "Are you sure you want to delete this attendance record?"}
            </AppText>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.cancelBtn, {flex: 1}]} onPress={() => setModalVisible(false)}>
                <AppText style={styles.cancelText} language={language}>{language === "te" ? "వద్దు" : "Cancel"}</AppText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.deleteBtn, {flex: 0.5}]} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={14} color="#fff" />
                <AppText style={styles.deleteText} language={language}>{language === "te" ? "తొలగించు" : "Delete"}</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 🔒 ALREADY PAID WARNING MODAL (NEW) */}
      <Modal visible={showPaidWarning} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={[styles.iconBg, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="lock-closed" size={34} color="#F59E0B" />
            </View>
            <AppText style={styles.modalTitle} language={language}>
              {language === "te" ? "తొలగించడం కుదరదు" : "Cannot Delete"}
            </AppText>
            <AppText style={[styles.modalSub, { lineHeight: 22 }]} language={language}>
              {language === "te"
                ? "ఈ హాజరుకు ఇప్పటికే చెల్లింపు జరిగింది. మీరు దీన్ని తొలగించాలనుకుంటే, ముందుగా 'చెల్లింపు చరిత్ర' (Payment History) లో పేమెంట్ రికార్డును తొలగించండి."
                : "This attendance is already paid. Please delete the payment record in Payment History first before removing it here."}
            </AppText>
            <View style={styles.modalBtns}>
              <TouchableOpacity activeOpacity={0.7} style={[styles.cancelBtn, { flex: 1, backgroundColor: '#F59E0B' }]} onPress={() => setShowPaidWarning(false)}>
                <AppText  style={[styles.cancelText, { color: '#fff', fontWeight: '600' }]} language={language}>
                  {language === "te" ? "అర్థమైంది" : "Got It"}
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
  summary: { paddingHorizontal: 20, marginVertical: 10 },
  cropText: { fontSize: 14, fontWeight: "600" },
  cropHeader: { marginHorizontal: 20, marginTop: 12, paddingVertical: 12, paddingHorizontal: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  card: { marginHorizontal: 20, marginVertical: 6, padding: 14, borderWidth: 1, borderRadius: 14, backgroundColor: "#fff", position: "relative" },
  shimmerCard: { marginHorizontal: 20, marginVertical: 6, padding: 14, borderRadius: 14, backgroundColor: "#fff" },
  rowTop: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  workHeader: { 
    marginHorizontal: 28, 
    marginTop: 8, 
    paddingVertical: 10, // ప్యాడింగ్ కొంచెం పెంచాను నీట్ గా ఉండటానికి
    paddingHorizontal: 12, 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    backgroundColor: "#fff", 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: "#E5E7EB" 
  },

  workName: { 
    fontSize: 14, 
    fontWeight: "600",
    color: "#111827" 
  },

  workDaysText: { 
    fontSize: 11, 
    color: "#6B7280",
    marginTop: 2 // పేరుకి కింద గ్యాప్ కోసం
  },
  date: { fontSize: 13, color: "#374151" },
  deleteBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: "#DC2626" },
  deleteText: { fontSize: 13, color: "#fff", fontWeight: "600", textAlign: 'center' },
  cancelText: { fontSize: 13, color: "#374151", fontWeight: "500", textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center" },
  modalBox: { width: "80%", backgroundColor: "#fff", borderRadius: 18, padding: 20, alignItems: "center" },
  iconBg: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#FEE2E2", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  deleteIconWrap: { padding: 8, borderRadius: 10, backgroundColor: "#FEF2F2", zIndex: 50 },
  modalTitle: { fontSize: 16, fontWeight: "600", marginTop: 6, color: '#111827' },
  modalSub: { fontSize: 13, color: "#6B7280", textAlign: "center", marginTop: 8 },
  modalBtns: { flexDirection: "row", marginTop: 22, gap: 12 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: "#F3F4F6", justifyContent: 'center', alignItems: 'center' },
  valuesRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  valueItem: { alignItems: "center" },
  label: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  value: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  total: { fontSize: 15, fontWeight: "600" },
  cropLeft: { flexDirection: "column", justifyContent: "center" },
  cropName: { fontSize: 20, fontWeight: "600", color: "#111827", includeFontPadding: false },
  cropDays: { fontSize: 12, color: "#6B7280", marginTop: 3 },
  summaryBox: { marginHorizontal: 20, marginTop: 10, paddingVertical: 14, flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "#ffffff", borderRadius: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  summaryItem: { alignItems: "center" },
  summaryLabel: { fontSize: 12, color: "#6B7280" },
  summaryValue: { fontSize: 16, fontWeight: "600", marginTop: 2, lineHeight: 28, includeFontPadding: false },
  divider: { width: 1, height: 30, backgroundColor: "#E5E7EB" },
});