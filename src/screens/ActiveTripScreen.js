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

  // const handleBackPress = () => {
  //   confirmEndTrip();
  //   return true;
  // };

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
        amount: shop.amount,
        notes: shop.notes,
        isClosed: shop.isClosed,
        paymentMethod: shop.paymentMethod,
      },
      onUpdate: (updatedData) => handleShopUpdated(shop.id, updatedData),
    });
  };

  const filteredShops = shops.filter(
    (shop) =>
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderShopItem = ({ item }) => (
    <TouchableOpacity
      style={styles.shopItem}
      onPress={() =>
        item.status === "PENDING" ? handleUpdateShop(item) : null
      }
      disabled={item.status === "VISITED"}
    >
      <View style={styles.shopHeader}>
        <Text style={styles.shopName}>{item.name}</Text>
        <Text
          style={[
            styles.shopStatus,
            {
              color:
                item.status === "VISITED"
                  ? theme.colors.success
                  : theme.colors.warning,
            },
          ]}
        >
          {item.status}
        </Text>
      </View>
      <Text style={styles.shopAddress}>{item.address}</Text>
      {item.status === "VISITED" && (
        <>
          <View style={styles.visitDetails}>
            <View style={styles.amountContainer}>
              <Text style={styles.amount}>
                {visibleAmounts[item.id] ? `₹${item.amount || 0}` : "•••••"}
              </Text>
              <TouchableOpacity onPress={() => toggleAmountVisibility(item.id)}>
                <Ionicons
                  name={visibleAmounts[item.id] ? "eye-off" : "eye"}
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {item.isClosed && <Text style={styles.closedTag}>CLOSED</Text>}
          </View>
          <View style={styles.paymentMethodContainer}>
            <Text style={styles.paymentMethod}>
              {item.paymentMethod === "GPAY" ? (
                <FontAwesome5
                  name="google-pay"
                  size={24}
                  color={
                    item.paymentMethod === "GPAY"
                      ? theme.colors.text
                      : theme.colors.textSecondary
                  }
                />
              ) : (
                <>
                  <Ionicons
                    name={
                      item.paymentMethod === "GPAY"
                        ? "phone-portrait-outline"
                        : "cash-outline"
                    }
                    size={16}
                    color={theme.colors.textSecondary}
                    style={{ marginRight: theme.spacing.xs }}
                  />
                  {" CASH"}
                </>
              )}
            </Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditShop(item)}
            >
              <Ionicons name="pencil" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
        </>
      )}
    </TouchableOpacity>
  );

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{collectionName}</Text>
        <Text style={styles.headerSubtitle}>
          {shops.filter((s) => s.status === "VISITED").length} of {shops.length}{" "}
          shops visited
        </Text>
        {currentTrip?.totalAmount > 0 && (
          <Text style={styles.totalAmount}>
            Total Collection: ₹{currentTrip.totalAmount}
          </Text>
        )}
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search shops..."
      />

      <FlatList
        data={filteredShops}
        renderItem={renderShopItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />

      <Button
        title="End Collection Trip"
        onPress={confirmEndTrip}
        style={styles.endButton}
      />
    </View>
  );
}

const getStyles = (theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    alignItems: "center",
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  totalAmount: {
    color: theme.colors.success,
    fontSize: 18,
    fontWeight: "600",
    marginTop: theme.spacing.sm,
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
  visitedShop: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
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
  shopStatus: {
    fontSize: 14,
    fontWeight: "bold",
  },
  shopAddress: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginTop: theme.spacing.xs,
  },
  visitDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  endButton: {
    margin: theme.spacing.md,
    backgroundColor: theme.colors.error,
  },
  paymentMethodContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.xs,
  },
  paymentMethod: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  editButton: {
    padding: theme.spacing.xs,
  },
  notes: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontStyle: "italic",
    marginTop: theme.spacing.xs,
  },
});
