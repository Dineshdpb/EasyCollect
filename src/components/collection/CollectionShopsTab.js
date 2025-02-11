import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActionSheetIOS,
} from "react-native";
import { Button } from "../common/Button";
import { theme } from "../../theme";

export function CollectionShopsTab({ collection, onRefresh, navigation }) {
  const handleAddShop = () => {
    navigation.navigate("AddShop", {
      collectionId: collection.id,
      onAdd: onRefresh,
    });
  };

  const handleStartTrip = () => {
    if (!collection?.shops?.length) {
      Alert.alert(
        "No Shops",
        "Please add shops to this collection before starting a trip."
      );
      return;
    }

    navigation.navigate("ActiveTrip", {
      collectionId: collection.id,
      collectionName: collection.name,
    });
  };

  const renderShopItem = ({ item }) => (
    <TouchableOpacity
      style={styles.shopItem}
      onPress={() => showShopOptions(item)}
    >
      <View style={styles.shopHeader}>
        <Text style={styles.shopName}>{item.name}</Text>
        {item.lastVisited && (
          <Text style={styles.lastVisited}>
            Last visit: {new Date(item.lastVisited).toLocaleDateString()}
          </Text>
        )}
      </View>
      <Text style={styles.shopAddress}>{item.address}</Text>
      {item.lastAmount > 0 && (
        <Text style={styles.lastAmount}>
          Last collection: ₹{item.lastAmount}
        </Text>
      )}
    </TouchableOpacity>
  );

  const showShopOptions = (shop) => {
    Alert.alert("Shop Options", "Choose an action", [
      {
        text: "Edit Shop",
        onPress: () =>
          navigation.navigate("EditShop", {
            shop,
            collectionId: collection.id,
            onUpdate: onRefresh,
          }),
      },
      {
        text: "Delete Shop",
        onPress: () => handleDeleteShop(shop),
        style: "destructive",
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const handleDeleteShop = (shop) => {
    Alert.alert(
      "Delete Shop",
      "Are you sure you want to delete this shop? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await storage.deleteShopFromCollection(collection.id, shop.id);
              onRefresh();
            } catch (error) {
              Alert.alert("Error", "Failed to delete shop");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Start Collection Trip"
          onPress={handleStartTrip}
          style={styles.startButton}
        />
      </View>

      <FlatList
        data={collection?.shops || []}
        renderItem={renderShopItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No shops added to this collection.
            </Text>
            <Text style={styles.emptySubText}>
              Add shops to start collecting!
            </Text>
          </View>
        }
      />

      <Button
        title="Add New Shop"
        onPress={handleAddShop}
        style={styles.addButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.md,
  },
  startButton: {
    backgroundColor: theme.colors.success,
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
    marginBottom: theme.spacing.xs,
  },
  shopName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  lastVisited: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  shopAddress: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  lastAmount: {
    color: theme.colors.success,
    fontSize: 14,
    marginTop: theme.spacing.xs,
  },
  addButton: {
    margin: theme.spacing.md,
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
});
