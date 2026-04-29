import firestore from "@react-native-firebase/firestore";

export const createNotification = async ({
  title,
  message,
  userId,
}: {
  title: string;
  message: string;
  userId: string;
}) => {
  try {
    await firestore().collection("notifications").add({
      title,
      message,
      userId,
      createdAt: firestore.FieldValue.serverTimestamp(),
      seen: false,
    });
  } catch (e) {
    console.log("Notification error:", e);
  }
};