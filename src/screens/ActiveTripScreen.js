import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  BackHandler,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Button } from "../components/common/Button";
import { SearchBar } from "../components/common/SearchBar";
import { storage, TRIP_STATUS } from "../storage/asyncStorage";
import { useTheme } from "../context/ThemeContext";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

export default function ActiveTripScreen({ route, navigation }) {
  const { collectionId, collectionName } = route.params;
  const [shops, setShops] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [startTime] = useState(new Date().toISOString());
  const [visibleAmounts, setVisibleAmounts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const { theme } = useTheme();

  useEffect(() => {
    loadTripData();
    //
  }, []);

  const loadTripData = async () => {
    // First check if there's an existing trip
    const existingTrip = await storage.getCurrentTrip();

    const collection = await storage.getCollectionById(collectionId);
    if (!collection?.shops?.length) {
      Alert.alert("Error", "No shops found in this collection");
      navigation.goBack();
      return;
    }

    let initialShops;

    if (existingTrip && existingTrip.collectionId === collectionId) {
      // Merge existing trip data with collection shops
      initialShops = collection.shops.map((shop) => {
        const existingShopData = existingTrip.shops.find(
          (s) => s.id === shop.id
        );
        if (existingShopData) {
          return {
            ...shop,
            ...existingShopData,
            status: "VISITED",
          };
        }
        return {
          ...shop,
          status: "PENDING",
          amount: 0,
          isClosed: false,
          notes: "",
          visitTime: null,
        };
      });
      setCurrentTrip(existingTrip);
    } else {
      // Initialize new trip with pending shops
      initialShops = collection.shops.map((shop) => ({
        ...shop,
        status: "PENDING",
        amount: 0,
        isClosed: false,
        notes: "",
        visitTime: null,
      }));

      // Create new trip
      const newTrip = {
        id: Date.now().toString(),
        collectionId,
        startTime,
        status: TRIP_STATUS.IN_PROGRESS,
        totalShops: initialShops.length,
        visitedShops: 0,
        totalAmount: 0,
        shops: [],
      };
      setCurrentTrip(newTrip);
      await storage.saveCurrentTrip(newTrip);
    }

    setShops(initialShops);
  };

  const handleUpdateShop = (shop) => {
    navigation.navigate("UpdateShop", {
      shopId: shop.id,
      shopName: shop.name,
      collectionId,
      initialData: {
        ...shop,
        amount: shop.amount,
        notes: shop.notes,
        isClosed: shop.isClosed,
        paymentMethod: shop.paymentMethod,
      },
      onUpdate: (updatedData) => handleShopUpdated(shop.id, updatedData),
    });
  };

  const handleShopUpdated = async (shopId, updateData) => {
    const updatedShops = shops.map((shop) =>
      shop.id === shopId
        ? {
            ...shop,
            ...updateData,
            status: "VISITED",
            visitTime: new Date().toISOString(),
          }
        : shop
    );
    setShops(updatedShops);

    // Update current trip
    const visitedCount = updatedShops.filter(
      (s) => s.status === "VISITED"
    ).length;
    const totalAmount = updatedShops.reduce(
      (sum, s) => sum + (s.amount || 0),
      0
    );
    const closedCount = updatedShops.filter((s) => s.isClosed).length;

    const updatedTrip = {
      ...currentTrip,
      visitedShops: visitedCount,
      totalAmount,
      closedShops: closedCount,
      shops: updatedShops.filter((s) => s.status === "VISITED"),
    };
    setCurrentTrip(updatedTrip);
    await storage.saveCurrentTrip(updatedTrip);
  };

  const confirmEndTrip = () => {
    Alert.alert(
      "End Trip",
      "Are you sure you want to end this collection trip?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "End Trip", style: "destructive", onPress: handleEndTrip },
      ]
    );
  };

  const handleEndTrip = async () => {
    const endTime = new Date().toISOString();
    const visitedShops = shops.filter((s) => s.status === "VISITED");

    const tripSummary = {
      ...currentTrip,
      endTime,
      status: TRIP_STATUS.COMPLETED,
      shops: visitedShops,
    };

    try {
      await storage.completeTrip(collectionId, tripSummary.id, tripSummary);
      navigation.replace("TripDetails", {
        tripId: tripSummary.id,
        collectionId,
      });
    } catch (error) {
      console.error("Error ending trip:", error);
      Alert.alert("Error", "Failed to end trip");
    }
  };

  const toggleAmountVisibility = (shopId) => {
    setVisibleAmounts((prev) => ({
      ...prev,
      [shopId]: !prev[shopId],
    }));
  };

  const handleEditShop = (shop) => {
    navigation.navigate("UpdateShop", {
      shopId: shop.id,
      shopName: shop.name,
      collectionId,
      initialData: {
        ...shop,
        amount: shop.amount,
        notes: shop.notes,
        isClosed: shop.isClosed,
        paymentMethod: shop.paymentMethod,
      },
      onUpdate: (updatedData) => handleShopUpdated(shop.id, updatedData),
    });
  };

  const renderShopItem = ({ item: shop }) => (
    <TouchableOpacity
      style={[styles.shopItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleUpdateShop(shop)}
    >
      <View style={styles.shopHeader}>
        <View style={styles.shopInfo}>
          <Ionicons
            name={
              shop.status === "VISITED"
                ? "checkmark-circle"
                : "radio-button-off"
            }
            size={24}
            color={
              shop.status === "VISITED"
                ? theme.colors.success
                : theme.colors.textSecondary
            }
            style={styles.statusIcon}
          />
          <View style={styles.shopDetails}>
            <Text style={[styles.shopName, { color: theme.colors.text }]}>
              {shop.name}
            </Text>
            <Text
              style={[
                styles.shopAddress,
                { color: theme.colors.textSecondary },
              ]}
            >
              {shop.address}
            </Text>
            {shop.status === "VISITED" && (
              <View style={styles.amountContainer}>
                <TouchableOpacity
                  onPress={() => toggleAmountVisibility(shop.id)}
                  style={styles.amountToggle}
                >
                  <View style={styles.amountRow}>
                    <Ionicons
                      name={
                        shop.paymentMethod === "ONLINE"
                          ? "phone-portrait"
                          : "cash"
                      }
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text
                      style={[styles.amount, { color: theme.colors.text }]}
                      numberOfLines={1}
                    >
                      {visibleAmounts[shop.id]
                        ? `₹${shop.amount || 0}`
                        : "Tap to view"}
                    </Text>
                    <Ionicons
                      name={
                        visibleAmounts[shop.id]
                          ? "eye-outline"
                          : "eye-off-outline"
                      }
                      size={16}
                      color={theme.colors.textSecondary}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
      {shop.status === "VISITED" && shop.notes && (
        <Text style={[styles.notes, { color: theme.colors.textSecondary }]}>
          <Ionicons name="document-text" size={14} /> {shop.notes}
        </Text>
      )}
    </TouchableOpacity>
  );

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="walk"
          size={32}
          color={theme.colors.primary}
          style={styles.headerIcon}
        />
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Collection Trip
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            {collectionName}
          </Text>
        </View>
        <View style={styles.tripStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {currentTrip?.visitedShops || 0}/{shops.length}
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              Visited
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              ₹{currentTrip?.totalAmount || 0}
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              Collected
            </Text>
          </View>
        </View>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search shops..."
      />

      <FlatList
        data={shops.filter((shop) =>
          shop.name.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        renderItem={renderShopItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity
        style={[
          styles.endTripButton,
          { backgroundColor: theme.colors.error },
        ]}
        onPress={confirmEndTrip}
      >
        <View style={styles.endTripContent}>
          <Ionicons name="flag" size={24} color="white" />
          <Text style={styles.endTripText}>End Trip</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerIcon: {
    marginRight: theme.spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: 14,
  },
  tripStats: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  statItem: {
    alignItems: "flex-end",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  statLabel: {
    fontSize: 12,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  shopItem: {
    padding: theme.spacing.md,
    borderRadius: 8,
    marginBottom: theme.spacing.md,
  },
  shopHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shopInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  shopDetails: {
    flex: 1,
  },
  statusIcon: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  shopName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  shopAddress: {
    fontSize: 14,
    marginBottom: theme.spacing.xs,
  },
  amountContainer: {
    marginTop: theme.spacing.xs,
  },
  amountToggle: {
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.background + "80",
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  amount: {
    fontSize: 16,
    minWidth: 80,
  },
  paymentIcon: {
    marginRight: theme.spacing.xs,
  },
  visibilityIcon: {
    marginLeft: theme.spacing.xs,
  },
  notes: {
    fontSize: 14,
    marginTop: theme.spacing.sm,
  },
  endTripButton: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.md,
    borderRadius: 8,
    padding: theme.spacing.sm,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  endTripContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  endTripText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
