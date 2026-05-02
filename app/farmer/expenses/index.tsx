//expenses/index.tsx
import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList, Modal, SafeAreaView, ScrollView,
  StatusBar, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View
} from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";

export default function ExpensesScreen() {
    const router = useRouter();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState<"te" | "en">("te");
    const [totalExpense, setTotalExpense] = useState(0);
    const [cropTotals, setCropTotals] = useState<any>({});
    const [categoryTotals, setCategoryTotals] = useState<any>({});
const [deleteVisible, setDeleteVisible] = useState(false);
const [activeSession, setActiveSession] = useState("");
    // 🔥 Menu State
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
const EmptyShimmer = () => (
  <View style={styles.emptyContainer}>

    <ShimmerPlaceholder
      LinearGradient={LinearGradient}
      style={{ width: 120, height: 120, borderRadius: 60 }}
    />

    <ShimmerPlaceholder
      LinearGradient={LinearGradient}
      style={{ width: 150, height: 18, marginTop: 20, borderRadius: 6 }}
    />

    <ShimmerPlaceholder
      LinearGradient={LinearGradient}
      style={{ width: 220, height: 12, marginTop: 10, borderRadius: 6 }}
    />

    <ShimmerPlaceholder
      LinearGradient={LinearGradient}
      style={{ width: 180, height: 12, marginTop: 6, borderRadius: 6 }}
    />

  </View>
);
const ExpenseShimmerCard = () => (
  <View style={[styles.card, { borderColor: '#F1F5F9' }]}>
    {/* ఎడమ వైపు బార్ కోసం షిమ్మర్ */}
    <ShimmerPlaceholder
      LinearGradient={LinearGradient}
      shimmerColors={['#ebebeb', '#f5f5f5', '#ebebeb']}
      style={{ width: 4, height: 40, borderRadius: 2 }}
    />

    <View style={{ flex: 1, marginLeft: 15 }}>
      {/* పంట పేరు (Crop Name) షిమ్మర్ */}
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        shimmerColors={['#ebebeb', '#f5f5f5', '#ebebeb']}
        style={{ height: 18, width: "50%", borderRadius: 6 }}
      />
      {/* కేటగిరీ & డేట్ షిమ్మర్ */}
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        shimmerColors={['#f1f5f9', '#f8fafc', '#f1f5f9']}
        style={{ height: 12, width: "70%", marginTop: 8, borderRadius: 4 }}
      />
    </View>

    {/* అమౌంట్ సెక్షన్ షిమ్మర్ */}
    <View style={{ alignItems: 'flex-end' }}>
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        shimmerColors={['#ebebeb', '#f5f5f5', '#ebebeb']}
        style={{ width: 70, height: 18, borderRadius: 6 }}
      />
    </View>
  </View>
);
    useEffect(() => {
        let unsubscribe: any;
        const load = async () => {
            const phone = await AsyncStorage.getItem("USER_PHONE");
            const lang = await AsyncStorage.getItem("APP_LANG");
            if (lang) setLanguage(lang as any);
            if (!phone) {
  setLoading(false);
  return;
}
            setLoading(true);
            const userDoc = await firestore()
  .collection("users")
  .doc(phone)
  .get();

const session = userDoc.data()?.activeSession;

if (!session) {
  setLoading(false);
  return;
}

setActiveSession(session);
            unsubscribe = firestore()
                .collection("users").doc(phone).collection("expenses")
.where("session", "==", session)
.where("createdAt", "!=", null)   // 🔥 ADD THIS
.orderBy("createdAt", "desc")
.limit(100)
              .onSnapshot((snap) => {

  if (!snap || !snap.docs) {
    setLoading(false);
    return;
  }

  const list: any[] = [];
  let total = 0;
  const cropMap: any = {};
  const catMap: any = {};

  snap.docs.forEach(doc => {
                        const d: any = doc.data();
                        const amt = Number(d.amount) || 0;
                        total += amt;
                        const crop = d.crop || "Other";
const category = d.category || "Other";

cropMap[crop] = (cropMap[crop] || 0) + amt;
catMap[category] = (catMap[category] || 0) + amt;
                        list.push({ id: doc.id, ...d });
                    });

                    setData(list);
                    setTotalExpense(total);
                    setCropTotals(cropMap);
                    setCategoryTotals(catMap);
                    setLoading(false);
                });
        };
        load();
        return () => unsubscribe && unsubscribe();
    }, []);


    const getColor = (str: string) => {
        const colors = ["#10B981", "#3B82F6", "#F59E0B", "#950f52", "#8B5CF6", "#EC4899"];
        let hash = 0;
        for (let i = 0; i < (str?.length || 0); i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="light-content" />
            <AppHeader
                title={language === "te" ? "నా ఖర్చులు" : "My Expenses"}
                subtitle={language === "te" ? "వ్యయాల చరిత్ర" : "History"}
                language={language}
            />
        <FlatList
  data={loading ? [1, 2, 3, 4, 5] : data} // Loading లో ఉన్నప్పుడు dummy numbers
  keyExtractor={(item, index) => (loading ? index.toString() : item.id)} // loading లో index ని key గా తీసుకుంటుంది
  contentContainerStyle={{ 
      paddingBottom: 120,
      flexGrow: 1 
  }}
                
                // 🛑 DATA LEKAPOTHE EEMI KANIPINCHADU (ONLY EMPTY STATE)
               ListEmptyComponent={
  loading ? (
    <EmptyShimmer />
  ) : (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyBox}>
        <View style={styles.emptyIconBg}>
          <Ionicons name="receipt-outline" size={60} color="#DC2626" />
        </View>
        <AppText style={styles.emptyTitle} language={language}>
          {language === "te" ? "ఖర్చులు లేవు" : "No Expenses Yet"}
        </AppText>
        <AppText style={styles.emptySub} language={language}>
          {language === "te"
            ? "మీ పెట్టుబడిని నమోదు చేయడం ప్రారంభించండి"
            : "Start tracking your farm investments"}
        </AppText>
      </View>
    </View>
  )
}

                // 🔥 DATA UNTE MATRHAME TOP CARDS KANIPISTHAYI
                ListHeaderComponent={
                    data.length > 0 ? (
                        <>
                            <LinearGradient colors={["#911d10", "#561111"]} style={styles.mainStatsCard}>
                                <AppText style={styles.statLabel}>{language === "te" ? "మొత్తం పెట్టుబడి" : "Total Investment"}</AppText>
                                <AppText style={styles.statValue}>₹ {totalExpense.toLocaleString('en-IN')}</AppText>
                                <View style={styles.divider} />
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} >
                                    {Object.keys(cropTotals || {}).map((crop) => (
                                        <View key={crop} style={styles.cropChip}>
                                            <View style={[styles.dot, { backgroundColor: getColor(crop) }]} />
                                            <AppText style={styles.chipText}>{crop}: ₹{cropTotals[crop].toLocaleString('en-IN')}</AppText>
                                        </View>
                                    ))}
                                </ScrollView>
                            </LinearGradient>

                            <View style={styles.categorySummary}>
                               <AppText style={styles.sectionTitle} language={language}>
    {language === "te" ? "రకాల వారీగా ఖర్చులు" : "Expenses by Category"}
</AppText>

                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                                    {Object.keys(categoryTotals || {}).map((cat) => {
                                        const color = getColor(cat.trim());
                                        return (
                                            <View key={cat} style={[styles.catBox, { borderColor: color + "40" }]}>
                                                <View style={[styles.catIconCircle, { backgroundColor: color + "15" }]}>
                                                    <Ionicons name="pie-chart" size={16} color={color} />
                                                </View>
                                                <AppText style={styles.catBoxLabel}>{cat}</AppText>
                                                <AppText style={[styles.catBoxValue, { color }]}>
                                                    ₹{categoryTotals[cat].toLocaleString("en-IN")}
                                                </AppText>
                                            </View>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        </>
                    ) : null
                }
                renderItem={({ item }) => {

  if (loading) {
    return <ExpenseShimmerCard />;
  }

                    const color = getColor(item.crop || "default");
                    const date = item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : "---";

                    return (
                        <View style={styles.card}>
                            <View style={[styles.cardBar, { backgroundColor: color }]} />
                            <View style={styles.cardInfo}>
                                <AppText style={styles.cardCrop}>{item.crop}</AppText>
                                <AppText style={styles.cardCat}>{item.category} | {date}</AppText>
                            </View>
                            <View style={styles.cardRight}>
                                <AppText style={styles.cardAmount}>- ₹{item.amount.toLocaleString('en-IN')}</AppText>
                                <TouchableOpacity 
  activeOpacity={0.6}   // 🔥 SMOOTH TAP
  onPress={() => {
    setSelectedItem(item);
    setMenuVisible(true);
  }}
  style={styles.menuBtn}
>
                                    <Ionicons name="ellipsis-vertical" size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
            />
{/* 🔥 Custom 3-Dot Action Menu Modal */}
<Modal 
    visible={menuVisible} 
    transparent 
    animationType="none"
    onRequestClose={() => { setMenuVisible(false); setSelectedItem(null); }}
>
    <TouchableWithoutFeedback onPress={() => { setMenuVisible(false); setSelectedItem(null); }}>
        <View style={styles.modalOverlay}>
            {/* selectedItem ఉంటేనే UI ని లోడ్ చెయ్ (Null safety) */}
            {selectedItem ? (
                <View style={styles.menuContent}>
                    <AppText style={styles.menuHeader}>
                        {selectedItem.crop} - {selectedItem.category}
                    </AppText>
                    
                    <TouchableOpacity 
                        style={styles.menuItem} 
                        onPress={() => {
                            const id = selectedItem.id; // ముందే ఐడిని సేవ్ చేసుకో
                            setMenuVisible(false);
                            setSelectedItem(null);
                            router.push({ 
                                pathname: "/farmer/expenses/add-expense", 
                                params: { editId: id } 
                            });
                        }}
                    >
                        <Ionicons name="pencil-outline" size={20} color="#3B82F6" />
                        <AppText style={styles.menuText}>
                            {language === "te" ? "సవరించండి" : "Edit Record"}
                        </AppText>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.menuItem, { borderBottomWidth: 0 }]} 
                        onPress={() => {
  setMenuVisible(false);
  setDeleteVisible(true);
}}
>
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        <AppText style={[styles.menuText, { color: '#EF4444' }]}>
                            {language === "te" ? "తొలగించండి" : "Delete Record"}
                        </AppText>
                    </TouchableOpacity>
                </View>
            ) : null}
        </View>
    </TouchableWithoutFeedback>
</Modal>
<Modal visible={deleteVisible} transparent animationType="fade">
  <View style={styles.overlay}>

    <View style={styles.deleteBox}>

      {/* ICON */}
      <View style={styles.iconBg}>
        <Ionicons name="trash-outline" size={32} color="#DC2626" />
      </View>

      {/* TITLE */}
      <AppText style={styles.deleteTitle} language={language}>
        {language === "te" ? "తొలగించాలా?" : "Delete Expense?"}
      </AppText>

      {/* SUB */}
      <AppText style={styles.deleteSub} language={language}>
        {language === "te"
          ? "ఈ రికార్డ్ శాశ్వతంగా తొలగించబడుతుంది"
          : "This record will be permanently deleted"}
      </AppText>

      {/* BUTTONS */}
      <View style={styles.deleteBtns}>

  {/* CANCEL */}
  <TouchableOpacity
    activeOpacity={0.8}
    style={styles.cancelBtn}
    onPress={() => setDeleteVisible(false)}
  >
    <AppText style={styles.cancelText} language={language}>
      {language === "te" ? "వద్దు" : "Cancel"}
    </AppText>
  </TouchableOpacity>

  {/* DELETE */}
  <TouchableOpacity
    activeOpacity={0.85}
    style={styles.deleteBtn}
    onPress={async () => {
     const phone = await AsyncStorage.getItem("USER_PHONE");

if (phone && selectedItem?.id) {
  await firestore()
    .collection("users")
    .doc(phone)
    .collection("expenses")
    .doc(selectedItem.id)
    .delete();
}

setDeleteVisible(false);
setSelectedItem(null);
    }}
  >
    <Ionicons name="trash-outline" size={16} color="#fff" />
    <AppText style={styles.deleteText} language={language}>
      {language === "te" ? "తొలగించు" : "Delete"}
    </AppText>
  </TouchableOpacity>

</View>
    </View>

  </View>
</Modal>
            <TouchableOpacity activeOpacity={0.8} style={styles.addBtn} onPress={() => router.push("/farmer/expenses/add-expense")}>
                <LinearGradient colors={["#c53822", "#801515"]} style={styles.addGradient}>
                    <Ionicons name="add" size={32} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#F8FAFC" },
    mainStatsCard: { margin: 20, padding: 22, borderRadius: 24, elevation: 5 },
    statLabel: { color: "#f7bbbb", fontSize: 12 },
    statValue: { color: "#fff", fontSize: 32, fontWeight: "600", marginVertical: 2, marginTop: -5 },
    divider: { height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginVertical: 12},
    cropChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginRight: 8 },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    chipText: { color: '#fff', fontSize: 12 },
catBox: {
  width: 110,          // 🔥 FIXED WIDTH
  height: 110,         // 🔥 FIXED HEIGHT

  backgroundColor: "#fff",
  borderRadius: 16,
  marginRight: 10,

  borderWidth: 1,
  borderColor: "#E5E7EB",

  alignItems: "center",
  justifyContent: "center"
},
// 🔥 ADDED EMPTY STATE STYLES
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100
    },
    emptyBox: {
        alignItems: 'center',
        padding: 20,
        width: '100%'
    },
    emptyIconBg: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1e293b'
    },
    emptySub: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 30,
        paddingHorizontal: 40
    },
    emptyBtn: {
        backgroundColor: '#DC2626',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingVertical: 14,
        borderRadius: 15,
        gap: 8,
        elevation: 3
    },
    emptyBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16
    },
catIconCircle: {
  width: 36,
  height: 36,
  borderRadius: 18,
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 6
},

catBoxValue: {
  fontSize: 14,
  fontWeight: "600",
  marginTop: 2
},
    categorySummary: { paddingLeft: 20, marginBottom: 20 },
    sectionTitle: { fontSize: 17, fontWeight: '600', color: '#1e293b', marginBottom: 15 },
    catScroll: { flexDirection: 'row' },
   
    catBoxLabel: { fontSize: 12, color: '#64748b', fontWeight: '500' },

menuBtn: {
  padding: 6,
  borderRadius: 10,
  backgroundColor: "#F3F4F6"   // 🔥 subtle bg
},
   card: { 
  marginHorizontal: 20,
  marginVertical: 6,
  backgroundColor: "#fff",
  borderRadius: 16,

  flexDirection: 'row',
  alignItems: 'center',
  padding: 14,

  borderWidth: 1,
  borderColor: "#E5E7EB"   // 🔥 CLEAN GREY BORDER
},
    cardBar: { width: 4, height: '80%', borderRadius: 2 },
    cardInfo: { flex: 1, marginLeft: 15 },
    cardCrop: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
    cardCat: { fontSize: 12, color: '#64748b', marginTop: 2 },
    cardRight: { alignItems: 'flex-end', flexDirection: 'row', gap: 10 },
    cardAmount: { fontSize: 16, fontWeight: '600', color: '#ef4444' },
    menuIcon: { padding: 5 },
modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.25)",
  justifyContent: "center",
  alignItems: "center"
},
deleteBtns: {
  flexDirection: "row",
  marginTop: 20,
  gap: 10
},

cancelBtn: {
  flex: 1,
  paddingVertical: 12,
  borderRadius: 12,
  backgroundColor: "#F3F4F6",
  alignItems: "center",
  justifyContent: "center"
},

cancelText: {
  fontSize: 14,
  fontWeight: "600",
  color: "#374151"
},

deleteBtn: {
  flex: 1,
  flexDirection: "row",
  gap: 6,
  paddingVertical: 12,
  borderRadius: 12,
  backgroundColor: "#DC2626",
  alignItems: "center",
  justifyContent: "center"
},

deleteText: {
  fontSize: 14,
  fontWeight: "600",
  color: "#fff"
},
menuContent: {
  width: "80%",
  backgroundColor: "#fff",
  borderRadius: 20,
  padding: 18,

  borderWidth: 1,
  borderColor: "#E5E7EB"
},
overlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.3)",
  justifyContent: "center",
  alignItems: "center"
},

deleteBox: {
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

deleteTitle: {
  fontSize: 16,
  fontWeight: "600"
},

deleteSub: {
  fontSize: 13,
  color: "#6B7280",
  textAlign: "center",
  marginTop: 6
},

    menuHeader: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 15, textAlign: 'center' },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    menuText: { marginLeft: 12, fontSize: 16, fontWeight: '600', color: '#1e293b' },

    addBtn: { position: "absolute", bottom: 30, right: 25 },
    addGradient: { width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center", elevation: 5 }
});