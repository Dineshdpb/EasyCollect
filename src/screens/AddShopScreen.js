import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Button } from "../components/common/Button";
import { storage } from "../storage/asyncStorage";
import { useTheme } from "../context/ThemeContext";

export default function AddShopScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { collectionId, tripId, onAdd } = route.params;
  const [shopData, setShopData] = useState({
    name: "",
    address: "",
    notes: "",
  });

  const styles = getStyles(theme);

  const handleSave = async () => {
    try {
      if (!shopData.name.trim()) {
        Alert.alert("Error", "Please enter a shop name");
        return;
      }

      // Get current collection
      const collection = await storage.getCollectionById(collectionId);

      // Check if shop name already exists in this collection
      const shopExists = collection.shops?.some(
        (shop) => shop.name.toLowerCase() === shopData.name.trim().toLowerCase()
      );

      if (shopExists) {
        Alert.alert(
          "Error",
          "A shop with this name already exists in this collection"
        );
        return;
      }

      const newShop = {
        id: Date.now().toString(),
        name: shopData.name.trim(),
        address: shopData.address.trim(),
        notes: shopData.notes.trim(),
        createdAt: new Date().toISOString(),
        lastVisited: null,
        lastAmount: 0,
        previousAmounts: [],
      };

      // If tripId is provided, add to trip
      if (tripId) {
        const updatedCollection = {
          ...collection,
          trips: collection.trips.map((trip) => {
            if (trip.id === tripId) {
              return {
                ...trip,
                shops: [...trip.shops, newShop],
              };
            }
            return trip;
          }),
        };
        await storage.updateCollection(collectionId, updatedCollection);
      } else {
        // Add to collection shops as before
        const updatedCollection = {
          ...collection,
          shops: [...(collection.shops || []), newShop],
        };
        await storage.updateCollection(collectionId, updatedCollection);
      }

      if (onAdd) onAdd();
      navigation.goBack();
    } catch (error) {
      console.error("Error adding shop:", error);
      Alert.alert("Error", "Failed to add shop. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={shopData.name}
          onChangeText={(text) => setShopData({ ...shopData, name: text })}
          placeholder="Shop Name"
          placeholderTextColor={theme.colors.textSecondary}
          autoFocus
        />

        <TextInput
          style={styles.input}
          value={shopData.address}
          onChangeText={(text) => setShopData({ ...shopData, address: text })}
          placeholder="Shop Address"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          value={shopData.notes}
          onChangeText={(text) => setShopData({ ...shopData, notes: text })}
          placeholder="Notes (Optional)"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={4}
        />

        <Button
          title="Save Shop"
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
