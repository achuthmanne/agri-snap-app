import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';

import AppHeader from '@/components/AppHeader';
import AppText from '@/components/AppText';

// బటన్స్ సైజు స్క్రీన్ ని బట్టి ఆటోమాటిక్ గా సెట్ అవ్వడానికి
const { width } = Dimensions.get('window');
const BUTTON_SIZE = (width - 64) / 4; // కొంచెం గ్యాప్ పెంచాను నీట్ గా ఉండటానికి

export default function StandardCalculator() {
  const [language, setLanguage] = useState<'te' | 'en'>('te');
  const [input, setInput] = useState('');
  const [resultPreview, setResultPreview] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('APP_LANG').then((saved) => {
      if (saved === 'te' || saved === 'en') setLanguage(saved);
    });
  }, []);

  // రియల్ టైమ్ లో లెక్క చేయడానికి
  useEffect(() => {
    if (input) {
      calculateResult(input, true);
    } else {
      setResultPreview('');
    }
  }, [input]);

  const handlePress = (val: string) => {
    Vibration.vibrate(20);

    if (val === 'C') {
      setInput('');
      setResultPreview('');
      return;
    }

    if (val === '⌫') {
      setInput((prev) => prev.slice(0, -1));
      return;
    }

    if (val === '=') {
      calculateResult(input, false);
      return;
    }

    const operators = ['+', '-', '×', '÷', '%'];
    const lastChar = input.slice(-1);

    if (operators.includes(val) && operators.includes(lastChar)) {
      setInput((prev) => prev.slice(0, -1) + val);
      return;
    }

    setInput((prev) => prev + val);
  };

  const calculateResult = (expression: string, isPreview: boolean) => {
    try {
      let formattedExpr = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/%/g, '/100');

      if (/[+\-*/.]$/.test(formattedExpr)) {
        formattedExpr = formattedExpr.slice(0, -1);
      }

      const evalResult = new Function('return ' + formattedExpr)();

      if (evalResult === Infinity || Number.isNaN(evalResult)) {
        if (!isPreview) setInput('Error');
        return;
      }

      const finalAns = String(Math.round(evalResult * 100000000) / 100000000);

      if (isPreview) {
        setResultPreview(finalAns);
      } else {
        setInput(finalAns);
        setResultPreview('');
      }
    } catch (error) {
      if (!isPreview) {
        setInput('Error');
      }
    }
  };

  const buttons = [
    ['C', '⌫', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['00', '0', '.', '=']
  ];

  const getButtonStyle = (btn: string) => {
    if (btn === '=') return styles.btnEquals;
    if (['+', '-', '×', '÷'].includes(btn)) return styles.btnOperator;
    if (['C', '⌫', '%'].includes(btn)) return styles.btnAction;
    return styles.btnNumber;
  };

  const getButtonTextStyle = (btn: string) => {
    if (btn === '=') return styles.textEquals;
    if (['+', '-', '×', '÷'].includes(btn)) return styles.textOperator;
    if (['C', '⌫', '%'].includes(btn)) return styles.textAction;
    return styles.textNumber;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7F6" />
      
      <AppHeader
        title={language === 'te' ? 'క్యాలిక్యులేటర్' : 'Calculator'}
        subtitle={language === 'te' ? 'సాధారణ లెక్కలు' : 'Standard Calculations'}
        language={language}
      />

      <View style={styles.container}>
        
        {/* 🔥 DISPLAY SECTION */}
        <View style={styles.displayContainer}>
          <AppText style={[styles.inputText, input.length > 10 && { fontSize: 42 }, input.length > 15 && { fontSize: 32 }]} numberOfLines={2}>
            {input || '0'}
          </AppText>
          <AppText style={styles.previewText} numberOfLines={1}>
            {resultPreview ? `= ${resultPreview}` : ''}
          </AppText>
        </View>

        <View style={styles.divider} />

      {/* 🔥 KEYPAD SECTION (Flat & Clean) */}
        <View style={styles.keypadContainer}>
          {buttons.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((btn) => {
                
                // సింబల్స్ కి ఏ ఐకాన్ వాడాలో డిసైడ్ చేయడం
                const isOperator = ['+', '-', '×', '÷', '='].includes(btn);
                let iconName: any = '';
                if (btn === '+') iconName = 'plus';
                if (btn === '-') iconName = 'minus';
                if (btn === '×') iconName = 'close';
                if (btn === '÷') iconName = 'division';
                if (btn === '=') iconName = 'equal';

                return (
                  <TouchableOpacity
                    key={btn}
                    activeOpacity={0.6}
                    style={[styles.button, getButtonStyle(btn)]}
                    onPress={() => handlePress(btn)}
                  >
                    {btn === '⌫' ? (
                      <Ionicons name="backspace-outline" size={32} color="#374151" />
                    ) : isOperator ? (
                      // 🔥 ఆపరేటర్స్ కి టెక్స్ట్ బదులు ఐకాన్స్ వాడుతున్నాం!
                      <MaterialCommunityIcons 
                        name={iconName} 
                        size={30} 
                        color={btn === '=' ? '#ffffff' : '#16A34A'} 
                      />
                    ) : (
                      <AppText style={[styles.btnText, getButtonTextStyle(btn)]}>
                        {btn}
                      </AppText>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: '#F6F7F6' 
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  
  // DISPLAY
  displayContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    minHeight: 160,
  },
  inputText: {
    fontSize: 56,
    fontWeight: '300',
    color: '#111827', // Darker for better visibility
    textAlign: 'right',
    fontFamily: 'Mandali',
  },
  previewText: {
    fontSize: 28,
    fontWeight: '400',
    color: '#9CA3AF',
    marginTop: 8,
    minHeight: 34,
    fontFamily: 'Mandali',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 24,
    marginBottom: 24,
  },

  // KEYPAD
  keypadContainer: {
    paddingHorizontal: 22,
    paddingBottom: 35,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    // 🔥 No shadows, no elevations! Pure flat design.
  },
  btnText: {
    fontFamily: 'Mandali',
    textAlign: 'center',
  },

  // 🔥 FLAT COLORS & BIG FONTS
  btnNumber: {
    backgroundColor: '#F3F4F6', // Light Flat Gray
  },
  textNumber: {
    color: '#111827', // Almost black
    fontSize: 34,
    fontWeight: '400',
  },

  btnOperator: {
    backgroundColor: '#DCFCE7', // Flat Light Green
  },
  btnAction: {
    backgroundColor: '#E5E7EB', // Slightly darker flat gray
  },
  textAction: {
    color: '#374151', // Dark Gray
    fontSize: 30,
    fontWeight: '500',
  },

  btnEquals: {
    backgroundColor: '#16A34A', // Solid Green Flat
  },
 textOperator: {
    color: '#16A34A', 
    fontSize: 38,
    fontWeight: '500',
    justifyContent: 'center',
    includeFontPadding: false, // 🔥 ఇది ఆండ్రాయిడ్ లో ఎక్స్‌ట్రా ప్యాడింగ్ ని తీసేస్తుంది
    textAlignVertical: 'center',
    lineHeight: 42, // 🔥 కరెక్ట్ గా సెంటర్ లో కూర్చోవడానికి
  },

  textEquals: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: '500',
    justifyContent: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 44,
  },
});