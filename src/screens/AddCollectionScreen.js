import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import { Button } from "../components/common/Button";
import { storage } from "../storage/asyncStorage";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

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
      <View style={styles.header}>
        <Ionicons
          name="add-circle-outline"
          size={60}
          color={theme.colors.primary}
          style={styles.icon}
        />
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Create New Collection
        </Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          Group your shops together for easier management{"\n"}and payment tracking
        </Text>
      </View>

      <TextInput
        style={[styles.input, { color: theme.colors.text }]}
        value={name}
        onChangeText={setName}
        placeholder="Collection Name"
        placeholderTextColor={theme.colors.textSecondary}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={handleSave}
      />
      <Button 
        title="Create Collection" 
        onPress={handleSave} 
        style={styles.saveButton}
        icon="add-circle"
      />
    </View>
  );
}

const getStyles = (theme) => ({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  header: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  icon: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  input: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: theme.spacing.md,
  },
  saveButton: {
    marginTop: theme.spacing.md,
  },
});
