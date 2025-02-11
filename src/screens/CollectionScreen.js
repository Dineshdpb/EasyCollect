import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Button } from "../components/common/Button";
import { TabBar } from "../components/common/TabBar";
import { storage, TRIP_STATUS } from "../storage/asyncStorage";
import { theme } from "../theme";

export default function CollectionScreen({ navigation }) {
  const [shops, setShops] = useState([]);
  const [activeTab, setActiveTab] = useState("shops");
  const [activeTrip, setActiveTrip] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const savedShops = await storage.getShops();
    setShops(savedShops);
    const currentTrip = await storage.getCurrentTrip();
    setActiveTrip(currentTrip);
  };

  const renderShop = ({ item }) => (
    <TouchableOpacity
      style={styles.shopItem}
      onPress={() => navigation.navigate("ShopDetails", { shopId: item.id })}
    >
      <View style={styles.shopHeader}>
        <Text style={styles.shopName}>{item.name}</Text>
        <Text style={styles.shopStatus}>
          {item.lastVisited
            ? "Last visit: " + new Date(item.lastVisited).toLocaleDateString()
            : "Never visited"}
        </Text>
      </View>
      <Text style={styles.shopAddress}>{item.address}</Text>
    </TouchableOpacity>
  );

  const handleStartTrip = async () => {
    if (activeTrip) {
      navigation.navigate("ActiveTrip", { tripId: activeTrip.id });
    } else {
      const newTrip = {
        id: Date.now().toString(),
        startTime: new Date().toISOString(),
        status: TRIP_STATUS.IN_PROGRESS,
        shops: [],
      };
      await storage.saveCurrentTrip(newTrip);
      setActiveTrip(newTrip);
      navigation.navigate("ActiveTrip", { tripId: newTrip.id });
    }
  };

  const renderContent = () => {
    if (activeTab === "shops") {
      return (
        <FlatList
          data={shops}
          renderItem={renderShop}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No shops added yet. Add your first shop!
            </Text>
          }
        />
      );
    } else {
      return (
        <Button
          title="View Trip History"
          onPress={() => navigation.navigate("TripHistory")}
          style={styles.historyButton}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {activeTrip ? (
          <Button
            title="Continue Trip"
            onPress={handleStartTrip}
            style={[
              styles.startButton,
              { backgroundColor: theme.colors.warning },
            ]}
          />
        ) : (
          <Button
            title="Start Trip"
            onPress={handleStartTrip}
            style={styles.startButton}
          />
        )}
      </View>

      <TabBar
        tabs={[
          { key: "shops", title: "Shops" },
          { key: "history", title: "History" },
        ]}
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />

      {renderContent()}

      {activeTab === "shops" && (
        <Button
          title="Add New Shop"
          onPress={() => navigation.navigate("AddShop")}
          style={styles.addButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
  },
  startButton: {
    backgroundColor: theme.colors.success,
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
  },
  shopName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  shopStatus: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  shopAddress: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginTop: theme.spacing.xs,
  },
  addButton: {
    margin: theme.spacing.md,
  },
  historyButton: {
    margin: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: theme.spacing.xl,
  },
});
