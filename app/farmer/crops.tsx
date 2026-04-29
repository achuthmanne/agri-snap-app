import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { allCropsKnowledge } from "../../data/allCropsKnowledge";

export default function CropKnowledgeScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<any | null>(null);
  const [showList, setShowList] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // భాషను మార్చుకోవడానికి స్టేట్ (Default: Telugu)
  const [lang, setLang] = useState<'te' | 'en'>('te');

  const handleSelect = (crop: any) => {
    setShowList(false);
    setLoading(true);
    setTimeout(() => {
      setSelected(crop);
      setLoading(false);
    }, 600);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f4f6f5" }}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1b5e20" />
        </Pressable>
        <Text style={styles.headerTitle}>{lang === 'te' ? 'పంటల సమాచారం' : 'Crop Knowledge'}</Text>
        
        {/* LANGUAGE TOGGLE BUTTON */}
        <Pressable 
          onPress={() => setLang(lang === 'te' ? 'en' : 'te')}
          style={styles.langBtn}
        >
          <Text style={styles.langBtnText}>{lang === 'te' ? 'English' : 'తెలుగు'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* DROPDOWN */}
        <Pressable style={styles.dropdown} onPress={() => setShowList(!showList)}>
          <Text style={styles.dropdownText}>
            {selected ? selected.name[lang] : (lang === 'te' ? "పంటను ఎంచుకోండి" : "Select Crop")}
          </Text>
          <Ionicons name="chevron-down" size={18} />
        </Pressable>

     {showList && (
  <View style={styles.dropdownList}>
    <ScrollView nestedScrollEnabled={true}>
      {allCropsKnowledge.map((crop) => (
        <Pressable
          key={crop.id}
          style={styles.dropItem}
          onPress={() => handleSelect(crop)}
        >
          <Text style={{ color: "#333" }}>
            {typeof crop.name === "string"
              ? crop.name
              : crop.name[lang]}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  </View>
)}

        {loading && (
          <View style={{ marginTop: 40 }}>
            <ActivityIndicator size="large" color="#1b5e20" />
          </View>
        )}

        {!loading && selected && (
          <>
            {/* BASIC INFO */}
            <View style={styles.card}>
               <Text style={styles.section}>{lang === 'te' ? 'ప్రాథమిక సమాచారం' : 'Basic Info'}</Text>
               <Text>🌤 {lang === 'te' ? 'సీజన్' : 'Season'}: {selected.basic.season[lang]}</Text>
               <Text>⏳ {lang === 'te' ? 'కాలపరిమితి' : 'Duration'}: {selected.basic.duration[lang]}</Text>
               <Text>🌱 {lang === 'te' ? 'నేలలు' : 'Soil'}: {selected.basic.soil[lang]}</Text>
               <Text>💧 {lang === 'te' ? 'నీటి అవసరం' : 'Water'}: {selected.basic.water[lang]}</Text>
            </View>

            {/* SMART TIPS */}
            <View style={styles.card}>
              <Text style={styles.section}>💡 {lang === 'te' ? 'ముఖ్యమైన సూచనలు' : 'Smart Farming Tips'}</Text>
              {selected.practicalTips.map((tip: any, i: number) => (
  <Text key={i} style={styles.listItem}>
    | {tip[lang]}
  </Text>
))}

            </View>

            {/* PESTS */}
            <View style={styles.card}>
              <Text style={styles.section}>🐛 {lang === 'te' ? 'తెగుళ్లు - నివారణ' : 'Pests & Diseases'}</Text>
             {selected.pestsAndDiseases.map((p: any, i: number) => (
  <Text key={i} style={styles.listItem}>
    • {p[lang]}
  </Text>
))}

            </View>

            {/* FERTILIZER */}
            <View style={styles.card}>
  <Text style={styles.section}>
    🧪 {lang === 'te' ? 'ఎరువుల యాజమాన్యం' : 'Fertilizer Guide'}
  </Text>

  <Text style={styles.listItem}>
    • {selected.fertilizerGuide[lang]}
  </Text>
</View>
<View style={styles.card}>
  <Text style={styles.section}>
    🏛 {lang === 'te' ? 'ప్రభుత్వ పథకాలు' : 'Government Schemes'}
  </Text>

  {selected.schemes?.map((scheme: any, i: number) => (
    <Pressable
      key={i}
      onPress={() => Linking.openURL(scheme.link)}
    >
      <Text style={[styles.listItem, { color: "#1565c0" }]}>
        • {typeof scheme.name === "string"
      ? scheme.name
      : scheme.name[lang]}

      </Text>
    </Pressable>
  ))}
</View>
<View style={styles.card}>
  <Text style={styles.section}>
    💰 {lang === 'te' ? 'మార్కెట్ ధరలు' : 'Market Information'}
  </Text>

  {selected.markets?.map((market: any, i: number) => (
    <Pressable
      key={i}
      onPress={() => Linking.openURL(market.link)}
    >
      <Text style={[styles.listItem, { color: "#1565c0" }]}>
       • {typeof market.name === "string"
      ? market.name
      : market.name[lang]}

      </Text>
    </Pressable>
  ))}
</View>
<View style={styles.card}>
  <Text style={styles.section}>
    🎥 {lang === 'te' ? 'ఉపయోగకరమైన వీడియోలు' : 'Useful Videos'}
  </Text>

  {selected.videos?.map((video: any, i: number) => (
    <Pressable
      key={i}
      onPress={() => Linking.openURL(video.link)}
    >
      <Text style={[styles.listItem, { color: "#1565c0" }]}>
      • {typeof video.title === "string"
    ? video.title
    : video.title[lang]}

      </Text>
    </Pressable>
  ))}
</View>


          {/* HELPLINE CARD */}
<View style={[styles.card, { backgroundColor: "#e8f5e9", borderColor: '#c8e6c9', borderWidth: 1 }]}>
  <Text style={[styles.section, { borderBottomColor: '#c8e6c9' }]}>
    ☎️ {lang === 'te' ? 'సహాయక కేంద్రాలు (Helplines)' : 'Agri Helplines'}
  </Text>
  
  {selected.helpline?.map((item: any, i: number) => (
    <Pressable 
      key={i} 
      style={{ marginBottom: 12 }}
      onPress={() => {
        // Extracting only the number if there's text (like for WhatsApp)
        const phoneNumber = item.phone.split(' ')[0].replace(',', '');
        Linking.openURL(`tel:${phoneNumber}`);
      }}
    >
      <Text style={{ fontWeight: "700", color: "#2e7d32", fontSize: 14 }}>
        {typeof item.state === "string"
    ? item.state
    : item.state[lang]}

      </Text>
      <Text style={{ color: "#1b5e20", marginTop: 2, fontSize: 16, fontWeight: '600' }}>
        📞 {item.phone}
      </Text>
    </Pressable>
  ))}
  
  <Text style={{ fontSize: 11, color: '#666', fontStyle: 'italic', marginTop: 5 }}>
    *{lang === 'te' ? 'నంబర్ పై క్లిక్ చేసి నేరుగా కాల్ చేయండి' : 'Click on the number to call directly'}
  </Text>
</View>

          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: "#fff", paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16, flexDirection: "row", alignItems: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700", color: "#1b5e20" },
  langBtn: { backgroundColor: '#e8f5e9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  langBtnText: { color: '#1b5e20', fontWeight: 'bold', fontSize: 12 },
  dropdown: { backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", elevation: 2 },
  dropdownText: { fontWeight: "700", color: "#1b5e20" },
  dropItem: { backgroundColor: "#fff", padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 16, marginTop: 14, elevation: 3 },
  section: { fontWeight: "800", marginBottom: 10, color: "#1b5e20", fontSize: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
  listItem: { marginBottom: 6, lineHeight: 20, color: '#333' },dropdownList: {
  backgroundColor: "#fff",
  borderRadius: 12,
  maxHeight: 200,   // 👈 FIXED HEIGHT
  marginBottom: 10,
  elevation: 3,
},

});
