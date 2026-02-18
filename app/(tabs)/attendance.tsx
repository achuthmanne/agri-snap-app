//mestri attnendance screen
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

/* ---------- TYPES ---------- */
type Kuli = {
  id: string;
  name: string;
  photo?: string;
};

type AttendanceStatus = 'full' | 'morning' | 'evening' | 'absent';


export default function AttendanceScreen() {
  const router = useRouter();
// ✅ LANGUAGE BASED LOCALE
 const [language, setLanguage] = useState<'te' | 'en'>('en');
const locale = language === 'te' ? 'te-IN' : 'en-IN';

// ✅ FORMATTED DATE & TIME
const formattedDate = new Date().toLocaleDateString(locale, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});





  /* ---------- STATES ---------- */
 
  const [loading, setLoading] = useState(true);
  
const [dataReady, setDataReady] = useState(false);

  const [saving, setSaving] = useState(false);

  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'fail' | null>(null);

  const [userId, setUserId] = useState<string | null>(null);

  const [farmers, setFarmers] = useState<any[]>([]);
  const [kulis, setKulis] = useState<Kuli[]>([]);

  const [farmerInput, setFarmerInput] = useState('');
  const [cropInput, setCropInput] = useState('');

  const [showFarmerList, setShowFarmerList] = useState(false);
  const [showCropList, setShowCropList] = useState(false);

  const [attendance, setAttendance] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [readOnly, setReadOnly] = useState(false);
const [todaySummary, setTodaySummary] = useState<any | null>(null);
const [workInput, setWorkInput] = useState('');
const [showWorkList, setShowWorkList] = useState(false);


  /* ---------- MULTI LANG TEXT ---------- */
  const T = {
    title: language === 'te' ? 'హాజరు' : 'Attendance',
    farmer: language === 'te' ? 'రైతు' : 'Farmer',
    crop: language === 'te' ? 'పంట' : 'Crop',
    rate: language === 'te' ? 'రోజు రేటు' : 'Daily Rate',
    save: language === 'te' ? 'హాజరు సేవ్ చేయండి' : 'Save Attendance',
    success: language === 'te' ? 'హాజరు సేవ్ అయ్యింది' : 'Attendance saved',
    fail:
      language === 'te'
        ? 'దయచేసి అన్ని వివరాలు నమోదు చేయండి'
        : 'Please fill all details',
    present: language === 'te' ? 'హాజరు' : 'Present',
    absent: language === 'te' ? 'గైర్హాజరు' : 'Absent',
    total: language === 'te' ? 'మొత్తం' : 'Total',
    amount: language === 'te' ? 'మొత్తం కూలి' : 'Total Amount',
    photo: language === 'te' ? 'ఫోటో' : 'Photo',
  name: language === 'te' ? 'పేరు' : 'Name',
  status: language === 'te' ? 'హాజరు' : 'Status',
  wage: language === 'te' ? 'కూలి' : 'Wage',
  };
 

const STATUS_LABEL = {
  en: {
    full: 'FULL',
    morning: 'MORNING',
    evening: 'EVENING',
    absent: 'ABSENT',
  },
  te: {
    full: 'పూర్తి',
    morning: 'ఉదయం',
    evening: 'సాయంత్రం',
    absent: 'లేరు',
  },
};

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


  const init = async () => {
  setLoading(true);
  setDataReady(false); // 🔴 important

  // ⏳ UX delay (instant render avoid cheyyadaniki)
  await new Promise(res => setTimeout(res, 800));

  const lang = await AsyncStorage.getItem('APP_LANG');
  if (lang === 'te' || lang === 'en') setLanguage(lang);

  const userRaw = await AsyncStorage.getItem('CURRENT_USER');
  if (!userRaw) {
    setLoading(false);
    return;
  }

  const user = JSON.parse(userRaw);
  setUserId(user.id);

  const farmersRaw = await AsyncStorage.getItem(`FARMERS_${user.id}`);
  const kulisRaw = await AsyncStorage.getItem(`KULIS_${user.id}`);

  setFarmers(farmersRaw ? JSON.parse(farmersRaw) : []);
  setKulis(kulisRaw ? JSON.parse(kulisRaw) : []);

  // ---------- TODAY ATTENDANCE ----------
  const todayStr = new Date().toDateString();
  const attRaw = await AsyncStorage.getItem(`ATTENDANCE_${user.id}`);

  if (attRaw) {
    const list = JSON.parse(attRaw);
    const today = list.find(
  (a: any) =>
    a.date === todayStr &&
    a.farmer === farmerInput &&
    a.crop === cropInput
);

  }

  // ✅ ALL DATA READY NOW
  setLoading(false);
  setDataReady(true);
};
useEffect(() => {
  init();
}, []);
{loading && (
  <View style={styles.loader}>
    <ActivityIndicator size="large" color="#1b5e20" />
  </View>
)}

  /* ---------- MESSAGE AUTO CLEAR ---------- */
  const autoClearMsg = () => {
    setTimeout(() => {
      setMsg('');
      setMsgType(null);
    }, 3500);
  };

  /* ---------- ATTENDANCE TOGGLE ---------- */
const toggleAttendance = (kuliId: string) => {
  setAttendance(prev => {
    const cur = prev[kuliId];

    const next: AttendanceStatus =
      cur === 'full'
        ? 'morning'
        : cur === 'morning'
        ? 'evening'
        : cur === 'evening'
        ? 'absent'
        : 'full';

    return { ...prev, [kuliId]: next };
  });
};

const presentCount = kulis.filter(
  k =>
    attendance[k.id] === 'full' ||
    attendance[k.id] === 'morning' ||
    attendance[k.id] === 'evening'
).length;


  const absentCount = kulis.length - presentCount;
const resetForm = () => {
  setFarmerInput('');
  setCropInput('');
  setAttendance({});
  setTodaySummary(null);
};

  /* ---------- SAVE ---------- */
  const saveAttendance = async () => {
    
   if (!farmerInput || !cropInput || !workInput) {
  setMsgType('fail');
  setMsg(
    language === 'te'
      ? 'రైతు, పంట, పని అన్నీ నమోదు చేయాలి'
      : 'Farmer, Crop and Work are required'
  );
  autoClearMsg();
  return;
}


    if (!userId) return;

    setSaving(true);

    setTimeout(async () => {
      const now = new Date();
const key = `ATTENDANCE_${userId}`;
const raw = await AsyncStorage.getItem(key);
const old = raw ? JSON.parse(raw) : [];

const todayStr = new Date().toDateString();

const duplicate = old.find(
  (a: any) =>
    a.date === todayStr &&
    a.farmer === farmerInput &&
    a.work === workInput
);

if (duplicate) {
  setSaving(false);
  setMsgType('fail');
  setMsg(
    language === 'te'
      ? 'ఈ రైతు & పంటకు ఈరోజు హాజరు ఇప్పటికే ఉంది'
      : 'Attendance already exists for this Farmer & Crop today'
  );
  autoClearMsg();
  return;
}

      const record = {
        dateISO: now.toISOString(),
        date: now.toDateString(),
        time: now.toLocaleTimeString(),
        farmer: farmerInput,
        farmerId: String,
        maestriId: String,
        mestriName: String,
        crop: cropInput,
       work: workInput, 
        summary: {
          present: presentCount,
          absent: absentCount,
          total: kulis.length,
          
        },
        records: kulis.map(k => ({
          kuliId: k.id,
          name: k.name,
          photo: k.photo,
          status: attendance[k.id] || 'absent',
         
        })),
      };

      

      await AsyncStorage.setItem(key, JSON.stringify([record, ...old]));
const snapshot = {
  id: Date.now().toString(),

  farmer: farmerInput,
  crop: cropInput,
work: workInput, 
  dateISO: now.toISOString(),
  dateText: now.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
fullCount: kulis.filter(k => attendance[k.id] === 'full').length,
morningCount: kulis.filter(k => attendance[k.id] === 'morning').length,
eveningCount: kulis.filter(k => attendance[k.id] === 'evening').length,

};


/* SAVE SNAPSHOT */
const snapKey = `ATTENDANCE_SNAPSHOT_${userId}`;
const snapRaw = await AsyncStorage.getItem(snapKey);
const snapOld = snapRaw ? JSON.parse(snapRaw) : [];

await AsyncStorage.setItem(
  snapKey,
  JSON.stringify([snapshot, ...snapOld])

  
);
 setReadOnly(true);

setTimeout(() => {
  resetForm();
  setReadOnly(false);
}, 10000);

      setSaving(false);
      setMsgType('success');
      setMsg(T.success);
      autoClearMsg();

      setTimeout(() => router.back(), 1200);
    }, 2000);
   
  };
  const confirmDeleteAttendance = () => {
  Alert.alert(
    language === 'te' ? 'నిర్ధారణ' : 'Confirm',
    language === 'te'
      ? 'ఈరోజు హాజరు తొలగించాలా? ఇది తిరిగి రావు.'
      : 'Do you want to delete today attendance? This cannot be undone.',
    [
      {
        text: language === 'te' ? 'రద్దు' : 'Cancel',
        style: 'cancel',
      },
      {
        text: language === 'te' ? 'తొలగించు' : 'Delete',
        style: 'destructive',
        onPress: deleteTodayAttendance, // ✅ ACTUAL DELETE
      },
    ]
  );
};

  const deleteTodayAttendance = async () => {
  if (!userId) return;

  const raw = await AsyncStorage.getItem(`ATTENDANCE_${userId}`);
  if (!raw) return;

  const list = JSON.parse(raw);
  const todayStr = new Date().toDateString();

  const updated = list.filter((a: any) => a.date !== todayStr);

  await AsyncStorage.setItem(
    `ATTENDANCE_${userId}`,
    JSON.stringify(updated)
  );

  setMsgType('success');
  setMsg(
    language === 'te'
      ? 'ఈరోజు హాజరు తొలగించబడింది'
      : 'Today attendance deleted'
  );

  setTimeout(() => {
    router.replace('/(tabs)/attendance'); // 🔄 fresh screen
  }, 1500);
};


  /* ---------- UI ---------- */
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
        <View style={{ width: 22 }} />
        <Ionicons
  name="time-outline"
  size={22}
  color="#1b5e20"
  onPress={() => router.push('/(tabs)/attendance-history')}
/>


      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
         <Text style={styles.dateText}>
   • {formattedDate} • 
</Text>

 {dataReady && (
  <>
        {/* FARMER */}
        <View style={{ zIndex: 100 }}>
          <Text style={{ fontSize: 12, color: '#000000', marginTop: 4 }}>
  {language === 'te'
    ? '*జాబితాలో లేకపోతే — మీరే నమోదు చేయండి'
    : '*Not in list? Type manually'}
</Text>
          <View style={styles.inputBox}>
             <Ionicons name="person" size={16} color="#1b5e20" />
            <TextInput
             editable={!readOnly}
  selectTextOnFocus={!readOnly}
              value={farmerInput}
              onChangeText={t => {
                setFarmerInput(t);
                setShowFarmerList(true);
              }}
              placeholder={T.farmer}
               placeholderTextColor="#333"
              style={styles.input}
            />
            <Pressable  disabled={readOnly}
  onPress={() => setShowFarmerList(p => !p)} >
              <Ionicons name="chevron-down" size={18} />
            </Pressable>
          </View>

          {showFarmerList && (
            <View style={styles.dropdown}>
               <ScrollView nestedScrollEnabled style={{ maxHeight: 140 }}>
              {farmers.map(f => (
                <Pressable
                  key={f.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFarmerInput(f.name);
                    setShowFarmerList(false);
                  }}
                >
                  <Ionicons name="person" size={16} color="#1b5e20" />
                  <Text style={styles.dropdownText}>{f.name}</Text>
                </Pressable>
              ))}
              </ScrollView>
            </View>
          )}
        </View>
        {/* WORK */}
<View style={{ zIndex: 40 }}>
  <View style={styles.inputBox}>
    <Ionicons name="briefcase" size={18} />
    <TextInput
      editable={!readOnly}
      selectTextOnFocus={!readOnly}
      value={workInput}
      onChangeText={t => {
        setWorkInput(t);
        setShowWorkList(true);
      }}
      placeholder={language === 'te' ? 'పని ఎంచుకోండి' : 'Select Work'}
       placeholderTextColor="#333"
      style={styles.input}
    />
    <Pressable
      disabled={readOnly}
      onPress={() => setShowWorkList(p => !p)}
    >
      <Ionicons name="chevron-down" size={18} />
    </Pressable>
  </View>

  {showWorkList && (
    <View style={styles.dropdown}>
       <ScrollView nestedScrollEnabled style={{ maxHeight: 140 }}>
      {WORKS.map(w => (
        <Pressable
          key={w}
          style={styles.dropdownItem}
          onPress={() => {
            setWorkInput(w);
            setShowWorkList(false);
          }}
        >
          <Ionicons name="briefcase" size={16} color="#1b5e20" />
          <Text style={styles.dropdownText}>{w}</Text>
        </Pressable>
      ))}
      </ScrollView>
    </View>
  )}
</View>


        {/* CROP */}
        <View style={{ zIndex: 50 }}>
          <View style={styles.inputBox}>
             <Ionicons name="leaf" size={18} />
            <TextInput
             editable={!readOnly}
  selectTextOnFocus={!readOnly}
              value={cropInput}
              onChangeText={t => {
                setCropInput(t);
                setShowCropList(true);
              }}
              placeholder={T.crop}
               placeholderTextColor="#333"
              style={styles.input}
            />
            <Pressable  disabled={readOnly}
   onPress={() => setShowCropList(p => !p)}>
              <Ionicons name="chevron-down" size={18} />
            </Pressable>
          </View>

          {showCropList && (
            <View style={styles.dropdown}>
               <ScrollView nestedScrollEnabled style={{ maxHeight: 140 }}>
              {CROPS.map(c => (
                <Pressable
                  key={c}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setCropInput(c);
                    setShowCropList(false);
                  }}
                >
                  <Ionicons name="leaf" size={16} color="#1b5e20" />
                  <Text style={styles.dropdownText}>{c}</Text>
                </Pressable>
              ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* TABLE HEADER */}
<View style={styles.tableHeader}>
  <Text style={[styles.th, { flex: 2 }]}>{T.photo}</Text>
  <Text style={[styles.th, { flex: 3 }]}>{T.name}</Text>
  <Text style={[styles.th, { flex: 3 }]}>{T.status}</Text>
</View>

    <ScrollView
  style={styles.tableBody}
  nestedScrollEnabled
  keyboardShouldPersistTaps="handled"
  showsVerticalScrollIndicator={false}
>

  {kulis.map(k => {
    const status = attendance[k.id] || 'absent';

    return (
      <View key={k.id} style={styles.row}>
        <Image
          source={
            k.photo ? { uri: k.photo } : require('../../assets/user.jpg')
          }
          style={styles.photo}
        />

        <Text style={[styles.td, { flex: 3 }]}>{k.name}</Text>

        {/* ✅ ONLY BUTTON DISABLED */}
        <Pressable
          disabled={readOnly}   // 👈 ONLY HERE
          onPress={() => toggleAttendance(k.id)}
          style={[
            styles.toggle,
            status === 'full' && styles.full,
            status === 'morning' && styles.morning,
            status === 'evening' && styles.evening,
            status === 'absent' && styles.absent,
            readOnly && styles.readOnlyToggle, // 👈 visual only
          ]}
        >
          <Text style={styles.toggleText}>
            {STATUS_LABEL[language][status]}
          </Text>
        </Pressable>
      </View>
    );
  })}
</ScrollView>

        {/* SUMMARY */}

       <View style={styles.summaryCard}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
         <View style={styles.summaryCard1}>
  <Text style={{fontWeight: 'bold'}}>{T.present}: {readOnly ? todaySummary?.present ?? presentCount : presentCount
}</Text></View>
   <View style={styles.summaryCard2}>
  <Text style={{fontWeight: 'bold'}}>{T.absent}: {readOnly ? todaySummary?.absent ?? absentCount : absentCount
}</Text></View>
   <View style={styles.summaryCard3}>
  <Text style={{fontWeight: 'bold'}}>
    {T.total}: {readOnly ? todaySummary?.present ?? presentCount : presentCount
 }/{kulis.length}
  </Text>
  </View>
  </View>
</View>
 {readOnly && (
  <View style={styles.successmsgBox}>
    <Ionicons name="information-circle" size={18} color="#3a6e38" />
    <Text style={styles.successmsgText}>
      {language === 'te'
        ? 'ఈరోజు హాజరు ఇప్పటికే నమోదు చేయబడింది'
        : 'Attendance already marked for today'}
    </Text>
  </View>
)}

       {readOnly && (
  <Pressable style={styles.deleteBtn} onPress={confirmDeleteAttendance}>

    <Ionicons name="trash" size={18} color="#ffffff" />
    <Text style={styles.deleteText}>
      {language === 'te' ? 'ఈరోజు హాజరు తొలగించండి' : 'Delete Today Attendance'}
    </Text>
  </Pressable>
)}


        {/* SAVE */}
       {!readOnly && (
  <Pressable style={styles.saveBtn} onPress={saveAttendance}>
    <Ionicons name="save" size={18} color="#fff" />
    <Text style={styles.saveText}>{T.save}</Text>
  </Pressable>
)}
 </>
)}

        {/* INLINE MSG */}
        {msgType && (
          <View
            style={[
              styles.msgBox,
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
      </ScrollView>

      {(loading || saving) && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#1b5e20" />
        </View>
      )}
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f6f5' },
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
  content: { padding: 16, paddingBottom: 40 },
  dateText: { textAlign: 'center', color: '#555', marginBottom: 12 },
tableBody: {
  maxHeight: 320, // 👈 ONLY ROWS SCROLL AVVALANTE IDHI MUST
},
readOnlyToggle: {
  opacity: 0.6,
},
morning: {
  backgroundColor: '#bbdefb',
  borderColor: '#1565c0',
  borderWidth: 2,
},

evening: {
  backgroundColor: '#ffe0b2',
  borderColor: '#ef6c00',
  borderWidth: 2,
},

  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
    elevation: 2
  },
  input: { flex: 1, paddingVertical: 12 },
  
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 6,
    marginBottom: 10,
    overflow: 'hidden'
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  dropdownText: { marginLeft: 8 },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e3faed',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    elevation: 2
  },
  th: { textAlign: 'center', fontWeight: '700', color: '#1b5e20' },

  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    marginTop: 6,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2
  },
  photo: { width: 75, height: 73, borderRadius: 8, marginHorizontal: 15 },
  td: { textAlign: 'center', color: '#000000', fontWeight: '700', elevation: 2, fontSize: 16 },

  toggle: {
    flex: 2,
    marginHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    
  },
  full: { backgroundColor: '#c8e6c9', borderColor: '#2e7d32', borderWidth: 2 },
  half: { backgroundColor: '#fff9c4', borderColor: '#f9a825', borderWidth: 2 },
  absent: { backgroundColor: '#ffcdd2', borderColor: '#c62828', borderWidth: 2 },

  summaryCard: {
    backgroundColor: 'rgb(255, 255, 255)',
    padding:20,
    borderRadius: 14,
    marginTop:10,
    
    elevation: 2
  },
   summaryCard1: {
    backgroundColor: 'rgb(157, 198, 157)',
    padding: 16,
    borderRadius: 14,
    marginTop: 5,
    elevation: 4,
    
  },
  summaryCard2: {
    backgroundColor: 'rgb(252, 225, 225)',
    padding: 16,
    borderRadius: 14,
    marginTop: 5,
    elevation: 2
  },
  summaryCard3: {
    backgroundColor: 'rgb(254, 254, 203)',
    padding: 16,
    borderRadius: 14,
    marginTop: 5,
    elevation: 2
  },
  saveBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#226e26',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    elevation: 4
  },
  saveText: { color: '#fff', fontWeight: '700', marginLeft: 8 },

  msgBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  success: { backgroundColor: '#2e7d32' },
  fail: { backgroundColor: '#d32f2f' },
  msgText: { color: '#ffffff', marginLeft: 8 },
  toggleText: {
  fontWeight: '700',
  fontSize: 13,
  color: '#1b5e20',
},
deleteBtn: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#cb0e21',
  padding: 14,
  borderRadius: 12,
  marginTop: 14,
  elevation: 4
},
deleteText: {
  color: '#ffffff',
  fontWeight: '700',
  marginLeft: 8,
},
successmsgBox: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#e8f5e9',
  padding: 14,
  borderRadius: 12,
  marginTop: 14,
  borderWidth: 1,
  borderColor: '#357b0c'
},
successmsgText: {
  color: '#357b0c',
  fontWeight: '700',
  marginLeft: 8,
},

rateInputBox: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingHorizontal: 10,
  backgroundColor: '#fff',
  elevation: 2
},



rateInput: {
  width: 60,
  paddingVertical: 8,
  paddingLeft: 6,
  textAlign: 'center',
},



  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
