import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import firestore from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');
const DUMMY_OTP = "123456";

export default function LoginScreen() {
  const router = useRouter();
  
  // States
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"FARMER" | "MESTRI" | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);

  // Timer Logic
  useEffect(() => {
    // పాత కోడ్:
// let interval: NodeJS.Timeout; 

// కొత్త కోడ్ (ఇలా మార్చు):
let interval: any; 

if (otpSent && timer > 0) {
  interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
}
return () => clearInterval(interval);

  }, [otpSent, timer]);

  const handleSendOTP = () => {
    if (phone.length !== 10) {
      setError("దయచేసి 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి");
      return;
    }
    if (!role) {
      setError("మీరు రైతునా? లేక మేస్త్రీనా? ఒకరిని ఎంచుకోండి");
      return;
    }
    setError("");
    setLoading(true);
    
    // Production Simulation
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setTimer(30);
    }, 1000);
  };
const handleVerifyOTP = async () => {
  if (otp.length !== 6) {
    setError("OTP పూర్తి నమోదు చేయండి");
    return;
  }

  setLoading(true);
  setError("");

  const state = await NetInfo.fetch();

  if (!state.isConnected) {
    setLoading(false);
    setError("ఇంటర్నెట్ కనెక్షన్ లేదు");
    return;
  }

  try {
    if (otp !== DUMMY_OTP) {
      throw new Error("Invalid OTP");
    }

    const userRef = firestore().collection("users").doc(phone);

    await userRef.set({
      phone,
      role,
      lastLogin: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
      status: "active",
      createdAt: firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    await AsyncStorage.multiSet([
      ["CURRENT_PHONE", phone],
      ["CURRENT_ROLE", role!],
    ]);

    router.replace(role === "FARMER" ? "/farmer" : "/(tabs)");

  } catch (err) {
    setError("OTP సరిపోలలేదు");
  }

  setLoading(false);
};



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Brand Identity */}
          <View style={styles.headerSection}>
            <Image source={require("../assets/images/icon.png")} style={styles.logo} resizeMode="contain" />
            <Text style={styles.brandName}>AgriSnap</Text>
            <Text style={styles.tagline}>మీ వ్యవసాయానికి డిజిటల్ తోడు</Text>
          </View>

          {!otpSent ? (
            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>మొబైల్ నంబర్</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.prefix}>🇮🇳 +91</Text>
                <TextInput
                  placeholder="00000 00000"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={(t) => { setPhone(t); setError(""); }}
                  cursorColor="#2E7D32"
                  style={styles.textInput}
                />
              </View>

              <Text style={styles.inputLabel}>మీరు ఎవరు?</Text>
              <View style={styles.roleGrid}>
                <TouchableOpacity 
                  activeOpacity={0.9}
                  onPress={() => setRole("FARMER")}
                  style={[styles.roleBtn, role === "FARMER" && styles.roleBtnActive]}
                >
                  <Text style={styles.roleIcon}>🚜</Text>
                  <Text style={[styles.roleText, role === "FARMER" && styles.roleTextActive]}>రైతు</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  activeOpacity={0.9}
                  onPress={() => setRole("MESTRI")}
                  style={[styles.roleBtn, role === "MESTRI" && styles.roleBtnActive]}
                >
                  <Text style={styles.roleIcon}>👷</Text>
                  <Text style={[styles.roleText, role === "MESTRI" && styles.roleTextActive]}>మేస్త్రీ</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleSendOTP} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>ముందుకు సాగండి</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.otpHeader}>OTP వెరిఫికేషన్</Text>
              <Text style={styles.otpSubText}>{phone} కు వచ్చిన కోడ్‌ను నమోదు చేయండి</Text>
              
              <TextInput
                placeholder="0 0 0 0 0 0"
                placeholderTextColor="#BBB"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={(t) => { setOtp(t); setError(""); }}
                cursorColor="#2E7D32"
                style={styles.otpInput}
                autoFocus
              />

              <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyOTP} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>లాగిన్ పూర్తి చేయండి</Text>}
              </TouchableOpacity>

              <View style={styles.otpFooter}>
                {timer > 0 ? (
                  <Text style={styles.timerText}>మళ్ళీ పంపడానికి: <Text style={{color: '#2E7D32'}}>{timer} సెకన్లు</Text></Text>
                ) : (
                  <TouchableOpacity onPress={() => setTimer(30)}>
                    <Text style={styles.resendText}>మళ్ళీ OTP పంపండి</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setOtpSent(false)}>
                  <Text style={styles.changeNumText}>నంబర్ మార్చాలా?</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorMsg}>{error}</Text>
            </View>
          ) : null}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 60, paddingBottom: 30 },
  
  headerSection: { alignItems: 'center', marginBottom: 45 },
  logo: { width: 90, height: 90 },
  brandName: { fontSize: 34, fontWeight: '900', color: '#1B5E20', marginTop: 10, letterSpacing: -0.5 },
  tagline: { fontSize: 15, color: '#666', fontWeight: '600', marginTop: 2 },

  formContainer: { width: '100%' },
  inputLabel: { fontSize: 13, fontWeight: '800', color: '#444', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9F8',
    borderRadius: 20,
    height: 65,
    paddingHorizontal: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  prefix: { fontSize: 17, fontWeight: '700', color: '#333', borderRightWidth: 1, borderRightColor: '#DDD', paddingRight: 12, marginRight: 15 },
  textInput: { flex: 1, fontSize: 19, fontWeight: '700', color: '#000' },

  roleGrid: { flexDirection: 'row', gap: 15, marginBottom: 35 },
  roleBtn: {
    flex: 1,
    height: 120,
    backgroundColor: '#F8F9F8',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleBtnActive: {
    backgroundColor: '#FFF',
    borderColor: '#2E7D32',
    elevation: 8,
    shadowColor: "#2E7D32",
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  roleIcon: { fontSize: 32, marginBottom: 8 },
  roleText: { fontSize: 17, fontWeight: '800', color: '#666' },
  roleTextActive: { color: '#2E7D32' },

  primaryBtn: {
    backgroundColor: '#2E7D32',
    height: 65,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  btnText: { color: '#FFF', fontSize: 19, fontWeight: '800' },

  otpHeader: { fontSize: 24, fontWeight: '900', color: '#1B5E20', textAlign: 'center', marginBottom: 8 },
  otpSubText: { fontSize: 14, color: '#777', textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },
  otpInput: {
    backgroundColor: '#F8F9F8',
    height: 70,
    borderRadius: 20,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 10,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#2E7D32',
  },

  otpFooter: { marginTop: 25, gap: 15, alignItems: 'center' },
  timerText: { fontSize: 14, fontWeight: '700', color: '#666' },
  resendText: { fontSize: 15, fontWeight: '800', color: '#2E7D32', textDecorationLine: 'underline' },
  changeNumText: { fontSize: 14, fontWeight: '600', color: '#999' },

  errorBox: { marginTop: 30, backgroundColor: '#FFF2F2', padding: 15, borderRadius: 15, borderLeftWidth: 5, borderLeftColor: '#D32F2F' },
  errorMsg: { color: '#B71C1C', fontWeight: '800', fontSize: 14 },
});
