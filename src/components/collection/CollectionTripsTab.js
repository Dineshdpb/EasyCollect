import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { theme } from "../../theme";

export function CollectionTripsTab({ collection, navigation }) {
  const formatDuration = (startTime, endTime) => {
    if (!endTime) return "In Progress";
    const duration = new Date(endTime) - new Date(startTime);
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const renderTripItem = ({ item }) => (
    <TouchableOpacity
      style={styles.tripItem}
      onPress={() =>
        navigation.navigate("TripDetails", {
          tripId: item.id,
          collectionId: collection.id,
        })
      }
    >
      <View style={styles.tripHeader}>
        <Text style={styles.tripDate}>
          {new Date(item.startTime).toLocaleDateString()}
        </Text>
        <Text style={styles.tripDuration}>
          {formatDuration(item.startTime, item.endTime)}
        </Text>
      </View>

      <View style={styles.tripStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Shops Visited</Text>
          <Text style={styles.statValue}>
            {item.visitedShops}/{item.totalShops}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Collection</Text>
          <Text style={styles.statValue}>₹{item.totalAmount || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Closed Shops</Text>
          <Text style={styles.statValue}>{item.closedShops || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={collection?.trips || []}
        renderItem={renderTripItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No collection trips yet.</Text>
            <Text style={styles.emptySubText}>
              Start a trip to begin collecting!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  tripItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: 8,
    marginBottom: theme.spacing.md,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  tripDate: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  tripDuration: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  tripStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
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
