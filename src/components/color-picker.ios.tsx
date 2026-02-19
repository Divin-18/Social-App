import { Text, View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import {
  BottomSheet,
  Button,
  ColorPicker,
  Host,
  VStack,
} from "@expo/ui/swift-ui";
import { useState } from "react";

export default function ColorPickerIOS() {
  const [color, setColor] = useState("#FF6347");
  return (
    <View style={styles.container}>
      <Host>
        <ColorPicker selection={color} onValueChanged={setColor} />
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: 200,
    height: 200,
  },
});
