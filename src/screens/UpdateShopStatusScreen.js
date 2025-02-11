import React, { useState } from "react";
import { View, TextInput, StyleSheet, Switch, Text } from "react-native";
import { Button } from "../components/common/Button";
import { storage } from "../storage/asyncStorage";
import { theme } from "../theme";

export default function UpdateShopStatusScreen({ route, navigation }) {
  const { tripId, shopId, onUpdate } = route.params;
  const [amount, setAmount] = useState("");
  const [isClosed, setIsClosed] = useState(false);

  const handleSubmit = async () => {
    const trips = await storage.getTrips();
    const updatedTrips = trips.map((trip) => {
      if (trip.id === tripId) {
        const updatedShops = trip.shops.map((shop) => {
          if (shop.id === shopId) {
            return {
              ...shop,
              amount: amount ? parseFloat(amount) : 0,
              isClosed,
              lastUpdated: new Date().toISOString(),
              status: isClosed ? "closed" : "visited",
            };
          }
          return shop;
        });
        return { ...trip, shops: updatedShops };
      }
      return trip;
    });

    await storage.saveTrips(updatedTrips);
    navigation.goBack();
    onUpdate();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter Amount"
        placeholderTextColor={theme.colors.textSecondary}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Mark as Closed</Text>
        <Switch
          value={isClosed}
          onValueChange={setIsClosed}
          trackColor={{ false: "#767577", true: theme.colors.primary }}
        />
      </View>

      <Button
        title="Submit"
        onPress={handleSubmit}
        style={styles.submitButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    padding: theme.spacing.md,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: theme.spacing.lg,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  switchLabel: {
    color: theme.colors.text,
    fontSize: 16,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
});
