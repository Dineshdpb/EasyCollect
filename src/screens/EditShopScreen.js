import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Button } from "../components/common/Button";
import { storage } from "../storage/asyncStorage";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

export default function EditShopScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { shop, collectionId } = route.params;
  const [shopData, setShopData] = useState({
    name: shop.name,
    address: shop.address,
    notes: shop.notes || "",
  });
  const [amount, setAmount] = useState(shop.amount?.toString() || "0");
  const [isAmountVisible, setIsAmountVisible] = useState(false);

  const handleSave = async () => {
    try {
      if (!shopData.name.trim()) {
        Alert.alert("Error", "Please enter a shop name");
        return;
      }

      const updatedShop = {
        ...shop,
        name: shopData.name.trim(),
        address: shopData.address.trim(),
        notes: shopData.notes.trim(),
        amount: parseFloat(amount) || 0,
        previousAmounts: [
          ...(shop.previousAmounts || []),
          {
            amount: shop.amount,
            date: new Date().toISOString(),
            notes: shop.notes,
          },
        ].slice(-5), // Keep last 5 entries
      };

      await storage.updateShopInCollection(collectionId, shop.id, updatedShop);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to update shop");
    }
  };

  const styles = getStyles(theme);

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

        {/* <View style={styles.amountContainer}>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            secureTextEntry={!isAmountVisible}
            placeholder="Amount"
            placeholderTextColor={theme.colors.textSecondary}
          />
          <TouchableOpacity
            style={styles.visibilityToggle}
            onPress={() => setIsAmountVisible(!isAmountVisible)}
          >
            <Ionicons
              name={isAmountVisible ? "eye-off" : "eye"}
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View> */}

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
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  visibilityToggle: {
    padding: theme.spacing.sm,
  },
});
