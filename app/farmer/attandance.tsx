import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function FarmerAttendance() {
  const router = useRouter();

  /* ---------------- STATE ---------------- */
  const [language, setLanguage] = useState<'te' | 'en'>('en');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState('');

  const [mestriName, setMestriName] = useState('');

  const [crop, setCrop] = useState('');
  const [showCrop, setShowCrop] = useState(false);
const [work, setWork] = useState('');
const [showWork, setShowWork] = useState(false);
const [full, setFull] = useState('');
const [morning, setMorning] = useState('');
const [evening, setEvening] = useState('');


  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'fail' | null>(null);
const CROPS = language === 'te' ? [
  // Major Food Grains (ముఖ్యమైన ఆహార పంటలు)
  'వరి', 'మొక్కజొన్న', 'జొన్న', 'సజ్జ', 'రాగులు', 'కొర్రలు', 
  
  // Commercial / Cash Crops (వాణిజ్య పంటలు)
  'పత్తి', 'మిర్చి', 'చెరకు', 'పొగాకు', 'సోయాబీన్', 'సుబాబుల్', 
  
  // Pulses & Oilseeds (పప్పు ధాన్యాలు మరియు నూనె గింజలు)
  'కంది', 'పెసర', 'మినుము', 'వేరుశనగ', 'ఆముదము', 'సన్ ఫ్లవర్', 'నువ్వులు', 
  
  // Vegetables (కూరగాయలు)
  'టమోటా', 'వంకాయ', 'బెండకాయ', 'ఉల్లిపాయ', 'బంగాళాదుంప', 'చిక్కుడుకాయ', 
  'గోరుచిక్కుడు', 'కాకరకాయ', 'బీరకాయ', 'సొరకాయ', 'మునక్కాయ', 
  
  // Fruits & Plantation (పండ్లు మరియు తోట పంటలు)
  'మామిడి', 'అరటి', 'బొప్పాయి', 'జామ', 'నిమ్మ', 'బత్తాయి', 'కొబ్బరి', 'జీడిమామిడి', 'పామాయిల్',
  
  // Spices (మసాలా దినుసులు)
  'పసుపు', 'అల్లం', 'ధనియాలు'
] : [
  // Major Food Grains
  'Paddy', 'Maize', 'Jowar', 'Bajra', 'Ragi', 'Korra', 
  
  // Commercial / Cash Crops
  'Cotton', 'Mirchi', 'Sugarcane', 'Tobacco', 'Soybean', 'Subabul', 
  
  // Pulses & Oilseeds
  'Red Gram', 'Green Gram', 'Black Gram', 'Groundnut', 'Castor', 'Sunflower', 'Sesame', 
  
  // Vegetables
  'Tomato', 'Brinjal', 'Ladies Finger', 'Onion', 'Potato', 'Beans', 
  'Cluster Beans', 'Bitter Gourd', 'Ridge Gourd', 'Bottle Gourd', 'Drumstick', 
  
  // Fruits & Plantation
  'Mango', 'Banana', 'Papaya', 'Guava', 'Lemon', 'Sweet Orange', 'Coconut', 'Cashew', 'Oil Palm',
  
  // Spices
  'Turmeric', 'Ginger', 'Coriander'
];

const WORKS = language === 'te' ? [
'నాటు పని', 'కలుపు తీయడం', 'విత్తనాలు చల్లడం', 'నారు పోయడం', 'నీరు పెట్టడం', 'ఎరువులు వేయడం',
'కోత కోయడం', 'పత్తి ఏరడం', 'మిర్చి కోయడం', 'కూరగాయల కోత', 'పూల కోత', 'ఆకుకూరలు కోయడం',
'నూర్పిడి', 'ధాన్యం శుభ్రపరచడం', 'ధాన్యం ఎండబోయడం', 'చెత్త వేరు చేయడం', 'గ్రేడింగ్', 'ప్యాకింగ్',
'బస్తాలు మోయడం', 'పశువుల సంరక్షణ', 'పాలు పితకడం', 'మేత కోయడం', 'చెత్త ఊడ్చడం', 'కంచె వేయడం', 'గడ్డి కోయడం', 'మందు కొట్టడం'
] : [
  // Main Field Works
  'Transplanting', 'Weeding', 'Sowing', 
  'Nursery Management', 'Irrigation', 'Fertilizer Application',
  
  // Harvesting & Picking
  'Harvesting', 'Cotton Picking', 'Chilli Picking', 
  'Vegetable Picking', 'Flower Picking', 'Leafy Greens Harvesting',
  
  // Post-Harvest Processing
  'Threshing', 'Winnowing/Cleaning', 'Drying Grains', 
  'Seed Separation', 'Grading', 'Packing',
  
  // Allied & Heavy Works
  'Loading/Unloading', 'Cattle Management', 
  'Milking', 'Fodder Collection', 'Cleaning Sheds',
  'Fencing', 'Grass Cutting', 'Spraying'
];

const locale = language === 'te' ? 'te-IN' : 'en-IN';

// ✅ FORMATTED DATE & TIME
const formattedDate = new Date().toLocaleDateString(locale, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

  const T = {
    title: language === 'te' ? 'హాజరు నమోదు' : 'Mark Attendance',
    mestri: language === 'te' ? 'మెస్త్రీ' : 'Mestri',
    crop: language === 'te' ? 'పంట ఎంచుకోండి' : 'Select Crop',
    full: language === 'te' ? 'పూర్తిగా వచ్చిన వారు:' : 'Full Present:',
    morning: language === 'te' ? 'ఉదయం వచ్చిన వారు:' : 'Morning Present:',
evening: language === 'te' ? 'సాయంత్రం వచ్చిన వారు:' : 'Evening Present:',

    total: language === 'te' ? 'మొత్తం హాజరు' : 'Total Attendance',
    absent: language === 'te' ? 'లేరు' : 'Absent',
    save: language === 'te' ? 'హాజరు నమోదు చేయండి' : 'Save Attendance',
    fail: language === 'te' ? 'దయచేసి అవసరమైన అన్ని వివరాలు పూరించండి' : 'Please fill required fields',
    duplicate: language === 'te' ? 'హాజరు ఇప్పటికే ఈ రోజు సేవ్ చేయబడింది' : 'Attendance already saved today',
    success: language === 'te' ? 'హాజరు విజయవంతంగా సేవ్ చేయబడింది' : 'Attendance saved successfully',
  };

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const lang = await AsyncStorage.getItem('APP_LANG');
    if (lang === 'te' || lang === 'en') setLanguage(lang);

    const userRaw = await AsyncStorage.getItem('CURRENT_USER');
    if (!userRaw) return;

    const user = JSON.parse(userRaw);
    setUserId(user.id);


    setLoading(false);
  };

  /* ---------------- SAVE ---------------- */
 const saveAttendance = async () => {
  if (
  !mestriName ||
  !crop ||
  !work ||
  (!full && !morning && !evening)
) {
  showMsg('fail', T.fail);
  return;
}



  setSaving(true);
const f = Number(full || 0);
const m = Number(morning || 0);
const e = Number(evening || 0);
const t = f + m + e;


  const today = new Date().toDateString();

  

  // 🔁 DUPLICATE CHECK ON SNAPSHOTS
  const snapKey = `FARMER_ATT_SNAPSHOT_${userId}`;
  const snapRaw = await AsyncStorage.getItem(snapKey);
  const snapList = snapRaw ? JSON.parse(snapRaw) : [];
// 🔐 MESTRI NAME CONSISTENCY CHECK
const existingMestri = snapList.find(
  (s: any) =>
    s.farmerId === userId &&
    s.crop === crop
);

  const duplicate = snapList.find(
    (s: any) =>
      s.date === today &&
      s.mestriName === mestriName &&
      s.work === work && s.crop === crop
  );

  if (duplicate) {
    setSaving(false);
    showMsg('fail', T.duplicate);
    return;
  }

  // 📸 SNAPSHOT
const snapshot = {
  id: Date.now().toString(),
  farmerId: userId,

  date: today,
  time: new Date().toLocaleTimeString(),
  dateISO: new Date().toISOString(),

  mestriName,
  crop,
  work,              // ✅ NEW FIELD

  summary: {
  full: f,
  morning: m,
  evening: e,
  total: t,
},


  isPaid: false,
  paymentId: null,
};


  await AsyncStorage.setItem(
    snapKey,
    JSON.stringify([snapshot, ...snapList])
  );

  setSaving(false);
  showMsg('success', T.success);

  setTimeout(() => {
  setLoading(true);
  router.back();
}, 2000);

};

  const showMsg = (type: 'success' | 'fail', text: string) => {
    setMsgType(type);
    setMsg(text);
    setTimeout(() => {
      setMsg('');
      setMsgType(null);
    }, 3000);
  };

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1b5e20" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={styles.header}>
       
 <Pressable
  onPress={() => {
    setLoading(true);
    setTimeout(() => {
      router.back();
    }, 300);
  }}
>
  <Ionicons name="arrow-back" size={22} color="#1b5e20" />
</Pressable>
        <Text style={styles.headerTitle}>{T.title}</Text>
         <Ionicons
  name="time-outline"
  size={22}
  color="#1b5e20"
  onPress={() => router.push('/farmer/attendance-history')}
/>

      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.noticeBox}>
  <Text style={styles.noticeText}>
    ⚠️ {language === 'te'
      ? 'గమనిక: ఒకసారి మెస్త్రీ పేరు నమోదు చేసిన తరువాత, భవిష్యత్తులో అదే మెస్త్రీకి అదే పేరు మాత్రమే ఉపయోగించాలి.\n\nఉదాహరణ: మొదటిసారి మెస్త్రీ పేరు "సుసిల" అని నమోదు చేస్తే, తర్వాత ఎప్పుడైనా అదే మెస్త్రీకి "సుసిల" అనే పేరు మాత్రమే నమోదు చేయాలి.\n\nఎందుకంటే: చెల్లింపులు (Payments), హాజరు చరిత్ర (History) మరియు లెక్కలు సరిగా ఉండేందుకు ఇది అవసరం.'
      : 'Note: Once a Mestri name is entered, always use the same name in future.\n\nExample: If the Mestri name is entered as "Susila" for the first time, always use "Susila" for the same Mestri in future.\n\nReason: This is required to keep payments, attendance history, and calculations accurate.'}
  </Text>
</View>
<Text style={styles.dateText}>
   • {formattedDate} • 
</Text>

        {/* MESTRI CARD */}
        <Text style={{ fontWeight: '700', marginBottom: 6 }}>
  {language === 'te' ? 'మెస్త్రీ పేరు *' : 'Mestri Name *'}
</Text>

<View style={styles.mestriInputBox}>
  <Ionicons name="person-circle-outline" size={22} color="#1b5e20" />
  <TextInput
    style={styles.mestriInput}
    placeholder={
      language === 'te'
        ? 'ఇక్కడ మెస్త్రీ పేరు టైప్ చేయండి'
        : 'Type Mestri Name here'
    }
    placeholderTextColor="#999"
    value={mestriName}
    onChangeText={setMestriName}
  />
</View>


{/* Small Hint */}
  <Text style={styles.hintText}>
    {language === 'te'
      ? 'జాబితాలో లేకపోతే — మీరే నమోదు చేయండి'
      : 'Not in list? Type manually'}
  </Text>

{/* WORK */}
<View>
  <View style={{ position: 'relative', marginBottom: 16 }}>

  <View style={styles.selectBox}>
    <Ionicons name="construct" size={20} color="#1b5e20" />

    <TextInput
  style={styles.inputInline}
  placeholder={language === 'te' ? 'పని ఎంచుకోండి / నమోదు చేయండి' : 'Select or Enter Work'}
  placeholderTextColor="#888"
  value={work}
  onChangeText={(text) => {
    setWork(text);
    setShowWork(true); // 🔥 auto open
  }}
  onFocus={() => setShowWork(true)} // open when focused
/>

    <Pressable onPress={() => setShowWork(p => !p)}>
      <Ionicons name="chevron-down" size={18} />
    </Pressable>
  </View>
{showWork && (
  <View style={styles.dropdown}>
    <ScrollView nestedScrollEnabled style={{ maxHeight: 220 }}>
     {WORKS
  .filter(w =>
    w.toLowerCase().includes(work.toLowerCase())
  )
  .map(w => (
    <Pressable
      key={w}
      style={styles.dropdownItem}
      onPress={() => {
        setWork(w);
        setShowWork(false);
      }}
    >

          <Ionicons name="construct" size={16} color="#1b5e20" />
          <Text style={{ marginLeft: 8 }}>{w}</Text>
        </Pressable>
      ))}
    </ScrollView>
  </View>
)}
</View>
</View>
{/* CROP */}
<View>
  <View style={{ position: 'relative', marginBottom: 16 }}>

  <View style={styles.selectBox}>
    <Ionicons name="leaf" size={20} color="#1b5e20" />

    <TextInput
  style={styles.inputInline}
  placeholder={language === 'te' ? 'పంట ఎంచుకోండి / నమోదు చేయండి' : 'Select or Enter Crop'}
  placeholderTextColor="#888"
  value={crop}
  onChangeText={(text) => {
    setCrop(text);
    setShowCrop(true); // 🔥 auto open
  }}
  onFocus={() => setShowCrop(true)}
/>


    <Pressable onPress={() => setShowCrop(p => !p)}>
      <Ionicons name="chevron-down" size={18} />
    </Pressable>
  </View>
  {showCrop && (
  <View style={styles.dropdown}>
    <ScrollView nestedScrollEnabled style={{ maxHeight: 220 }}>
      {CROPS
  .filter(c =>
    c.toLowerCase().includes(crop.toLowerCase())
  )
  .map(c => (
    <Pressable
      key={c}
      style={styles.dropdownItem}
      onPress={() => {
        setCrop(c);
        setShowCrop(false);
      }}
    >

          <Ionicons name="leaf" size={16} color="#1b5e20" />
          <Text style={{ marginLeft: 8 }}>{c}</Text>
        </Pressable>
      ))}
    </ScrollView>
  </View>
)}
</View>
</View>

        {/* INPUTS */}
       <View style={styles.inputCard}>

  {/* FULL */}
  <View style={styles.inputRow}>
    <Ionicons name="sunny" size={22} color="#2e7d32" />
    <Text style={styles.label}>
      {T.full}
    </Text>
    <TextInput
      style={styles.bigInput}
      keyboardType="number-pad"
      value={full}
      onChangeText={setFull}
    />
  </View>

  {/* MORNING */}
  <View style={styles.inputRow}>
    <Ionicons name="partly-sunny" size={22} color="#f9a825" />
    <Text style={styles.label}>{T.morning}</Text>
    <TextInput
      style={styles.bigInput}
      keyboardType="number-pad"
      value={morning}
      onChangeText={setMorning}
    />
  </View>

  {/* EVENING */}
  <View style={styles.inputRow}>
    <Ionicons name="moon" size={22} color="#1565c0" />
    <Text style={styles.label}>{T.evening}</Text>
    <TextInput
      style={styles.bigInput}
      keyboardType="number-pad"
      value={evening}
      onChangeText={setEvening}
    />
  </View>

  {/* TOTAL */}
  <View style={styles.inputRow}>
    <Ionicons name="people-circle" size={22} color="#1b5e20" />
    <Text style={styles.label}>{T.total} :</Text>
    <Text style={styles.totalValue}>
      {Number(full || 0) +
        Number(morning || 0) +
        Number(evening || 0)}
    </Text>
  </View>

</View>


        {/* SAVE */}
        <Pressable style={styles.saveBtn} onPress={saveAttendance}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save" size={18} color="#fff" />
              <Text style={styles.saveText}>{T.save}</Text>
            </>
          )}
        </Pressable>

      
      </ScrollView>
      {msgType && (
  <View
    style={[
      styles.toast,
      msgType === 'success' ? styles.success : styles.fail,
    ]}
  >
    <Ionicons
      name={
        msgType === 'success'
          ? 'checkmark-circle'
          : 'close-circle'
      }
      size={18}
      color="#fff"
    />
    <Text style={styles.msgText}>{msg}</Text>
  </View>
)}

    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f6f5' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#1b5e20',
  },
  mestriInputBox: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 5,
  borderColor: '#1b5e20',
  marginBottom: 10,
},

mestriInput: {
  flex: 1,
  marginLeft: 8,
  fontSize: 16,
  fontWeight: '600',
},

noticeBox: {
  backgroundColor: '#ffe5e5',
  borderRadius: 10,
  padding: 10,
  marginBottom: 10,
  borderLeftWidth: 4,
  borderLeftColor: '#d32f2f',
},
noticeText: {
  color: '#d32f2f',
  fontWeight: '700',
  fontSize: 13,
},
inputInline: {
  flex: 1,
  paddingVertical: 2,
  marginLeft: 8,
},
toast: {
  position: 'absolute',
  bottom: 90,   // 🔥 adjust if needed based on bottom nav height
  left: 20,
  right: 20,
  padding: 14,
  borderRadius: 12,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 8,
},

hintText: {
  fontSize: 12,
  color: '#666',
  marginTop: 4,
  marginLeft: 6,
},

  content: { padding: 16 },

totalValue: {
  fontSize: 22,
  fontWeight: '800',
  color: '#1b5e20',
},

  selectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 8,
  },
  placeholder: { color: '#999' },
  valueText: { fontWeight: '700' },

 dropdown: {
  position: 'absolute',
  top: 60,
  left: 0,
  right: 0,
  backgroundColor: '#fff',
  borderRadius: 12,
  elevation: 8,
  zIndex: 999,
  maxHeight: 220,
},


  dateText: { textAlign: 'center', color: '#555', marginBottom: 12 },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    elevation: 3,
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  label: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '700',
  },
  bigInput: {
    width: 80,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    borderBottomWidth: 2,
    borderColor: '#1b5e20',
  },
  
  saveBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1b5e20',
    padding: 18,
    borderRadius: 14,
  },
  saveText: { color: '#fff', fontWeight: '700', marginLeft: 8 },

  msgBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  success: { backgroundColor: '#2e7d32' },
  fail: { backgroundColor: '#d32f2f' },
  msgText: { color: '#fff', marginLeft: 8, fontWeight: '700' },
});
