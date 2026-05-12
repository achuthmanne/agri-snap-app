import React from "react";
import { StyleSheet, Text, TextProps } from "react-native";

interface Props extends TextProps {
  children: React.ReactNode;
  language?: "te" | "en";
}

export default function AppText({ children, style, ...otherProps }: Props) {
  const font = "Mandali";

  return (
    <Text
      style={[
        styles.defaultStyle,
        style,
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
    color: "#111827",
  }
});