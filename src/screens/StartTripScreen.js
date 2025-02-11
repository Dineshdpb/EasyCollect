import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, BackHandler } from "react-native";
import { Button } from "../components/common/Button";
import { storage, TRIP_STATUS } from "../storage/asyncStorage";
import { theme } from "../theme";

export default function StartTripScreen({ route, navigation }) {
  const { tripId } = route.params;
  const [currentTrip, setCurrentTrip] = useState(null);
  const [currentShopIndex, setCurrentShopIndex] = useState(0);
  const [currentShop, setCurrentShop] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [visitedShops, setVisitedShops] = useState([]);

  useEffect(() => {
    loadTripDetails();
    setStartTime(new Date().toISOString());

    // Handle back button
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => backHandler.remove();
  }, []);

  const handleBackPress = () => {
    confirmStopTrip();
    return true;
  };

  const loadTripDetails = async () => {
    const trips = await storage.getTrips();
    const trip = trips.find((t) => t.id === tripId);

    if (trip && trip.shops && trip.shops.length > 0) {
      // Update trip status to IN_PROGRESS
      const updatedTrip = { ...trip, status: TRIP_STATUS.IN_PROGRESS };
      await updateTrip(updatedTrip);
      setCurrentTrip(updatedTrip);
      setCurrentShop(trip.shops[0]);
    } else {
      Alert.alert("No Shops", "This trip has no shops to visit.");
      navigation.goBack();
    }
  };

  const updateTrip = async (updatedTrip) => {
    const trips = await storage.getTrips();
    const updatedTrips = trips.map((t) => (t.id === tripId ? updatedTrip : t));
    await storage.saveTrips(updatedTrips);
  };

  const handleShopUpdate = () => {
    navigation.navigate("UpdateShopStatus", {
      tripId,
      shopId: currentShop.id,
      onUpdate: handleShopStatusUpdated,
    });
  };

  const handleShopStatusUpdated = async (updatedShopData) => {
    const updatedShop = {
      ...currentShop,
      ...updatedShopData,
      visitTime: new Date().toISOString(),
    };

    setVisitedShops([...visitedShops, updatedShop]);

    if (currentShopIndex < currentTrip.shops.length - 1) {
      setCurrentShopIndex((prev) => prev + 1);
      setCurrentShop(currentTrip.shops[currentShopIndex + 1]);
    } else {
      await completeTrip();
    }
  };

  const calculateTripDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = Math.floor((end - start) / 1000); // seconds

    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);

    return `${hours}h ${minutes}m`;
  };

  const completeTrip = async () => {
    const endTime = new Date().toISOString();
    const tripHistory = {
      id: Date.now().toString(),
      startTime,
      endTime,
      duration: calculateTripDuration(startTime, endTime),
      totalShops: currentTrip.shops.length,
      visitedShops: visitedShops.length,
      totalAmount: visitedShops.reduce(
        (sum, shop) => sum + (shop.amount || 0),
        0
      ),
      shops: visitedShops,
    };

    const updatedTrip = {
      ...currentTrip,
      status: TRIP_STATUS.COMPLETED,
      history: [...(currentTrip.history || []), tripHistory],
    };

    await updateTrip(updatedTrip);
    Alert.alert(
      "Trip Completed",
      "You have successfully completed this trip!",
      [
        {
          text: "OK",
          onPress: () => navigation.navigate("TripDetail", { tripId }),
        },
      ]
    );
  };

  const confirmStopTrip = () => {
    Alert.alert(
      "Stop Trip",
      "Are you sure you want to stop this trip? Progress will be saved.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Stop Trip",
          style: "destructive",
          onPress: handleStopTrip,
        },
      ]
    );
  };

  const handleStopTrip = async () => {
    const endTime = new Date().toISOString();
    const tripHistory = {
      id: Date.now().toString(),
      startTime,
      endTime,
      duration: calculateTripDuration(startTime, endTime),
      totalShops: currentTrip.shops.length,
      visitedShops: visitedShops.length,
      totalAmount: visitedShops.reduce(
        (sum, shop) => sum + (shop.amount || 0),
        0
      ),
      shops: visitedShops,
      status: "STOPPED",
    };

    const updatedTrip = {
      ...currentTrip,
      history: [...(currentTrip.history || []), tripHistory],
    };

    await updateTrip(updatedTrip);
    navigation.navigate("TripDetail", { tripId });
  };

  if (!currentShop) return null;

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Shop {currentShopIndex + 1} of {currentTrip?.shops.length}
        </Text>
        <Text style={styles.progressPercent}>
          {Math.round(
            ((currentShopIndex + 1) / currentTrip?.shops.length) * 100
          )}
          %
        </Text>
      </View>

      <View style={styles.shopCard}>
        <Text style={styles.shopName}>{currentShop.name}</Text>
        <Text style={styles.shopAddress}>{currentShop.address}</Text>
        {currentShop.notes && (
          <Text style={styles.notes}>Notes: {currentShop.notes}</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Update Shop Status"
          onPress={handleShopUpdate}
          style={styles.updateButton}
        />
        <Button
          title="Stop Trip"
          onPress={confirmStopTrip}
          style={styles.stopButton}
          textStyle={styles.stopButtonText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  progressText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  progressPercent: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
  shopCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: 12,
    marginBottom: theme.spacing.lg,
  },
  shopName: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: theme.spacing.sm,
  },
  shopAddress: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    marginBottom: theme.spacing.sm,
  },
  notes: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontStyle: "italic",
  },
  buttonContainer: {
    marginTop: "auto",
  },
  updateButton: {
    marginBottom: theme.spacing.md,
  },
  stopButton: {
    backgroundColor: theme.colors.error,
  },
  stopButtonText: {
    color: theme.colors.text,
  },
});
