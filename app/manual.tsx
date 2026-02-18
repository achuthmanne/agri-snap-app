import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function ManualScreen() {
  const scrollRef = useRef<ScrollView>(null);

  const [language, setLanguage] = useState<'te' | 'en'>('te');
  const [reachedEnd, setReachedEnd] = useState(false);
  const [accepted, setAccepted] = useState(false);

  /* ---------- TEXT ---------- */
  const T = {
    title: language === 'te' ? 'వినియోగ మార్గదర్శిని' : 'User Manual',
    subtitle:
      language === 'te'
        ? 'దయచేసి పూర్తిగా చదవండి'
        : 'Please read carefully',

    continue:
      language === 'te' ? 'కొనసాగించండి' : 'Continue',

    mustRead:
      language === 'te'
        ? 'ముందుగా పూర్తిగా చదవాలి'
        : 'Please read completely',

    agree:
      language === 'te'
        ? 'నేను అన్ని నియమాలు చదివాను'
        : 'I have read and understood',

    sections: [
      {
        icon: 'shield-checkmark',
        te: 'ఈ యాప్ పూర్తిగా ఆఫ్లైన్ లో పని చేస్తుంది. మీ డేటా ఫోన్ లోనే సురక్షితంగా ఉంటుంది.',
        en: 'This app works completely offline. Your data stays securely on your phone.',
      },
      {
        icon: 'person',
        te: 'మెస్త్రీ మరియు రైతు ఖాతాలు వేరువేరు. మీ పాత్రను సరిగ్గా ఎంచుకోండి.',
        en: 'Mestri and Farmer accounts are different. Please choose your role correctly.',
      },
      {
        icon: 'people',
        te: 'రైతులు, కూలీలు, హాజరు, చెల్లింపులు అన్నీ మీరు స్వయంగా నమోదు చేయాలి.',
        en: 'Farmers, workers, attendance, and payments must be entered by you.',
      },
      {
        icon: 'calendar',
        te: 'హాజరు రోజువారీగా నమోదు చేయాలి. తప్పు నమోదు చేస్తే ఎడిట్ చేయవచ్చు.',
        en: 'Attendance must be marked daily. You can edit if entered wrongly.',
      },
    {
  icon: 'keypad',
  te: 'ఇంగ్లీష్ అక్షరాలతో తెలుగు టైప్ చేయవచ్చు. Gboard లో Telugu (Transliteration) ఆన్ చేస్తే raamu అని టైప్ చేస్తే రాము అవుతుంది. స్పేస్ బార్ పై లాంగ్ ప్రెస్ చేసి తెలుగు కీబోర్డ్ కి మారవచ్చు.',
  en: 'You can type Telugu using English letters. Enable Telugu (Transliteration) in Gboard. Long press space bar to switch to Telugu keyboard.',
},
{
  icon: 'mic',
  te: 'మైక్ బటన్ ద్వారా మాట్లాడి తెలుగు లో టైప్ చేయవచ్చు. మైక్ నొక్కి మాట్లాడితే పదాలు ఆటోమేటిక్ గా వస్తాయి.',
  en: 'You can use voice typing by pressing the mic button. Speak and the text will appear automatically.',
},

{
  icon: 'keypad',
  te: 'తెలుగు కీబోర్డ్ రాకపోతే భయపడవద్దు. వాయిస్ ద్వారా పేరు, గ్రామం, పని వివరాలు సులభంగా నమోదు చేయవచ్చు.',
  en: 'If you cannot type in Telugu, don’t worry. You can easily enter names, village, and work details using voice.',
},

      {
        icon: 'cash',
        te: 'ఒకే రైతు, పంట, పని, తేదీలకు మళ్లీ చెల్లింపు లెక్కించలేరు.',
        en: 'Duplicate payment calculation is not allowed for same farmer, crop, work, and dates.',
      },
      {
  icon: 'calculator',
  te: 'ఈ యాప్‌లో కాలిక్యులేటర్ కూడా ఉంది. అత్యవసరంగా లెక్కలు వేయాల్సినప్పుడు యాప్ నుండే కాలిక్యులేటర్ ఉపయోగించవచ్చు.',
  en: 'This app also has a built-in calculator. You can quickly calculate amounts directly inside the app when needed.',
},

      {
        icon: 'warning',
        te: 'యాప్ తొలగిస్తే మీ డేటా పూర్తిగా పోతుంది. బ్యాకప్ ఉండదు.',
        en: 'If you uninstall the app, all data will be lost. No backup available.',
      },
      {
        icon: 'lock-closed',
        te: 'మీ పిన్ ఎవరికీ చెప్పవద్దు. ఇది మీ డేటా భద్రత కోసం.',
        en: 'Do not share your PIN with anyone. It protects your data.',
      },
      {
        icon: 'checkmark-circle',
        te: 'ముందుకు వెళ్లడానికి ఈ మార్గదర్శిని పూర్తిగా చదవాలి.',
        en: 'You must read this manual fully before continuing.',
      },
    ],
  };

  /* ---------- CONTINUE ---------- */
  const handleContinue = async () => {
    if (!reachedEnd || !accepted) {
      Alert.alert(T.mustRead);
      return;
    }

    await AsyncStorage.setItem('MANUAL_ACCEPTED', 'YES');
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>{T.title}</Text>
        <Text style={styles.subtitle}>{T.subtitle}</Text>

        {/* Language Switch */}
        <View style={styles.langRow}>
          <Pressable onPress={() => setLanguage('te')}>
            <Text
              style={[
                styles.lang,
                language === 'te' && styles.langActive,
              ]}
            >
              తెలుగు
            </Text>
          </Pressable>
          <Text style={{ marginHorizontal: 6 }}>|</Text>
          <Pressable onPress={() => setLanguage('en')}>
            <Text
              style={[
                styles.lang,
                language === 'en' && styles.langActive,
              ]}
            >
              English
            </Text>
          </Pressable>
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } =
            nativeEvent;
          const isEnd =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 20;
          if (isEnd) setReachedEnd(true);
        }}
        scrollEventThrottle={16}
      >
        {T.sections.map((s, i) => (
          <View key={i} style={styles.card}>
            <Ionicons name={s.icon as any} size={26} color="#1b5e20" />
            <Text style={styles.cardText}>
              {language === 'te' ? s.te : s.en}
            </Text>
          </View>
        ))}

        {/* CHECKBOX */}
        <Pressable
          style={styles.checkRow}
          onPress={() => setAccepted(p => !p)}
        >
          <Ionicons
            name={accepted ? 'checkbox' : 'square-outline'}
            size={24}
            color="#1b5e20"
          />
          <Text style={styles.checkText}>{T.agree}</Text>
        </Pressable>

        {/* CONTINUE */}
        <Pressable
          style={[
            styles.continueBtn,
            !(reachedEnd && accepted) && styles.disabled,
          ]}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>{T.continue}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f5' },

  header: {
    paddingTop: 50,
    paddingBottom: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 4,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1b5e20',
  },

  subtitle: { color: '#555', marginTop: 4 },

  langRow: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },

  lang: { color: '#777', fontSize: 14 },
  langActive: { color: '#1b5e20', fontWeight: '700' },

  content: { padding: 16 },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 3,
    alignItems: 'center',
  },

  cardText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },

  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },

  checkText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },

  continueBtn: {
    backgroundColor: '#2e7d32',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
    elevation: 4,
  },

  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  disabled: {
    opacity: 0.4,
  },
});
