import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActionSheetIOS,
} from "react-native";
import { storage } from "../storage/asyncStorage";
import { theme } from "../theme";
import { Ionicons } from "@expo/vector-icons";

export default function TripDetailsScreen({ route, navigation }) {
  const { tripId, collectionId } = route.params;
  const [trip, setTrip] = useState(null);
  const [collection, setCollection] = useState(null);

  useEffect(() => {
    loadTripDetails();
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={showTripOptions}>
          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      ),
    });
  }, []);

  const loadTripDetails = async () => {
    const collectionData = await storage.getCollectionById(collectionId);
    setCollection(collectionData);

    const tripData = collectionData.trips.find((t) => t.id === tripId);
    setTrip(tripData);

    navigation.setOptions({
      title: `Trip - ${new Date(tripData.startTime).toLocaleDateString()}`,
    });
  };

  const formatDuration = (startTime, endTime) => {
    const duration = new Date(endTime) - new Date(startTime);
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleEditShopVisit = (shopVisit) => {
    Alert.prompt(
      "Edit Collection Amount",
      "Enter new amount:",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Save",
          onPress: async (newAmount) => {
            if (newAmount && !isNaN(newAmount)) {
              try {
                const updatedTrip = {
                  ...trip,
                  shops: trip.shops.map((shop) =>
                    shop.id === shopVisit.id
                      ? { ...shop, amount: parseFloat(newAmount) }
                      : shop
                  ),
                  totalAmount: trip.shops.reduce(
                    (sum, shop) =>
                      shop.id === shopVisit.id
                        ? sum - shop.amount + parseFloat(newAmount)
                        : sum + shop.amount,
                    0
                  ),
                };

                await storage.updateTripInCollection(
                  collectionId,
                  trip.id,
                  updatedTrip
                );
                loadTripDetails();
              } catch (error) {
                Alert.alert("Error", "Failed to update amount");
              }
            } else {
              Alert.alert("Error", "Please enter a valid amount");
            }
          },
        },
      ],
      "plain-text",
      shopVisit.amount.toString()
    );
  };

  const showTripOptions = () => {
    Alert.alert("Trip Options", "Choose an action", [
      {
        text: "Edit Trip Details",
        onPress: handleEditTripDetails,
      },
      {
        text: "Delete Trip",
        onPress: handleDeleteTrip,
        style: "destructive",
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const handleEditTripDetails = () => {
    navigation.navigate("EditTrip", {
      trip,
      collectionId,
      onUpdate: loadTripDetails,
    });
  };

  const handleDeleteTrip = () => {
    Alert.alert(
      "Delete Trip",
      "Are you sure you want to delete this trip? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await storage.deleteTripFromCollection(collectionId, trip.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert("Error", "Failed to delete trip");
            }
          },
        },
      ]
    );
  };

  const renderShopItem = ({ item }) => (
    <TouchableOpacity
      style={styles.shopItem}
      onPress={() => handleEditShopVisit(item)}
    >
      <View style={styles.shopHeader}>
        <Text style={styles.shopName}>{item.name}</Text>
        <Text style={styles.visitTime}>
          {new Date(item.visitTime).toLocaleTimeString()}
        </Text>
      </View>

      <Text style={styles.shopAddress}>{item.address}</Text>

      <View style={styles.shopDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.amount}>₹{item.amount || 0}</Text>
          {item.isClosed && <Text style={styles.closedTag}>CLOSED</Text>}
        </View>
        {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
      </View>
    </TouchableOpacity>
  );

  if (!trip) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.collectionName}>{collection?.name}</Text>
        <Text style={styles.tripTime}>
          {new Date(trip.startTime).toLocaleTimeString()} -{" "}
          {new Date(trip.endTime).toLocaleTimeString()}
        </Text>
        <Text style={styles.duration}>
          Duration: {formatDuration(trip.startTime, trip.endTime)}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{trip.visitedShops}</Text>
          <Text style={styles.statLabel}>Shops Visited</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>₹{trip.totalAmount}</Text>
          <Text style={styles.statLabel}>Total Collection</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{trip.closedShops || 0}</Text>
          <Text style={styles.statLabel}>Shops Closed</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Visited Shops</Text>

      <FlatList
        data={trip.shops}
        renderItem={renderShopItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    alignItems: "center",
  },
  collectionName: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: theme.spacing.xs,
  },
  tripTime: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  duration: {
    color: theme.colors.primary,
    fontSize: 16,
    marginTop: theme.spacing.xs,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "bold",
    padding: theme.spacing.md,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  shopItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: 8,
    marginBottom: theme.spacing.md,
  },
  shopHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shopName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  visitTime: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  shopAddress: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginTop: theme.spacing.xs,
  },
  shopDetails: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amount: {
    color: theme.colors.success,
    fontSize: 16,
    fontWeight: "bold",
  },
  closedTag: {
    color: theme.colors.error,
    fontSize: 14,
    fontWeight: "bold",
  },
  notes: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontStyle: "italic",
    marginTop: theme.spacing.xs,
  },
});
