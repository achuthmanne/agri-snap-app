import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";

export default function VehiclesScreen() {

  const router = useRouter();

  const [data, setData] = useState<any[]>([]);
  const [grouped, setGrouped] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"te" | "en">("te");

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [typeModalVisible, setTypeModalVisible] = useState(false);
const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  /* ---------------- LOAD ---------------- */

  useEffect(() => {
    AsyncStorage.getItem("APP_LANG").then((l) => {
      if (l) setLanguage(l as any);
    });
  }, []);

  useEffect(() => {
    let unsubscribe: any;

   const load = async () => {

  setLoading(true); // 🔥 MOVE HERE FIRST

  const phone = await AsyncStorage.getItem("USER_PHONE");
  if (!phone) {
    setLoading(false);
    return;
  }

  const userDoc = await firestore()
    .collection("users")
    .doc(phone)
    .get();

  const activeSession = userDoc.data()?.activeSession;

  if (!activeSession) {
    setLoading(false);
    return;
  }

      unsubscribe = firestore()
        .collection("users")
        .doc(phone)
        .collection("vehicles")
.where("session", "==", activeSession) // 🔥 ADD THIS
.where("createdAt", "!=", null)  
.orderBy("createdAt", "desc") // 🔥 keep this after where
        .onSnapshot((snap) => {

  if (!snap || !snap.docs) {
    setLoading(false);
    return;
  }

  const list: any[] = [];
  const group: any = {};

  snap.forEach(doc => {
    const d: any = doc.data();

    if (!d) return; // 🔥 extra safety

    list.push({ id: doc.id, ...d });

    const type = d.type || "Others";

    if (!group[type]) group[type] = [];
    group[type].push({ id: doc.id, ...d });
  });

  setData(list);
  setGrouped(group);
  setLoading(false);
});
    };

    load();
    return () => unsubscribe && unsubscribe();

  }, []);

  /* ---------------- COLOR ---------------- */
const typeColors: any = {
  tractor: "#16A34A",   // Green
  jcb: "#F59E0B",       // Orange/Yellow
  harvester: "#3B82F6", // Blue
  tiller: "#f4581a",    // Purple
  bullock: "#A16207",   // Brown
  truck: "#ad44ef",     // Red
  auto: "#06B6D4",      // Cyan
  pickup: "#6366F1",    // Indigo
  ace: "#EC4899",       // Pink
};

const getColor = (type: string) => {
  const label = type?.toLowerCase() || "";

  // 🚜 TRACTOR (ట్రాక్టర్)
  if (label.includes("tractor") || label.includes("ట్రాక్టర్")) return typeColors.tractor;
  
  // 🏗️ JCB (జెసిబి)
  if (label.includes("jcb") || label.includes("backhoe") || label.includes("జెసిబి")) return typeColors.jcb;
  
  // 🌾 HARVESTER (హార్వెస్టర్)
  if (label.includes("harvester") || label.includes("హార్వెస్టర్")) return typeColors.harvester;
  
  // ⚙️ TILLER (టిల్లర్)
  if (label.includes("tiller") || label.includes("టిల్లర్")) return typeColors.tiller;
  
  // 🐂 BULLOCK CART (ఎద్దుల బండి)
  if (label.includes("bullock") || label.includes("బండి") || label.includes("ఎద్దుల")) return typeColors.bullock;
  
  // 🚛 TRUCK/TRAILER (లారీ/టిప్పర్/ట్రైలర్)
  if (label.includes("truck") || label.includes("tipper") || label.includes("trailer") || 
      label.includes("లారీ") || label.includes("టిప్పర్") || label.includes("ట్రైలర్")) return typeColors.truck;
  
  // 🛺 AUTO (ఆటో)
  if (label.includes("auto") || label.includes("ఆటో")) return typeColors.auto;
  
  // 🛻 PICKUP/BOLERO (పికప్/బొలెరో)
  if (label.includes("pickup") || label.includes("bolero") || label.includes("పికప్") || label.includes("బొలెరో")) return typeColors.pickup;
  
  // 🐘 TATA ACE (ఏస్)
  if (label.includes("ace") || label.includes("ఏస్") || label.includes("ఏనుగు")) return typeColors.ace;

  return "#520b33"; // Default Grey if nothing matches
};

  /* ---------------- SHIMMER ---------------- */

 const VehicleShimmer = () => (
  <View style={styles.shimmerCard}>

    {/* LEFT BAR */}
    <ShimmerPlaceholder
      LinearGradient={LinearGradient}
      shimmerColors={["#E5E7EB", "#F3F4F6", "#E5E7EB"]}
      style={styles.shimmerBar}
    />

    {/* CONTENT */}
    <View style={styles.shimmerContent}>

      {/* TITLE */}
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        shimmerColors={["#E5E7EB", "#F3F4F6", "#E5E7EB"]}
        style={styles.shimmerTitle}
      />

      {/* SUB */}
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        shimmerColors={["#E5E7EB", "#F3F4F6", "#E5E7EB"]}
        style={styles.shimmerSub}
      />

      {/* NUMBER PLATE */}
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        shimmerColors={["#E5E7EB", "#F3F4F6", "#E5E7EB"]}
        style={styles.shimmerPlate}
      />

    </View>

    {/* RIGHT MENU */}
    <ShimmerPlaceholder
      LinearGradient={LinearGradient}
      shimmerColors={["#E5E7EB", "#F3F4F6", "#E5E7EB"]}
      style={styles.shimmerMenu}
    />

  </View>
);

const formatDisplay = (num: string) => {
  const match = num.match(/^([A-Z]{2})(\d{2})([A-Z]{2})(\d{4})$/);
  return match ? `${match[1]} ${match[2]} ${match[3]} ${match[4]}` : num;
};
  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

     <AppHeader
  title={language === "te" ? "నా వాహనాలు" : "My Vehicles"} // Added 'Na' (My) for Telugu too
  subtitle={
    language === "te" 
      ? "మీ వ్యవసాయ వాహనాల వివరాలు ఇక్కడ చూడండి" 
      : "Manage all your farming vehicles here"
  }
  language={language}
/>

      <FlatList
        data={loading ? ["1","2","3","4"] : Object.keys(grouped)}
        keyExtractor={(item, index) => loading ? index.toString() : item}
        contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}

      ListEmptyComponent={
  !loading && Object.keys(grouped).length === 0 ? (
    <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <MaterialCommunityIcons name="tractor" size={80} color="#16A34A" />
              </View>
              <AppText style={styles.emptyTitle}>
                {language === "te" ? "వాహనాలు లేవు" : "No Vehicles Yet"}
              </AppText>
              <AppText style={styles.emptySub}>
                {language === "te"
                  ? "మీ వాహనాలను చేర్చడానికి + బటన్ నొక్కండి"
                  : "Tap + button to add your vehicles"}
              </AppText>
            </View>
          ) : null
        }

        renderItem={({ item }) => {

        if (loading) return <VehicleShimmer />;

          const vehicles = grouped[item];

          return (
            <View>

  

              {vehicles.map((v: any) => (
                <TouchableOpacity
  key={v.id}
  activeOpacity={0.7}
  style={styles.card}
  onPress={() => {
  setSelectedVehicle(v);
  setTypeModalVisible(true);
}}
>
                  <View style={[styles.cardBar, { backgroundColor: getColor(v.type)}]} />

                  <View style={styles.cardInfo}>
                    <AppText style={styles.cardTitle}>{v.nickname}</AppText>

                    <AppText style={styles.cardSub}>
                      {language === "te" ? "రకం" : "Type"}: {v.type}
                    </AppText>

                    {v.number && (
                      <View style={styles.plate}>
                        <AppText style={styles.plateText}>{formatDisplay(v.number)}</AppText>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedItem(v);
                      setMenuVisible(true);
                    }}
                    style={styles.menuBtn}
                  >
                    <Ionicons name="ellipsis-vertical" size={18} color="#9CA3AF" />
                  </TouchableOpacity>

                </TouchableOpacity>
              ))}

            </View>
          );
        }}
      />

     {/* 📱 MENU MODAL */}
<Modal visible={menuVisible} transparent animationType="fade">
  <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
    <View style={styles.modalOverlay}>
      <TouchableWithoutFeedback>
        <View style={styles.menuContent}>
          {selectedItem && (
            <>
              <AppText style={styles.menuHeader}>
                {selectedItem.nickname}
              </AppText>

              {/* Edit Option */}
              <TouchableOpacity activeOpacity={0.8}
                style={styles.menuItem}
                onPress={() => {
                  const id = selectedItem.id;
                  setMenuVisible(false);
                 router.push({
  pathname: "/farmer/add-vehicle",
  params: {
    vehicleId: selectedItem.id,
    name: selectedItem.nickname,
    type: selectedItem.type,
    number: selectedItem.number || ""
  }
});
                }}
              >
                <Ionicons name="pencil-outline" size={20} color="#3B82F6" />
                <AppText style={styles.menuText}>
                  {language === "te" ? "సవరించు" : "Edit"}
                </AppText>
              </TouchableOpacity>

              {/* Delete Option */}
              <TouchableOpacity activeOpacity={0.8}
                style={[styles.menuItem, { borderBottomWidth: 0 }]}
                onPress={() => {
                  setMenuVisible(false);
                  setDeleteVisible(true);
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                <AppText style={[styles.menuText, { color: "#EF4444" }]}>
                  {language === "te" ? "తొలగించు" : "Delete"}
                </AppText>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  </TouchableWithoutFeedback>
</Modal>

{/* 🗑️ DELETE CONFIRMATION MODAL */}
<Modal visible={deleteVisible} transparent animationType="fade">
  <View style={styles.overlay}>
    <View style={styles.deleteBox}>
      <View style={styles.iconBg}>
        <Ionicons name="trash-outline" size={32} color="#DC2626" />
      </View>

      <AppText style={styles.deleteTitle}>
        {language === "te" ? "వాహనాన్ని తొలగించాలా?" : "Delete Vehicle?"}
      </AppText>
      
      <AppText style={styles.deleteSub}>
        {language === "te" 
          ? "ఈ వాహనం వివరాలు శాశ్వతంగా తొలగించబడతాయి." 
          : "This vehicle details will be permanently removed."}
      </AppText>

      <View style={styles.deleteBtns}>
        {/* Cancel Button */}
        <TouchableOpacity activeOpacity={0.8}
          style={styles.cancelBtn}
          onPress={() => setDeleteVisible(false)}
        >
          <AppText style={styles.cancelBtnText}>
            {language === "te" ? "వద్దు" : "Cancel"}
          </AppText>
        </TouchableOpacity>

        {/* Confirm Delete Button */}
        <TouchableOpacity activeOpacity={0.8}
          style={styles.deleteBtn}
          onPress={async () => {
  const phone = await AsyncStorage.getItem("USER_PHONE");
  if (!phone || !selectedItem) return;

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
      .collection("vehicles")
      .doc(selectedItem.id);

    const doc = await docRef.get();

    // 🔥 SESSION SAFETY
    if (doc.data()?.session !== activeSession) {
      console.log("Wrong session delete blocked");
      return;
    }
// 🔥 INSTANT UI REMOVE
setGrouped((prev: any) => {
  const newGroup = { ...prev };

  Object.keys(newGroup).forEach((type) => {
    newGroup[type] = newGroup[type].filter(
      (item: any) => item.id !== selectedItem.id
    );

    if (newGroup[type].length === 0) {
      delete newGroup[type];
    }
  });

  return newGroup;
});

// 🔥 CLOSE MODAL IMMEDIATELY
setDeleteVisible(false);

// 🔥 THEN DELETE FROM FIRESTORE
await docRef.delete();
  } catch (e) {
    console.log(e);
  }

  
}}
        >
          <AppText style={styles.deleteBtnText}>
            {language === "te" ? "అవును" : "Delete"}
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

{selectedVehicle && (
  <Modal visible={typeModalVisible} transparent animationType="fade">

    <TouchableWithoutFeedback onPress={() => setTypeModalVisible(false)}>
      <View style={styles.modalOverlay}>

        <TouchableWithoutFeedback>
          <View style={styles.modalBox}>

            <AppText style={styles.modalTitle}>
              {language === "te" ? "పని ఎంపిక చేసుకోండి" : "Choose Work Type"}
            </AppText>

            {/* 🚜 FARMER */}
            <TouchableOpacity activeOpacity={0.8}
              style={[styles.selectCard, {borderColor: 'green'}]}
              onPress={() => {
                setTypeModalVisible(false);

                router.push({
                  pathname: "/farmer/vehicle-details",
                  params: {
                    id: selectedVehicle.id,
                    name: selectedVehicle.nickname,
                    number: selectedVehicle.number || "",
                    type: selectedVehicle.type
                  }
                });
              }}
            >
              
            <View style={[styles.iconBox, { backgroundColor: "#DCFCE7" }]}>
              <Ionicons name="people-outline" size={22} color="#16A34A" />
            </View>

            <View style={{ flex: 1 }}>
              <AppText style={styles.cardTitle1}>
                {language === "te" ? "రైతుల పని" : "Farmer Work"}
              </AppText>
              <AppText style={styles.cardSub1}>
                {language === "te"
                  ? "రైతుల పనులను నమోదు చేయండి"
                  : "Manage farmer works"}
              </AppText>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {/* 👷 DRIVER */}
          <TouchableOpacity activeOpacity={0.8}
              style={[styles.selectCard, {borderColor: 'blue'}]}
              onPress={() => {
                setTypeModalVisible(false);

                router.push({
                  pathname: "/farmer/driver-list",
                  params: {
                    id: selectedVehicle.id,
                    name: selectedVehicle.nickname,
                    number: selectedVehicle.number || "",
                    type: selectedVehicle.type
                  }
                });
              }}
            >
            <View style={[styles.iconBox, { backgroundColor: "#DBEAFE" }]}>
              <Ionicons name="person-outline" size={22} color="#2563EB" />
            </View>

            <View style={{ flex: 1 }}>
              <AppText style={styles.cardTitle}>
                {language === "te" ? "డ్రైవర్ పని" : "Driver Work"}
              </AppText>
              <AppText style={styles.cardSub}>
                {language === "te"
                  ? "డ్రైవర్ పనులను నమోదు చేయండి"
                  : "Manage driver works"}
              </AppText>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
           </TouchableOpacity>

          </View>
        </TouchableWithoutFeedback>

      </View>
    </TouchableWithoutFeedback>

  </Modal>
)}

      {/* ADD BUTTON */}
      <TouchableOpacity activeOpacity={0.8}
        style={styles.addBtn}
        onPress={() => router.push("/farmer/add-vehicle")}
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

 
card: {
  marginHorizontal: 16,
  marginVertical: 6,
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 16,
  flexDirection: "row",
  alignItems: "center",   // 🔥🔥 THIS IS THE MAIN FIX
  borderWidth: 1,
  borderColor: "#E5E7EB"
},
cardBar: {
  width: 4,
  alignSelf: "stretch",
  borderTopLeftRadius: 12,
  borderBottomLeftRadius: 12
},
  cardInfo: { flex: 1, marginLeft: 15 },

  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardSub: { fontSize: 12, color: "#6B7280" },

plate: {
  marginTop: 6,

  alignSelf: "flex-start",   // 🔥 IMPORTANT (width control)

  backgroundColor: "#FACC15",
  paddingHorizontal: 8,      // 🔽 reduce padding
  paddingVertical: 3,        // 🔽 reduce height

  borderRadius: 5,

  borderWidth: 1,
  borderColor: "#EAB308"
},
plateText: {
  fontSize: 11,              // 🔽 slightly small
  fontWeight: "700",
  letterSpacing: 1,
  color: "#111827"
},
menuHeader: { 
    textAlign: "center", 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#1E293B",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    gap: 12,
  },
  menuText: { 
    fontSize: 16, 
    fontWeight: "500",
    color: "#475569"
  },
  shimmerCard: {
  marginHorizontal: 16,
  marginVertical: 6,
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 14,
  flexDirection: "row",
  alignItems: "center",

  borderWidth: 1,
  borderColor: "#E5E7EB"
},

shimmerBar: {
  width: 4,
  height: "100%",
  borderRadius: 2
},
modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  alignItems: "center"
},

modalBox: {
  width: "85%",
  backgroundColor: "#fff",
  borderRadius: 20,
  padding: 20,

  // 🔥 shadow (premium feel)
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 10
},

modalTitle: {
  fontSize: 16,
  fontWeight: "600",
  textAlign: "center",
  marginBottom: 16,
  color: "#111827"
},

selectCard: {
  flexDirection: "row",
  alignItems: "center",
  padding: 14,
  borderRadius: 14,
  borderWidth: 1,
  marginBottom: 12,
  backgroundColor: "#fff"
},

iconBox: {
  width: 42,
  height: 42,
  borderRadius: 12,
  justifyContent: "center",
  alignItems: "center",
  marginRight: 12
},

cardTitle1: {
  fontSize: 14,
  fontWeight: "600",
  color: "#111827"
},

cardSub1: {
  fontSize: 12,
  color: "#6B7280",
  marginTop: 2
},
shimmerContent: {
  flex: 1,
  marginLeft: 12
},

shimmerTitle: {
  height: 16,
  width: "55%",
  borderRadius: 6
},

shimmerSub: {
  height: 12,
  width: "35%",
  marginTop: 6,
  borderRadius: 6
},

shimmerPlate: {
  height: 18,
  width: 100,
  marginTop: 8,
  borderRadius: 6
},

shimmerMenu: {
  width: 32,
  height: 32,
  borderRadius: 10
},
  deleteSub: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20
  },
  cancelBtnText: {
    fontWeight: "600",
    color: "#475569"
  },
  deleteBtnText: {
    fontWeight: "600",
    color: "#fff"
  },
  menuBtn: {
  justifyContent: "center",
  alignItems: "center",

  padding: 6,
  borderRadius: 10,
width: 32,
  height: 32,
  backgroundColor: "#F3F4F6"
},
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  emptyIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f2fef2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20
  },

  emptyTitle: { fontSize: 20, fontWeight: "600" },
  emptySub: { fontSize: 14, color: "#64748b", marginTop: 8 },

  modalOverlay1: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center"
  },

  menuContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18
  },

  
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)"
  },

  deleteBox: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center"
  },

  iconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center"
  },

  deleteTitle: { fontSize: 16, fontWeight: "600", marginTop: 10 },

  deleteBtns: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10
  },

  cancelBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    alignItems: "center"
  },

  deleteBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: "#DC2626",
    borderRadius: 10,
    alignItems: "center"
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