import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function ProfileScreen() {
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("");
  const [stateName, setStateName] = useState("");
  const [language, setLanguage] = useState<'te' | 'en'>('te');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [langModal, setLangModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const storedPhone = await AsyncStorage.getItem("CURRENT_PHONE");
    if (!storedPhone) return;

    setPhone(storedPhone);

    try {
      const doc = await firestore().collection("users").doc(storedPhone).get();
      if (doc.exists()) {

        const data = doc.data();
        setName(data?.name || "");
        setVillage(data?.village || "");
        setDistrict(data?.district || "");
        setStateName(data?.state || "");
        setRole(data?.role || "");
        setLanguage(data?.language || "te");
      }
    } catch {
      setError("డేటా లోడ్ కాలేదు");
    }

    setLoading(false);
  };

  const saveProfile = async () => {
    const net = await NetInfo.fetch();
    if (!net.isConnected) {
      setError("ఇంటర్నెట్ లేదు");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await firestore().collection("users").doc(phone).set({
        name,
        village,
        district,
        state: stateName,
        language,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      await AsyncStorage.setItem("APP_LANG", language);
    } catch {
      setError("సేవ్ కాలేదు");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* Identity Card */}
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name ? name.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>
          <Text style={styles.name}>{name || "పేరు నమోదు చేయండి"}</Text>
          <Text style={styles.phone}>{phone}</Text>
          <Text style={styles.roleBadge}>
            {role === "FARMER" ? "🚜 రైతు" : "👷 మేస్త్రీ"}
          </Text>
        </View>

        {/* Personal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>వ్యక్తిగత సమాచారం</Text>

          <TextInput style={styles.input} placeholder="పేరు" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="గ్రామం" value={village} onChangeText={setVillage} />
          <TextInput style={styles.input} placeholder="జిల్లా" value={district} onChangeText={setDistrict} />
          <TextInput style={styles.input} placeholder="రాష్ట్రం" value={stateName} onChangeText={setStateName} />
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>సెట్టింగ్స్</Text>

          <TouchableOpacity onPress={() => setLangModal(true)} style={styles.settingRow}>
            <Text style={styles.settingText}>🌐 భాష</Text>
            <Text style={styles.settingValue}>{language === 'te' ? "తెలుగు" : "English"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutRow}>
            <Text style={{ color: "#D32F2F", fontWeight: "700" }}>🚪 లాగ్ అవుట్</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
          {saving ? <ActivityIndicator color="#fff" /> :
            <Text style={styles.saveText}>మార్పులు సేవ్ చేయండి</Text>}
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      {/* Language Modal */}
      <Modal visible={langModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity onPress={() => { setLanguage("te"); setLangModal(false); }}>
              <Text style={styles.langOption}>తెలుగు</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setLanguage("en"); setLangModal(false); }}>
              <Text style={styles.langOption}>English</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7F6" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: { color: "#fff", fontSize: 30, fontWeight: "900" },
  name: { fontSize: 20, fontWeight: "800", marginBottom: 4 },
  phone: { color: "#666", marginBottom: 4 },
  roleBadge: { color: "#2E7D32", fontWeight: "700" },

  section: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 15 },

  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    fontSize: 15,
    backgroundColor: "#FAFAFA"
  },

  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  settingText: { fontSize: 15, fontWeight: "600" },
  settingValue: { color: "#2E7D32", fontWeight: "700" },

  logoutRow: { paddingVertical: 14 },

  saveBtn: {
    backgroundColor: "#2E7D32",
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20
  },
  saveText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  error: { color: "#D32F2F", textAlign: "center", fontWeight: "700" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    padding: 25,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  langOption: { fontSize: 18, paddingVertical: 15, fontWeight: "700" }
});
