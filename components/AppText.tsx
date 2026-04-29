import React from "react";
import { StyleSheet, Text, TextProps } from "react-native";

interface Props extends TextProps {
  children: React.ReactNode;
  language?: "te" | "en"; // Deenni optional ga unchutunnam for compatibility
}

export default function AppText({ children, style, ...otherProps }: Props) {
  // Direct ga Mandali font ni assign chestunnam
  const font = "Mandali";

  return (
    <Text
      style={[
        styles.defaultStyle,
        style, // User customization style
        { 
          fontFamily: font,
          includeFontPadding: false, 
          textAlignVertical: 'center' 
        }
      ]}
      {...otherProps}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  defaultStyle: {
    // Default text color or size if needed
    color: "#111827",
  }
});