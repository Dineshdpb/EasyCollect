import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { storage, TRIP_STATUS } from "../storage/asyncStorage";
import { theme } from "../theme";

export default function TripHistoryScreen({ navigation }) {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    const allTrips = await storage.getTrips();
    // Sort trips by date, most recent first
    const sortedTrips = allTrips.sort(
      (a, b) => new Date(b.startTime) - new Date(a.startTime)
    );
    setTrips(sortedTrips);
  };

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
      onPress={() => navigation.navigate("TripDetails", { tripId: item.id })}
    >
      <View style={styles.tripHeader}>
        <Text style={styles.tripDate}>
          {new Date(item.startTime).toLocaleDateString()}
        </Text>
        <Text
          style={[
            styles.tripStatus,
            {
              color:
                item.status === TRIP_STATUS.COMPLETED
                  ? theme.colors.success
                  : theme.colors.warning,
            },
          ]}
        >
          {item.status}
        </Text>
      </View>

      <View style={styles.tripStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Duration</Text>
          <Text style={styles.statValue}>
            {formatDuration(item.startTime, item.endTime)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Shops</Text>
          <Text style={styles.statValue}>
            {item.shops?.length || 0} visited
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Collection</Text>
          <Text style={styles.statValue}>
            ₹
            {item.shops?.reduce((sum, shop) => sum + (shop.amount || 0), 0) ||
              0}
          </Text>
        </View>
      </View>

      {item.status === TRIP_STATUS.IN_PROGRESS && (
        <TouchableOpacity
          style={styles.resumeButton}
          onPress={() => navigation.navigate("ActiveTrip", { tripId: item.id })}
        >
          <Text style={styles.resumeButtonText}>Resume Trip</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        renderItem={renderTripItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No trips recorded yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tripItem: {
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: 8,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  tripDate: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  tripStatus: {
    fontSize: 14,
    fontWeight: "600",
  },
  tripStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
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
  resumeButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: 4,
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  resumeButtonText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: theme.spacing.xl,
  },
});
