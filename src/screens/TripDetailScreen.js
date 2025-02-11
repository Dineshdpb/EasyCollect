import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ScrollView } from "react-native";
import { Button } from "../components/common/Button";
import { TabBar } from "../components/common/TabBar";
import { storage, TRIP_STATUS } from "../storage/asyncStorage";
import { theme } from "../theme";

export default function TripDetailScreen({ route, navigation }) {
  const { tripId } = route.params;
  const [trip, setTrip] = useState(null);
  const [activeTab, setActiveTab] = useState("shops");
  const [tripHistory, setTripHistory] = useState([]);

  useEffect(() => {
    loadTripDetails();
  }, []);

  const loadTripDetails = async () => {
    const trips = await storage.getTrips();
    const currentTrip = trips.find((t) => t.id === tripId);
    setTrip(currentTrip);

    // Load trip history
    if (currentTrip.history) {
      setTripHistory(currentTrip.history);
    }
  };

  const calculateStatistics = () => {
    if (!trip || !trip.shops) return null;

    const totalShops = trip.shops.length;
    const visitedShops = trip.shops.filter((shop) => shop.lastUpdated).length;
    const closedShops = trip.shops.filter((shop) => shop.isClosed).length;
    const totalAmount = trip.shops.reduce(
      (sum, shop) => sum + (shop.amount || 0),
      0
    );

    return {
      totalShops,
      visitedShops,
      closedShops,
      totalAmount,
      completionRate: totalShops
        ? ((visitedShops / totalShops) * 100).toFixed(1)
        : 0,
    };
  };

  const renderStatistics = () => {
    const stats = calculateStatistics();
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Trip Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₹{stats.totalAmount}</Text>
            <Text style={styles.statLabel}>Total Collection</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats.visitedShops}/{stats.totalShops}
            </Text>
            <Text style={styles.statLabel}>Shops Visited</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.closedShops}</Text>
            <Text style={styles.statLabel}>Shops Closed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.completionRate}%</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderShop = ({ item }) => (
    <View style={styles.shopItem}>
      <View style={styles.shopHeader}>
        <Text style={styles.shopName}>{item.name}</Text>
        <Text
          style={[
            styles.shopStatus,
            {
              color: item.isClosed ? theme.colors.error : theme.colors.success,
            },
          ]}
        >
          {item.isClosed ? "CLOSED" : item.lastUpdated ? "VISITED" : "PENDING"}
        </Text>
      </View>
      <Text style={styles.shopAddress}>{item.address}</Text>
      {item.amount > 0 && (
        <Text style={styles.shopAmount}>Collection: ₹{item.amount}</Text>
      )}
      {item.lastUpdated && (
        <Text style={styles.visitTime}>
          Last visited: {new Date(item.lastUpdated).toLocaleString()}
        </Text>
      )}
    </View>
  );

  const renderTripHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyDate}>
          {new Date(item.startTime).toLocaleDateString()} -
          {new Date(item.startTime).toLocaleTimeString()}
        </Text>
        <Text style={styles.historyDuration}>Duration: {item.duration}</Text>
      </View>
      <View style={styles.historySummary}>
        <Text style={styles.summaryText}>
          Visited: {item.visitedShops}/{item.totalShops} shops
        </Text>
        <Text style={styles.summaryText}>Collection: ₹{item.totalAmount}</Text>
      </View>
      <FlatList
        data={item.shops}
        renderItem={renderShop}
        keyExtractor={(shop) => shop.id}
        scrollEnabled={false}
      />
    </View>
  );

  const renderContent = () => {
    if (activeTab === "shops") {
      return (
        <FlatList
          data={trip?.shops || []}
          renderItem={renderShop}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No shops added to this trip yet.
            </Text>
          }
        />
      );
    } else {
      return (
        <FlatList
          data={tripHistory}
          renderItem={renderTripHistoryItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No trip history available yet.</Text>
          }
        />
      );
    }
  };

  const handleStartTrip = () => {
    if (trip.status === TRIP_STATUS.COMPLETED) {
      Alert.alert("Trip Completed", "This trip has already been completed.");
      return;
    }
    navigation.navigate("StartTrip", { tripId: trip.id });
  };

  if (!trip) return null;

  return (
    <View style={styles.container}>
      {renderStatistics()}
      <TabBar
        tabs={[
          { key: "shops", title: "Shops" },
          { key: "history", title: "Trip History" },
        ]}
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />
      {renderContent()}
      {activeTab === "shops" && trip.status !== TRIP_STATUS.COMPLETED && (
        <View style={styles.actionButtons}>
          <Button
            title="Start Trip"
            onPress={handleStartTrip}
            style={styles.startTripButton}
          />
          <Button
            title="Add Shop"
            onPress={() => navigation.navigate("AddShop", { tripId: trip.id })}
            style={styles.addButton}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  statsContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    borderRadius: 8,
  },
  statsTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    marginBottom: theme.spacing.md,
  },
  statValue: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  shopItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: 8,
  },
  shopHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  shopName: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
  shopStatus: {
    fontSize: 12,
    fontWeight: "bold",
  },
  shopAddress: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: theme.spacing.xs,
  },
  shopAmount: {
    color: theme.colors.success,
    fontSize: 16,
    fontWeight: "600",
    marginTop: theme.spacing.xs,
  },
  visitTime: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: theme.spacing.xs,
  },
  historyItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: 8,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  historyDate: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  historyDuration: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  historySummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  summaryText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  startTripButton: {
    flex: 2,
    backgroundColor: theme.colors.success,
  },
  addButton: {
    flex: 1,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: theme.spacing.xl,
  },
});
