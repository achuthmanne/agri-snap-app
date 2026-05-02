// This is the main attendance screen for Mestris. It lists all mestris, allows searching, and provides options to view details, edit, call, or delete each mestri. It also has a button to add new mestris.
// app/farmer/attendance.tsx
import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import {
  FlatList, Linking, SafeAreaView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Menu, MenuOption, MenuOptions, MenuTrigger } from "react-native-popup-menu";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";

export default function AttendanceScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [language, setLanguage] = useState<"te" | "en">("te");
  const [mestris, setMestris] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
 const [search, setSearch] = useState("");
const [isFocused, setIsFocused] = useState(false);
const [deleteItem, setDeleteItem] = useState<any>(null);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [isListening, setIsListening] = useState(false);
const isScreenFocused = useIsFocused();
const [activeSession, setActiveSession] = useState("");

useSpeechRecognitionEvent("result", (event) => {

  // 🔥 FIX: only current screen lo unna appude work avvali
  if (!isScreenFocused || !isListening) return;

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
  if (!isScreenFocused) {
    ExpoSpeechRecognitionModule.stop();
    setIsListening(false);
  }

  return () => {
    ExpoSpeechRecognitionModule.stop(); // 🔥 ADD
  };
}, [isScreenFocused]);

  const filteredMestris = mestris.filter((item) =>
(item.name || "").toLowerCase().includes(search.trim().toLowerCase())
);

useEffect(() => {
  const loadLang = async () => {
    const lang = await AsyncStorage.getItem("APP_LANG");
    if (lang) setLanguage(lang as "te" | "en");
  };

  loadLang();
}, []);

useEffect(() => {
  let unsubscribe: any;

  const loadData = async () => {
    const userPhone = (await AsyncStorage.getItem("USER_PHONE")) ?? "";
    if (!userPhone) {
  setLoading(false);
  return;
}

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

    unsubscribe = firestore()
      .collection("users")
      .doc(userPhone)
      .collection("mestris")
      .where("session", "==", session)
      .orderBy("createdAt", "desc")
     .onSnapshot((snapshot) => {

  const list: any[] = [];

  snapshot.forEach((doc) => {
    list.push({
      id: doc.id,
      ...doc.data()
    });
  });

  setMestris(list);
  setLoading(false); // ✅ direct
});
  };

  loadData();

  return () => unsubscribe && unsubscribe();
}, []);


const handleDelete = (item: any) => {
  setDeleteItem(item);
  setShowDeleteModal(true);
};
const confirmDelete = async () => {
  if (!deleteItem) return;

  try {
    const userPhone = (await AsyncStorage.getItem("USER_PHONE")) ?? "";

if (!userPhone || !activeSession) {
  setShowDeleteModal(false);
  return;
}
    const mestriRef = firestore()
      .collection("users")
      .doc(userPhone)
      .collection("mestris")
      .doc(deleteItem.id);

    // 🔥 STEP 1: get attendance
    const attendanceRef = mestriRef.collection("attendance");
    const attendanceSnap = await attendanceRef
  .where("session", "==", activeSession)
  .get();

const batch = firestore().batch();

attendanceSnap.docs.forEach(doc => {
  batch.delete(doc.ref);
});

await batch.commit();

    // 🔥 STEP 3: delete mestri document itself
    await mestriRef.delete();

    console.log("FULL DELETE DONE ✅");

    setShowDeleteModal(false);
    setDeleteItem(null);

  } catch (e) {
    console.log("Delete error:", e);
  }
};
const avatarColors = [
  "#22C55E", "#3B82F6", "#F59E0B", "#EF4444",
  "#8B5CF6", "#14B8A6", "#F97316", "#6366F1",
  "#10B981", "#E11D48"
];

const getColor = (id: string) => {
  const index = id.charCodeAt(0) % avatarColors.length;
  return avatarColors[index];
};
const handleEdit = (item: any) => {
  router.push({
    pathname: "/farmer/mestri/edit/[id]",
    params: { id: item.id }
  });
};
const ShimmerRow = () => (
  <View style={styles.row}>

    <ShimmerPlaceholder
      LinearGradient={LinearGradient}
      style={{ width: 42, height: 42, borderRadius: 21 }}
    />

    <View style={{ flex: 1, marginLeft: 12 }}>

      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={{ width: "60%", height: 14, borderRadius: 6 }}
      />

      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={{ width: "40%", height: 12, borderRadius: 6, marginTop: 6 }}
      />

      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={{ width: "50%", height: 12, borderRadius: 6, marginTop: 6 }}
      />

    </View>

  </View>
);

const handleCall = (phone: string) => {
  if (!phone) return;

  const url = `tel:${phone}`;

  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        console.log("Dialer not supported");
      }
    })
    .catch((err) => console.log(err));
};

const optionsStyles = {
  optionsContainer: {
    borderRadius: 10,
    padding: 4,

    backgroundColor: "#fff",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5
  }
};
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <AppHeader
              title={language === "te" ? "కూలీ మేస్త్రీలు" : "Kuli Mestris"}
              subtitle={language === "te" ? "హాజరు నిర్వహణ" : "Attendance Management"}
              language={language}
            />
        
  {/* SEARCH */}
<View style={[
  styles.searchContainer,
  { borderColor: isFocused ? "#16A34A" : "#E5E7EB" }
]}>
  <Ionicons name="search" size={18} color={isFocused ? "#16A34A" : "#9CA3AF"} />

  <TextInput
    value={search}
    onChangeText={setSearch}
    placeholder={
    language === "te"
      ? "మేస్త్రీని వెతకండి..."
      : "Search mestri..."
  }
    placeholderTextColor="#9CA3AF"
    cursorColor={'green'}
    selectionColor={'green'}
    onFocus={() => setIsFocused(true)}
    onBlur={() => setIsFocused(false)}
    style={[styles.searchInput, { fontFamily: 'Mandali' }]}
  />

  {search.length > 0 ? (
    <TouchableOpacity onPress={() => setSearch("")} >
      <Ionicons name="close-circle" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  ) : (
    <TouchableOpacity 
      onPress={handleVoiceSearch}   style={{
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

{loading ? (
  <>
    <ShimmerRow />
    <ShimmerRow />
    <ShimmerRow />
    <ShimmerRow />
  </>
) :(
      <FlatList
  data={filteredMestris}
  keyExtractor={(item) => item.id}
  contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
  showsVerticalScrollIndicator={false}

 ListEmptyComponent={
  <View style={styles.emptyBox}>

    <Ionicons
      name={search.trim().length > 0 ? "search-outline" : "people-outline"}
      size={60}
      color="#9CA3AF"
    />

    <AppText style={styles.emptyTitle} language={language}>
      {search.trim().length > 0
        ? (language === "te" ? "ఏమి దొరకలేదు" : "Not Found")
        : (language === "te" ? "మేస్త్రీలు లేరు" : "No Mestris")}
    </AppText>

    <AppText style={styles.emptySub} language={language}>
      {search.trim().length > 0
        ? (language === "te"
            ? "మీ శోధనకు సరిపడే ఫలితాలు లేవు"
            : "No results match your search")
        : (language === "te"
            ? "+ బటన్ నొక్కి మేస్త్రీలను చేర్చండి"
            : "Tap + button to add mestris")}
    </AppText>

  </View>
}

renderItem={({ item }) => (
  <View style={styles.row}>

    {/* LEFT CLICKABLE AREA */}
    <TouchableOpacity
      style={styles.left}
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: "/farmer/mestri/[id]",
          params: { id: item.id }
        })
      }
    >

      {/* AVATAR */}
      <View style={[styles.avatar, { backgroundColor: getColor(item.id) }]}>
        <AppText style={styles.avatarText} language={language}>
          {item.name?.charAt(0)?.toUpperCase()}
        </AppText>
      </View>

      {/* DETAILS */}
      <View style={styles.details}>
        <AppText style={styles.name} language={language}>
          {item.name}
        </AppText>

 <AppText style={styles.phone} language={language}>
        +91 - {item.phone || "----"}
        </AppText>

        <AppText style={styles.sub} language={language}>
          {item.village || "----"}
        </AppText>

      </View>

    </TouchableOpacity>

    {/* RIGHT SIDE (NON CLICKABLE FOR NAVIGATION) */}
    <View style={styles.right}>

      {/* CALL */}
      <TouchableOpacity
        style={styles.callBtn}
        onPress={() => handleCall(item.phone || "")}
      >
       
        <Ionicons name="call" size={16} color="#16A34A" />
      </TouchableOpacity>

      {/* MENU */}
      <Menu>
        <MenuTrigger>
          <Ionicons name="ellipsis-vertical" size={18} color="#6B7280" />
        </MenuTrigger>

        <MenuOptions customStyles={optionsStyles}>
          <MenuOption onSelect={() => handleEdit(item)}>
            <View style={styles.menuItem}>
              <Ionicons name="create-outline" size={16} color="#2563EB" />
              <AppText language={language}>
                {language === "te" ? "మార్చు" : "Edit"}
              </AppText>
            </View>
          </MenuOption>

          <MenuOption onSelect={() => handleDelete(item)}>
            <View style={styles.menuItem}>
              <Ionicons name="trash-outline" size={16} color="#DC2626" />
              <AppText language={language}>
                {language === "te" ? "తొలగించు" : "Delete"}
              </AppText>
            </View>
          </MenuOption>
        </MenuOptions>
      </Menu>

    </View>

  </View>
)}

/>
)}
      {/* ADD BUTTON */}
      <TouchableOpacity activeOpacity={0.8}
        style={styles.addBtn}
        onPress={() => router.push("/farmer/mestri/add-mestri")}
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
              <Ionicons name="warning" size={36} color="#DC2626" />
            </View>
      <AppText style={styles.modalTitle} language={language}>
        {language === "te" ? "తొలగించాలా?" : "Delete Mestri?"}
      </AppText>

      <AppText style={styles.modalSub} language={language}>
        {language === "te"
          ? "ఈ మేస్త్రీని పూర్తిగా తొలగించాలా?"
          : "Are you sure you want to delete this mestri?"}
      </AppText>

      <View style={styles.modalBtns}>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => setShowDeleteModal(false)}
        >
          <AppText language={language}>
            {language === "te" ? "వద్దు" : "Cancel"}
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={confirmDelete}
        >
          <AppText style={{ color: "white" }} language={language}>
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F6F7F6"
  },
searchWrapper: {
  paddingHorizontal: 20,
  marginTop: 10,
  alignItems: "flex-end"
},


row: {
   flexDirection: "row",
  alignItems: "center",
  paddingVertical: 14,
  marginHorizontal: 20,
  justifyContent: "space-between",

  marginVertical: 6,

  paddingHorizontal: 12,

  borderWidth: 1,
  borderColor:"#E5E7EB",

  borderRadius: 12,

  backgroundColor:"#ffffff",
},

left: {
  flexDirection: "row",
  alignItems: "center",
  flex: 1
},
searchBox: {
  borderWidth: 1.5,
  borderRadius: 14,
  paddingHorizontal: 12,
  height: 44,
  flexDirection: "row",
  alignItems: "center"
},
avatar: {
  width: 42,
  height: 42,
  borderRadius: 21,
  justifyContent: "center",
  alignItems: "center",
  marginRight: 12
},
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
avatarText: {
  color: "#fff",
  fontSize: 15,
  fontWeight: "600"
},


details: {
  flex: 1,
  gap: 4,
  marginLeft: 8   // 🔥 clean spacing
},
/* RIGHT */

right: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
},

callBtn: {
  width: 34,
  height: 34,
  borderRadius: 10,

  backgroundColor: "#ECFDF5", // light green box
  justifyContent: "center",
  alignItems: "center"
},

menuText: {
  padding: 10,
  fontSize: 14
},
inputWrap: {
  flex: 1,
  marginLeft: 8,
  justifyContent: "center"
},

input: {
  fontSize: 14,
  color: "#111827",
  padding: 0
},

placeholder: {
  position: "absolute",
  left: 0,
  fontSize: 14,
  color: "#9CA3AF"
},
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },

 

 name: {
  fontSize: 15,
  fontWeight: "600",
  color: "#0F172A",
  lineHeight: 24   // 🔥 ADD THIS
},

sub: {
  fontSize: 12,
  color: "#64748B",
  lineHeight: 20   // 🔥 ADD THIS
},

phone: {
  fontSize: 12,
  color: "#16A34A",
  lineHeight: 14
},

emptyBox: {
  marginTop: 100,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 20
},

emptyTitle: {
  marginTop: 12,
  fontSize: 16,
  fontWeight: "600",
  color: "#1F2937"
},

emptySub: {
  marginTop: 6,
  fontSize: 13,
  color: "#6B7280",
  textAlign: "center"
},
menuItem: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  paddingVertical: 8,
  paddingHorizontal: 10
},

editText: {
  fontSize: 13,
  color: "#2563EB",
  includeFontPadding: false,
  lineHeight: 16
},

deleteText: {
  fontSize: 13,
  color: "#DC2626",
  includeFontPadding: false,
  lineHeight: 16
},
   addBtn: { position: "absolute", bottom: 30, right: 20 },

  addGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center"
  },

inputWrapper: {
  flex: 1,
  marginLeft: 8,
  justifyContent: "center"
},
containerRow: {
  marginHorizontal: 20,
  paddingVertical: 14,

  borderBottomWidth: 1,
  borderBottomColor: "#F1F5F9"
},

topSection: {
  flexDirection: "row",
  alignItems: "center"
},


nameRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center"
},



rowItem: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 4,
  gap: 5
},
iconBg: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: "#f5eae8",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 10
},


/* ACTIONS */
actionRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 8,
  marginLeft: 54
},
actionBtn: {
  flexDirection: "row",
  alignItems: "center",

  paddingVertical: 4,
  paddingHorizontal: 6,

  gap: 4   // 🔥 small gap only
},

actionText: {
  fontSize: 12,
  color: "#64748B",
  marginLeft: 50
},

divider: {
  width: 1,
  height: 12,
  backgroundColor: "#E5E7EB",
  marginHorizontal: 6   // 🔥 reduce gap
},


topRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center"
},


actions: {
  marginLeft: 10,
  gap: 10
},
overlay: {
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999
},

modalBox: {
  width: "80%",
  backgroundColor: "#fff",
  borderRadius: 20,
  padding: 24,
  alignItems: "center"
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
}
});