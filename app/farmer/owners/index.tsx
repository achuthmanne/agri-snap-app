import AppEmptyState from "@/components/AppEmptyState"; 
import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Menu, MenuOption, MenuOptions, MenuTrigger } from "react-native-popup-menu";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";

export default function OwnersList() {

  const router = useRouter();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"te" | "en">("te");
  const [activeSession, setActiveSession] = useState("");

  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const isScreenFocused = useIsFocused();

  // 🔥 LOCK LOGIC & MODERN UI STATES
  const [actionLoading, setActionLoading] = useState(false);
  const [showCannotDeleteModal, setShowCannotDeleteModal] = useState(false);

  useSpeechRecognitionEvent("result", (event) => {
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
    return () => { ExpoSpeechRecognitionModule.stop(); };
  }, []);

  useEffect(() => {
    AsyncStorage.getItem("APP_LANG").then(l => { if (l) setLanguage(l as any); });
  }, []);

  /* ---------------- LOAD DATA ---------------- */
  useFocusEffect(
    useCallback(() => {
      let unsub: any;

      const loadData = async () => {
        try {
          const phone = await AsyncStorage.getItem("USER_PHONE");
          if (!phone) return;

          setLoading(true);

          const userDoc = await firestore().collection("users").doc(phone).get();
          const session = userDoc.data()?.activeSession;

          if (!session) {
            setData([]); 
            setLoading(false);
            return;
          }
          
          setActiveSession(session);

          // 🔥 Fetching "owners" instead of drivers
          unsub = firestore()
            .collection("users")
            .doc(phone)
            .collection("owners")
            .where("session", "==", session)
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

      loadData();

      return () => { if (unsub) unsub(); };
    }, [])
  );

  /* ---------------- FILTER & COLORS ---------------- */
  const filtered = data.filter(item =>
    item.ownerName?.toLowerCase().includes(search.toLowerCase())
  );

  const colors = ["#22C55E","#3B82F6","#F59E0B","#EF4444","#8B5CF6"];
  const getColor = (id: string) => colors[id.charCodeAt(0) % colors.length];

  const handleCall = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  // 🔥 CORE LOGIC: CHECK FOR ENTRIES TO LOCK EDIT/DELETE
  const checkHasRecords = async (ownerId: string) => {
    try {
      const phone = await AsyncStorage.getItem("USER_PHONE");
      if (!phone || !activeSession) return false;

      // చెక్ వర్క్స్ ఎంట్రీస్
      const entriesSnap = await firestore()
        .collection("users").doc(phone)
        .collection("owners").doc(ownerId)
        .collection("entries")
        .where("session", "==", activeSession)
        .limit(1)
        .get();

      return !entriesSnap.empty; 
    } catch (error) {
      console.log("Error checking records", error);
      return true; 
    }
  };

  const handleEditClick = async (item: any) => {
    setActionLoading(true);
    const hasRecords = await checkHasRecords(item.id);
    setActionLoading(false);

    router.push({
      pathname: "/farmer/owners/add-owner",
      params: {
        editId: item.id,
        name: item.ownerName,
        phone: item.phone,
        village: item.village,
        hasRecords: hasRecords ? "true" : "false" 
      }
    });
  };

  const handleDeleteClick = async (item: any) => {
    setActionLoading(true);
    const hasRecords = await checkHasRecords(item.id);
    setActionLoading(false);

    if (hasRecords) {
      setShowCannotDeleteModal(true); 
    } else {
      setDeleteItem(item);
      setShowDeleteModal(true); 
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    const phone = await AsyncStorage.getItem("USER_PHONE");
    if (!phone) return;

    setData(prev => prev.filter(item => item.id !== deleteItem.id));
    setShowDeleteModal(false);

    try {
      await firestore()
        .collection("users")
        .doc(phone)
        .collection("owners")
        .doc(deleteItem.id)
        .delete();
    } catch (e) {
      console.log("Delete Error:", e);
    }
    setDeleteItem(null);
  };

  // MODERN MENU STYLES
  const optionsStyles = {
    optionsContainer: {
      borderRadius: 14, paddingVertical: 5, paddingHorizontal: 0, width: 150,
      backgroundColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15, shadowRadius: 12, elevation: 8, marginTop: 25, 
    }
  };

  const ShimmerRow = () => (
    <View style={styles.row}>
      <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: 42, height: 42, borderRadius: 21 }} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: "60%", height: 14, borderRadius: 6 }} />
        <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: "40%", height: 12, borderRadius: 6, marginTop: 6 }} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {actionLoading && (
        <View style={styles.actionLoadingOverlay}>
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      )}

      <AppHeader
        title={language === "te" ? "వాహన యజమానులు" : "Vehicle Owners"}
        subtitle={language === "te" ? "మీ పొలంలో పని చేసిన వారు" : "Owners who worked in your field"}
        language={language}
      />

      {(!loading && data.length === 0) ? null : (
        <View style={[styles.searchContainer, isFocused && styles.searchFocused]}>
          <Ionicons name="search-outline" size={20} color={isFocused ? "#16A34A" : "#9CA3AF"} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={language === "te" ? "యజమాని పేరు వెతకండి..." : "Search owner..."}
            placeholderTextColor="#9CA3AF"
            cursorColor="#16A34A"
            selectionColor="#16A34A40"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={styles.searchInput}
          />
          {search.trim().length > 0 ? (
            <TouchableOpacity onPress={() => setSearch("")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleVoiceSearch} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialCommunityIcons 
                name={isListening ? "microphone" : "microphone-outline"} 
                size={22} 
                color={isListening ? "#EF4444" : (isFocused ? "#16A34A" : "#9CA3AF")} 
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {loading ? (
        <View style={{ paddingTop: 10 }}>
          <ShimmerRow /><ShimmerRow /><ShimmerRow />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled" 
          contentContainerStyle={[
            { padding: 20, paddingBottom: 100 },
            filtered.length === 0 && { flexGrow: 1, justifyContent: 'center' }
          ]}
          ListEmptyComponent={
            <AppEmptyState
              iconName={search.trim().length > 0 ? "search-outline" : "tractor"}
              title={
                search.trim().length > 0
                  ? language === "te" ? "ఏమి దొరకలేదు" : "Not Found"
                  : language === "te" ? "యజమానులు లేరు" : "No Owners Added"
              }
              subtitle={
                search.trim().length > 0
                  ? language === "te" ? "మీ శోధనకు సరిపడే ఫలితాలు లేవు" : "No results match your search"
                  : language === "te" ? "+ బటన్ నొక్కి వాహన యజమానిని చేర్చండి" : "Tap + button to add owners"
              }
              language={language}
            />
          }
          renderItem={({ item }) => {
            const color = getColor(item.id);

            return (
              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.left}
                  activeOpacity={0.8}
                  onPress={() => {
                    router.push({
                      pathname: "/farmer/owners/owner-work", // 🔥 Next screen for entering works
                      params: {
                        ownerId: item.id,
                        name: item.ownerName,
                        phone: item.phone,
                        village: item.village
                      }
                    });
                  }}
                >
                  <View style={[styles.avatar, { backgroundColor: color }]}>
                    <AppText style={styles.avatarText}>{item.ownerName?.charAt(0)?.toUpperCase()}</AppText>
                  </View>

                  <View style={styles.details}>
                    <AppText style={styles.name}>{item.ownerName}</AppText>
                    <AppText style={styles.phone}>+91 - {item.phone || "----"}</AppText>
                    <AppText style={styles.sub}>{item.village || "----"}</AppText>
                  </View>
                </TouchableOpacity>

                <View style={styles.right}>
                  <TouchableOpacity style={styles.callBtn} onPress={() => handleCall(item.phone)}>
                    <Ionicons name="call" size={16} color="#16A34A" />
                  </TouchableOpacity>

                  <Menu>
                    <MenuTrigger style={{ padding: 5 }}>
                      <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
                    </MenuTrigger>
                    <MenuOptions customStyles={optionsStyles}>
                      <MenuOption onSelect={() => handleEditClick(item)}>
                        <View style={styles.modernMenuItem}>
                          <Ionicons name="create-outline" size={18} color="#2563EB" />
                          <AppText style={styles.menuTextEdit} language={language}>{language === "te" ? "మార్చు" : "Edit"}</AppText>
                        </View>
                      </MenuOption>
                      <View style={styles.menuDivider} />
                      <MenuOption onSelect={() => handleDeleteClick(item)}>
                        <View style={styles.modernMenuItem}>
                          <Ionicons name="trash-outline" size={18} color="#EF4444" />
                          <AppText style={styles.menuTextDelete} language={language}>{language === "te" ? "తొలగించు" : "Delete"}</AppText>
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

      <TouchableOpacity activeOpacity={0.8}
        style={styles.addBtn}
        onPress={() => router.push("/farmer/owners/add-owner")}
      >
        <LinearGradient colors={["#16A34A","#166534"]} style={styles.addGradient}>
           <Ionicons name="add" size={30} color="#fff" />
         </LinearGradient>
      </TouchableOpacity>

      <Modal visible={showDeleteModal} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.iconBgWarning}>
              <Ionicons name="trash-outline" size={36} color="#DC2626" />
            </View>
            <AppText style={styles.modalTitle} language={language}>{language === "te" ? "తొలగించాలా?" : "Delete Entry?"}</AppText>
            <AppText style={styles.modalSub} language={language}>{language === "te" ? "ఈ యజమానిని పూర్తిగా తొలగించాలా?" : "Are you sure you want to delete this record?"}</AppText>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDeleteModal(false)}>
                <AppText>{language === "te" ? "వద్దు" : "Cancel"}</AppText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
                <AppText style={{ color: "#fff", fontWeight: '600' }}>{language === "te" ? "తొలగించు" : "Delete"}</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showCannotDeleteModal} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={[styles.iconBgWarning, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="lock-closed" size={36} color="#F59E0B" />
            </View>
            <AppText style={styles.modalTitle} language={language}>{language === "te" ? "తొలగించడం కుదరదు" : "Cannot Delete"}</AppText>
            <AppText style={[styles.modalSub, { lineHeight: 22 }]} language={language}>
              {language === "te"
                ? "ఈ యజమానికి సంబంధించి పనుల వివరాలు ఇప్పటికే రికార్డ్ అయ్యాయి. కావున వీరిని తొలగించడం కుదరదు."
                : "This owner has existing work records. Therefore, they cannot be deleted."}
            </AppText>
            <View style={styles.modalBtns}>
              <TouchableOpacity activeOpacity={0.8} style={[styles.cancelBtn, { flex: 1, backgroundColor: '#F59E0B' }]} onPress={() => setShowCannotDeleteModal(false)}>
                <AppText style={{ color: 'white', fontWeight: '600' }} language={language}>{language === "te" ? "అర్థమైంది" : "Got It"}</AppText>
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
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F9FAFB", marginHorizontal: 20, marginTop: 15, marginBottom: 0, paddingHorizontal: 12, height: 50, borderRadius: 8, borderWidth: 1, borderColor: "#E5E7EB" },
  searchFocused: { borderColor: "#16A34A", backgroundColor: "#FFFFFF" },
  searchInput: { flex: 1, height: "100%", marginLeft: 10, fontSize: 15, paddingTop: 0, paddingBottom: 0, textAlignVertical: "center", color: "#1F2937", fontFamily: "Mandali", includeFontPadding: false },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, marginHorizontal: 20, marginVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor:"#E5E7EB", borderRadius: 12, backgroundColor:"#ffffff", justifyContent: "space-between" },
  left: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: { width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText: { color: "#fff", fontWeight: "600" },
  details: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600" },
  phone: { fontSize: 12, color: "#16A34A" },
  sub: { fontSize: 12, color: "#6B7280" },
  right: { flexDirection: "row", alignItems: "center", gap: 8 },
  callBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#ECFDF5", justifyContent: "center", alignItems: "center" },
  addBtn: { position: "absolute", bottom: 30, right: 20 },
  addGradient: { width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", elevation: 5, shadowColor: "#000", shadowOffset:{width:0, height:2}, shadowOpacity:0.2, shadowRadius:4 },
  modernMenuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 14, gap: 10 },
  menuTextEdit: { fontSize: 14, color: "#1E293B", fontWeight: "500" },
  menuTextDelete: { fontSize: 14, color: "#EF4444", fontWeight: "500" },
  menuDivider: { height: 1, backgroundColor: "#F1F5F9", marginHorizontal: 10 },
  overlay: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", zIndex: 999 },
  actionLoadingOverlay: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "rgba(255,255,255,0.7)", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modalBox: { width: "80%", backgroundColor: "#fff", borderRadius: 20, padding: 24, alignItems: "center", elevation: 10 },
  iconBgWarning: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#FEE2E2", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: "600", marginTop: 10, color: '#111827' },
  modalSub: { fontSize: 13, color: "#6B7280", textAlign: "center", marginTop: 8 },
  modalBtns: { flexDirection: "row", marginTop: 20, gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: 'center' },
  deleteBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: "#DC2626", alignItems: "center", justifyContent: 'center' }
});