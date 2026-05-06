// app/farmer/admin-scheme.tsx
import { Ionicons } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";

export default function AddSchemeAdmin() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  // ఫారమ్ స్టేట్స్
  const [title, setTitle] = useState("");
  const [stateChoice, setStateChoice] = useState<"AP" | "TS" | "BOTH">("AP");
  const [shortDesc, setShortDesc] = useState("");
  const [eligibility, setEligibility] = useState(""); // న్యూ లైన్ తో సెపరేట్ చేస్తాం
  const [documents, setDocuments] = useState(""); // న్యూ లైన్ తో సెపరేట్ చేస్తాం
  const [applySteps, setApplySteps] = useState("");
  const [applyLink, setApplyLink] = useState("");

  /* ---------------- ఇమేజ్ పికర్ ---------------- */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9], // బ్యానర్ సైజ్ (TV/YouTube థంబ్‌నెయిల్ లాగా)
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  /* ---------------- ఫైర్‌బేస్ కి సేవ్ చేయడం ---------------- */
  const handleSave = async () => {
    if (!title || !shortDesc || !imageUri) {
      Alert.alert("ఎర్రర్", "దయచేసి కనీసం టైటిల్, వివరణ మరియు ఒక బ్యానర్ ఫోటో ఇవ్వండి.");
      return;
    }

    setLoading(true);

    try {
     // 1. ఇమేజ్ ని Firebase Storage కి పంపడం (Pucka Fix)
      const fileName = `schemes/${Date.now()}_banner.jpg`;
      const reference = storage().ref(fileName);
      
      // Expo ఇమేజ్ ని ఫైర్‌బేస్ కి అర్థమయ్యేలా Blob లాగా మారుస్తున్నాం
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      await reference.put(blob);
      const downloadURL = await reference.getDownloadURL();

      // 2. ఎంటర్ (New Line) కొట్టిన వాటిని Arrays లాగా మార్చడం
      const eligibilityArray = eligibility.split("\n").map((s) => s.trim()).filter((s) => s !== "");
      const documentsArray = documents.split("\n").map((s) => s.trim()).filter((s) => s !== "");

      // 3. Firestore లో డేటా సేవ్ చేయడం
      await firestore().collection("schemes").add({
        title: title.trim(),
        state: stateChoice,
        shortDesc: shortDesc.trim(),
        eligibility: eligibilityArray,
        documentsRequired: documentsArray,
        howToApply: applySteps.trim(),
        applyLink: applyLink.trim() || null,
        bannerImage: downloadURL,
        isActive: true, // డీఫాల్ట్ గా లైవ్ లో ఉంటుంది
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert("సక్సెస్! 🎉", "పథకం అద్భుతంగా యాడ్ చేయబడింది.", [
        { text: "OK", onPress: () => router.back() }
      ]);

    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("ఫెయిల్", "డేటా సేవ్ అవ్వలేదు. ఇంటర్నెట్ చెక్ చేయండి.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="AgriSnap Admin" subtitle="కొత్త పథకం యాడ్ చేయండి" language="te" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 1. ఇమేజ్ అప్‌లోడ్ */}
        <AppText style={styles.label}>బ్యానర్ ఫోటో (16:9)</AppText>
        <TouchableOpacity style={styles.imageBox} onPress={pickImage} activeOpacity={0.8}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="cloud-upload-outline" size={40} color="#16A34A" />
              <AppText style={styles.uploadText}>బ్యానర్ అప్‌లోడ్ చేయండి</AppText>
            </View>
          )}
        </TouchableOpacity>

        {/* 2. పథకం పేరు */}
        <AppText style={styles.label}>పథకం పేరు</AppText>
        <TextInput
          style={styles.input}
          placeholder="ఉదా: వైఎస్సార్ రైతు భరోసా"
          value={title}
          onChangeText={setTitle}
        />

        {/* 3. రాష్ట్రం ఎంపిక */}
        <AppText style={styles.label}>ఏ రాష్ట్రానికి సంబంధించింది?</AppText>
        <View style={styles.tabContainer}>
          {["AP", "TS", "BOTH"].map((state) => (
            <TouchableOpacity
              key={state}
              style={[styles.tabBtn, stateChoice === state && styles.activeTab]}
              onPress={() => setStateChoice(state as any)}
            >
              <AppText style={[styles.tabText, stateChoice === state && styles.activeTabText]}>
                {state === "BOTH" ? "రెండు" : state}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>

        {/* 4. షార్ట్ డిస్క్రిప్షన్ */}
        <AppText style={styles.label}>చిన్న వివరణ (Short Description)</AppText>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="రైతులకు పెట్టుబడి సాయం కింద ఏటా ఆర్థిక సాయం..."
          multiline
          numberOfLines={3}
          value={shortDesc}
          onChangeText={setShortDesc}
        />

        {/* 5. అర్హతలు */}
        <AppText style={styles.label}>అర్హతలు (లైన్ కి ఒకటి చొప్పున రాయండి)</AppText>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="సొంత భూమి ఉన్న రైతులు.&#10;కౌలు రైతులు."
          multiline
          numberOfLines={4}
          value={eligibility}
          onChangeText={setEligibility}
        />

        {/* 6. కావాల్సిన పత్రాలు */}
        <AppText style={styles.label}>కావాల్సిన పత్రాలు (లైన్ కి ఒకటి)</AppText>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="ఆధార్ కార్డ్&#10;పట్టాదార్ పాస్ బుక్"
          multiline
          numberOfLines={3}
          value={documents}
          onChangeText={setDocuments}
        />

        {/* 7. ఎక్కడ దరఖాస్తు చేయాలి */}
        <AppText style={styles.label}>ఎలా అప్లై చేయాలి?</AppText>
        <TextInput
          style={styles.input}
          placeholder="ఉదా: సమీప మీసేవ లేదా గ్రామ సచివాలయం"
          value={applySteps}
          onChangeText={setApplySteps}
        />

        {/* 8. ఆన్లైన్ లింక్ (ఆప్షనల్) */}
        <AppText style={styles.label}>ఆన్‌లైన్ వెబ్‌సైట్ లింక్ (ఉంటే)</AppText>
        <TextInput
          style={styles.input}
          placeholder="https://agri.ap.gov.in"
          value={applyLink}
          onChangeText={setApplyLink}
          keyboardType="url"
          autoCapitalize="none"
        />

        {/* 9. SUBMIT BUTTON */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          <LinearGradient colors={["#16A34A", "#15803D"]} style={styles.gradientBtn}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <AppText style={styles.saveText}>పథకాన్ని పబ్లిష్ చేయి</AppText>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7F6" },
  scrollContent: { padding: 20, paddingBottom: 60 },
  
  label: { fontSize: 14, fontWeight: "600", color: "#4B5563", marginBottom: 8, marginTop: 16 },
  
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1F2937",
    fontFamily: "Mandali"
  },
  textArea: { height: 100, textAlignVertical: "top" },

  imageBox: {
    width: "100%",
    height: 180,
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#BBF7D0",
    borderStyle: "dashed",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center"
  },
  previewImage: { width: "100%", height: "100%", resizeMode: "cover" },
  imagePlaceholder: { alignItems: "center" },
  uploadText: { marginTop: 8, color: "#16A34A", fontWeight: "600" },

  tabContainer: { flexDirection: "row", backgroundColor: "#E5E7EB", borderRadius: 12, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: "#1B5E20" },
  tabText: { color: "#6B7280", fontWeight: "600" },
  activeTabText: { color: "#ffffff" },

  saveBtn: { marginTop: 30, borderRadius: 14, overflow: "hidden" },
  gradientBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8
  },
  saveText: { color: "white", fontSize: 16, fontWeight: "bold" }
});