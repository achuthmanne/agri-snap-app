import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import AppText from "@/components/AppText";
import AgriLoader from "../../../components/AgriLoader";
const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const { language, changeLanguage } = useLanguage();
  const [created, setCreated] = useState("");
  const [online, setOnline] = useState(true);
const [isFocused, setIsFocused] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
const [loaderType, setLoaderType] = useState<"loading" | "updating">("loading"
);

  const getDisplayRole = () => {
    const isFarmer = role?.toLowerCase() === "farmer" || role === "రైతు";
    const isMestri = role?.toLowerCase() === "mestri" || role === "మేస్త్రీ";
    if (language === "te") return isFarmer ? "రైతు" : isMestri ? "మేస్త్రీ" : "యూజర్";
    return isFarmer ? "Farmer" : isMestri ? "Mestri" : "User";
  };

  const getProfileImage = () => {
    const isFarmer = role?.toLowerCase() === "farmer" || role === "రైతు";
    const isMestri = role?.toLowerCase() === "mestri" || role === "మేస్త్రీ";
    if (isFarmer) return require("../../../assets/images/farmer.png");
    if (isMestri) return require("../../../assets/images/kuli.png");
    return require("../../../assets/images/default.jpg");
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userPhone = await AsyncStorage.getItem("USER_PHONE");
        const storedLang = await AsyncStorage.getItem("APP_LANG");

       
        if (!userPhone) { router.replace("/login"); return; }

        setPhone(userPhone);
        const doc = await firestore().collection("users").doc(userPhone).get();
        const data = doc.data();

        if (data) {
          setName(data.name || "");
          setRole(data.role || "");
          setCreated(data.createdAt?.toDate()?.toLocaleDateString() || "--/--/----");
          if (!data.name || data.name.trim().length < 3) {
  setIsEditing(true);
  setTimeout(() => setShowAlert(true), 500); // 👈 delay
}
        }
      } catch (error) { console.log(error); } finally { setLoading(false); }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => setOnline(!!state.isConnected));
    return unsubscribe;
  }, []);

  const handleBackPress = () => {
    if (!name || name.trim().length < 3) {
      setShowAlert(true);
      return;
    }
    router.back();
  };

  const handleSave = async () => {
    if (!name || name.trim().length < 3) {
      setShowAlert(true);
      return;
    }
     setLoaderType("updating"); 
    setLoading(true);
    try {
      await firestore().collection("users").doc(phone).update({
        name: name.trim(),
        language: language,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      await AsyncStorage.setItem("APP_LANG", language);
      setIsEditing(false);
      router.replace(role === "FARMER" ? "/farmer/(tabs)" : "/(tabs)");
    } catch (error) { alert("Error saving data"); } finally { setLoading(false); }
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    const lang = await AsyncStorage.getItem("APP_LANG");
    await AsyncStorage.clear();
    if (lang) await AsyncStorage.setItem("APP_LANG", lang);
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
<KeyboardAwareScrollView
  enableOnAndroid={true}
  keyboardShouldPersistTaps="always"
  extraScrollHeight={10}
  showsVerticalScrollIndicator={false}
  enableAutomaticScroll={true}
>
          <LinearGradient colors={["#1B5E20", "#2E7D32", "#43A047"]} style={styles.headerGradient}>
            <View style={styles.topActions}>
              <TouchableOpacity onPress={handleBackPress} style={styles.iconCircle}>
                <Ionicons name="chevron-back" size={22} color="white" />
              </TouchableOpacity>
              <AppText style={styles.headerTitle} language={language}>
                {language === "te" ? "ప్రొఫైల్" : "My Profile"}
              </AppText>
              <TouchableOpacity onPress={() => setShowLogoutModal(true)} style={styles.iconCircle}>
                <Ionicons name="log-out-outline" size={22} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.avatarSection}>
              <View style={styles.avatarOuter}>
                <Image source={getProfileImage()} style={styles.avatarImage} />
                <View style={[styles.statusIndicator, { backgroundColor: online ? "#4ADE80" : "#F87171" }]} />
              </View>

              <View style={styles.nameRowMaster}>
                <View style={{ width: 36, opacity: 0 }} />
                <AppText
  style={[
    styles.profileName,
    language === "en" && { fontWeight: "600", marginTop: -8 },
    language === "te" && { fontFamily: "Mandali", marginTop: -8 , includeFontPadding: false}
  ]}
  language={language}
>
                  {name || (language === "te" ? "యూజర్" : "User")}
                </AppText>
                <TouchableOpacity
                  onPress={() => setIsEditing(!isEditing)}
                  style={[styles.editIconBtn, !isEditing && { backgroundColor: 'rgba(255,255,255,0.2)' }, isEditing && { backgroundColor: '#FFD700' }]}
                  disabled={name.trim().length < 3 && !isEditing}
                >
                  <Ionicons name={isEditing ? "close" : "pencil"} size={16} color={isEditing ? "#1B5E20" : "white"} />
                </TouchableOpacity>
              </View>

              <View style={styles.roleTag}>
                <AppText style={styles.roleTagText} language={language}>{getDisplayRole()}</AppText>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.formContainer}>
<AppText
  style={[
    styles.sectionLabel,
    language === "te" && { letterSpacing: 0, lineHeight: 15 }
  ]}
  language={language}
>
              {language === "te" ? "వ్యక్తిగత వివరాలు" : "Personal Details"}
            </AppText>
<View style={[
styles.inputWrapper,
isFocused && styles.inputWrapperFocused,
!isEditing && { backgroundColor: '#F9FAFB', borderColor: '#F1F5F9' }
]}>

<Ionicons 
name="person-outline" 
size={20} 
color={isFocused ? "#1B5E20" : "#9CA3AF"} 
style={styles.inputIcon} 
/>

<View style={{ flex: 1 }}>

<AppText
style={[
styles.floatingLabel,
(isFocused || name?.length > 0) && styles.labelActive
]}
language={language}
>
{language === "te" ? "పూర్తి పేరు" : "Full Name"}
</AppText>

<TextInput
  key="nameInput"
  value={name}
  onChangeText={setName}
  editable={isEditing}
  onFocus={() => {
    setIsFocused(true);
    setShowAlert(false);
  }}
  selectionColor="#1B5E20"
  cursorColor="#1B5E20"
  style={[styles.textInput, { fontFamily: "Mandali" }]} // 🔥 Explicit ga add chesa
/>
</View>

              {!isEditing && <Ionicons name="lock-closed" size={14} color="#CBD5E1" />}
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: '#F3F4F6', borderWidth: 0 }]}>
              <Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <View style={{ flex: 1 }}>
                <AppText style={styles.inputLabel} language={language}>
                  {language === "te" ? "మొబైల్ సంఖ్య" : "Phone Number"}
                </AppText>
                <AppText style={styles.disabledText} language={language}>+91 {phone}</AppText>
              </View>
              <Ionicons name="lock-closed-outline" size={14} color="#9CA3AF" />
            </View>

            <AppText style={styles.sectionLabel} language={language}>
              {language === "te" ? "యాప్ భాష" : "App Language"}
            </AppText>
            <View style={[styles.languageGrid, !isEditing && { opacity: 0.6 }]} pointerEvents={isEditing ? "auto" : "none"}>
              <TouchableOpacity onPress={() => changeLanguage("te")} style={[styles.langCard, language === "te" && styles.langCardActive]}>
                <View style={[styles.radio, language === "te" && styles.radioActive]}>{language === "te" && <View style={styles.radioInner} />}</View>
                <AppText style={[styles.langText, language === "te" && styles.langTextActive]} language="te">తెలుగు</AppText>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => changeLanguage("en")} style={[styles.langCard, language === "en" && styles.langCardActive]}>
                <View style={[styles.radio, language === "en" && styles.radioActive]}>{language === "en" && <View style={styles.radioInner} />}</View>
                <AppText style={[styles.langText, language === "en" && styles.langTextActive]} language="en">English</AppText>
              </TouchableOpacity>
            </View>

            {isEditing && (
              <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
                <LinearGradient colors={["#2E7D32", "#1B5E20"]} style={styles.saveButtonGradient}>
                  <AppText style={styles.saveButtonText} language={language}>
                    {language === "te" ? "వివరాలు సేవ్ చేయండి" : "Save Changes"}
                  </AppText>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>

      {/* Modals with Font Support */}
      <Modal visible={showAlert} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.alertIconBg}>
              <Ionicons name="warning" size={40} color="#1B5E20" />
            </View>
            <AppText style={styles.modalTitle1} language={language}>{language === "te" ? "పేరు అవసరం" : "Name Required"}</AppText>
            <AppText style={styles.modalSub} language={language}>
              {language === "te" ? "యాప్ ఉపయోగించడానికి దయచేసి మీ పేరును నమోదు చేయండి." : "Please enter your name to continue using the app."}
            </AppText>
            <TouchableOpacity onPress={() => setShowAlert(false)} style={styles.alertConfirmBtn}>
              <AppText style={styles.alertConfirmText} language={language}>{language === "te" ? "సరే (Okay)" : "Okay"}</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.iconBg}>
                    <Ionicons name="log-out" size={36} color="#e44830" />
                  </View>
            <AppText style={styles.modalTitle} language={language}>{language === "te" ? "లాగౌట్" : "Logout"}</AppText>
            <AppText style={styles.modalSub} language={language}>{language === "te" ? "మీరు నిజంగా నిష్క్రమించాలనుకుంటున్నారా?" : "Are you sure you want to sign out?"}</AppText>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowLogoutModal(false)} style={styles.cancelBtn}>
                <AppText style={styles.cancelText} language={language}>{language === "te" ? "వద్దు" : "No"}</AppText>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmLogout} style={styles.confirmBtn}>
                <AppText style={styles.confirmText} language={language}>{language === "te" ? "అవును" : "Yes"}</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AgriLoader visible={loading} type={loaderType} language={language} />
    </SafeAreaView>
  );
}

// ... styles remains same as yours ...
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  headerGradient: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 60, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  topActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '500', color: 'white' },
  avatarSection: { alignItems: 'center' },
  avatarOuter: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'white', position: 'relative', elevation: 10 },
  avatarImage: { width: '100%', height: '100%', borderRadius: 50, resizeMode: 'cover' },
  statusIndicator: { position: 'absolute', bottom: 5, right: 5, width: 18, height: 18, borderRadius: 9, borderWidth: 3, borderColor: 'white' },
  nameRowMaster: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: 15, paddingHorizontal: 10 },
  profileName: { fontSize: 26, fontWeight: '600', color: 'white', flexShrink: 1, textAlign: 'center' },
  editIconBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  roleTag: { backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 12 },
  roleTagText: { color: 'white', fontSize: 12, fontWeight: '500', textTransform: 'uppercase' },
  formContainer: {
  marginTop: -30,
  marginHorizontal: 20,
  backgroundColor: 'white',
  borderRadius: 30,
  padding: 20, // 👈 reduce (24 → 20)
  elevation: 8,
  marginBottom: 30 // 👈 reduce
},
  sectionLabel: {
  fontSize: 12,
  fontWeight: '600',
  color: '#94A3B8',

  letterSpacing: 0.5, // 👈 reduce

  includeFontPadding: false, // 👈 VERY IMPORTANT
  lineHeight: 16, // 👈 control height

  marginBottom: 10, // 👈 reduce spacing
  marginTop: 8
},
  inputWrapper:{
flexDirection:"row",
alignItems:"center",
borderWidth:1,
borderColor:"#E2E8F0",
borderRadius:16,

paddingHorizontal:15,
height:60,              // 👈 fixed height

marginBottom:18,

backgroundColor:"#fff"
},
iconBg: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: "#f5e8e8",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 10
},
inputWrapperFocused:{
borderColor:"#1B5E20",
shadowColor:"#1B5E20",
shadowOpacity:0.1,
shadowRadius:6,
elevation:3
},
floatingLabel:{
position:"absolute",
left:0,
top:18,

fontSize:14,
color:"#94A3B8"
},
labelActive:{
top:-8,
fontSize:11,
color:"#1B5E20"
},
  inputIcon: { marginRight: 12 },
  inputLabel: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  textInput:{
fontSize:16,
color:"#1E293B",

paddingTop:18,     // 👈 space for label
paddingBottom:2,

includeFontPadding:false   // 👈 Telugu fix
},
  disabledText: { fontSize: 16, color: '#64748B', fontWeight: '500' },
  languageGrid: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  langCard: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  langCardActive: { borderColor: '#1B5E20', backgroundColor: '#E8F5E9' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#CBD5E1', marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: '#1B5E20' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1B5E20' },
  langText: { fontSize: 15, fontWeight: '500', color: '#64748B' },
  langTextActive: { color: '#1B5E20' },
  saveButton: {
  borderRadius: 18,
  overflow: 'hidden',
  marginTop: 10,
  height: 52   // 👈 ADD THIS
},
saveButtonGradient: {
  justifyContent: 'center',
  alignItems: 'center',
  height: 52,   // 👈 FIXED HEIGHT
},
  saveButtonText: {
  color: 'white',
  fontSize: 15,
  fontWeight: '600',

  lineHeight: 18,           // 👈 IMPORTANT
  includeFontPadding: false // 👈 ANDROID FIX
},
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 25, padding: 25, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '500', color: '#e2431f', marginVertical: 10 },
   modalTitle1: { fontSize: 20, fontWeight: '500', color: '#187012', marginVertical: 10 },
  modalSub: { textAlign: 'center', color: '#64748B', marginBottom: 25, lineHeight: 20 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center' },
  confirmBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#EF4444', alignItems: 'center' },
  cancelText: { color: '#64748B', fontWeight: '500' },
  confirmText: { color: 'white', fontWeight: '500' },
  alertIconBg: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  alertConfirmBtn: { backgroundColor: '#1B5E20', width: '100%', paddingVertical: 15, borderRadius: 15, alignItems: 'center' },
  alertConfirmText: { color: 'white', fontWeight: '500', fontSize: 16 }
});
