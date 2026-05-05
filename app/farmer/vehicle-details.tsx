//vechile details
import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { useEffect, useState } from "react";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import React, { useCallback } from "react";
import {
  FlatList,
  Linking,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Menu, MenuOption, MenuOptions, MenuTrigger } from "react-native-popup-menu";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
export default function VehicleDetails() {

  const router = useRouter();
  const { id, name, number, type } = useLocalSearchParams();

  const vehicleNumber = Array.isArray(number) ? number[0] : number;
  const vehicleType = Array.isArray(type) ? type[0] : type;

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"te" | "en">("te");

  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
const [deleteItem, setDeleteItem] = useState<any>(null);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [isListening, setIsListening] = useState(false);
const isScreenFocused = useIsFocused();

useSpeechRecognitionEvent("result", (event) => {
  // 🔥 ONLY THIS SCREEN ACTIVE UNTE MATRAM
  if (!isScreenFocused) return;

  if (event.results && event.results.length > 0) {
    setSearch(event.results[0].transcript);
  }
});

  useSpeechRecognitionEvent("end", () => setIsListening(false));

  const handleVoiceSearch = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) return;
  
    setIsListening(true);
    ExpoSpeechRecognitionModule.start({
      lang: language === "te" ? "te-IN" : "en-US",
      interimResults: true,
    });
  };
  useEffect(() => {
  return () => {
    ExpoSpeechRecognitionModule.stop(); // 🔥 stop when leaving screen
  };
}, []);
/* ---------------- LOAD ---------------- */

  useFocusEffect(
    useCallback(() => {
      let unsub: any;

      const load = async () => {
        try {
          const phone = await AsyncStorage.getItem("USER_PHONE");
          if (!phone) return;

          setLoading(true);

          const userDoc = await firestore()
            .collection("users")
            .doc(phone)
            .get();

          const activeSession = userDoc.data()?.activeSession;

          if (!activeSession) {
            setData([]); // సెషన్ లేకపోతే లిస్ట్ ఖాళీ
            setLoading(false);
            return;
          }

          unsub = firestore()
            .collection("users")
            .doc(phone)
            .collection("vehicles")
            .doc(id as string)
            .collection("farmers")
            .where("session", "==", activeSession) // 🔥 సెషన్ ఫిల్టర్
            // ❌ .orderBy తీసేశాను (Index ఇష్యూ రాకుండా ఉండటానికి)
            .onSnapshot(
              (snap) => {
                if (!snap || !snap.docs) {
                  setData([]);
                  setLoading(false);
                  return;
                }

                const list: any[] = [];
                snap.forEach(doc => {
                  const d = doc.data();
                  if (!d) return;
                  list.push({ id: doc.id, ...d });
                });

                // 🔥 జావాస్క్రిప్ట్ లోనే లేటెస్ట్ ముందు వచ్చేలా సార్ట్ చేస్తున్నాం
                list.sort((a, b) => {
                  const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                  const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                  return timeB - timeA;
                });

                setData(list);
                setLoading(false);
              },
              (error) => {
                console.log("Firestore Error: ", error);
                setLoading(false);
              }
            );
        } catch (error) {
          console.log("Loading Error: ", error);
          setLoading(false);
        }
      };

      load();

      // స్క్రీన్ నుండి బయటకి వెళ్లగానే listener ఆగిపోయేలా
      return () => {
        if (unsub) unsub();
      };
    }, [id])
  );
  // 🔥 useEffect బదులు useFocusEffect వాడుతున్నాం
  useFocusEffect(
    useCallback(() => {
      let unsub: any;

      const load = async () => {
        const phone = await AsyncStorage.getItem("USER_PHONE");
        if (!phone) return;

        setLoading(true);

        const userDoc = await firestore()
          .collection("users")
          .doc(phone)
          .get();

        const activeSession = userDoc.data()?.activeSession;

        if (!activeSession) {
          setLoading(false);
          return;
        }

        unsub = firestore()
          .collection("users")
          .doc(phone)
          .collection("vehicles")
          .doc(id as string)
          .collection("farmers")
          .where("session", "==", activeSession) 
          .orderBy("createdAt", "desc")
          .onSnapshot((snap) => {

            if (!snap || !snap.docs) {
              setLoading(false);
              return;
            }

            const list: any[] = [];

            snap.forEach(doc => {
              const d = doc.data();
              if (!d) return;
              list.push({ id: doc.id, ...d });
            });

            setData(list);
            setLoading(false);
          });
      };

      load();

      // స్క్రీన్ నుండి బయటకి వెళ్లగానే listener ఆగిపోయేలా
      return () => {
        if (unsub) unsub();
      };

    }, [id]) // id మారినా కూడా మళ్లీ ఫ్రెష్ గా డేటా తెస్తుంది
  );

  useEffect(() => {
    let unsub: any;

    const load = async () => {
      const phone = await AsyncStorage.getItem("USER_PHONE");
      if (!phone) return;

      setLoading(true);

     const userDoc = await firestore()
  .collection("users")
  .doc(phone)
  .get();

const activeSession = userDoc.data()?.activeSession;

if (!activeSession) {
  setLoading(false);
  return;
}

unsub = firestore()
  .collection("users")
  .doc(phone)
  .collection("vehicles")
  .doc(id as string)
  .collection("farmers")
  .where("session", "==", activeSession) // 🔥 ADD THIS
  .orderBy("createdAt", "desc")
  .onSnapshot((snap) => {

    if (!snap || !snap.docs) {
      setLoading(false);
      return;
    }

    const list: any[] = [];

    snap.forEach(doc => {
      const d = doc.data();
      if (!d) return;
      list.push({ id: doc.id, ...d });
    });

    setData(list);
    setLoading(false);
  });
    };

    load();
    return () => unsub && unsub();

  }, []);

  /* ---------------- FILTER ---------------- */

  const filtered = data.filter(item =>
    item.farmerName?.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------------- COLORS ---------------- */

  const colors = ["#22C55E","#3B82F6","#F59E0B","#EF4444","#8B5CF6"];

  const getColor = (id: string) => {
    return colors[id.charCodeAt(0) % colors.length];
  };

  /* ---------------- CALL ---------------- */

  const handleCall = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

const handleEdit = (item: any) => {
  router.push({
    pathname: "/farmer/vehicle-farmers",
    params: {
      vehicleId: id,
      editId: item.id,
      name: item.farmerName,
      phone: item.phone,
      village: item.village
    }
  });
};

const handleDelete = (item: any) => {
  setDeleteItem(item);
  setShowDeleteModal(true);
};

const confirmDelete = async () => {
  if (!deleteItem) return;

  const phone = await AsyncStorage.getItem("USER_PHONE");
  if (!phone) return;

  // 🔥 INSTANT UI REMOVE
  setData(prev => prev.filter(item => item.id !== deleteItem.id));

  setShowDeleteModal(false);

  try {
    await firestore()
      .collection("users")
      .doc(phone)
      .collection("vehicles")
      .doc(id as string)
      .collection("farmers")
      .doc(deleteItem.id)
      .delete();
  } catch (e) {
    console.log(e);
  }

  setDeleteItem(null);
};
  /* ---------------- SHIMMER ---------------- */

  const ShimmerRow = () => (
    <View style={styles.row}>
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={{ width: 42, height: 42, borderRadius: 21 }}
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: "60%", height: 14 }} />
        <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: "40%", height: 12, marginTop: 6 }} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

     <AppHeader
        title={language === "te" ? "రైతుల జాబితా" : "Farmers List"}
        subtitle={
          vehicleNumber && vehicleNumber.trim() !== ""
            ? `${name || vehicleType} | ${vehicleNumber}` // ఉదాహరణకి: Mahindra Tractor • AP 39 AB 1234
            : `${name || vehicleType || (language === "te" ? "వాహన వివరాలు" : "Vehicle Details")}`
        }
        language={language}
      />

      {/* SEARCH */}
     <View style={[styles.searchContainer, { borderColor: isFocused ? "#16A34A" : "#E5E7EB" }]}>
        <Ionicons name="search" size={18} color={isFocused ? "#16A34A" : "#9CA3AF"} />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={language === "te" ? "రైతును వెతకండి..." : "Search farmer..."}
          placeholderTextColor="#9CA3AF"
          cursorColor={'green'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.searchInput, { fontFamily: 'Mandali' }]}
        />

        {search.length > 0 ? (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleVoiceSearch}  style={{
      marginLeft: 10,
      padding: 5,
      borderRadius: 50,
      backgroundColor: "#f0f9f3"
    }}>
            <MaterialCommunityIcons 
              name={isListening ? "microphone" : "microphone-outline"} 
              size={20} 
              color={isListening ? "#EF4444" : "#16A34A"} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* LIST */}
      {loading ? (
        <>
          <ShimmerRow />
          <ShimmerRow />
          <ShimmerRow />
        </>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}

          
           ListEmptyComponent={
            <View style={styles.emptyBox}>
          
              <Ionicons
                name={search.length > 0 ? "search-outline" : "people-outline"}
                size={60}
                color="#9CA3AF"
              />
          
              <AppText style={styles.emptyTitle} language={language}>
                {search.length > 0
                  ? (language === "te" ? "ఏమి దొరకలేదు" : "Not Found")
                  : (language === "te" ? "రైతులు లేరు" : "No Farmers Added")}
              </AppText>
          
              <AppText style={styles.emptySub} language={language}>
                {search.length > 0
                  ? (language === "te"
                      ? "మీ శోధనకు సరిపడే ఫలితాలు లేవు"
                      : "No results match your search")
                  : (language === "te"
                      ? "+ బటన్ నొక్కి రైతులను చేర్చండి"
                      : "Tap + button to add farmers")}
              </AppText>
          
            </View>
          }
          renderItem={({ item }) => {

            const color = getColor(item.id);

            return (
              <View style={styles.row}>

                {/* LEFT */}
                <TouchableOpacity
  style={styles.left}
  activeOpacity={0.8}
  onPress={() => {
    router.push({
      pathname: "/farmer/vfarmer-work",
      params: {
        vehicleId: id,
        farmerId: item.id,
        name: item.farmerName,
        phone: item.phone,
        village: item.village
      }
    });
  }}
>
                  <View style={[styles.avatar, { backgroundColor: color }]}>
                    <AppText style={styles.avatarText}>
                      {item.farmerName?.charAt(0)?.toUpperCase()}
                    </AppText>
                  </View>

                  <View style={styles.details}>
                    <AppText style={styles.name}>{item.farmerName}</AppText>

                    <AppText style={styles.phone}>
                      +91 - {item.phone || "----"}
                    </AppText>

                    <AppText style={styles.sub}>
                      {item.village || "----"}
                    </AppText>
                  </View>
                </TouchableOpacity>

                {/* RIGHT */}
                <View style={styles.right}>

                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => handleCall(item.phone)}
                  >
                    <Ionicons name="call" size={16} color="#16A34A" />
                  </TouchableOpacity>

                  <Menu>
                    <MenuTrigger>
                      <Ionicons name="ellipsis-vertical" size={18} color="#6B7280" />
                    </MenuTrigger>

                    <MenuOptions>

  <MenuOption onSelect={() => handleEdit(item)}>
    <View style={styles.menuItem}>
      <Ionicons name="create-outline" size={16} color="#2563EB" />
      <AppText>{language === "te" ? "మార్చు" : "Edit"}</AppText>
    </View>
  </MenuOption>

  <MenuOption onSelect={() => handleDelete(item)}>
    <View style={styles.menuItem}>
      <Ionicons name="trash-outline" size={16} color="#DC2626" />
      <AppText>{language === "te" ? "తొలగించు" : "Delete"}</AppText>
    </View>
  </MenuOption>

</MenuOptions>
                  </Menu>

                </View>

              </View>
            );
          }}
        />
      )}

      {/* ADD BUTTON */}
      <TouchableOpacity activeOpacity={0.8}
        style={styles.addBtn}
        onPress={() =>
          router.push({
            pathname: "/farmer/vehicle-farmers",
            params: { vehicleId: id }
          })
        }
      >
        <LinearGradient
                       colors={["#16A34A","#166534"]}
                       style={styles.addGradient}
                     >
                       <Ionicons name="add" size={30} color="#fff" />
                     </LinearGradient>
      </TouchableOpacity>
{showDeleteModal && (
  <View style={styles.overlay}>

    <View style={styles.modalBox}>

      <View style={styles.iconBg}>
        <Ionicons name="trash-outline" size={36} color="#DC2626" />
      </View>

      <AppText style={styles.modalTitle} language={language}>
        {language === "te" ? "తొలగించాలా?" : "Delete Entry?"}
      </AppText>

      <AppText style={styles.modalSub} language={language}>
        {language === "te"
          ? "ఈ వివరాన్ని తొలగించాలా?"
          : "Are you sure you want to delete this record?"}
      </AppText>

      <View style={styles.modalBtns}>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => setShowDeleteModal(false)}
        >
          <AppText>{language === "te" ? "వద్దు" : "Cancel"}</AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={confirmDelete}
        >
          <AppText style={{ color: "#fff" }}>
            {language === "te" ? "తొలగించు" : "Delete"}
          </AppText>
        </TouchableOpacity>

      </View>

    </View>

  </View>
)}
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({

  safe: { flex: 1, backgroundColor: "#F6F7F6" },
searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 14,
    height: 50, // కొంచెం హైట్ పెంచితే బాగుంటుంది
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    elevation: 1 // నీట్‌గా కనిపిస్తుంది
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: "#111827",
    paddingVertical: 0,
    height: '100%'
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    marginHorizontal: 20,
    marginVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor:"#E5E7EB",
    borderRadius: 12,
    backgroundColor:"#ffffff",
    justifyContent: "space-between"
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },

  avatarText: {
    color: "#fff",
    fontWeight: "600"
  },

  details: { flex: 1 },

  name: { fontSize: 15, fontWeight: "600" },

  phone: { fontSize: 12, color: "#16A34A" },

  sub: { fontSize: 12, color: "#6B7280" },

  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },

  callBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center"
  },

  emptyBox: {
    marginTop: 100,
    alignItems: "center"
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600"
  },

  emptySub: {
    marginTop: 6,
    fontSize: 13,
    color: "#6B7280"
  },

   addBtn: { position: "absolute", bottom: 30, right: 20 },

  addGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center"
  },
  overlay: {
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center"
},

modalBox: {
  width: "80%",
  backgroundColor: "#fff",
  borderRadius: 20,
  padding: 24,
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

modalTitle: {
  fontSize: 16,
  fontWeight: "600",
  marginTop: 10
},

modalSub: {
  fontSize: 13,
  color: "#6B7280",
  textAlign: "center",
  marginTop: 6
},

modalBtns: {
  flexDirection: "row",
  marginTop: 20,
  gap: 10
},

cancelBtn: {
  flex: 1,
  padding: 12,
  borderRadius: 12,
  backgroundColor: "#F1F5F9",
  alignItems: "center"
},

deleteBtn: {
  flex: 1,
  padding: 12,
  borderRadius: 12,
  backgroundColor: "#DC2626",
  alignItems: "center"
},

menuItem: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  padding: 10
}

});