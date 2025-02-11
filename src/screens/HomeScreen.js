import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "../components/common/Button";
import { theme } from "../theme";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Collections</Text>
      <Button
        title="View My Trips"
        onPress={() => navigation.navigate("Trips")}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: theme.colors.text,
    fontSize: 24,
    marginBottom: theme.spacing.xl,
  },
  button: {
    width: "80%",
  },
});
