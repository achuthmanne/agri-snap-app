import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AgriLoader from "./../../components/AgriLoader";

export default function ProfileScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState(""); 
  const [language, setLanguage] = useState<"te" | "en">("te");
  const [created, setCreated] = useState("");
  const [online, setOnline] = useState(true);

  // NEW STATES
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

 const displayRole = useMemo(() => {
  const isFarmer = role?.toLowerCase() === "farmer" || role === "రైతు";
  const isMestri = role?.toLowerCase() === "mestri" || role === "మేస్త్రీ";

  if (language === "te") {
    return isFarmer ? "రైతు" : isMestri ? "మేస్త్రీ" : "యూజర్";
  } else {
    return isFarmer ? "Farmer" : isMestri ? "Mestri" : "User";
  }
}, [role, language]);

 const profileImage = useMemo(() => {
  const isFarmer = role?.toLowerCase() === "farmer" || role === "రైతు";
  const isMestri = role?.toLowerCase() === "mestri" || role === "మేస్త్రీ";

  if (isFarmer) return require("./../../assets/images/farmer.png");
  if (isMestri) return require("./../../assets/images/kuli.png");
  return require("./../../assets/images/icon.png");
}, [role]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userPhone = await AsyncStorage.getItem("USER_PHONE");
        if (!userPhone) { router.replace("/login"); return; }
        setPhone(userPhone);
        const doc = await firestore().collection("users").doc(userPhone).get();
        const data = doc.data();
        if (data) {
          setName(data.name || "");
          setRole(data.role || "");
          setLanguage(data.language || "te");
          setCreated(data.createdAt?.toDate()?.toLocaleDateString() || "--/--/----");
        }
      } catch (error) { console.log(error); } finally { setLoading(false); }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected);
    });
    return unsubscribe;
  }, []);

  const handleSave = async () => {
    if (!phone) return;
    setLoading(true);
    const finalRole = profileImage();
    try {
      await firestore().collection("users").doc(phone).update({
        name,
        language,
        role: finalRole, 
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      await AsyncStorage.setItem("APP_LANG", language);
      setIsEditing(false); // Save ayyaka lock chesthunnam
    } catch (error) { alert("Error saving data"); } finally { setLoading(false); }
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await AsyncStorage.clear();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
  behavior={Platform.OS === "ios" ? "padding" : "height"}
>
       <ScrollView
  keyboardShouldPersistTaps="always"
  keyboardDismissMode="none"
>
          <LinearGradient colors={["#1B5E20", "#2E7D32", "#43A047"]} style={styles.headerGradient}>
            <View style={styles.topActions}>
              <TouchableOpacity onPress={() => router.back()} style={styles.iconCircle}>
                <Ionicons name="chevron-back" size={22} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{language === "te" ? "ప్రొఫైల్" : "My Profile"}</Text>
              {/* LOGOUT ICON BUTTON */}
              <TouchableOpacity onPress={() => setShowLogoutModal(true)} style={styles.iconCircle}>
                <Ionicons name="log-out-outline" size={22} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.avatarSection}>
  <View style={styles.avatarOuter}>
    <Image source={profileImage()} style={styles.avatarImage} />
    <View style={[styles.statusIndicator, { backgroundColor: online ? "#4ADE80" : "#F87171" }]} />
  </View>
  
  {/* NAME & EDIT ICON CENTERED LOGIC */}
  <View style={styles.nameContainerMaster}>
     {/* Left side empty space to balance the icon on right */}
     <View style={{ width: 35 }} /> 
     
     <Text style={styles.profileName}>
        {name || (language === "te" ? "యూజర్" : "User")}
     </Text>

     <TouchableOpacity 
      onPress={() => {
  setTimeout(() => setIsEditing(true), 100);
}}
        style={[styles.editIconWrapper, isEditing && { backgroundColor: '#FFD700' }]}
     >
        <Ionicons 
          name={isEditing ? "close" : "pencil"} 
          size={16} 
          color={isEditing ? "#1B5E20" : "white"} 
        />
     </TouchableOpacity>
  </View>

  <View style={styles.roleTag}>
    <Text style={styles.roleTagText}>{displayRole}</Text>
  </View>
</View>

          </LinearGradient>

          <View style={styles.formContainer}>
            <Text style={styles.sectionLabel}>{language === "te" ? "వ్యక్తిగత వివరాలు" : "Personal Details"}</Text>
            
            {/* FULL NAME BOX - LOCK LOGIC */}
            <View style={[styles.inputWrapper, !isEditing && {borderColor: '#F1F5F9', backgroundColor: '#FAFAFA'}]}>
              <Ionicons name="person-outline" size={20} color={isEditing ? "#1B5E20" : "#9CA3AF"} style={styles.inputIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>{language === "te" ? "పూర్తి పేరు" : "Full Name"}</Text>
               <TextInput
  value={name}
  onChangeText={setName}
  editable={isEditing}
  selectionColor="#1B5E20"
  cursorColor="#1B5E20"
  blurOnSubmit={false}
  returnKeyType="done"
  onSubmitEditing={() => {}}   // 👈 add this empty function
/>

              </View>
              {!isEditing && <Ionicons name="lock-closed" size={14} color="#CBD5E1" />}
            </View>

            {/* PHONE NUMBER - ALWAYS LOCKED */}
            <View style={[styles.inputWrapper, { backgroundColor: '#F3F4F6', borderWidth: 0 }]}>
              <Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>{language === "te" ? "మొబైల్ సంఖ్య" : "Phone Number"}</Text>
                <Text style={styles.disabledText}>+91 {phone}</Text>
              </View>
              <Ionicons name="lock-closed-outline" size={14} color="#9CA3AF" />
            </View>

            <Text style={styles.sectionLabel}>{language === "te" ? "యాప్ భాష" : "App Language"}</Text>
            {/* LANGUAGE GRID - LOCK LOGIC */}
            <View style={[styles.languageGrid, !isEditing && {opacity: 0.7}]} pointerEvents={isEditing ? "auto" : "none"}>
              <TouchableOpacity onPress={() => setLanguage("te")} style={[styles.langCard, language === "te" && styles.langCardActive]}>
                <View style={[styles.radio, language === "te" && styles.radioActive]}>{language === "te" && <View style={styles.radioInner} />}</View>
                <Text style={[styles.langText, language === "te" && styles.langTextActive]}>తెలుగు</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setLanguage("en")} style={[styles.langCard, language === "en" && styles.langCardActive]}>
                <View style={[styles.radio, language === "en" && styles.radioActive]}>{language === "en" && <View style={styles.radioInner} />}</View>
                <Text style={[styles.langText, language === "en" && styles.langTextActive]}>English</Text>
              </TouchableOpacity>
            </View>

            {/* SAVE BUTTON - ONLY SHOWS WHEN EDITING */}
            {isEditing && (
              <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
                <LinearGradient colors={["#2E7D32", "#1B5E20"]} style={styles.saveButtonGradient}>
                  <Text style={styles.saveButtonText}>{language === "te" ? "వివరాలు సేవ్ చేయండి" : "Save Changes"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* CUSTOM LOGOUT CONFIRMATION MODAL */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="log-out" size={50} color="#EF4444" />
            <Text style={styles.modalTitle}>{language === "te" ? "లాగౌట్" : "Logout"}</Text>
            <Text style={styles.modalSub}>{language === "te" ? "మీరు నిజంగా ఖాతా నుండి నిష్క్రమించాలనుకుంటున్నారా?" : "Are you sure you want to sign out?"}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowLogoutModal(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>{language === "te" ? "వద్దు" : "No"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmLogout} style={styles.confirmBtn}>
                <Text style={styles.confirmText}>{language === "te" ? "అవును" : "Yes"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AgriLoader visible={loading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  headerGradient: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 60, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  topActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: 'white' },
  avatarSection: { alignItems: 'center' },
  avatarOuter: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'white', position: 'relative', elevation: 10 },
  avatarImage: { width: '100%', height: '100%', borderRadius: 50, resizeMode: 'cover' },
  statusIndicator: { position: 'absolute', bottom: 5, right: 5, width: 18, height: 18, borderRadius: 9, borderWidth: 3, borderColor: 'white' },
  profileName: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  roleTag: { backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 10 },
  roleTagText: { color: 'white', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  formContainer: { marginTop: -30, marginHorizontal: 20, backgroundColor: 'white', borderRadius: 30, padding: 24, elevation: 8, marginBottom: 40 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1, marginTop: 10 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 15, paddingVertical: 10, marginBottom: 16 },
  inputIcon: { marginRight: 12 },
  inputLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  textInput: { fontSize: 16, color: '#1E293B', fontWeight: '600' },
  disabledText: { fontSize: 16, color: '#64748B', fontWeight: '600' },
  languageGrid: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  langCard: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  langCardActive: { borderColor: '#1B5E20', backgroundColor: '#E8F5E9' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#CBD5E1', marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: '#1B5E20' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1B5E20' },
  langText: { fontSize: 15, fontWeight: '600', color: '#64748B' },
  langTextActive: { color: '#1B5E20' },
  saveButton: { borderRadius: 18, overflow: 'hidden', marginTop: 10 },
  saveButtonGradient: { justifyContent: 'center', alignItems: 'center', paddingVertical: 18 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  nameContainerMaster: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center', // Idhi motham block ni center chesthundhi
  marginTop: 15,
  width: '100%',
  paddingHorizontal: 20,
},


editIconWrapper: {
  width: 30,
  height: 30,
  borderRadius: 15,
  backgroundColor: 'rgba(255,255,255,0.2)',
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 10, // Name ki icon ki madhyalo space
},

  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 25, padding: 25, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1B5E20', marginVertical: 10 },
  modalSub: { textAlign: 'center', color: '#64748B', marginBottom: 25 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center' },
  confirmBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#EF4444', alignItems: 'center' },
  cancelText: { color: '#64748B', fontWeight: 'bold' },
  confirmText: { color: 'white', fontWeight: 'bold' }
});
