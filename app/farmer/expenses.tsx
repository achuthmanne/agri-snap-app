import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
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

/* ---------- TYPES ---------- */
type Expense = {
  id: string;
  category: string;
  crop: string;
  amount: number;
  createdAt: number;
};

export default function FarmerExpenses() {
  const [language, setLanguage] = useState<'te' | 'en'>('te');
  const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [search, setSearch] = useState('');

  const [userId, setUserId] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);

  /* MODAL STATES */
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [category, setCategory] = useState('');
  const [crop, setCrop] = useState('');
  const [amount, setAmount] = useState('');

  const [showCatList, setShowCatList] = useState(false);
  const [showCropList, setShowCropList] = useState(false);

  /* ---------- TEXT ---------- */
  const T = {
    title: language === 'te' ? 'ఖర్చుల పుస్తకం' : 'Expense Book',
    add: language === 'te' ? 'ఖర్చు జోడించండి' : 'Add Expense',
    noData:
      language === 'te'
        ? 'ఇంకా ఖర్చులు నమోదు కాలేదు'
        : 'No expenses added yet',
         clearAll: language === 'te' ? 'అన్నీ తొలగించు' : 'Clear All',

  c1Title: language === 'te' ? 'హెచ్చరిక' : 'Warning',
  c1Msg:
    language === 'te'
      ? 'ఈ సంవత్సరం ఖర్చులన్నీ తొలగించాలా?'
      : 'Do you want to clear all expenses of this year?',

  c2Msg:
    language === 'te'
      ? 'ఇది చేసిన తర్వాత డేటా తిరిగి రాదు.'
      : 'This action cannot be undone.',

  c3Msg:
    language === 'te'
      ? 'ఖచ్చితంగా కొనసాగాలా?'
      : 'Are you absolutely sure?',

  yes: language === 'te' ? 'అవును' : 'Yes',
  cancel: language === 'te' ? 'రద్దు' : 'Cancel',
  };

  const CATEGORIES =
    language === 'te'
      ? ['విత్తనాలు', 'ఎరువులు', 'మందులు', 'కూలీలు', 'ట్రాక్టర్','ఎద్దులతో అరక', 'రవాణా ఖర్చులు', 'ఇతరాలు']
      : ['Seeds', 'Fertilizers', 'Pesticides', 'Labour','Tractor','plough with bullocks', 'travel expenses','Others'];

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

  /* ---------- LOAD ---------- */
  useEffect(() => {
    load();
  }, []);
const formatAmount = (num: number | string) => {
  const n = Number(num || 0);
  return n.toLocaleString('en-IN');
};

  const load = async () => {
    const lang = await AsyncStorage.getItem('APP_LANG');
    if (lang === 'te' || lang === 'en') setLanguage(lang);

    const userRaw = await AsyncStorage.getItem('CURRENT_USER');
    if (!userRaw) return;

    const user = JSON.parse(userRaw);
    setUserId(user.id);

    const raw = await AsyncStorage.getItem(`FARMER_EXPENSES_${user.id}`);
    setExpenses(raw ? JSON.parse(raw) : []);

    setLoading(false);
  };

  /* ---------- SAVE ---------- */
  const saveExpense = async () => {
  if (!category || !crop || !amount) {
    Alert.alert(
      language === 'te'
        ? 'అన్ని వివరాలు ఇవ్వండి'
        : 'Please fill all fields'
    );
    return;
  }

  setSaving(true); // 🔥 START LOADER

  setTimeout(async () => {
    const newItem: Expense = {
      id: editId ?? Date.now().toString(),
      category,
      crop,
      amount: Number(amount),
      createdAt: Date.now(),
    };

    const updated = editId
      ? expenses.map(e => (e.id === editId ? newItem : e))
      : [newItem, ...expenses];

    await AsyncStorage.setItem(
      `FARMER_EXPENSES_${userId}`,
      JSON.stringify(updated)
    );

    setExpenses(updated);
    setSaving(false); // 🔥 STOP LOADER
    closeModal();
  }, 1200); // smooth UX
};


  /* ---------- DELETE ---------- */
  const deleteExpense = (id: string) => {
    Alert.alert(
      language === 'te' ? 'తొలగించాలా?' : 'Delete?',
      language === 'te'
        ? 'ఈ ఖర్చును తొలగించాలా?'
        : 'Do you want to delete this expense?',
      [
        { text: language === 'te' ? 'రద్దు' : 'Cancel', style: 'cancel' },
        {
          text: language === 'te' ? 'తొలగించు' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = expenses.filter(e => e.id !== id);
            setExpenses(updated);
            await AsyncStorage.setItem(
              `FARMER_EXPENSES_${userId}`,
              JSON.stringify(updated)
            );
          },
        },
      ]
    );
  };
const confirmClearAll = () => {
  Alert.alert(T.c1Title, T.c1Msg, [
    { text: T.cancel, style: 'cancel' },
    {
      text: T.yes,
      onPress: () => {
        Alert.alert(T.c1Title, T.c2Msg, [
          { text: T.cancel, style: 'cancel' },
          {
            text: T.yes,
            onPress: () => {
              Alert.alert(T.c1Title, T.c3Msg, [
                { text: T.cancel, style: 'cancel' },
                {
                  text: T.yes,
                  style: 'destructive',
                  onPress: clearAllExpenses,
                },
              ]);
            },
          },
        ]);
      },
    },
  ]);
};
const clearAllExpenses = async () => {
  if (!userId) return;

  setLoading(true);

  await AsyncStorage.removeItem(`FARMER_EXPENSES_${userId}`);

  setExpenses([]); // UI clear
  setLoading(false);
};
const showClearAll = expenses.length > 10;

  const openEdit = (e: Expense) => {
    setEditId(e.id);
    setCategory(e.category);
    setCrop(e.crop);
    setAmount(String(e.amount));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setCategory('');
    setCrop('');
    setAmount('');
  };
const filteredExpenses = expenses.filter(e =>
  e.crop.toLowerCase().includes(search.toLowerCase()) ||
  e.category.toLowerCase().includes(search.toLowerCase())
);
const cropCategorySummary = filteredExpenses.reduce((acc: any, item) => {
  if (!acc[item.crop]) {
    acc[item.crop] = {};
  }

  if (!acc[item.crop][item.category]) {
    acc[item.crop][item.category] = 0;
  }

  acc[item.crop][item.category] += item.amount;

  return acc;
}, {});


  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1b5e20" />
      </View>
    );
  }

  /* ---------- UI ---------- */
  return (
    <View style={{ flex: 1, backgroundColor: '#f4f6f5' }}>
      {/* HEADER */}
    <View style={styles.header}>
  <Pressable onPress={() => router.back()}>
    <Ionicons name="arrow-back" size={22} color="#1b5e20" />
  </Pressable>

  <Text style={styles.headerTitle}>{T.title}</Text>

  
</View>


     <View style={{ padding: 5 }}>

        <View style={styles.infoBox}>
  <Ionicons name="information-circle" size={16} color="#1565c0" />
  <Text style={styles.infoText}>
    {language === 'te'
      ? 'గమనిక: చెల్లింపు చరిత్ర లో ఇప్పటికే నమోదు చేసిన కూలీల చెల్లింపులను ఇక్కడ మళ్లీ నమోదు చేయాల్సిన అవసరం లేదు.'
      : 'Note: Labour payments already recorded in Payment History do not need to be added again here.'}
  </Text>
</View>

        <TextInput
  placeholder={
    language === 'te'
      ? '🔍 పంట / వర్గం వెతకండి'
      : '🔍 Search crop / category'
  }
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
        {expenses.length === 0 && (
          <Text style={styles.empty}>{T.noData}</Text>
        )}

       {filteredExpenses.map(e => (

  <View key={e.id} style={styles.card}>
  <View style={styles.actions}>
              <Pressable
  onPress={() => openEdit(e)}
  hitSlop={10}
  android_ripple={{ color: '#ddd', borderless: true }}
  style={styles.iconBtn}
>
  <Ionicons name="create-outline" size={22} color="#1b5e20" />
</Pressable>

          <Pressable
  onPress={() => deleteExpense(e.id)}
  hitSlop={10}
  android_ripple={{ color: '#ddd', borderless: true }}
  style={styles.iconBtn}
>
  <Ionicons name="trash-outline" size={22} color="#d32f2f" />
</Pressable>


            </View>
<Text style={styles.meta}>
  📅 {new Date(e.createdAt).toLocaleDateString(
    language === 'te' ? 'te-IN' : 'en-IN'
  )}
</Text>

    <Text style={styles.row}>
      🌾 <Text style={styles.label}>
        {language === 'te' ? 'పంట:' : 'Crop:'}
      </Text>{' '}
      {e.crop}
    </Text>

    <Text style={styles.row}>
      📦 <Text style={styles.label}>
        {language === 'te' ? 'వర్గం:' : 'Category:'}
      </Text>{' '}
      {e.category}
    </Text>

    <Text style={styles.row}>
  💰 <Text style={styles.label}>
    {language === 'te' ? 'మొత్తం:' : 'Total:'}
  </Text>{' '}
  ₹{formatAmount(e.amount)}
</Text>

  </View>
))}
{/* TOTAL EXPENSE CARD */}
<View style={styles.totalCard}>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Ionicons name="wallet" size={22} color="#1b5e20" />
    <Text style={styles.totalTitle}>
      {language === 'te' ? 'మొత్తం ఖర్చులు' : 'Total Expenses'}
    </Text>
  </View>

  <Text style={styles.totalAmount}>
    ₹{formatAmount(
      expenses.reduce((sum, e) => sum + e.amount, 0)
    )}
  </Text>
</View>


{Object.keys(cropCategorySummary).length > 0 && (
  <View style={styles.summaryCard}>
    <Text style={styles.summaryTitle}>
      {language === 'te' ? 'పంట + వర్గం వారీ సారాంశం' : 'Crop + Category Summary'}
    </Text>

    {Object.entries(cropCategorySummary).map(([cropName, categories]: any) => (
      <View key={cropName} style={{ marginTop: 10 }}>
        <Text style={styles.cropTitle}>🌾 {cropName}</Text>

        {Object.entries(categories).map(([catName, total]: any) => (
          <Text key={catName} style={styles.catRow}>
            📦 {catName} – ₹{formatAmount(total)}
          </Text>
        ))}
      </View>
    ))}
  </View>
)}

{showClearAll && (
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

{/* FLOATING ADD BUTTON */}
<Pressable style={styles.fab} onPress={() => setShowModal(true)}>
  <Ionicons name="add" size={26} color="#fff" />
  <Text style={styles.fabText}>{T.add}</Text>
</Pressable>

      {/* MODAL */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editId
                ? language === 'te'
                  ? 'ఖర్చు మార్చండి'
                  : 'Edit Expense'
                : T.add}
            </Text>

            {/* CATEGORY */}
           
              <View style={{ marginBottom: 12 }}>
  <View style={styles.dropdownInput}>
    <TextInput
      placeholder={language === 'te' ? 'వర్గం ఎంచుకోండి / నమోదు చేయండి' : 'Select or Enter Category'}
      value={category}
      onChangeText={setCategory}
      style={{ flex: 1 }}
      placeholderTextColor="#666"
    />
    <Pressable onPress={() => setShowCatList(p => !p)}>
      <Ionicons name="chevron-down" size={18} />
    </Pressable>
  </View>

 {showCatList && (
  <View style={styles.dropdownList}>
    <ScrollView nestedScrollEnabled style={{ maxHeight: 140 }}>
      {CATEGORIES.map(c => (
        <Pressable
          key={c}
          style={styles.dropItem}
          onPress={() => {
            setCategory(c);
            setShowCatList(false);
          }}
        >
          <Text>{c}</Text>
        </Pressable>
      ))}
    </ScrollView>
  </View>
)}

</View>

            {/* CROP */}
           <View style={{ marginBottom: 12 }}>
  <View style={styles.dropdownInput}>
    <TextInput
      placeholder={
        language === 'te'
          ? 'పంట ఎంచుకోండి / నమోదు చేయండి'
          : 'Select or Enter Crop'
      }
      value={crop}
      onChangeText={setCrop}
      style={{ flex: 1 }}
      placeholderTextColor="#666"
    />

    <Pressable onPress={() => setShowCropList(p => !p)}>
      <Ionicons name="chevron-down" size={18} />
    </Pressable>
  </View>

  {showCropList && (
    <View style={styles.dropdownList}>
       <ScrollView nestedScrollEnabled style={{ maxHeight: 140 }}>
      {CROPS.map(c => (
        <Pressable
          key={c}
          style={styles.dropItem}
          onPress={() => {
            setCrop(c);
            setShowCropList(false);
          }}
        >
         
          <Text style={{ marginLeft: 8 }}>{c}</Text>
        </Pressable>
      ))}
      </ScrollView>
    </View>
  )}
</View>


            {/* AMOUNT */}
            <TextInput
              placeholder={language === 'te' ? 'మొత్తం ₹' : 'Total ₹'}
              placeholderTextColor="#333"
              keyboardType="number-pad"
              value={amount}
              onChangeText={setAmount}
              style={styles.input}
            />

            <Pressable style={styles.saveBtn} onPress={saveExpense}>
              <Text style={styles.saveText}>
                {language === 'te' ? 'సేవ్' : 'Save'}
              </Text>
            </Pressable>

            <Pressable onPress={closeModal}>
              <Text style={styles.cancel}>
                {language === 'te' ? 'రద్దు' : 'Cancel'}
              </Text>
            </Pressable>
          </View>
        </View>
        {saving && (
  <View style={styles.fullLoader}>
    <ActivityIndicator size="large" color="#1b5e20" />
    <Text style={{ marginTop: 10, color: '#1b5e20', fontWeight: '600' }}>
      {language === 'te' ? 'సేవ్ అవుతోంది...' : 'Saving...'}
    </Text>
  </View>
)}

      </Modal>
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
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
clearText: {
  color: '#d32f2f',
  fontWeight: '700',
  fontSize: 14,
},
totalCard: {
  backgroundColor: '#ffffff',
  padding: 18,
  borderRadius: 18,
  elevation: 6,
  marginBottom: 16,
  borderLeftWidth: 5,
  borderLeftColor: '#2e7d32',
},

totalTitle: {
  fontSize: 15,
  fontWeight: '700',
  color: '#1b5e20',
  marginLeft: 8,
},

totalAmount: {
  marginTop: 10,
  fontSize: 22,
  fontWeight: '800',
  color: '#2e7d32',
},

dropdownInput: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: 5,
},

 dropdownList: {
  position: 'absolute',
  top: 60,
  left: 0,
  right: 0,
  backgroundColor: '#fff',
  borderRadius: 12,
  elevation: 8,
  zIndex: 999,
  maxHeight: 290,
},
summaryCard: {
  backgroundColor: '#e0ffec',
  padding: 16,
  borderRadius: 16,
  marginTop: 20,
  elevation: 5,
},

summaryTitle: {
  fontSize: 16,
  fontWeight: '800',
  color: '#1b5e20',
  marginBottom: 8,
},

cropTitle: {
  fontWeight: '700',
  fontSize: 14,
  marginTop: 6,
},

catRow: {
  marginLeft: 12,
  marginTop: 4,
  color: '#444',
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
meta: {
  color: '#000000',
  fontSize: 15,
  marginBottom: 6,
},

searchInput: {
  backgroundColor: '#fff',
  padding: 10,
  borderRadius: 10,
  marginBottom: 12,
},
infoBox: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  backgroundColor: '#e3f2fd',
  padding: 10,
  borderRadius: 10,
  marginTop: 10,
  marginBottom: 10,
},

infoText: {
  marginLeft: 6,
  fontSize: 12,
  color: '#1565c0',
  flex: 1,
},

clearHint: {
  marginTop: 6,
  fontSize: 12,
  color: '#777',
  textAlign: 'center',
},

fab: {
  position: 'absolute',
  right: 20,
  bottom: 30,
  backgroundColor: '#2e7d32',
  paddingVertical: 14,
  paddingHorizontal: 18,
  borderRadius: 30,
  flexDirection: 'row',
  alignItems: 'center',
  elevation: 6,
},

fabText: {
  color: '#fff',
  fontWeight: '700',
  marginLeft: 6,
},

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#1b5e20',
  },

  addBtn: {
    flexDirection: 'row',
    backgroundColor: '#2e7d32',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addText: { color: '#fff', fontWeight: '700', marginLeft: 6 },
iconBtn: {
  padding: 8,
  borderRadius: 20,
},

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 4,
  },
  row: { marginBottom: 6 },
  label: { fontWeight: '700' },
  amount: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '800',
    color: '#1b5e20',
  },

actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
   position: 'absolute', top: 50, right: 20
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#777',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#1b5e20',
    marginBottom: 12,
  },

  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    overflow: 'hidden'
  },
  dropItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },

  saveBtn: {
    backgroundColor: '#2e7d32',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700' },

  cancel: {
    textAlign: 'center',
    marginTop: 10,
    color: '#777',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
