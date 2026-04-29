import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";

const Shimmer = createShimmerPlaceholder(LinearGradient);
const { width } = Dimensions.get("window");

import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";

export default function MyMachines() {
  const router = useRouter();
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"te" | "en">("te");
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState("");

useEffect(() => {
    // 1. Language Load
    AsyncStorage.getItem("APP_LANG").then((l) => {
      if (l) setLanguage(l as any);
    });

    // 2. Real-time Listener Setup
    let unsubscribe: () => void;

    const setupListener = async () => {
      const phone = await AsyncStorage.getItem("USER_PHONE");
      if (!phone) {
        setLoading(false);
        return;
      }

      // Firestore Listener
      unsubscribe = firestore()
        .collection("machines")
        .where("userId", "==", phone)
        .onSnapshot(
          (snap) => {
            if (!snap) {
              setMachines([]);
              setLoading(false);
              return;
            }
            const list = snap.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));

            // Sorting (Latest first)
            list.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            
            setMachines(list);
            setLoading(false);
          },
          (error) => {
            console.log("Firestore error:", error);
            setLoading(false);
          }
        );
    };

    setupListener();

    // 3. Cleanup (ఇక్కడ ఎర్రర్ రాదు)
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
  const loadMachines = () => {
    setLoading(true);
    AsyncStorage.getItem("USER_PHONE").then((phone) => {
      if (!phone) {
        setLoading(false);
        return;
      }

      firestore()
        .collection("machines")
        .where("userId", "==", phone)
        .onSnapshot(
          (snap) => {
            if (!snap) {
              setMachines([]);
              setLoading(false);
              return;
            }
            const list: any[] = [];
            snap.docs.forEach((doc) => {
              list.push({ id: doc.id, ...doc.data() });
            });
            // Client side sorting if index is not created
            list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setMachines(list);
            setLoading(false);
          },
          (error) => {
            console.log("Firestore error:", error);
            setLoading(false);
          }
        );
    });
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async () => {
    try {
      if (!selectedId) {
        console.log("No Machine ID selected");
        return;
      }

      // Firestore నుంచి డాక్యుమెంట్ ని డిలీట్ చేయడం
      await firestore()
        .collection("machines")
        .doc(selectedId)
        .delete();

      // డిలీట్ అయ్యాక మోడల్ క్లోజ్ చేయడం
      setDeleteModal(false);
      setSelectedId(""); // ID ని రీసెట్ చేయడం

      console.log("Machine deleted successfully!");
    } catch (error) {
      console.log("Error deleting machine:", error);
      // ఒకవేళ ఎర్రర్ వస్తే యూజర్ కి తెలిసేలా చిన్న అలర్ట్ (ఆప్షనల్)
      alert(language === "te" ? "తొలగించడం కుదరలేదు" : "Failed to delete");
    }
  };

const getImage = (type: string) => {
  if (!type) return require("@/assets/images/John-deere-Tractors..jpg");

  const t = type.toLowerCase();

  
// 1. MINI TRACTOR
  if (t.includes("mini tractor") || t.includes("మినీ ట్రాక్టర్")) {
    return require("@/assets/images/mini.webp");
  }

  // 3. POWER TILLER
  if (t.includes("power tiller") || t.includes("పవర్ టిల్లర్")) {
    return require("@/assets/images/tiller.avif");
  }

  // 4. COMBINE HARVESTER
  if (t.includes("combine harvester") || t.includes("కంబైన్డ్ హార్వెస్టర్") || t.includes("కోత మిషన్")) {
    return require("@/assets/images/harvester.jpg");
  }

  // 5. PADDY TRANSPLANTER
  if (t.includes("paddy transplanter") || t.includes("వరి నాటు యంత్రం")) {
    return require("@/assets/images/vari.png");
  }
  // 8. SEED DRILL
  if (t.includes("seed drill") || t.includes("విత్తన గొర్రు") || t.includes("సీడ్ డ్రిల్")) {
    return require("@/assets/images/seeddrill.jpg");
  }
  // TATA ACE / MINI TRUCK
if (
  t.includes("tata") || 
  t.includes("ace") || 
  t.includes("ఏస్") || 
  t.includes("ఏనుగు") ||
  t.includes("mini truck")
) {
  // నీ దగ్గర ఉన్న టాటా ఏస్ ఇమేజ్ నేమ్ ఇక్కడ ఇవ్వు
  return require("@/assets/images/tataace.jpg"); 
}

  // 9. POWER SPRAYER
  if (t.includes("sprayer") || t.includes("స్ప్రేయర్")) {
    return require("@/assets/images/sprayer.jpg");
  }
  // 2. TRACTORS
  if (t.includes("tractor") || t.includes("ట్రాక్టర్")) {
    return require("@/assets/images/John-deere-Tractors..jpg");
  }
  // BULLDOZER / DOZER
if (
  t.includes("dozer") || 
  t.includes("డొజర్") || 
  t.includes("bulldozer")
) {
  // నీ దగ్గర ఉన్న డొజర్ ఇమేజ్ నేమ్ ఇక్కడ ఇవ్వు
  return require("@/assets/images/dozer.avif"); 
}

  // 10. DRONE SPRAYER
  if (t.includes("drone sprayer") || t.includes("డ్రోన్ స్ప్రేయర్")) {
    return require("@/assets/images/drone.jpg");
  }

  // 11. THRESHER
  if (t.includes("thresher") || t.includes("నూర్పిడి యంత్రం") || t.includes("థ్రెషర్")) {
    return require("@/assets/images/tresher.jpg");
  }

  // 12. BALER
  if (t.includes("baler") || t.includes("గడ్డి కట్టల మిషన్") || t.includes("బేలర్")) {
    return require("@/assets/images/baler.jpg");
  }

  // 13. JCB / BACKHOE
  if (t.includes("jcb") || t.includes("జెసిబి") || t.includes("backhoe")) {
    return require("@/assets/images/jcb.webp");
  }

  // AUTO TROLLEY / 3-WHEELER
if (
  t.includes("auto") || 
  t.includes("ఆటో") || 
  t.includes("trolley") || 
  t.includes("ట్రాలీ") ||
  t.includes("ape") ||
  t.includes("అప్పే")
) {
  // నీ దగ్గర ఉన్న ఆటో ట్రాలీ ఇమేజ్ నేమ్ ఇక్కడ ఇవ్వు
  return require("@/assets/images/auto.webp"); 
}
  // 2. CHAIN EXCAVATOR / POCLAIN (కొత్తది)
if (
  t.includes("excavator") || 
  t.includes("poclain") || 
  t.includes("పొక్లెయిన్") || 
  t.includes("ఎక్స్కవేటర్") ||
  t.includes("హిటాచి") // రైతులు హిటాచి అని కూడా పిలుస్తారు
) {
  // ఇక్కడ నీ దగ్గర ఉన్న చెయిన్ హిటాచి/పొక్లెయిన్ ఇమేజ్ నేమ్ ఇవ్వు
  return require("@/assets/images/chain.jpg"); 
}
  // 14. TIPPER / TROLLEY
  if (t.includes("tipper") || t.includes("టిప్పర్") || t.includes("trolley") || t.includes("ట్రాలీ")) {
    return require("@/assets/images/tataace.jpg");
  }

  // 15. DIGGER
  if (t.includes("digger") || t.includes("గుంతలు తీసే యంత్రం")) {
    return require("@/assets/images/digger.jpg");
  }

  // 16. LASER LAND LEVELER
  if (t.includes("laser land leveler") || t.includes("లేజర్ ల్యాండ్ లెవెలర్")) {
    return require("@/assets/images/laser.jpg");
  }

  // 17. CHAFF CUTTER
  if (t.includes("chaff cutter") || t.includes("గడ్డి కత్తిరించే యంత్రం")) {
    return require("@/assets/images/chaff.jpg");
  }

  // 20. MAIZE SHELLER
  if (t.includes("maize sheller") || t.includes("మొక్కజొన్న వొలిచే యంత్రం")) {
    return require("@/assets/images/maize.jpg");
  }
};
  /* ---------------- RENDERS ---------------- */

  const renderShimmer = () => (
    <View style={styles.card}>
      <Shimmer style={styles.shimmerImage} />
      <View style={{ padding: 15 }}>
        <Shimmer style={styles.shimmerTitle} />
        <Shimmer style={[styles.shimmerTitle, { width: '40%', marginTop: 10 }]} />
      </View>
    </View>
  );

 const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      {/* 1. TOP IMAGE SECTION (Clean Look) */}
      <View style={styles.imageWrapper}>
        <Image source={getImage(item.equipment)} style={styles.image} />
        <View style={styles.badge}>
          <AppText style={styles.badgeText}>
            {language === "te" ? "యాక్టివ్" : "Active"}
          </AppText>
        </View>
      </View>

      {/* 2. DETAILS SECTION */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <AppText style={styles.cardTitle}>{item.equipment}</AppText>
        </View>
        <View style={styles.infoRow}>
         <View style={styles.locationTag}>
             <Ionicons name="location" size={14} color="#16A34A" />
             <AppText style={styles.locationLabel}>{item.village}</AppText>
          </View>
          </View>
        <View style={styles.infoRow}>
          <Ionicons name="call" size={16} color="#4B5563" />
          <AppText style={styles.infoText}>{item.phone}</AppText>
        </View>

        {/* OPERATIONS TAGS */}
        <View style={styles.tagWrapper}>
          {item.operations?.slice(0, 3).map((op: string, i: number) => (
            <View key={i} style={styles.tag}>
              <AppText style={styles.tagText}>{op}</AppText>
            </View>
          ))}
        </View>

        {/* 3. MODERN ACTION BUTTONS (Bottom of the Card) */}
        <View style={styles.actionFooter}>
          <TouchableOpacity 
            activeOpacity={0.7}
            style={[styles.footerBtn, { borderColor: '#E5E7EB' }]}
            onPress={() => router.push({ pathname: "/farmer/bookings/add-machine", params: { machineId: item.id } })}
          >
            <Ionicons name="create-outline" size={18} color="#2563EB" />
            <AppText style={[styles.footerBtnText, { color: '#2563EB' }]}>
              {language === "te" ? "సవరించు" : "Edit"}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7}
            style={[styles.footerBtn, { borderColor: '#FEE2E2', backgroundColor: '#FEF2F2' }]}
            onPress={() => { setSelectedId(item.id); setDeleteModal(true); }}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <AppText style={[styles.footerBtnText, { color: '#EF4444' }]}>
              {language === "te" ? "తొలగించు" : "Delete"}
            </AppText>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <AppHeader
        title={language === "te" ? "నా యంత్రాలు" : "My Machines"}
        subtitle={language === "te" ? "మీరు జోడించిన యంత్రాల జాబితా" : "List of machines you added"}
        language={language}
      />

      {loading ? (
        <FlatList
          data={[1, 2, 3]}
          renderItem={renderShimmer}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={{ padding: 16 }}
        />
      ) : machines.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="tractor" size={80} color="#D1D5DB" />
          <AppText style={styles.emptyText}>
            {language === "te" ? "యంత్రాలు ఏవీ లేవు" : "No machines added yet"}
          </AppText>
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => router.push("/farmer/bookings/add-machine")}
          >
            <AppText style={{color: '#fff', fontWeight: '600'}}>
              {language === "te" ? "కొత్తది జోడించండి" : "Add New Machine"}
            </AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={machines}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* DELETE MODAL */}
      <Modal visible={deleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Ionicons name="alert-circle" size={50} color="#EF4444" />
            <AppText style={styles.modalTitle}>
              {language === "te" ? "నిజంగా తొలగించాలా?" : "Are you sure?"}
            </AppText>
            <AppText style={styles.modalSub}>
              {language === "te" ? "ఈ సమాచారం శాశ్వతంగా తొలగించబడుతుంది." : "This machine details will be permanently deleted."}
            </AppText>

            <View style={styles.modalRow}>
              <TouchableOpacity activeOpacity={0.8} style={styles.cancelBtn} onPress={() => setDeleteModal(false)}>
                <AppText style={{fontWeight: '600'}}>{language === "te" ? "వద్దు" : "Cancel"}</AppText>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} style={styles.deleteBtn} onPress={handleDelete}>
                <AppText style={{color: '#fff', fontWeight: '600'}}>{language === "te" ? "అవును" : "Delete"}</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#F3F4F6" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageWrapper: { width: "100%", height: 250, position: 'relative' },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  badge: { 
    position: 'absolute', 
    bottom: 10, 
    left: 15, 
    backgroundColor: 'rgba(22, 163, 74, 0.9)', 
    paddingHorizontal: 12, 
    paddingVertical: 4,
    borderRadius: 12 
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  
  content: { padding: 18 },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 10 
  },
  cardTitle: { fontSize: 19, fontWeight: "600", color: "#111827" },
  locationTag: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 8,
    backgroundColor: '#F0FDF4', 
    paddingVertical: 4, 
    borderRadius: 8 
  },
  locationLabel: { fontSize: 12, color: '#16A34A', marginLeft: 4, fontWeight: '600' },
  
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  infoText: { fontSize: 14, color: "#4B5563", marginLeft: 8 },
  
  tagWrapper: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginTop: 5, 
    marginBottom: 15 
  },
  tag: { 
    backgroundColor: '#F3F4F6', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 8, 
    marginRight: 8, 
    marginBottom: 5 
  },
  tagText: { fontSize: 11, color: '#4B5563' },

  // ACTION FOOTER STYLES
  actionFooter: { 
    flexDirection: 'row', 
    borderTopWidth: 1, 
    borderTopColor: '#F3F4F6', 
    paddingTop: 15,
    justifyContent: 'space-between'
  },
  footerBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    width: '48%' // బటన్స్ పక్కపక్కన సమానంగా ఉండటానికి
  },
  footerBtnText: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginLeft: 8 
  },

  // Shimmer
  shimmerImage: { width: '100%', height: 250 },
  shimmerTitle: { width: '70%', height: 20, borderRadius: 5, marginTop: 15 },
  
  moreText: { fontSize: 12, color: '#9CA3AF', alignSelf: 'center' },


  // Modal & Others
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalBox: { backgroundColor: "#fff", padding: 25, borderRadius: 25, width: "100%", alignItems: "center" },
  modalTitle: { fontSize:20, fontWeight: "600", marginTop: 15 },
  modalSub: { color: '#6B7280', textAlign: 'center', marginTop: 8 },
  modalRow: { flexDirection: "row", marginTop: 25, width: '100%' },
  cancelBtn: { flex: 1, padding: 15, borderRadius: 15, backgroundColor: '#F3F4F6', alignItems: 'center', marginRight: 10 },
  deleteBtn: { flex: 1, padding: 15, borderRadius: 15, backgroundColor: '#EF4444', alignItems: 'center' },
  
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 },
  emptyText: { fontSize: 16, color: "#9CA3AF", marginTop: 15 },
  addBtn: { marginTop: 20, backgroundColor: '#16A34A', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 15 }
});