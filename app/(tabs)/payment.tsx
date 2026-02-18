import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

/* ---------- TYPES ---------- */
type KuliCalc = {
  kuliId: string;
  name: string;
  photo?: string;

  fullDays: number;
  morningDays: number;
  eveningDays: number;

  totalAmount: number;
  isGrandTotal?: boolean;
};


export default function PaymentScreen() {
  /* ---------- STATES ---------- */
  const [language, setLanguage] = useState<'te' | 'en'>('en');
  const [loading, setLoading] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [farmers, setFarmers] = useState<any[]>([]);

  const [farmerInput, setFarmerInput] = useState('');
  const [cropInput, setCropInput] = useState('');
  const [fullRate, setFullRate] = useState('');
const [morningRate, setMorningRate] = useState('');
const [eveningRate, setEveningRate] = useState('');


  const [showFarmerList, setShowFarmerList] = useState(false);
  const [showCropList, setShowCropList] = useState(false);

  const [results, setResults] = useState<KuliCalc[]>([]);
 // 🔹 DATE RANGE STATES (ADD)
const [snapshots, setSnapshots] = useState<any[]>([]);
const [availableDates, setAvailableDates] = useState<string[]>([]);
const [fromDate, setFromDate] = useState<string | null>(null);
const [toDate, setToDate] = useState<string | null>(null);

const [showFromDateList, setShowFromDateList] = useState(false);
const [showToDateList, setShowToDateList] = useState(false);

const [showDateRange, setShowDateRange] = useState(false);
const [workInput, setWorkInput] = useState('');
const [showWorkList, setShowWorkList] = useState(false);


  /* ---------- SOUND ---------- */
  const countSound = useRef<Audio.Sound | null>(null);

  /* ---------- TEXT ---------- */
  const T = {
    title: language === 'te' ? 'చెల్లింపులు' : 'Payments',
    farmer: language === 'te' ? 'రైతు' : 'Farmer',
    crop: language === 'te' ? 'పంట' : 'Crop',
    fromDate: language === 'te' ? 'తేదీ నుండి' : 'From Date',
    toDate: language === 'te' ? 'తేదీ వరకు' : 'To Date',
    rate: language === 'te' ? 'రోజు రేటు' : 'Daily Rate',
    calculate: language === 'te' ? 'లెక్కించండి' : 'Calculate',
    full: language === 'te' ? 'పూర్తి రోజులు' : 'Full Days',
    half: language === 'te' ? 'సగం రోజులు' : 'Half Days',
    total: language === 'te' ? 'మొత్తం' : 'Total',
    grandTotal: language === 'te' ? 'మొత్తం చెల్లింపు' : 'Grand Total',
    noData: language === 'te' ? 'డేటా లభించలేదు' : 'No data found',
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

  /* ---------- INIT ---------- */
 
  const init = async () => {
    const lang = await AsyncStorage.getItem('APP_LANG');
    if (lang === 'te' || lang === 'en') setLanguage(lang);

    const userRaw = await AsyncStorage.getItem('CURRENT_USER');
    if (!userRaw) return;

    const user = JSON.parse(userRaw);
    setUserId(user.id);

    const farmersRaw = await AsyncStorage.getItem(`FARMERS_${user.id}`);
    setFarmers(farmersRaw ? JSON.parse(farmersRaw) : []);
    // 🔹 LOAD SNAPSHOTS (DATES ONLY)
const snapRaw = await AsyncStorage.getItem(
  `ATTENDANCE_SNAPSHOT_${user.id}`
);
setSnapshots(snapRaw ? JSON.parse(snapRaw) : []);

  };

  const loadSound = async () => {
  const { sound } = await Audio.Sound.createAsync(
    require('../../assets/sounds/count.mp3'),
    { shouldPlay: false }
  );
  countSound.current = sound;
};

const playSound = async () => {
  try {
    await countSound.current?.replayAsync();
  } catch {}
};

useEffect(() => {
  loadSound();
  return () => {
    countSound.current?.unloadAsync();
  };
}, []);
useEffect(() => {
  init();
}, []);
// 🔹 FARMER + CROP → AVAILABLE DATES
useEffect(() => {
  if (!farmerInput || !cropInput) {
    setAvailableDates([]);
    setFromDate(null);
    setToDate(null);
    return;
  }

  const dates = snapshots
    .filter(
      s => s.farmer === farmerInput && s.crop === cropInput
    )
    .map(s => s.dateISO)
    .sort();

  setAvailableDates(dates);
}, [farmerInput, cropInput]);
useEffect(() => {
  if (!userId || !farmerInput || !cropInput) {
    setAvailableDates([]);
    setShowDateRange(false);
    return;
  }

  (async () => {
    const raw = await AsyncStorage.getItem(`ATTENDANCE_${userId}`);
    if (!raw) return;

    const sessions = JSON.parse(raw);

  const dates = Array.from(
  new Set(
    sessions
      .filter(
        (s: any) =>
          s.farmer === farmerInput && s.crop === cropInput
      )
      .map((s: any) => s.dateISO as string)
  )
) as string[];

setAvailableDates(dates.sort());


    // ⭐ ONLY IF MULTIPLE DATES
    setShowDateRange(dates.length > 1);
  })();
}, [farmerInput, cropInput]);
const fullRateValue = Number(fullRate);
const morningRateValue = Number(morningRate);
const eveningRateValue = Number(eveningRate);

  /* ---------- CALCULATE ---------- */
  const calculatePayment = async () => {
    if (
  !userId ||
  !farmerInput ||
  !workInput ||
  !cropInput ||
  !fullRate ||
  !morningRate ||
  !eveningRate
) return;

    setLoading(true);
    
    setResults([]);
  await new Promise(resolve => setTimeout(resolve, 4000));
  // 🔒 DUPLICATE CHECK (BEFORE CALCULATION)
const historyRaw = await AsyncStorage.getItem(
  `PAYMENT_HISTORY_${userId}`
);

const history = historyRaw ? JSON.parse(historyRaw) : [];

const alreadyExists = history.some((item: any) => {
  // CASE 1: Date range present
  if (fromDate && toDate) {
    return (
      item.farmer === farmerInput &&
      item.crop === cropInput &&
      item.work === workInput &&
      item.fromDate === fromDate &&
      item.toDate === toDate
    );
  }

  // CASE 2: No date range (same day)
  return (
    item.farmer === farmerInput &&
    item.crop === cropInput &&
    item.work === workInput &&
    new Date(item.createdAt).toDateString() ===
      new Date().toDateString()
  );
});

if (alreadyExists) {
  setLoading(false);

  alert(
    language === 'te'
      ? 'ఈ డేటా ఇప్పటికే చరిత్ర (History) లో ఉంది.\nదయచేసి అక్కడ చూసుకోండి.'
      : 'This data already exists in History.\nPlease check there.'
  );

  return; // ❌ STOP CALCULATION
}

    const raw = await AsyncStorage.getItem(`ATTENDANCE_${userId}`);
    if (!raw) {
      setLoading(false);
      return;
    }

    const sessions = JSON.parse(raw);
   const filtered = sessions.filter((s: any) => {
  if (s.farmer !== farmerInput || s.crop !== cropInput || s.work !== workInput) return false;

  // ⭐ date range apply ONLY when enabled
  if (showDateRange && fromDate && toDate) {
    const d = new Date(s.dateISO).getTime();
    return (
      d >= new Date(fromDate).getTime() &&
      d <= new Date(toDate).getTime()
    );
  }

  return true; // normal case
});



    if (filtered.length === 0) {
      setLoading(false);
      return;
    }

    const map: Record<string, KuliCalc> = {};
   
const fullRateValue = Number(fullRate);
const morningRateValue = Number(morningRate);
const eveningRateValue = Number(eveningRate);


    filtered.forEach((day: any) => {
      day.records.forEach((r: any) => {
        if (r.status === 'absent') return;

        if (!map[r.kuliId]) {
  map[r.kuliId] = {
    kuliId: r.kuliId,
    name: r.name,
    photo: r.photo,
    fullDays: 0,
    morningDays: 0,
    eveningDays: 0,
    totalAmount: 0,
  };
}


        if (r.status === 'full') {
  map[r.kuliId].fullDays += 1;
  map[r.kuliId].totalAmount += fullRateValue;
} else if (r.status === 'morning') {
  map[r.kuliId].morningDays += 1;
  map[r.kuliId].totalAmount += morningRateValue;
} else if (r.status === 'evening') {
  map[r.kuliId].eveningDays += 1;
  map[r.kuliId].totalAmount += eveningRateValue;
}

      });
    });

    const list = Object.values(map);
    // 🔹 TOTAL KULIS & AMOUNTS
const morningKulis = list.filter(k => k.morningDays > 0).length;
const eveningKulis = list.filter(k => k.eveningDays > 0).length;
const fullkulis = list.filter(k => k.fullDays > 0).length;
const fullAmount = list.reduce(
  (sum, k) => sum + k.fullDays * fullRateValue,
  0
);

const morningAmount = list.reduce(
  (sum, k) => sum + k.morningDays * morningRateValue,
  0
);

const eveningAmount = list.reduce(
  (sum, k) => sum + k.eveningDays * eveningRateValue,
  0
);

const grandTotal = fullAmount + morningAmount + eveningAmount;

// 🔹 SAVE TO PAYMENT HISTORY
const historyItem = {
  id: Date.now().toString(),
  farmerId: String,
  farmer: farmerInput,
  crop: cropInput,
   work: workInput, 
mestriId: String,
  // ✅ ADD THIS
  fromDate,
  toDate,
fullRate: fullRateValue,
morningRate: morningRateValue,
eveningRate: eveningRateValue,
fullKulis: fullkulis,
morningKulis,
eveningKulis,
morningAmount,
eveningAmount,

 fullAmount,
  grandTotal,

  bankType: 'Cash',
  createdAt: Date.now(),
  clearedDateText: new Date().toLocaleString(),
};

const key = `PAYMENT_HISTORY_${userId}`;
const oldRaw = await AsyncStorage.getItem(key);
let oldHistory = oldRaw ? JSON.parse(oldRaw) : [];

// 🧹 DUPLICATE AUTO DELETE LOGIC
oldHistory = oldHistory.filter((item: any) => {
  // CASE 1: date range undi
  if (historyItem.fromDate && historyItem.toDate) {
    return !(
      item.farmer === historyItem.farmer &&
      item.crop === historyItem.crop &&
      item.work === historyItem.work &&
      item.fromDate === historyItem.fromDate &&
      item.toDate === historyItem.toDate
    );
  }

  // CASE 2: date range ledu
  return !(
    item.farmer === historyItem.farmer &&
    item.crop === historyItem.crop &&
    item.work=== historyItem.work &&
    new Date(item.createdAt).toDateString() ===
      new Date(historyItem.createdAt).toDateString()
  );
});

// ➕ ADD NEW ONE
const updatedHistory = [historyItem, ...oldHistory];

await AsyncStorage.setItem(key, JSON.stringify(updatedHistory));

    const total = list.reduce((s, k) => s + k.totalAmount, 0);
list.push({
  kuliId: 'GRAND_TOTAL',
  name: T.grandTotal,
   fullDays: 0,
    morningDays: 0,
    eveningDays: 0,
    
  totalAmount: total,
  isGrandTotal: true,
});

   setResults(list);
setLoading(false);

  };
  const clearPayment = async () => {
  if (!userId || results.length === 0) return;

  const now = new Date();

  

  const key = `PAYMENT_HISTORY_${userId}`;
  const old = await AsyncStorage.getItem(key);
  const history = old ? JSON.parse(old) : [];


  await AsyncStorage.setItem(key, JSON.stringify(history));

  // 🔒 lock UI (optional UX)
  setResults([]);
};
const formatDate = (iso: string) => {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};


  /* ---------- RESULT CARD ---------- */
  function AnimatedResultCard({
    k,
    index,
  }: {
    k: KuliCalc;
    index: number;
  }) {
    const hasAnimated = useRef(false);

    const slideAnim = useRef(new Animated.Value(30)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const amountAnim = useRef(new Animated.Value(0)).current;
    const [displayAmount, setDisplayAmount] = useState(0);
const lastValue = useRef(0);

   useEffect(() => {
  if (hasAnimated.current) return; // ✅ prevents repeat
  hasAnimated.current = true;

const listenerId = amountAnim.addListener(({ value }) => {
  const v = Math.floor(value);
  if (v !== lastValue.current) {
    lastValue.current = v;
    setDisplayAmount(v);
    playSound();
  }
});


  Animated.sequence([
    Animated.delay(index * 600),
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(amountAnim, {
        toValue: k.totalAmount,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]),
  ]).start();

  return () => {
    amountAnim.removeListener(listenerId);
  };
}, []);


    return (
     <Animated.View
  style={[
    styles.resultCard,
    k.isGrandTotal && styles.grandTotalCard,
    {
      opacity: opacityAnim,
      transform: [{ translateY: slideAnim }],
    },
  ]}
>

        <View
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: k.isGrandTotal ? 'center' : 'flex-start',
    gap: k.isGrandTotal ? 0 : 40,
    width: '100%',
  }}
>

          {!k.isGrandTotal && (
  <Image
    source={
      k.photo ? { uri: k.photo } : require('../../assets/user.jpg')
    }
    style={styles.resultPhoto}
  />
)}


          <View style={{ alignItems: 'center' }}>
            <Text style={styles.name}>{k.name}</Text>


            
 {k.isGrandTotal ? (
 <Text style={styles.grandTotalText}>
 {T.grandTotal}: ₹{displayAmount}
  </Text>

) : (
  <>
    {k.fullDays > 0 && (
  <Text style={styles.line}>
    {T.full}: {k.fullDays} × ₹{fullRateValue}
  </Text>
)}

{k.morningDays > 0 && (
  <Text style={styles.line}>
    {language === 'te' ? 'ఉదయం' : 'Morning'}: {k.morningDays} × ₹{morningRateValue} = ₹{k.morningDays * morningRateValue}
  </Text>
)}

{k.eveningDays > 0 && (
  <Text style={styles.line}>
    {language === 'te' ? 'సాయంత్రం' : 'Evening'}: {k.eveningDays} × ₹{eveningRateValue} = ₹{k.eveningDays * eveningRateValue}
  </Text>
)}


    <Text style={styles.amount}>
      {T.total}: ₹{displayAmount}
    </Text>
  </>
)}
     </View>
        </View>
      </Animated.View>
    );
  }

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

      <Ionicons
        name="time-outline"
        size={22}
        color="#1b5e20"
        onPress={() => router.push('/(tabs)/payment-history')}
      />
    </View>

    <ScrollView contentContainerStyle={styles.content}>
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
            value={farmerInput}
            onChangeText={t => {
              setFarmerInput(t);
              setShowFarmerList(true);
            }}
            placeholder={T.farmer}
             placeholderTextColor="#333"
            style={styles.input}
          />
          

          <Pressable onPress={() => setShowFarmerList(p => !p)}>
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
<View style={{ zIndex: 45 }}>
  <View style={styles.inputBox}>
    <Ionicons name="briefcase" size={18} />
    <TextInput
      value={workInput}
      onChangeText={t => {
        setWorkInput(t);
        setShowWorkList(true);
      }}
      placeholder={language === 'te' ? 'పని' : 'Work'}
       placeholderTextColor="#333"
      style={styles.input}
    />
    <Pressable onPress={() => setShowWorkList(p => !p)}>
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
          <Ionicons name="briefcase-outline" size={16} color="#1b5e20" />
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
            value={cropInput}
            onChangeText={t => {
              setCropInput(t);
              setShowCropList(true);
            }}
            placeholder={T.crop}
             placeholderTextColor="#333"
            style={styles.input}
          />
          <Pressable onPress={() => setShowCropList(p => !p)}>
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

      {/* DATE RANGE */}
      {showDateRange && (
        <View>
          {/* FROM DATE */}
          {availableDates.length > 0 && (
            <View style={{ zIndex: 40 }}>
              <View style={styles.inputBox}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color="#1b5e20"
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  value={fromDate ? formatDate(fromDate) : ''}
                  placeholder={T.fromDate}
                   placeholderTextColor="#333"
                  style={styles.input}
                  editable={false}
                  onPressIn={() => setShowFromDateList(true)}
                />
                <Pressable onPress={() => setShowFromDateList(p => !p)}>
                  <Ionicons name="chevron-down" size={18} />
                </Pressable>
              </View>

              {showFromDateList && (
                <View style={styles.dropdown}>
                  {availableDates.map(d => (
                    <Pressable
                      key={d}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFromDate(d);
                        setShowFromDateList(false);
                        setToDate(null);
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons
                          name="calendar-outline"
                          size={16}
                          color="#1b5e20"
                          style={{ marginRight: 8 }}
                        />
                        <Text>{formatDate(d)}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* TO DATE */}
          {fromDate && (
            <View style={{ zIndex: 30 }}>
              <View style={styles.inputBox}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color="#1b5e20"
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  value={toDate ? formatDate(toDate) : ''}
                  placeholder={T.toDate}
                   placeholderTextColor="#333"
                  style={styles.input}
                  editable={false}
                  onPressIn={() => setShowToDateList(true)}
                />
                <Pressable onPress={() => setShowToDateList(p => !p)}>
                  <Ionicons name="chevron-down" size={18} />
                </Pressable>
              </View>

              {showToDateList && (
                <View style={styles.dropdown}>
                  {availableDates
                    .filter(d => new Date(d) >= new Date(fromDate))
                    .map(d => (
                      <Pressable
                        key={d}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setToDate(d);
                          setShowToDateList(false);
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons
                            name="calendar-outline"
                            size={16}
                            color="#1b5e20"
                            style={{ marginRight: 8 }}
                          />
                          <Text>{formatDate(d)}</Text>
                        </View>
                      </Pressable>
                    ))}
                </View>
              )}
            </View>
          )}
        </View>
      )}

     
      {/* FULL RATE */}
<View style={styles.rateBox}>
  <Ionicons name="cash-outline" size={18} color="#1b5e20" />
  <TextInput
    value={fullRate}
    onChangeText={setFullRate}
    keyboardType="number-pad"
    placeholder={language === 'te' ? 'పూర్తి రోజు రేటు' : 'Full Day Rate'}
    placeholderTextColor="#333"
    style={styles.rateInput}
  />
</View>

{/* MORNING RATE */}
<View style={styles.rateBox}>
  <Ionicons name="sunny-outline" size={18} color="#ff9800" />
  <TextInput
    value={morningRate}
    onChangeText={setMorningRate}
    keyboardType="number-pad"
    placeholder={language === 'te' ? 'ఉదయం రేటు' : 'Morning Rate'}
    placeholderTextColor="#333"
    style={styles.rateInput}
  />
</View>

{/* EVENING RATE */}
<View style={styles.rateBox}>
  <Ionicons name="moon-outline" size={18} color="#3f51b5" />
  <TextInput
    value={eveningRate}
    onChangeText={setEveningRate}
    keyboardType="number-pad"
    placeholder={language === 'te' ? 'సాయంత్రం రేటు' : 'Evening Rate'}
    placeholderTextColor="#333"
    style={styles.rateInput}
  />
</View>


      <Pressable style={styles.calcBtn} onPress={calculatePayment}>
        <Ionicons name="calculator" size={18} color="#fff" />
        <Text style={styles.calcText}>{T.calculate}</Text>
      </Pressable>

      {results.map((k, i) => (
        <AnimatedResultCard key={k.kuliId} k={k} index={i} />
      ))}

      {results.length === 0 && !loading && (
        <Text style={styles.empty}>{T.noData}</Text>
      )}
    </ScrollView>

    {loading && (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1b5e20" />
      </View>
    )}
  </View>
);
}
/* ---------- STYLES (UNCHANGED UI) ---------- */
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
  clearBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#1b5e20',
  padding: 16,
  borderRadius: 14,
  marginTop: 16,
  gap: 8,
  elevation: 4,
},

clearBtnText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
},

  content: { padding: 16 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ddd', marginBottom: 10, elevation: 4 }, 
  input: { flex: 1, paddingVertical: 12 }, 
  dropdown: { backgroundColor: '#fff', borderRadius: 10, elevation: 6, marginBottom: 10, overflow: 'hidden' },
   dropdownItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderColor: '#eee', },
    dropdownText: { marginLeft: 8 },
  rateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    marginVertical: 10,
  },
  grandAmount: {
  fontSize: 24,
  fontWeight: '900',
  color: '#34a23c',
  marginTop: 10,
},
grandTotalCard: {
  backgroundColor: '#1b5e20',
  borderRadius: 16,
  paddingVertical: 5,
  paddingHorizontal: 5,
  alignItems: 'center',
 
},

grandTotalText: {
  fontSize: 20,
  fontWeight: '900',
  color: '#ffffff',
  flexDirection: 'row',
  marginBottom: 20,
  alignItems: 'center'
},

  rateInput: { flex: 1, padding: 10 },
  calcBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2e7d32',
    padding: 16,
    borderRadius: 12,
    marginVertical: 14,
  },
  calcText: { color: '#fff', fontWeight: '700', marginLeft: 8 },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  resultPhoto: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
  },
  name: { fontSize: 16, fontWeight: '700', color: '#1b5e20' },
  line: { color: '#555', marginTop: 4 },
  amount: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#2e7d32',
  },
  totalCard: {
    backgroundColor: '#1b5e20',
    padding: 16,
    borderRadius: 14,
    marginTop: 20,
  },
  totalText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  empty: { textAlign: 'center', color: '#777', marginTop: 30 },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});