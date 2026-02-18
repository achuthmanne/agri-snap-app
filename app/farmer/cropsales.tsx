import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function CropSalesScreen() {
  const router = useRouter();

  const [language, setLanguage] = useState<'te' | 'en'>('te');
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState<any[]>([]);
  const [userId, setUserId] = useState('');
const [saving, setSaving] = useState(false);

  /* MODAL */

const [showAdd, setShowAdd] = useState(false);
const [isEdit, setIsEdit] = useState(false);
const [editingId, setEditingId] = useState<string | null>(null);

// 🔹 FORM STATES
const [crop, setCrop] = useState('');
const [category, setCategory] = useState('');
const [amount, setAmount] = useState('');

  const [saleDate, setSaleDate] = useState(new Date());
const [search, setSearch] = useState('');

  const [quantity, setQuantity] = useState('');
  const [rate, setRate] = useState('');
const [showCropList, setShowCropList] = useState(false);
const closeModal = () => {
  setShowAdd(false);   // or setModalVisible(false)
  setIsEdit(false);
  setEditingId(null);

  // reset inputs
  setCrop('');
  setCategory('');
  setAmount('');
};

  const total = Number(quantity || 0) * Number(rate || 0);
const formatAmount = (num: number | string) => {
  const n = Number(num || 0);
  return n.toLocaleString('en-IN');
};

  const T = {
    title: language === 'te' ? 'పంట అమ్మకాలు' : 'Crop Sales',
    add: language === 'te' ? 'అమ్మకం జోడించండి' : 'Add Sale',
    crop: language === 'te' ? 'పంట' : 'Crop',
    qty: language === 'te' ? 'పరిమాణం (కిలో / క్వింటాల్)' : 'Quantity (kg/quintal)',
    rate: language === 'te' ? 'రేటు "క్వింటాల్‌కు" లేదా "కిలోకు"' : 'Rate per quinta or per kg',
    total: language === 'te' ? 'మొత్తం' : 'Total',
    save: language === 'te' ? 'సేవ్ చేయండి' : 'Save',
    noData:
      language === 'te'
        ? 'ఇంకా అమ్మకాలు లేవు'
        : 'No sales recorded',
  };

  useEffect(() => {
    load();
  }, []);
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
  const load = async () => {
    const lang = await AsyncStorage.getItem('APP_LANG');
    if (lang === 'te' || lang === 'en') setLanguage(lang);

    const userRaw = await AsyncStorage.getItem('CURRENT_USER');
    if (!userRaw) return;
    const user = JSON.parse(userRaw);
    setUserId(user.id);

    const raw = await AsyncStorage.getItem(`FARMER_SALES_${user.id}`);
    setSales(raw ? JSON.parse(raw) : []);
  };

  /* SAVE */
  const saveSale = async () => {
    if (!crop || !quantity || !rate) {
    Alert.alert(
      language === 'te'
        ? 'అన్ని వివరాలు ఇవ్వండి'
        : 'Please fill all fields'
    );
    return;
  };

    setLoading(true);

   const newSale = {
  id: editingId || Date.now().toString(),
  crop,
  quantity: Number(quantity),
  rate: Number(rate),
  total,
  date: saleDate.toISOString(),   // ✅ change here
};


    const updated = editingId
      ? sales.map(s => (s.id === editingId ? newSale : s))
      : [newSale, ...sales];

    await AsyncStorage.setItem(
      `FARMER_SALES_${userId}`,
      JSON.stringify(updated)
    );

    setSales(updated);
    setShowAdd(false);
    setEditingId(null);
    setCrop('');
    setQuantity('');
    setRate('');
    setLoading(false);
  };

 const editSale = (s: any) => {
  setIsEdit(true);   // 🔥 important
  setEditingId(s.id);
  setCrop(s.crop);
  setQuantity(String(s.quantity));
  setRate(String(s.rate));
  setShowAdd(true);
};


const confirmDelete = (id: string) => {
  Alert.alert(
    language === 'te' ? 'తొలగించాలా?' : 'Confirm Delete',
    language === 'te'
      ? 'ఈ ఎంట్రీని తొలగిస్తే తిరిగి రాదు'
      : 'This entry will be permanently deleted',
    [
      { text: language === 'te' ? 'రద్దు' : 'Cancel', style: 'cancel' },
      {
        text: language === 'te' ? 'తొలగించు' : 'Delete',
        style: 'destructive',
        onPress: () => deleteEntry(id),
      },
    ]
  );
};
const deleteEntry = async (id: string) => {
  if (!userId) return;

  setLoading(true);

  const updated = sales.filter(item => item.id !== id);

  setSales(updated); // 🔥 UI update

  await AsyncStorage.setItem(
    `FARMER_SALES_${userId}`,
    JSON.stringify(updated)
  );

  setLoading(false);
};
const confirmClearAll = () => {
  Alert.alert(
    language === 'te' ? 'నిర్ధారణ 1' : 'Confirmation 1',
    language === 'te'
      ? 'మీరు అన్ని అమ్మకాలను తొలగించాలనుకుంటున్నారా?'
      : 'Do you want to delete all sales?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
       text: language === 'te' ? 'తర్వాత' : 'Next',
        onPress: confirmClearAll2,
      },
    ]
  );
};

const confirmClearAll2 = () => {
  Alert.alert(
    language === 'te' ? 'నిర్ధారణ 2' : 'Confirmation 2',
    language === 'te'
      ? 'ఈ డేటా తిరిగి రావు. ఖచ్చితమా?'
      : 'This data cannot be recovered. Sure?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: language === 'te' ? 'తర్వాత' : 'Next',
        onPress: confirmClearAll3,
      },
    ]
  );
};

const confirmClearAll3 = async () => {
  Alert.alert(
    language === 'te' ? 'చివరి నిర్ధారణ' : 'Final Confirmation',
    language === 'te'
      ? 'సంవత్సరం పూర్తయింది అని నిర్ధారించుకుంటున్నారా?'
      : 'Are you sure this year is completed?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: language === 'te' ? 'తొలగించు' : 'Delete',
        style: 'destructive',
        onPress: clearAllSales,
      },
    ]
  );
};
const clearAllSales = async () => {
  setLoading(true);

  await AsyncStorage.setItem(
    `FARMER_SALES_${userId}`,
    JSON.stringify([])
  );

  setSales([]);
  setLoading(false);
};
const canClearAll = sales.length >= 10;

const filteredSales = sales.filter(s =>
  s.crop.toLowerCase().includes(search.toLowerCase())
);


  return (
    <View style={{ flex: 1, backgroundColor: '#f4f6f5' }}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1b5e20" />
        </Pressable>
        <Text style={styles.headerTitle}>{T.title}</Text>
      </View>
     

       <View style={{ padding: 16 }}>
        <TextInput
  placeholder={language === 'te' ? '🔍 పంట వెతకండి' : '🔍 Search crop'}
  value={search}
  onChangeText={setSearch}
  style={styles.searchInput}
  placeholderTextColor="#666"
/>
</View>
<ScrollView
  style={{ flex: 1 }}
  contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
>
        {sales.length === 0 && (
          <Text style={styles.empty}>{T.noData}</Text>
        )}
         {filteredSales.map(s => (
          <View key={s.id} style={styles.card}>
            <Text style={styles.meta}>
  📅 {new Date(s.date).toLocaleDateString(language === 'te' ? 'te-IN' : 'en-IN')}
</Text>

            <Text style={styles.label}>

            <Text>🌾 {T.crop}: </Text>{' '}{s.crop}</Text>
             <Text style={styles.label}>
            <Text>📦 {T.qty}:</Text>{' '} {s.quantity}</Text>
            <Text style={styles.label}>
            <Text>💸 {T.rate}:</Text>{' '} ₹{formatAmount(s.rate)}</Text>
            <Text style={styles.totalText}>
              💰 {T.total}:  ₹{formatAmount(s.total)}
            </Text>

            <View style={styles.actions}>
              <Pressable onPress={() => editSale(s)}>
                <Ionicons name="create" size={20} color="#1b5e20" />
              </Pressable>
             <Pressable onPress={() => confirmDelete(s.id)}>
  <Ionicons name="trash" size={22} color="#d32f2f" />
</Pressable>

            </View>
          </View>
          
        ))}
        {canClearAll && (
  <View style={styles.clearBox}>
     <Pressable onPress={confirmClearAll}>
       <Text style={styles.clearText}>
         {language === 'te'
           ? 'ఈ సంవత్సరపు డేటా మొత్తం తొలగించండి'
           : 'Clear all data for this year'}
       </Text>
     </Pressable>
 
     <Text style={styles.clearHint}>
       {language === 'te'
         ? '⚠ సంవత్సరం పూర్తయిన తర్వాత మాత్రమే ఉపయోగించండి'
         : '⚠ Use only after year completion'}
     </Text>
   </View>
)}

      </ScrollView>

      {/* ADD BUTTON */}
     <Pressable
  style={styles.addBtn}
  onPress={() => {
    setIsEdit(false);
    setEditingId(null);

    setCrop('');
    setQuantity('');
    setRate('');
    setShowAdd(true);
  }}
>
        <Ionicons name="add" size={26} color="#fff" />
        <Text style={styles.addText}>{T.add}</Text>
      </Pressable>

      {/* MODAL */}
     <Modal visible={showAdd} transparent animationType="slide">
  <View style={styles.overlay}>
    <View style={styles.modal}>

      <ScrollView
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.modalTitle}>
          {isEdit
            ? (language === 'te' ? 'అమ్మకం మార్చండి' : 'Edit Sale')
            : (language === 'te' ? 'అమ్మకం జోడించండి' : 'Add Sale')}
        </Text>

        <Text style={{ fontSize: 12, color: '#000', marginBottom: 8 }}>
          {language === 'te'
            ? '*జాబితాలో లేకపోతే — మీరే నమోదు చేయండి'
            : '*Not in list? Type manually'}
        </Text>

        {/* CROP INPUT */}
        <View style={{ position: 'relative', marginBottom: 6 }}>
          <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', paddingVertical: 0 }]}>
            <TextInput
              style={{ flex: 1, color: '#000' }}
              placeholder={T.crop}
              placeholderTextColor="#333"
              value={crop}
              onChangeText={setCrop}
            />

            <Pressable onPress={() => setShowCropList(p => !p)}>
              <Ionicons name="chevron-down" size={18} />
            </Pressable>
          </View>

          {showCropList && (
            <View style={styles.dropdown}>
              <ScrollView
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator
              >
                {CROPS.map(c => (
                  <Pressable
                    key={c}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setCrop(c);
                      setShowCropList(false);
                    }}
                  >
                    <Ionicons name="leaf-outline" size={16} color="#1b5e20" />
                    <Text style={{ marginLeft: 8 }}>{c}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* QUANTITY */}
        <TextInput
          placeholder={T.qty}
          keyboardType="number-pad"
          value={quantity}
          onChangeText={setQuantity}
          placeholderTextColor="#333"
          style={styles.input}
        />

        {/* RATE */}
        <TextInput
          placeholder={T.rate}
          keyboardType="number-pad"
          value={rate}
          onChangeText={setRate}
          placeholderTextColor="#333"
          style={styles.input}
        />

        <Text style={styles.totalPreview}>
          {T.total}: ₹{total}
        </Text>

        <Pressable style={styles.saveBtn} onPress={saveSale}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>{T.save}</Text>
          )}
        </Pressable>

        <Pressable style={styles.cancelBtn} onPress={closeModal}>
          <Text style={styles.cancelText}>
            {language === 'te' ? 'రద్దు' : 'Cancel'}
          </Text>
        </Pressable>

      </ScrollView>

    </View>
  </View>
</Modal>

    </View>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelBtn: {
  marginTop: 12,
  paddingVertical: 12,
  alignItems: 'center',
},

cancelText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#777',
},
modalTitle: {
  fontSize: 18,
  fontWeight: '800',
  textAlign: 'center',
  color: '#1b5e20',
  marginBottom: 15,
},

 label: { fontWeight: '700' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#1b5e20',
  },
  meta: {
  color: '#000000',
  fontSize: 15,
  marginBottom: 6,
},

 clearText: {
  color: '#d32f2f',
  fontWeight: '700',
  fontSize: 14,
},
searchInput: {
  backgroundColor: '#fff',
  padding: 10,
  borderRadius: 10,
  marginBottom: 12,
},

clearBox: {
  marginTop: 10,
  padding: 16,
  marginBottom: 60,
  borderRadius: 14,
  backgroundColor: '#fff3f3',
  borderWidth: 1,
  borderColor: '#f5c6cb',
  alignItems: 'center',
},


clearHint: {
  marginTop: 6,
  fontSize: 12,
  color: '#777',
  textAlign: 'center',
},

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
  },
  dropdown: {
  position: 'absolute',
  top: 48,
  left: 0,
  right: 0,
  backgroundColor: '#fff',
  borderRadius: 12,
  elevation: 20,
  zIndex: 9999,
  maxHeight: 200,
  borderWidth: 1,
  borderColor: '#ddd',
},

 fullLoader: {
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(255,255,255,0.85)',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 16,
},


dropdownItem: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 12,
  borderBottomWidth: 1,
  borderColor: '#eee',
},

  totalText: {
    fontWeight: '800',
    color: '#1b5e20',
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
   position: 'absolute', top: 50, right: 20
  },
  addBtn: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#2e7d32',
    padding: 14,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addText: { color: '#fff', marginLeft: 6, fontWeight: '700' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
 input: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingVertical: 8,   // 🔥 smaller
  paddingHorizontal: 12,
  marginBottom: 10,
  fontSize: 14,
  height: 45,   
  justifyContent: 'center'        // 🔥 fixed height (important)
},


  saveBtn: {
    backgroundColor: '#2e7d32',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700' },
  totalPreview: {
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '700',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#777',
  },
});
