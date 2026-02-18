import firestore from '@react-native-firebase/firestore';

const TEMP_USER_ID = "demoUser001";

export const addTestData = async () => {
  try {
    await firestore()
      .collection('users')
      .doc(TEMP_USER_ID)
      .collection('test')
      .add({
        message: 'Cloud working bro 🔥',
        createdAt: new Date(),
      });

    console.log('Cloud Write Success');
  } catch (error) {
    console.log('Cloud Write Error:', error);
  }
};
