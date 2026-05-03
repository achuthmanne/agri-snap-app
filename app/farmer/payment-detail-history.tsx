//payment detailed history screen
import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import { LayoutAnimation, Platform, UIManager } from "react-native";
import {
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function PaymentDetailHistory() {
  const { mestriId, name, village } = useLocalSearchParams();

  const [grouped, setGrouped] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<"te" | "en">("te");
  const [openCrops, setOpenCrops] = useState<any>({});
  const [openWorks, setOpenWorks] = useState<any>({});
  const [deleteId, setDeleteId] = useState("");
  const [summary, setSummary] = useState({ payments: 0, days: 0, paidDays: 0 });
  const [status, setStatus] = useState({ label: "", color: "#000" });
  const [modalVisible, setModalVisible] = useState(false);
const [dateMap, setDateMap] = useState<any>({});
  const cropColors = ["#22C55E", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];
  const workColors = ["#06B6D4", "#84CC16", "#F97316", "#6366F1", "#EC4899"];

  const getCropColor = (crop: string) => cropColors[crop.charCodeAt(0) % cropColors.length];
  const getWorkColor = (work: string) => workColors[work.charCodeAt(0) % workColors.length];
useEffect(() => {
  if (Platform.OS === "android") {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
  }
}, []);
  const loadData = async () => {
    const phone = await AsyncStorage.getItem("USER_PHONE");
    if (!phone) return;
    setLoading(true);

    try {
      const userDoc = await firestore()
  .collection("users")
  .doc(phone)
  .get();

const activeSession = userDoc.data()?.activeSession;
if (!activeSession) return;
      const snap = await firestore()
        .collection("users")
        .doc(phone)
        .collection("payments")
.where("mestriId", "==", mestriId)
.where("session", "==", activeSession) // 🔥 MUST ADD
.get();

      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
if (!list.length) {
  setGrouped({});
  setSummary({ payments: 0, days: 0, paidDays: 0 }); // 🔥 add
  setStatus({ label: "Not Paid", color: "#EF4444" }); // 🔥 add
  return;
}
      const attendanceSnap = await firestore()
        .collection("users")
        .doc(phone)
        .collection("mestris")
        .doc(mestriId as string)
        .collection("attendance")
.where("session", "==", activeSession) // 🔥 ADD
.get();

      const totalDays = attendanceSnap.size;
      let totalPayments = 0;
      let paidDays = 0;

      list.forEach((item) => {
        totalPayments += 1;
        paidDays += item.details?.totalDays || 0;
      });

      let newStatus;
      if (paidDays === 0) newStatus = { label: "Not Paid", color: "#EF4444" };
      else if (paidDays < totalDays) newStatus = { label: "Pending", color: "#F59E0B" };
      else newStatus = { label: "Cleared", color: "#22C55E" };

      setSummary({ payments: totalPayments, days: totalDays, paidDays: paidDays });
      setStatus(newStatus);
const promises = list.map(async (item) => {
  const ids = item.selectedAttendanceIds || [];
  if (ids.length === 0) return null;

  const docPromises = ids.map((attId: string) =>
    firestore()
      .collection("users")
      .doc(phone)
      .collection("mestris")
      .doc(mestriId as string)
      .collection("attendance")
      .doc(attId)
      .get()
  );

  const docs = await Promise.all(docPromises);

  const dates = docs
    .map((d) => d.data()?.date)
    .filter(Boolean)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return { id: item.id, dates };
});

const results = (await Promise.all(promises)).filter(Boolean);

const finalMap: any = {};
results.forEach((r: any) => {
  finalMap[r.id] = r.dates;
});

setDateMap(finalMap);
      const group: any = {};
      list.forEach((item) => {
        const crop = item.crop || "Others";
        const work = item.work || "Other";
        if (!group[crop]) group[crop] = {};
        if (!group[crop][work]) group[crop][work] = [];
        group[crop][work].push(item);
      });
      setGrouped(group);
    } catch (e) {
      console.log(e);
   } finally {
  setLoading(false); // 🔥 MUST
}
  };

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("APP_LANG").then((l) => {
        if (l) setLanguage(l as any);
      });
      loadData();
    }, [])
  );

  const toggleCrop = (crop: string) => setOpenCrops((p: any) => ({ ...p, [crop]: !p[crop] }));
  const toggleWork = (key: string) => setOpenWorks((p: any) => ({ ...p, [key]: !p[key] }));

const handleDelete = async () => {
  const phone = await AsyncStorage.getItem("USER_PHONE");
  if (!phone) return;

  try {
    const userDoc = await firestore()
      .collection("users")
      .doc(phone)
      .get();

    const activeSession = userDoc.data()?.activeSession;
    if (!activeSession) return;

    const docRef = firestore()
      .collection("users")
      .doc(phone)
      .collection("payments")
      .doc(deleteId);

    const doc = await docRef.get();

    const data = doc.data();

    if (data?.session !== activeSession) return;

    // 🔥 INSTANT SUMMARY UPDATE
    setSummary((prev) => ({
      payments: prev.payments - 1,
      days: prev.days,
      paidDays: prev.paidDays - (data?.details?.totalDays || 0),
    }));

    // 🔥 REMOVE FROM UI (GROUPED)
    setGrouped((prev: any) => {
      const newGroup = { ...prev };

      Object.keys(newGroup).forEach((crop) => {
        Object.keys(newGroup[crop]).forEach((work) => {
          newGroup[crop][work] = newGroup[crop][work].filter(
            (item: any) => item.id !== deleteId
          );

          // empty cleanup
          if (newGroup[crop][work].length === 0) {
            delete newGroup[crop][work];
          }
        });

        if (Object.keys(newGroup[crop]).length === 0) {
          delete newGroup[crop];
        }
      });

      return newGroup;
    });

    await docRef.delete();

    setModalVisible(false);

    // 🔥 OPTIONAL: background refresh
    loadData();

  } catch (e) {
    console.log(e);
  }
};
  const getStatusText = (label: string) => {
    if (language === "te") {
      if (label === "Cleared") return "చెల్లింపు పూర్తి";
      if (label === "Pending") return "చెల్లింపు పెండింగ్";
      return "చెల్లించలేదు";
    }
    return label;
  };

const Shimmer = (props: any) => (
  <ShimmerPlaceHolder
    LinearGradient={LinearGradient}
    shimmerColors={["#E5E7EB", "#F3F4F6", "#E5E7EB"]}
    style={{ borderRadius: 6, ...props.style }}
  />
);
if (loading) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <AppHeader
        title={language === "te" ? "చెల్లింపు చరిత్ర" : "Payment Details"}
        subtitle={language === "te" ? "పని వివరాలు" : "Work History"}
        language={language}
      />

      <View style={styles.dashboard}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.box}>
            <Shimmer style={{ width: 60, height: 12, marginBottom: 6 }} />
            <Shimmer style={{ width: 40, height: 16 }} />
          </View>
        ))}
      </View>

      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.shimmerCard}>
          <Shimmer style={{ width: "40%", height: 16, marginBottom: 10 }} />
          <Shimmer style={{ width: "80%", height: 12, marginBottom: 6 }} />
          <Shimmer style={{ width: "60%", height: 12 }} />
        </View>
      ))}
    </SafeAreaView>
  );
}


  return (
    
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
     <AppHeader
  title={language === "te" ? "చెల్లింపు చరిత్ర" : "Payment Details"}
  subtitle={language === "te" ? "పని వివరాలు" : "Work History"}
  language={language}
/>


      <View style={styles.dashboard}>
        <View style={styles.box}>
          <AppText style={styles.label} language={language}>{language === "te" ? "చెల్లింపులు" : "Payments"}</AppText>
          <AppText style={styles.value}>
   {summary.payments}
</AppText>
        </View>
        <View style={styles.dividerVertical} />
        <View style={styles.box}>
          <AppText style={styles.label} language={language}>{language === "te" ? "రోజులు" : "Days"}</AppText>
         <AppText style={styles.value}>
  {`${summary.paidDays} / ${summary.days}`}
</AppText>
        </View>
        <View style={styles.dividerVertical} />
        <View style={styles.box}>
          <AppText style={styles.label} language={language}>{language === "te" ? "స్థితి" : "Status"}</AppText>
          <AppText
  style={[
    styles.value,
    { color: loading ? "#9CA3AF" : status.color }
  ]}
  language={language}
>
  {getStatusText(status.label)}
</AppText>
        </View>
      </View>

      <FlatList
        data={Object.keys(grouped)}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingBottom: 100 }}
      ListEmptyComponent={
  loading ? null : (
    <View style={styles.empty}>
      <Ionicons name="wallet-outline" size={60} color="#9CA3AF" />
      <AppText style={styles.emptyTitle} language={language}>
        {language === "te" ? "చెల్లింపులు లేవు" : "No Payments"}
      </AppText>
    </View>
  )
}
        renderItem={({ item: crop }) => {
          const cropData = grouped[crop];
          const isCropOpen = openCrops[crop];
          const workCount = Object.keys(cropData).length;

          return (
            <View>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.cropHeader, { borderLeftWidth: 4, borderLeftColor: getCropColor(crop) }]}
                onPress={() => toggleCrop(crop)}
              >
                <View>
                  <AppText style={styles.cropName} language={language}>{crop}</AppText>
                  <AppText style={styles.cropSub} language={language}>
                    {language === "te" ? `${workCount} ${workCount === 1 ? "పని" : "పనులు"}` : `${workCount} ${workCount === 1 ? "work" : "works"}`}
                  </AppText>
                </View>
                <Ionicons name={isCropOpen ? "chevron-up" : "chevron-down"} size={20} />
              </TouchableOpacity>

              {isCropOpen && Object.keys(cropData).map((work) => {
                const workData = cropData[work];
                const key = `${crop}_${work}`;
                const isWorkOpen = openWorks[key];
                const workColor = getWorkColor(work);

                return (
                  <View key={work}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.workHeader, { borderLeftWidth: 3, borderLeftColor: workColor }]}
                      onPress={() => toggleWork(key)}
                    >
                      <View>
                        <AppText style={styles.workName} language={language}>{work}</AppText>
                        <AppText style={styles.workSub} language={language}>
                          {language === "te" ? `${workData.length} చెల్లింపులు` : `${workData.length} ${workData.length === 1 ? "payment" : "payments"}`}
                        </AppText>
                      </View>
                      <Ionicons name={isWorkOpen ? "chevron-up" : "chevron-down"} size={18} />
                    </TouchableOpacity>

                  {isWorkOpen && workData.map((entry: any) => {
  const dateObj = entry.createdAt?.toDate();
  const dates = dateMap[entry.id] || [];

const fromDate = dates[0];
const toDate = dates[dates.length - 1];
  // Telugu Labels Map
  const labels = {
    morning: language === "te" ? "ఉదయం" : "Morning",
    evening: language === "te" ? "సాయంత్రం" : "Evening",
    full: language === "te" ? "పూర్తి రోజు" : "Full Day",
    days: language === "te" ? "రోజులు" : "Days",
    workers: language === "te" ? "కూలీలు" : "Workers",
    amount: language === "te" ? "మొత్తం నగదు" : "Total Amount"
  };

  return (
    <View key={entry.id} style={[styles.card, { borderLeftWidth: 4, borderLeftColor: workColor, borderColor: workColor + "30" }]}>
      
      {/* TOP ROW: DATE & MODE */}
      <View style={styles.topRow}>
        <View style={styles.dateBox}>
          <Ionicons name="calendar-outline" size={14} color={workColor} />
          <AppText style={styles.dateText} language={language}>{dateObj?.toLocaleDateString("en-GB")}</AppText>
          <Ionicons name="time-outline" size={14} color={workColor} style={{ marginLeft: 10 }} />
          <AppText style={styles.dateText} language={language}>{dateObj?.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</AppText>
        </View>
        <View style={styles.modeBox}>
          <Ionicons name="wallet-outline" size={14} color={workColor} />
          <AppText style={styles.modeText} language={language}>{entry.paymentMode}</AppText>
        </View>
      </View>

      <View style={styles.divider} />
{dates.length > 0 && (
  <View style={{ marginTop: 6 }}>
    <AppText style={{ fontSize: 12, color: "#6B7280",textAlign:'center' }} language={language}>
      {fromDate} → {toDate}
    </AppText>
  </View>
)}
      {/* ☀️ MORNING */}
      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Ionicons name="sunny-outline" size={14} color="#F59E0B" />
          <AppText style={styles.label} language={language}>{labels.morning}</AppText>
        </View>
        <AppText style={styles.valueText} language={language}>
          {entry.details.morning} × ₹{entry.details.mRate} = ₹{entry.details.morning * entry.details.mRate}
        </AppText>
      </View>

      {/* 🌆 EVENING */}
      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Ionicons name="partly-sunny-outline" size={14} color="#6366F1" />
          <AppText style={styles.label} language={language}>{labels.evening}</AppText>
        </View>
        <AppText style={styles.valueText} language={language}>
          {entry.details.evening} × ₹{entry.details.eRate} = ₹{entry.details.evening * entry.details.eRate}
        </AppText>
      </View>

      {/* 🌕 FULL DAY */}
      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Ionicons name="moon-outline" size={14} color="#10B981" />
          <AppText style={styles.label} language={language}>{labels.full}</AppText>
        </View>
        <AppText style={styles.valueText} language={language}>
          {entry.details.full} × ₹{entry.details.fRate} = ₹{entry.details.full * entry.details.fRate}
        </AppText>
      </View>

      <View style={styles.divider} />

      {/* 📊 SUMMARY (DAYS & WORKERS) */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Ionicons name="calendar-number-outline" size={14} style={{color: workColor}} />
          <AppText style={styles.summaryText} language={language}>
            {entry.details.totalDays} {labels.days}
          </AppText>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="people-outline" size={14} style={{color: workColor}} />
          <AppText style={styles.summaryText} language={language}>
            {entry.details.totalWorkers} {labels.workers}
          </AppText>
        </View>
      </View>

      <View style={styles.divider} />

      {/* 💰 TOTAL AMOUNT */}
      <View style={styles.bottomRow}>
        <View>
           <AppText style={{fontSize: 10, color: '#6B7280'}} language={language}>{labels.amount}</AppText>
           <AppText style={[styles.amount, { color: workColor }]}>₹ {entry.totalAmount}</AppText>
        </View>
       <TouchableOpacity 
  activeOpacity={0.6}
  onPress={() => { 
    setDeleteId(entry.id); 
    setModalVisible(true); 
  }}
  style={styles.deleteButtonContainer}
>
  <Ionicons name="trash-bin-outline" size={18} color="#EF4444" />
  <AppText style={styles.delete} language={language}>
    {language === "te" ? "తొలగించు" : "Delete"}
  </AppText>
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

      {/* DELETE MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            
            {/* ICON (Same Warning Style) */}
            <View style={styles.iconBg}>
              <Ionicons name="warning" size={34} color="#DC2626" />
            </View>

            {/* TITLE */}
            <AppText style={styles.modalTitle} language={language}>
              {language === "te" ? "ఈ రికార్డును తొలగించాలా?" : "Are you sure you want to delete this? "}
            </AppText>
{/* MESSAGE */}
            <AppText style={styles.modalSub} language={language}>
              {language === "te"
                ? "తొలగిస్తే, దీనికి సంబంధించిన హాజరు కార్డులు మళ్ళీ చెల్లింపు చేయడానికి అందుబాటులోకి వస్తాయి."
                : "Once deleted, the linked attendance cards will become available again for payment selection."}
            </AppText>

            {/* BUTTONS */}
            <View style={styles.modalBtns}>
              <TouchableOpacity
              activeOpacity={0.8}
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <AppText style={styles.cancelText} language={language}>
                  {language === "te" ? "వద్దు" : "Cancel"}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
              activeOpacity={0.8}
                style={styles.deleteBtn}
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7F6" },
  dashboard: { marginHorizontal: 20, marginTop: 10, paddingVertical: 14, flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "#ffffff", borderRadius: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  box: { alignItems: "center" },
  label: { fontSize: 13, color: "#374151" },
  value: { fontSize: 18, fontWeight: "600", marginTop: 2 },
  dividerVertical: { width: 1, height: 30, backgroundColor: "#E5E7EB" },
  cropHeader: { marginHorizontal: 20, marginTop: 14, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: "#ffffff", borderRadius: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB" },
  cropName: { fontSize: 16, fontWeight: "600", color: "#111827" },
  cropSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  workHeader: { marginHorizontal: 30, marginTop: 10, padding: 12, backgroundColor: "#fff", borderRadius: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  workName: { fontSize: 14, fontWeight: "600", color: "#111827" },
  workSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  card: { marginHorizontal: 30, marginVertical: 6, padding: 14, backgroundColor: "#fff", borderRadius: 12 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateBox: { flexDirection: "row", alignItems: "center", gap: 6 },
  dateText: { fontSize: 12, color: "#374151", fontWeight: "500" },
  modeBox: { flexDirection: "row", alignItems: "center", gap: 6 },
  modeText: { fontSize: 12, color: "#374151" },
  row: { flexDirection: "row", justifyContent: "space-between", marginVertical: 4 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  valueText: { fontSize: 13, fontWeight: "500", color: "#111827" },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  summaryText: { fontSize: 12, color: "#6B7280" },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  amount: { fontWeight: "600", fontSize: 16 },
  empty: { marginTop: 120, alignItems: "center" },
  emptyTitle: { marginTop: 10, fontSize: 16 },
  modal: { backgroundColor: "#fff", padding: 25, borderRadius: 16, width: "80%" },
  deleteButtonContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FEF2F2', // Light red background
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#FEE2E2',
  gap: 6,
  // Subtle shadow for depth
  shadowColor: "#EF4444",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  
},

delete: {
  color: '#DC2626',
  fontSize: 12,
  fontWeight: '600',
},
overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalBox: {
    width: "82%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 8, // Shadows for Android
    shadowColor: "#000", // Shadows for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  iconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827"
  },
  modalSub: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18
  },
  modalBtns: {
    flexDirection: "row",
    marginTop: 22,
    gap: 12,
    width: '100%'
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center"
  },
  deleteBtn: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#DC2626"
  },
  shimmerCard: {
  marginHorizontal: 20,
  marginTop: 12,
  padding: 14,
  borderRadius: 12,
  backgroundColor: "#fff",
  overflow: "hidden",
},
  cancelText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "600"
  },
  deleteText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600"
  },
});