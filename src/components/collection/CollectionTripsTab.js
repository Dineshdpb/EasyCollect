import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { SearchBar } from "../common/SearchBar";

export function CollectionTripsTab({ collection, navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const formatDuration = (startTime, endTime) => {
    if (!endTime) return "In Progress";
    const duration = new Date(endTime) - new Date(startTime);
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const filteredTrips = (collection?.trips || []).filter((trip) => {
    const tripDate = new Date(trip.startTime).toLocaleDateString();
    return (
      tripDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.totalAmount?.toString().includes(searchQuery)
    );
  });

  const renderTripItem = ({ item }) => {
    const tripDate = new Date(item.startTime);
    const formattedDate = tripDate.toLocaleDateString();
    const formattedTime = tripDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
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
          <View>
            <Text style={styles.tripDate}>{formattedDate}</Text>
            <Text style={styles.tripTime}>{formattedTime}</Text>
          </View>
          <Text style={styles.tripAmount}>₹{item.totalAmount || 0}</Text>
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
  };

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search trips..."
      />

      <FlatList
        data={(collection?.trips || []).sort(
          (a, b) => new Date(b.startTime) - new Date(a.startTime)
        )}
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

const getStyles = (theme) => ({
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
  tripTime: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: theme.spacing.xs,
  },
  tripAmount: {
    color: theme.colors.success,
    fontSize: 16,
    fontWeight: "600",
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
