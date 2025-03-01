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
import { Ionicons } from "@expo/vector-icons";

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
      <View style={styles.header}>
        <Ionicons
          name="business-outline"
          size={60}
          color={theme.colors.primary}
          style={styles.icon}
        />
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Add New Shop
        </Text>
        <Text
          style={[styles.description, { color: theme.colors.textSecondary }]}
        >
          Add shop details to start tracking{"\n"}payments and visits
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons
            name="storefront-outline"
            size={24}
            color={theme.colors.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            value={shopData.name}
            onChangeText={(text) => setShopData({ ...shopData, name: text })}
            placeholder="Shop Name"
            placeholderTextColor={theme.colors.textSecondary}
            autoFocus
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="location-outline"
            size={24}
            color={theme.colors.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            value={shopData.address}
            onChangeText={(text) => setShopData({ ...shopData, address: text })}
            placeholder="Shop Address (Optional)"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="document-text-outline"
            size={24}
            color={theme.colors.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { color: theme.colors.text },
            ]}
            value={shopData.notes}
            onChangeText={(text) => setShopData({ ...shopData, notes: text })}
            placeholder="Notes (Optional)"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>

        <Button
          title="Add Shop"
          onPress={handleSave}
          style={styles.saveButton}
          icon="business"
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
  header: {
    alignItems: "center",
    marginVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  icon: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  form: {
    padding: theme.spacing.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    marginBottom: theme.spacing.md,
  },
  inputIcon: {
    padding: theme.spacing.md,
  },
  input: {
    flex: 1,
    padding: theme.spacing.md,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: theme.spacing.md,
  },
});
