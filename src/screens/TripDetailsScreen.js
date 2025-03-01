import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActionSheetIOS,
  Modal,
  Dimensions,
} from "react-native";
import { storage } from "../storage/asyncStorage";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { generatePDF } from "../components/ExportTripPDF.jsx";

export default function TripDetailsScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { tripId, collectionId } = route.params;
  const [trip, setTrip] = useState(null);
  const [collection, setCollection] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [cloneConfirmVisible, setCloneConfirmVisible] = useState(false);

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
    console.log("tripData", tripData.shops);
    let gpaySum = 0;
    let cashSum = 0;
    for (let i = 0; i < tripData.shops?.length; i++) {
      gpaySum += parseFloat(tripData.shops[i].gpayAmount);
      cashSum += parseFloat(tripData.shops[i].cashAmount);
    }
    setTrip({ ...tripData, gpaySum, cashSum });

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
    setModalVisible(true);
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
              await storage.deleteTripFromCollection(collectionId, tripId);
              navigation.goBack();
            } catch (error) {
              Alert.alert("Error", "Failed to delete trip");
            }
          },
        },
      ]
    );
  };

  const handleShopPress = (shop) => {
    if (trip.isCloned) {
      // For cloned trips, directly go to edit mode
      navigation.navigate("UpdateShop", {
        shopId: shop.id,
        initialData: shop,
        collectionId,
        tripId: trip.id,
        onUpdate: async (updateData) => {
          try {
            console.log("triptriptrip", trip);
            const updatedTrip = {
              ...trip,
              totalAmount: trip.shops.reduce(
                (sum, s) => sum + (parseFloat(s.amount) || 0)
              ),
              shops: trip.shops.map((s) =>
                s.id === shop.id ? { ...s, ...updateData, isUpdated: true } : s
              ),
            };
            // Recalculate trip totals
            updatedTrip.totalAmount = updatedTrip.shops.reduce(
              (sum, s) => sum + (parseFloat(s.amount) || 0),
              0
            );
            updatedTrip.gpaySum = updatedTrip.shops.reduce(
              (sum, s) => sum + (parseFloat(s.gpayAmount) || 0),
              0
            );
            updatedTrip.cashSum = updatedTrip.shops.reduce((sum, s) => {
              if (s.gpayAmount == 0 && s.cashAmount == 0 && s.amount) {
                return sum + parseFloat(s.amount);
              }
              return sum + (parseFloat(s.cashAmount) || 0);
            }, 0);

            await storage.updateTripInCollection(
              collectionId,
              trip.id,
              updatedTrip
            );
            loadTripDetails();
          } catch (error) {
            console.error("Error updating shop in cloned trip:", error);
            Alert.alert("Error", "Failed to update amount");
          }
        },
      });
    } else {
      // For original trips, show clone confirmation
      setSelectedShop(shop);
      setCloneConfirmVisible(true);
    }
  };

  const createTripClone = async () => {
    try {
      if (!selectedShop) return;

      // Create a clone of the trip with original totals
      const clonedTrip = {
        ...trip,
        id: Date.now().toString(),
        name: `Copy of ${trip.name || ""}`.trim(),
        startTime: trip.startTime,
        endTime: trip.endTime,
        isCloned: true,
        originalTripId: trip.id,
        // Keep original totals
        totalAmount: trip.totalAmount,
        gpaySum: trip.gpaySum,
        cashSum: trip.cashSum,
      };

      // Add the cloned trip to the collection
      await storage.addTripToCollection(collectionId, clonedTrip);

      // Navigate to UpdateShop with the cloned trip
      navigation.navigate("UpdateShop", {
        shopId: selectedShop.id,
        initialData: selectedShop,
        collectionId,
        tripId: clonedTrip.id,
        onUpdate: async (updateData) => {
          try {
            const collection = await storage.getCollectionById(collectionId);
            let latestClonedTrip = collection.trips.find(
              (t) => t.id === clonedTrip.id
            );

            if (latestClonedTrip) {
              latestClonedTrip.shops = latestClonedTrip.shops.map((shop) =>
                shop.id === selectedShop.id
                  ? { ...shop, ...updateData, isUpdated: true }
                  : shop
              );
              const cashTotal = latestClonedTrip.shops.reduce((sum, s) => {
                if (s.gpayAmount == 0 && s.cashAmount == 0 && s.amount) {
                  return sum + parseFloat(s.amount);
                }
                return sum + (parseFloat(s.cashAmount) || 0);
              }, 0);
              const gpayTotal = latestClonedTrip.shops.reduce((sum, s) => {
                if (s.gpayAmount == 0 && s.cashAmount == 0 && s.amount) {
                  return sum + parseFloat(s.amount);
                }
                return sum + (parseFloat(s.gpayAmount) || 0);
              }, 0);
              let updatedTrip = {
                ...latestClonedTrip,
                totalAmount: cashTotal + gpayTotal,
                cashSum: cashTotal,
                gpaySum: gpayTotal,
              };

              await storage.updateTripInCollection(
                collectionId,
                clonedTrip.id,
                updatedTrip
              );
              navigation.goBack();
              loadTripDetails();
            }
          } catch (error) {
            console.error("Error updating cloned trip:", error);
            Alert.alert("Error", "Failed to update amount in cloned trip");
          }
        },
      });
      setCloneConfirmVisible(false);
    } catch (error) {
      console.error("Error creating trip clone:", error);
      Alert.alert("Error", "Failed to create trip clone");
    }
  };

  const renderShopItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.shopItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleShopPress(item)}
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
          <View style={styles.statItem}>
            <Text style={styles.amount}>₹{item?.amount || 0}</Text>
            <Text style={styles.statLabel}>TOTAL</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.amount}>
              ₹{parseFloat(item?.gpayAmount) || 0}
            </Text>
            <Text style={styles.statLabel}>ONLINE</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.amount}>
              ₹
              {item?.gpayAmount == 0 &&
              item?.cashAmount == 0 &&
              item?.amount > 0
                ? parseFloat(item?.amount)
                : parseFloat(item?.cashAmount) || 0}
            </Text>
            <Text style={styles.statLabel}>CASH</Text>
          </View>

          {item.isClosed && <Text style={styles.closedTag}>CLOSED</Text>}
        </View>
        {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
        {item.previousAmounts && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Previous Collections:</Text>
            {item.previousAmounts.map((prev, index) => (
              <Text key={index} style={styles.historyItem}>
                {new Date(prev.date).toLocaleDateString()}: ₹{prev.amount}
                {prev.notes && ` - ${prev.notes}`}
              </Text>
            ))}
          </View>
        )}
      </View>
      {trip.isCloned && item.isUpdated && (
        <View style={styles.cloneBadge}>
          <Text
            style={[styles.cloneBadgeText, { color: theme.colors.primary }]}
          >
            Corrected
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (!trip) return null;

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
    historyContainer: {
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.background,
    },
    historyTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: theme.spacing.xs,
    },
    historyItem: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      marginBottom: theme.spacing.xs,
    },
    listContainer: {
      padding: theme.spacing.md,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    optionButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: theme.spacing.md,
    },
    optionText: {
      fontSize: 16,
      marginLeft: 10,
      color: theme.colors.text,
    },
    cancelButton: {
      padding: theme.spacing.md,
      alignItems: "center",
    },
    emptyContainer: {
      alignItems: "center",
      marginTop: theme.spacing.xl,
    },
    emptyText: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      marginBottom: theme.spacing.sm,
    },
    emptySubText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    // Clone modal styles
    cloneModalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    cloneModalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: Dimensions.get("window").height * 0.8,
    },
    cloneModalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    cloneModalTitle: {
      fontSize: 20,
      fontWeight: "600",
    },
    cloneModalBody: {
      marginBottom: 20,
    },
    cloneModalDescription: {
      fontSize: 16,
      marginBottom: 20,
      lineHeight: 22,
    },
    shopPreview: {
      padding: 15,
      borderRadius: 10,
      marginBottom: 20,
      backgroundColor: theme.colors.background,
    },
    shopPreviewTitle: {
      fontSize: 14,
      marginBottom: 5,
    },
    shopPreviewName: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 5,
    },
    shopPreviewAmount: {
      fontSize: 16,
    },
    cloneModalActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
    },
    cloneModalButton: {
      flex: 1,
      padding: 15,
      borderRadius: 8,
      alignItems: "center",
    },
    cancelButton: {
      borderWidth: 1,
      borderColor: "rgba(0, 0, 0, 0.1)",
    },
    confirmButton: {
      elevation: 2,
    },
    cloneButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
    cloneBadge: {
      position: "absolute",
      top: 0,
      right: 8,
      // paddingHorizontal: 8,
      // paddingVertical: 4,
      borderRadius: 4,
      backgroundColor: theme.colors.primaryLight,
    },
    cloneBadgeText: {
      fontSize: 12,
      fontWeight: "500",
    },
  });

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={styles.collectionName}>{collection?.name}</Text>
        <Text style={styles.tripTime}>
          {new Date(trip.startTime).toLocaleTimeString()} -{" "}
          {new Date(trip.endTime).toLocaleTimeString()}
        </Text>
        <Text style={styles.duration}>
          Duration: {formatDuration(trip.startTime, trip.endTime)}
        </Text>
      </View>

      <View
        style={[
          styles.statsContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{trip.visitedShops}</Text>
          <Text style={styles.statLabel}>Shops Visited</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            ₹{trip.isCloned ? trip.totalAmount : trip.totalAmount}
          </Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            ₹{trip.isCloned ? trip.gpaySum : trip.gpaySum}
          </Text>
          <Text style={styles.statLabel}>ONLINE</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            ₹{trip.isCloned ? trip.cashSum : trip.cashSum}
          </Text>
          <Text style={styles.statLabel}>CASH</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{trip.closedShops || 0}</Text>
          <Text style={styles.statLabel}>Shops Closed</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Visited Shops
      </Text>

      <FlatList
        data={trip.shops}
        renderItem={renderShopItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                setModalVisible(false);
                generatePDF(trip, collection);
              }}
            >
              <Ionicons
                name="share-outline"
                size={24}
                color={theme.colors.text}
              />
              <Text style={styles.optionText}>Share PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                setModalVisible(false);
                handleDeleteTrip();
              }}
            >
              <Ionicons
                name="trash-outline"
                size={24}
                color={theme.colors.error}
              />
              <Text style={[styles.optionText, { color: theme.colors.error }]}>
                Delete Trip
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.optionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={cloneConfirmVisible}
        onRequestClose={() => setCloneConfirmVisible(false)}
      >
        <TouchableOpacity
          style={styles.cloneModalOverlay}
          activeOpacity={1}
          onPress={() => setCloneConfirmVisible(false)}
        >
          <View
            style={[
              styles.cloneModalContent,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.cloneModalHeader}>
              <Text
                style={[styles.cloneModalTitle, { color: theme.colors.text }]}
              >
                Edit Collection Amount
              </Text>
              <TouchableOpacity onPress={() => setCloneConfirmVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.cloneModalBody}>
              <Text
                style={[
                  styles.cloneModalDescription,
                  { color: theme.colors.textSecondary },
                ]}
              >
                This will create a new trip with all the same details. The
                original trip will remain unchanged.
              </Text>

              <View style={styles.shopPreview}>
                <Text
                  style={[
                    styles.shopPreviewTitle,
                    { color: theme.colors.text },
                  ]}
                >
                  Selected Shop:
                </Text>
                <Text
                  style={[
                    styles.shopPreviewName,
                    { color: theme.colors.primary },
                  ]}
                >
                  {selectedShop?.name}
                </Text>
                <Text
                  style={[
                    styles.shopPreviewAmount,
                    { color: theme.colors.text },
                  ]}
                >
                  Current Amount: ₹{selectedShop?.amount || 0}
                </Text>
              </View>

              <View style={styles.cloneModalActions}>
                <TouchableOpacity
                  style={[styles.cloneModalButton, styles.cancelButton]}
                  onPress={() => setCloneConfirmVisible(false)}
                >
                  <Text
                    style={[
                      styles.cloneButtonText,
                      { color: theme.colors.text },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.cloneModalButton,
                    styles.confirmButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={createTripClone}
                >
                  <Text style={[styles.cloneButtonText, { color: "white" }]}>
                    Create & Edit
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
