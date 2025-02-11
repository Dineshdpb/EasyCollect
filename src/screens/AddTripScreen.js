import React, { useState } from "react";
import { View, TextInput, StyleSheet, Alert } from "react-native";
import { Button } from "../components/common/Button";
import { storage, TRIP_STATUS } from "../storage/asyncStorage";
import { theme } from "../theme";

export default function AddTripScreen({ navigation }) {
  const [tripName, setTripName] = useState("");

  const handleSaveTrip = async () => {
    if (!tripName.trim()) {
      Alert.alert("Error", "Please enter a trip name");
      return;
    }

    const newTrip = {
      id: Date.now().toString(),
      name: tripName.trim(),
      createdAt: new Date().toISOString(),
      status: TRIP_STATUS.PENDING,
      shops: [],
      statistics: {
        totalAmount: 0,
        visitedShops: 0,
        closedShops: 0,
      },
    };

    const existingTrips = await storage.getTrips();
    await storage.saveTrips([...existingTrips, newTrip]);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter Trip Name"
        placeholderTextColor={theme.colors.textSecondary}
        value={tripName}
        onChangeText={setTripName}
      />
      <Button
        title="Save Trip"
        onPress={handleSaveTrip}
        style={styles.saveButton}
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
    marginBottom: theme.spacing.md,
  },
  saveButton: {
    marginTop: theme.spacing.md,
  },
});
