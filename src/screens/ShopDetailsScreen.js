import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, FlatList } from "react-native";
import { storage } from "../storage/asyncStorage";
import { theme } from "../theme";

export default function ShopDetailsScreen({ route, navigation }) {
  const { shopId, collectionId } = route.params;
  const [shop, setShop] = useState(null);
  const [visitHistory, setVisitHistory] = useState([]);

  useEffect(() => {
    loadShopDetails();
  }, []);

  const loadShopDetails = async () => {
    const collection = await storage.getCollectionById(collectionId);
    const shopData = collection.shops.find((s) => s.id === shopId);
    setShop(shopData);
    navigation.setOptions({ title: shopData.name });

    // Get visit history from all trips
    const shopVisits = collection.trips
      .flatMap((trip) =>
        trip.shops
          .filter((s) => s.id === shopId)
          .map((s) => ({
            ...s,
            tripId: trip.id,
            tripDate: trip.startTime,
          }))
      )
      .sort((a, b) => new Date(b.visitTime) - new Date(a.visitTime));

    setVisitHistory(shopVisits);
  };

  const renderVisitItem = ({ item }) => (
    <View style={styles.visitItem}>
      <View style={styles.visitHeader}>
        <Text style={styles.visitDate}>
          {new Date(item.visitTime).toLocaleDateString()}
        </Text>
        <Text style={styles.visitTime}>
          {new Date(item.visitTime).toLocaleTimeString()}
        </Text>
      </View>

      <View style={styles.visitDetails}>
        <Text style={styles.amount}>Collection: ₹{item.amount || 0}</Text>
        {item.isClosed && <Text style={styles.closedTag}>CLOSED</Text>}
      </View>

      {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
    </View>
  );

  if (!shop) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.shopName}>{shop.name}</Text>
        <Text style={styles.shopAddress}>{shop.address}</Text>
        {shop.notes && <Text style={styles.shopNotes}>{shop.notes}</Text>}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{visitHistory.length}</Text>
          <Text style={styles.statLabel}>Total Visits</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            ₹{visitHistory.reduce((sum, visit) => sum + (visit.amount || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Total Collection</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {visitHistory.filter((v) => v.isClosed).length}
          </Text>
          <Text style={styles.statLabel}>Times Closed</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Visit History</Text>

      <FlatList
        data={visitHistory}
        renderItem={renderVisitItem}
        keyExtractor={(item, index) => `${item.tripId}-${index}`}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No visits recorded yet.</Text>
        }
      />
    </ScrollView>
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
  },
  shopName: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: theme.spacing.xs,
  },
  shopAddress: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    marginBottom: theme.spacing.xs,
  },
  shopNotes: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontStyle: "italic",
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
  visitItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: 8,
  },
  visitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  visitDate: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  visitTime: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  visitDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amount: {
    color: theme.colors.success,
    fontSize: 16,
    fontWeight: "600",
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
    marginTop: theme.spacing.sm,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: theme.spacing.xl,
  },
});
