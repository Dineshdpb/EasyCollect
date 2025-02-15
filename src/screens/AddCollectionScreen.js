import React, { useState } from "react";
import { View, TextInput, StyleSheet, Alert } from "react-native";
import { Button } from "../components/common/Button";
import { storage } from "../storage/asyncStorage";
import { useTheme } from "../context/ThemeContext";

export default function AddCollectionScreen({ route, navigation }) {
  const [name, setName] = useState("");
  const { theme } = useTheme();
  const { onAdd } = route.params;

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a collection name");
      return;
    }

    const newCollection = {
      id: Date.now().toString(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
      shops: [],
      trips: [],
    };

    try {
      const collections = await storage.getCollections();

      // Check if collection name already exists
      const exists = collections.some(
        (c) => c.name.toLowerCase() === name.trim().toLowerCase()
      );

      if (exists) {
        Alert.alert("Error", "A collection with this name already exists");
        return;
      }

      await storage.saveCollections([...collections, newCollection]);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to create collection");
      console.error("Error creating collection:", error);
    }
  };

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Collection Name"
        placeholderTextColor={theme.colors.textSecondary}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={handleSave}
      />
      <Button title="Save" onPress={handleSave} style={styles.saveButton} />
    </View>
  );
}

const getStyles = (theme) => ({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  input: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    padding: theme.spacing.md,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: theme.spacing.md,
  },
  saveButton: {
    marginTop: theme.spacing.md,
  },
});
