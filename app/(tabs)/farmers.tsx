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

const LOADER_DELAY = 3000;

export default function FarmersScreen() {
  const router = useRouter();

  /* ---------- STATES ---------- */
  const [language, setLanguage] = useState<'te' | 'en'>('en');
  const [farmers, setFarmers] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'fail' | null>(null);
const [isEdit, setIsEdit] = useState(false);
const [editingFarmerId, setEditingFarmerId] = useState<string | null>(null);

  /* ---------- INIT ---------- */
  useEffect(() => {
    loadLanguage();
    loadFarmers();
  }, []);

  const loadLanguage = async () => {
    const lang = await AsyncStorage.getItem('APP_LANG');
    if (lang === 'te' || lang === 'en') setLanguage(lang);
  };

  const loadFarmers = async () => {
    const userRaw = await AsyncStorage.getItem('CURRENT_USER');
    if (!userRaw) return;

    const user = JSON.parse(userRaw);
    setUserId(user.id);

    const raw = await AsyncStorage.getItem(`FARMERS_${user.id}`);
    setFarmers(raw ? JSON.parse(raw) : []);
  };

  const autoClearMsg = () => {
    setTimeout(() => {
      setMsg('');
      setMsgType(null);
    }, 4000);
  };

 const saveFarmer = async () => {
  if (!name || !village || !phone) {
    setMsgType('fail');
    setMsg(language === 'te'
      ? 'అన్ని వివరాలు నమోదు చేయండి'
      : 'Fill all details'
    );
    autoClearMsg();
    return;
  }

  if (!userId) return;
  setLoading(true);

  setTimeout(async () => {
    let updatedFarmers = [];

    if (isEdit && editingFarmerId) {
      // ✅ UPDATE EXISTING FARMER (SAME ID)
      updatedFarmers = farmers.map(f =>
        f.id === editingFarmerId
          ? { ...f, name, village, phone }
          : f
      );
    } else {
      // ➕ ADD NEW FARMER
      const newFarmer = {
        id: Date.now().toString(),
        name,
        village,
        phone,
      };
      updatedFarmers = [...farmers, newFarmer];
    }

    await AsyncStorage.setItem(
      `FARMERS_${userId}`,
      JSON.stringify(updatedFarmers)
    );

    setFarmers(updatedFarmers);

    // RESET
    setName('');
    setVillage('');
    setPhone('');
    setIsEdit(false);
    setEditingFarmerId(null);

    setLoading(false);
    setMsgType('success');
    setMsg(
      language === 'te'
        ? isEdit
          ? 'రైతు వివరాలు అప్‌డేట్ అయ్యాయి'
          : 'రైతు విజయవంతంగా జోడించబడింది'
        : isEdit
          ? 'Farmer updated successfully'
          : 'Farmer added successfully'
    );

    autoClearMsg();
    setTimeout(() => setShowAdd(false), 1500);
  }, LOADER_DELAY);
};


  /* ---------- DELETE FARMER ---------- */
  const confirmDelete = (id: string) => {
    Alert.alert(
      language === 'te' ? 'నిర్ధారణ' : 'Confirm',
      language === 'te'
        ? 'ఈ రైతును తొలగించాలా?'
        : 'Do you want to delete this farmer?',
      [
        { text: language === 'te' ? 'రద్దు' : 'Cancel', style: 'cancel' },
        {
          text: language === 'te' ? 'తొలగించు' : 'Delete',
          style: 'destructive',
          onPress: () => deleteFarmer(id),
        },
      ]
    );
  };
const startEdit = (farmer: any) => {
  setIsEdit(true);
  setEditingFarmerId(farmer.id);

  setName(farmer.name);
  setVillage(farmer.village);
  setPhone(farmer.phone);

  setShowAdd(true);
};

  const deleteFarmer = async (id: string) => {
    if (!userId) return;

    setLoading(true);

    setTimeout(async () => {
      const updated = farmers.filter(f => f.id !== id);
      setFarmers(updated);

      await AsyncStorage.setItem(`FARMERS_${userId}`, JSON.stringify(updated));
      setLoading(false);
    }, LOADER_DELAY);
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

        <Text style={styles.headerTitle}>
          {language === 'te' ? 'రైతులు' : 'Farmers'}
        </Text>

        <View style={{ width: 22 }} />
      </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={styles.content}>

        <Pressable style={styles.addButton} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addText}>
            {language === 'te' ? 'రైతు జోడించండి' : 'Add Farmer'}
          </Text>
        </Pressable>

        {farmers.length === 0 && (
          <Text style={styles.empty}>
            {language === 'te' ? 'ఇంకా రైతులు లేరు' : 'No farmers added yet'}
          </Text>
        )}

        {farmers.map(f => (
          <View key={f.id} style={styles.card}>

            <View style={{ flex: 1 }}>
              <View style={styles.detailRow}>
                <Ionicons name="person" size={16} color="#1b5e20" />
                <Text style={styles.label}>{language === 'te' ? 'పేరు' : 'Name'} :</Text>
                <Text style={styles.value}>{f.name}</Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="location" size={16} color="#1b5e20" />
                <Text style={styles.label}>{language === 'te' ? 'గ్రామం' : 'Village'} :</Text>
                <Text style={styles.value}>{f.village}</Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="call" size={16} color="#1b5e20" />
                <Text style={styles.label}>{language === 'te' ? 'ఫోన్' : 'Phone'} :</Text>
                <Text style={styles.value}>{f.phone}</Text>
              </View>
            </View>
<View style={{ flexDirection: 'row' }}>
  <Pressable
    onPress={() => startEdit(f)}
    style={{ paddingRight: 10 }}
  >
    <Ionicons name="create" size={22} color="#1976d2" />
  </Pressable>

  <Pressable onPress={() => confirmDelete(f.id)}>
    <Ionicons name="trash" size={22} color="#d32f2f" />
  </Pressable>
</View>

           
          </View>
        ))}

      </ScrollView>

      {/* ADD FARMER MODAL */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>

          <Text style={styles.modalTitle}>
  {isEdit
    ? language === 'te' ? 'రైతు వివరాలు మార్చండి' : 'Edit Farmer'
    : language === 'te' ? 'రైతు జోడించండి' : 'Add Farmer'}
</Text>

            <TextInput
              placeholder={language === 'te' ? 'రైతు పేరు' : 'Farmer Name'}
               placeholderTextColor="#333"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              placeholder={language === 'te' ? 'గ్రామం' : 'Village'}
               placeholderTextColor="#333"
              style={styles.input}
              value={village}
              onChangeText={setVillage}
            />

            <TextInput
              placeholder={language === 'te' ? 'ఫోన్ నెంబర్' : 'Phone Number'}
               placeholderTextColor="#333"
              style={styles.input}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <Pressable style={styles.saveBtn} onPress={saveFarmer}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveText}>
  {isEdit
    ? language === 'te' ? 'అప్‌డేట్ చేయండి' : 'Update'
    : language === 'te' ? 'సేవ్ చేయండి' : 'Save'}
</Text>
}
            </Pressable>

            {msgType && (
              <View style={[styles.inlineMsg, msgType === 'success' ? styles.success : styles.fail]}>
                <Ionicons
                  name={msgType === 'success' ? 'checkmark-circle' : 'close-circle'}
                  size={18}
                  color="#fff"
                />
                <Text style={styles.msgText}>{msg}</Text>
              </View>
            )}

            <Pressable onPress={() => setShowAdd(false)}>
              <Text style={styles.cancel}>
                {language === 'te' ? 'రద్దు' : 'Cancel'}
              </Text>
            </Pressable>

          </View>
        </View>
      </Modal>

      {loading && (
        <View style={styles.fullLoader}>
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

  content: { padding: 20 },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
  },

  addText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 6 },

  empty: { textAlign: 'center', color: '#777', marginTop: 40 },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
    alignItems: 'center',
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  label: { marginLeft: 8, fontSize: 15, color: '#1b5e20', fontWeight: '600' },
  value: { marginLeft: 5, fontSize: 15, color: '#555', fontWeight: '500' },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },

  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b5e20',
    textAlign: 'center',
    marginBottom: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
  },

  saveBtn: {
    backgroundColor: '#2e7d32',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  inlineMsg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },

  success: { backgroundColor: '#2e7d32' },
  fail: { backgroundColor: '#d32f2f' },

  msgText: { color: '#fff', marginLeft: 8, fontSize: 14 },

  cancel: { textAlign: 'center', marginTop: 12, color: '#777' },

  fullLoader: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
