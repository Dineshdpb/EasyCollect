import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TextInput, Alert } from "react-native";
import { Button } from "../components/common/Button";
import { storage } from "../storage/asyncStorage";
import { useTheme } from "../context/ThemeContext";

export default function EditTripScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { trip, collectionId, onUpdate } = route.params;
  const [notes, setNotes] = useState(trip?.notes || "");

  const handleSave = async () => {
    try {
      const updatedTrip = {
        ...trip,
        notes: notes.trim(),
      };

      await storage.updateTripInCollection(collectionId, trip?.id, updatedTrip);

      if (onUpdate) {
        onUpdate();
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to update trip details");
    }
  };

  const styles = getStyles(theme);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Trip Notes"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={4}
        />

        <Button
          title="Save Changes"
          onPress={handleSave}
          style={styles.saveButton}
        />
      </View>
    </ScrollView>
  );
}

const getStyles = (theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  form: {
    padding: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    padding: theme.spacing.md,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: theme.spacing.md,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: theme.spacing.md,
  },
});
