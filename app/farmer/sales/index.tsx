// app/farmer/sales/index.tsx

import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";

export default function SalesScreen() {

  const router = useRouter();

  const [data, setData] = useState<any[]>([]);
  const [language, setLanguage] = useState<"te" | "en">("te");
 const [loading, setLoading] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalQty, setTotalQty] = useState(0);
  const [cropQty, setCropQty] = useState<any>({});
  const [cropIncome, setCropIncome] = useState<any>({});

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
const unitMap: any = {
  kg: { en: "Kg", te: "కిలో" },
  gms: { en: "Gms", te: "గ్రా" },
  quintal: { en: "Quintal", te: "క్వింటాల్" },
  ton: { en: "Ton", te: "టన్ను" }
};
  /* ---------------- LOAD ---------------- */

  useEffect(() => {
    AsyncStorage.getItem("APP_LANG").then((l) => {
      if (l) setLanguage(l as any);
    });
  }, []);

  useEffect(() => {
    let unsubscribe: any;

    const load = async () => {
      const phone = await AsyncStorage.getItem("USER_PHONE");
      if (!phone) return;
 setLoading(true); // 🔥 ADD THIS

      unsubscribe = firestore()
        .collection("users")
        .doc(phone)
        .collection("sales")
        .orderBy("createdAt", "desc")
        .onSnapshot((snap) => {

          const list: any[] = [];

let totalIncome = 0;
let totalQty = 0;

const cropQtyMap: any = {};
const cropIncomeMap: any = {};

snap.forEach(doc => {
  const d: any = doc.data();

  const qty = Number(d.quantity) || 0;
  const total = Number(d.total) || 0;
  const unit = d.unit || "";

  totalIncome += total;
  totalQty += qty;

  // 🔥 crop + unit grouping
  const key = `${d.crop}_${unit}`;
  cropQtyMap[key] = (cropQtyMap[key] || 0) + qty;

  // 🔥 income (optional future use)
  cropIncomeMap[d.crop] = (cropIncomeMap[d.crop] || 0) + total;

  list.push({ id: doc.id, ...d });
});

setData(list);
setTotalIncome(totalIncome);
setTotalQty(totalQty);
setCropQty(cropQtyMap);
setCropIncome(cropIncomeMap);
 setLoading(false); // 🔥 ADD THIS

        });
    };

    load();

    return () => unsubscribe && unsubscribe();

  }, []);

  /* ---------------- COLOR ---------------- */
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
  <View style={styles.card}>

    <View style={{ width: 4, height: 60, backgroundColor: "#E5E7EB", borderRadius: 2 }} />

    <View style={{ flex: 1, marginLeft: 15 }}>
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={{ height: 16, width: "40%", borderRadius: 6 }}
      />
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={{ height: 12, width: "60%", marginTop: 6 }}
      />
    </View>

    <ShimmerPlaceholder
      LinearGradient={LinearGradient}
      style={{ width: 60, height: 16, borderRadius: 6 }}
    />

  </View>
);
 const colors = ["#10B981", "#3B82F6", "#F59E0B", "#950f45", "#8B5CF6", "#EC4899"];
  const getColor = (crop: string) => {
    const code = crop?.charCodeAt(0) || 0;
    return colors[code % colors.length];
  };

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <AppHeader
        title={language === "te" ? "నా అమ్మకాలు" : "My Sales"}
        subtitle={language === "te" ? "విక్రయాల చరిత్ర" : "Sales History"}
        language={language}
      />
      

  <FlatList
  data={loading ? [1, 2, 3, 4, 5] : data} // Increased numbers for better shimmer coverage
  keyExtractor={(item, index) => (loading ? index.toString() : item.id.toString())}
        contentContainerStyle={{ 
          paddingBottom: 120,
          // 🔥 empty unnappudu screen center ki ravalante:
          flexGrow: 1 
        }}
        
        // 🛑 DATA LEKAPOTHE EEMI KANIPINCHADU (ONLY EMPTY STATE)
       ListEmptyComponent={
  loading ? null : ( // Don't show "No Sales" while loading
    <View style={styles.emptyContainer}>
      <View style={styles.emptyBox}>
        <View style={styles.emptyIconBg}>
          <Ionicons name="cash-outline" size={80} color="#16A34A" />
        </View>
        <AppText style={styles.emptyTitle} language={language}>
          {language === "te" ? "అమ్మకాలు లేవు" : "No Sales Yet"}
        </AppText>
        <AppText style={styles.emptySub} language={language}>
          {language === "te"
            ? "మీ మొదటి అమ్మకాన్ని నమోదు చేయండి"
            : "Start adding your first sale"}
        </AppText>
      </View>
    </View>
  )
}

        // 🔥 DATA UNTE MATRHAME HEADER CHUPISTHUNDHI
        ListHeaderComponent={
          data.length > 0 ? (
            <>
              <LinearGradient
                colors={["#14532d", "#052e16"]}
                style={styles.mainStatsCard}
              >
                <AppText style={styles.statLabel}>
                  {language === "te" ? "మొత్తం ఆదాయం" : "Total Income"}
                </AppText>
                <AppText style={styles.statValue}>
                  ₹ {totalIncome.toLocaleString("en-IN")}
                </AppText>
                <View style={styles.divider} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {Object.keys(cropQty).map((key) => {
                    const [crop, unit] = key.split("_");
                    return (
                      <View key={key} style={styles.cropChip}>
                        <View style={[styles.dot, { backgroundColor: getColor(crop) }]} />
                        <AppText style={styles.chipText}>
                          {crop}: {cropQty[key]} {unitMap[unit]?.[language] || unit}
                        </AppText>
                      </View>
                    );
                  })}
                </ScrollView>
              </LinearGradient>

              <View style={styles.categorySummary}>
                
               <AppText style={styles.sectionTitle} language={language}>
    {language === "te" ? "పంటల వారీగా ఆదాయం" : "Crop-wise Income"}
  </AppText>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.catScroll}
                  contentContainerStyle={{ paddingRight: 20 }} // 👈 Right side gap kosam
                >
                  {Object.keys(cropIncome).map((crop) => (
  <View key={`income-${crop}`} style={[styles.catBox, { borderColor: getColor(crop) + "40" }]}>
                      <View style={[styles.catIconCircle, { backgroundColor: getColor(crop) + "15" }]}>
                        <Ionicons name="pie-chart" size={16} color={getColor(crop)} />
                      </View>
                      <AppText style={styles.catBoxLabel}>{crop}</AppText>
                      <AppText style={[styles.catBoxValue, { color: getColor(crop) }]}>
                        ₹{cropIncome[crop].toLocaleString("en-IN")}
                      </AppText>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </>
          ) : null
        }

      renderItem={({ item }) => {

  if (loading) {
    return <ExpenseShimmerCard />;
  }

          const color = getColor(item.crop);
           const date = item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : "---";

          return (
            <View style={styles.card}>

              <View style={[styles.cardBar, { backgroundColor: color }]} />

              <View style={styles.cardInfo}>
                <AppText style={styles.cardCrop}>
                  {item.crop}
                </AppText>

                <AppText style={styles.cardCat}>
                  {item.quantity} × ₹{item.rate} | {date}
                </AppText>
              </View>

             <View style={styles.cardRight}>

  {/* 💰 AMOUNT */}
  <AppText style={styles.income}>
    + ₹{item.total?.toLocaleString("en-IN")}
  </AppText>

  {/* MENU ICON */}
  <TouchableOpacity
    activeOpacity={0.6}
    onPress={() => {
      setSelectedItem(item);
      setMenuVisible(true);
    }}
    style={styles.menuBtn}
  >
    <Ionicons name="ellipsis-vertical" size={18} color="#9CA3AF" />
  </TouchableOpacity>

</View>

            </View>
          );
        }}
      />

      {/* MENU */}
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
                             {selectedItem.crop}
                         </AppText>
                         
                         <TouchableOpacity 
                             style={styles.menuItem} 
                             onPress={() => {
                                 const id = selectedItem.id; // ముందే ఐడిని సేవ్ చేసుకో
                                 setMenuVisible(false);
                                 setSelectedItem(null);
                                 router.push({ 
                                     pathname: "/farmer/sales/add-sale", 
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

      {/* DELETE MODAL */}
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
                style={styles.deleteBtn}
                onPress={async () => {
                  const phone = await AsyncStorage.getItem("USER_PHONE");
                  if (phone && selectedItem) {
                    await firestore()
                      .collection("users")
                      .doc(phone)
                      .collection("sales")
                      .doc(selectedItem.id)
                      .delete();
                  }
                  setDeleteVisible(false);
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

      {/* ADD BTN */}
      <TouchableOpacity
      activeOpacity={0.8}
        style={styles.addBtn}
        onPress={() => router.push("/farmer/sales/add-sale")}
      >
        <LinearGradient
          colors={["#16A34A","#166534"]}
          style={styles.addGradient}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({

  safe: { flex: 1, backgroundColor: "#F8FAFC" },

  mainStatsCard: {
    margin: 16,
    padding: 20,
    borderRadius: 20
  },
  // Empty state screen center lo ravadaniki:
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100 // adjusts vertical position
  },
  emptyBox: {
    alignItems: 'center',
    padding: 20
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
   emptyIconBg: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f2fef2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
  emptySub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 25
  },
  emptyBtn: {
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8
  },
  emptyBtnText: {
    color: '#fff',
    fontWeight: '600'
  },
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

 divider: { height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginVertical: 15 },
  statLabel: { color: "#bbf7d0", fontSize: 12 },
  statValue: { color: "#fff", fontSize: 28, fontWeight: "600" },
  qtyText: { color: "#86efac", fontSize: 12, marginTop: 4 },

  cropChipBox: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minWidth: 110
  },

cropChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginRight: 8 },
 dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
chipText: {
  color: "#E5E7EB",
  fontSize: 12
},

chipSubText: {
  color: "#ffffff",
  fontSize: 14,
  fontWeight: "600",
  marginTop: 2
},
  cropChipTitle: { fontWeight: "600" },
  cropQty: { fontSize: 16, fontWeight: "600" },
  cropIncome: { color: "#16A34A", marginTop: 4 },
categorySummary: {
  marginTop: 10,
  marginBottom: 6
},
cardRight: {
  flexDirection: "row",        // 🔥 SIDE BY SIDE
  alignItems: "center",
  gap: 10                      // 🔥 spacing between amount & icon
},

income: {
  color: "#16A34A",
  fontWeight: "600",
  fontSize: 14
},

menuBtn: {
  padding: 6,
  borderRadius: 10,
  backgroundColor: "#F3F4F6"   // 🔥 subtle bg
},
sectionTitle: {
  fontSize: 18,
  fontWeight: "600",
  marginHorizontal: 16,
  marginBottom: 10,
  color: "#111827"
},

catScroll: {
  paddingLeft: 16
},

catBox: {
  backgroundColor: "#fff",
  padding: 14,
  borderRadius: 14,
  marginRight: 10,

  borderWidth: 1,
  borderColor: "#E5E7EB",
 width: 110,          // 🔥 FIXED WIDTH
  height: 110,         // 🔥 FIXED HEIGHT

  alignItems: "center",
  minWidth: 90
},

catIconCircle: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: "#F3F4F6",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 6
},

catBoxLabel: {
  fontSize: 12,
  color: "#6B7280"
},

catBoxValue: {
  fontSize: 14,
  fontWeight: "600",
  marginTop: 2
},
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },

  cardBar: { width: 4, borderRadius: 2 },
  cardInfo: { flex: 1, marginLeft: 10 },
  cardCrop: { fontSize: 16, fontWeight: "600" },
  cardCat: { fontSize: 12, color: "#6B7280" },
 
  menuBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12
  },

  addBtn: { position: "absolute", bottom: 30, right: 20 },
  addGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center"
  }

});