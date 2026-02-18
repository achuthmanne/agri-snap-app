// kulis.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const LOADER_DELAY = 1200;

/* ---------- TYPE ---------- */
type Kuli = {
  id: string;
  name: string;
  phone: string;
  photo: string;
  role: 'Worker' | 'Mestri';
};

export default function KulisScreen() {
  const router = useRouter();

  /* ---------- STATES ---------- */
  const [language, setLanguage] = useState<'te' | 'en'>('en');
  const [kulis, setKulis] = useState<Kuli[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [role, setRole] = useState<'worker' | 'mestri'>('worker');

  const [editingKuliId, setEditingKuliId] = useState<string | null>(null);
const [isEdit, setIsEdit] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'fail' | null>(null);

  const sortedKulis = [
    ...kulis.filter(k => k.role === 'Mestri'),
    ...kulis.filter(k => k.role !== 'Mestri'),
  ];

  /* ---------- INIT ---------- */
  useEffect(() => {
    loadLanguage();
    loadKulis();
  }, []);

  const loadLanguage = async () => {
    const lang = await AsyncStorage.getItem('APP_LANG');
    if (lang === 'te' || lang === 'en') setLanguage(lang);
  };

  const loadKulis = async () => {
    const userRaw = await AsyncStorage.getItem('CURRENT_USER');
    if (!userRaw) return;

    const user = JSON.parse(userRaw);
    setUserId(user.id);

    const raw = await AsyncStorage.getItem(`KULIS_${user.id}`);
    setKulis(raw ? JSON.parse(raw) : []);
  };

  const autoClearMsg = () => {
    setTimeout(() => {
      setMsg('');
      setMsgType(null);
    }, 4000);
  };

  /* ---------- CAMERA ---------- */
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert('Camera permission required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  /* ---------- SAVE (ADD / EDIT) ---------- */
  const saveKuli = async () => {
    if (!name || !photo) {
      setMsgType('fail');
      setMsg(
        language === 'te'
          ? 'ఫోటో మరియు పేరు నమోదు చేయండి'
          : 'Please add photo and name'
      );
      autoClearMsg();
      return;
    }

    if (!userId) return;
    setLoading(true);

    setTimeout(async () => {
      const kuliId = editingKuliId ?? Date.now().toString();

      const newKuli: Kuli = {
        id: kuliId,
        name,
        phone,
        photo,
        role: role === 'mestri' ? 'Mestri' : 'Worker',
      };

      let updated: Kuli[];

      if (editingKuliId) {
        // ✏️ EDIT
        updated = kulis.map(k =>
          k.id === editingKuliId ? newKuli : k
        );
      } else {
        // ➕ ADD
        updated = [...kulis, newKuli];
      }

      setKulis(updated);
      await AsyncStorage.setItem(`KULIS_${userId}`, JSON.stringify(updated));

      // RESET
      setEditingKuliId(null);
      setName('');
      setPhone('');
      setPhoto(null);
      setRole('worker');

      setLoading(false);
      setMsgType('success');
      setMsg(
        language === 'te'
          ? editingKuliId
            ? 'కూలీ వివరాలు మార్చబడ్డాయి'
            : 'కూలీ జోడించబడింది'
          : editingKuliId
            ? 'Worker updated'
            : 'Worker added'
      );
      autoClearMsg();

      setTimeout(() => setShowAdd(false), 800);
    }, LOADER_DELAY);
  };

  /* ---------- DELETE ---------- */
  const confirmDelete = (id: string) => {
    Alert.alert(
      language === 'te' ? 'నిర్ధారణ' : 'Confirm',
      language === 'te'
        ? 'ఈ కూలీని తొలగించాలా?'
        : 'Do you want to delete this worker?',
      [
        { text: language === 'te' ? 'రద్దు' : 'Cancel', style: 'cancel' },
        {
          text: language === 'te' ? 'తొలగించు' : 'Delete',
          style: 'destructive',
          onPress: () => deleteKuli(id),
        },
      ]
    );
  };

  const deleteKuli = async (id: string) => {
    if (!userId) return;

    setLoading(true);

    setTimeout(async () => {
      const updated = kulis.filter(k => k.id !== id);
      setKulis(updated);
      await AsyncStorage.setItem(`KULIS_${userId}`, JSON.stringify(updated));
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
            setTimeout(() => router.back(), 300);
          }}
        >
          <Ionicons name="arrow-back" size={22} color="#1b5e20" />
        </Pressable>

        <Text style={styles.headerTitle}>
          {language === 'te' ? 'కూలీలు' : 'Workers'}
        </Text>

        <View style={{ width: 22 }} />
      </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          style={styles.addButton}
          onPress={() => {
            setEditingKuliId(null);
            setName('');
            setPhone('');
            setPhoto(null);
            setRole('worker');
            setShowAdd(true);
          }}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addText}>
            {language === 'te' ? 'కూలీ జోడించండి' : 'Add Worker'}
          </Text>
        </Pressable>

        {sortedKulis.map(k => (
          <View key={k.id} style={styles.card}>
            <Pressable
              style={{ position: 'absolute', top: 10, right: 10 }}
             onPress={() => {
  setIsEdit(true);                 // ⭐ EDIT MODE ON
  setEditingKuliId(k.id);          // ⭐ STORE SAME ID

  setName(k.name);
  setPhone(k.phone);
  setPhoto(k.photo);
  setRole(k.role === 'Mestri' ? 'mestri' : 'worker');

  setShowAdd(true);
}}

            >
              <Ionicons name="create" size={22} color="#3b5cd4" />
            </Pressable>

            <Image source={{ uri: k.photo }} style={styles.avatar} />

            <View style={{ flex: 1, marginLeft: 12 }}>
             <View style={styles.row}>
  <Ionicons name="person" size={16} color="#1b5e20" />
  <Text style={styles.label}>
    {language === 'te' ? 'పేరు' : 'Name'} :
  </Text>
  <Text style={styles.value}>{k.name}</Text>
</View>
             <View style={styles.row}>
  <Ionicons name="call" size={16} color="#1b5e20" />
  <Text style={styles.label}>
    {language === 'te' ? 'ఫోన్' : 'Phone'} :
  </Text>
  <Text style={styles.value}>{k.phone}</Text>
</View>
              {k.role === 'Mestri' && (
                <Text style={{ fontWeight: '700', color: '#1b5e20' }}>
                  👑 {language === 'te' ? 'మెస్త్రీ' : 'Mestri'}
                </Text>
              )}
            </View>

            <Pressable onPress={() => confirmDelete(k.id)}>
              <Ionicons name="trash" size={22} color="#d32f2f" />
            </Pressable>
          </View>
        ))}
      </ScrollView>

      {/* MODAL */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
  {isEdit
    ? language === 'te'
      ? 'కూలీ మార్చండి'
      : 'Edit Worker'
    : language === 'te'
      ? 'కూలీ జోడించండి'
      : 'Add Worker'}
</Text>

            <Pressable style={styles.photoBox} onPress={takePhoto}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photoPreview} />
              ) : (
                <Ionicons name="camera-outline" size={30} color="#1b5e20" />
              )}
            </Pressable>

            <TextInput
              placeholder={language === 'te' ? 'కూలీ పేరు' : 'Worker Name'}
               placeholderTextColor="#333"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              placeholder={language === 'te' ? 'ఫోన్ నెంబర్' : 'Phone Number'}
               placeholderTextColor="#333"
              style={styles.input}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
{/* ROLE SELECTION */}
<View style={{ marginBottom: 14 }}>
  <Text style={{ fontWeight: '700', color: '#1b5e20', marginBottom: 6 }}>
    {language === 'te' ? 'పాత్ర' : 'Role'}
  </Text>

  <View style={{ flexDirection: 'row' }}>
    {/* WORKER */}
    <Pressable
      style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
      onPress={() => setRole('worker')}
    >
      <Ionicons
        name={role === 'worker' ? 'radio-button-on' : 'radio-button-off'}
        size={20}
        color="#1b5e20"
      />
      <Text style={{ marginLeft: 6 }}>
        {language === 'te' ? 'కూలీ' : 'Worker'}
      </Text>
    </Pressable>

    {/* MESTRI */}
    <Pressable
      style={{ flexDirection: 'row', alignItems: 'center' }}
      onPress={() => setRole('mestri')}
    >
      <Ionicons
        name={role === 'mestri' ? 'radio-button-on' : 'radio-button-off'}
        size={20}
        color="#1b5e20"
      />
      <Text style={{ marginLeft: 6 }}>
        {language === 'te' ? 'మెస్త్రీ' : 'Mestri'}
      </Text>
    </Pressable>
  </View>
</View>

            <Pressable style={styles.saveBtn} onPress={saveKuli}>
              {loading
                ? <ActivityIndicator color="#fff" />
                :<Text style={styles.saveText}>
                  {isEdit
                    ? language === 'te' ? 'అప్‌డేట్ చేయండి' : 'Update'
                    : language === 'te' ? 'సేవ్ చేయండి' : 'Save'}
                </Text>}
            </Pressable>
            {/* CANCEL BUTTON */}
<Pressable
  style={{ marginTop: 14 }}
  onPress={() => {
    setShowAdd(false);

    // ❌ cancel edit mode
    setIsEdit(false);
    setEditingKuliId(null);

    // 🧹 clear form
    setName('');
    setPhone('');
    setPhoto(null);
    setRole('worker');
  }}
>
  <Text
    style={{
      textAlign: 'center',
      color: '#777',
      fontSize: 15,
      fontWeight: '600',
    }}
  >
    {language === 'te' ? 'రద్దు చేయి' : 'Cancel'}
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

/* ---------- STYLES (UNCHANGED) ---------- */
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
   label: { marginLeft: 8, fontSize: 15, color: '#1b5e20', fontWeight: '600' },
  value: { marginLeft: 5, fontSize: 15, color: '#555', fontWeight: '500' },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b5e20',
    textAlign: 'center',
    marginBottom: 16,
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 15,
    marginBottom: 14,
    elevation: 3,
  },
  avatar: { width: 80, height: 80, borderRadius: 15 },
  
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  photoBox: {
    height: 160,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#1b5e20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#f9fbe7',
  },
  photoPreview: { width: 120, height: 120, borderRadius: 12 },
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
  fullLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
