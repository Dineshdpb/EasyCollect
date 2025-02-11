import React, { useState } from "react";
import { View, TextInput, StyleSheet, ScrollView, Alert } from "react-native";
import { Button } from "../components/common/Button";
import { storage } from "../storage/asyncStorage";
import { theme } from "../theme";

export default function EditShopScreen({ route, navigation }) {
  const { shop, collectionId } = route.params;
  const [shopData, setShopData] = useState({
    name: shop.name,
    address: shop.address,
    notes: shop.notes || "",
  });

  const handleSave = async () => {
    try {
      if (!shopData.name.trim()) {
        Alert.alert("Error", "Please enter a shop name");
        return;
      }

      if (!shopData.address.trim()) {
        Alert.alert("Error", "Please enter a shop address");
        return;
      }

      const updatedShop = {
        ...shop,
        name: shopData.name.trim(),
        address: shopData.address.trim(),
        notes: shopData.notes.trim(),
      };

      await storage.updateShopInCollection(collectionId, shop.id, updatedShop);

      Alert.alert("Success", "Shop updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update shop");
      console.error("Error updating shop:", error);
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
          title="Save Changes"
          onPress={handleSave}
          style={styles.saveButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
