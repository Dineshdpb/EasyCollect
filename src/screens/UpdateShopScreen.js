import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Switch,
  ScrollView,
} from "react-native";
import { Button } from "../components/common/Button";
import { theme } from "../theme";

export default function UpdateShopScreen({ route, navigation }) {
  const { shopId, onUpdate } = route.params;
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isClosed, setIsClosed] = useState(false);

  const handleSubmit = () => {
    const updateData = {
      amount: amount ? parseFloat(amount) : 0,
      notes: notes.trim(),
      isClosed,
      visitTime: new Date().toISOString(),
    };

    onUpdate(updateData);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Collection Amount</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="Enter amount"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add notes about the visit"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Shop Closed?</Text>
        <Switch
          value={isClosed}
          onValueChange={setIsClosed}
          trackColor={{ false: "#767577", true: theme.colors.error }}
          thumbColor={isClosed ? theme.colors.error : "#f4f3f4"}
        />
      </View>

      <Button title="Save" onPress={handleSubmit} style={styles.submitButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    color: theme.colors.text,
    fontSize: 16,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    padding: theme.spacing.md,
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
});
