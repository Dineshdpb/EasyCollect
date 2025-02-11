import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
} from "react-native";
import { Button } from "../components/common/Button";
import { storage, TRIP_STATUS } from "../storage/asyncStorage";
import { theme } from "../theme";

export default function TripScreen({ navigation }) {
  const [sections, setSections] = useState([]);
  const [pendingTrips, setPendingTrips] = useState([]);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    const groupedTrips = await storage.getTripsByDate();
    const pending = await storage.getPendingTrips();

    // Convert grouped trips to sections
    const tripSections = Object.keys(groupedTrips)
      .sort((a, b) => new Date(b) - new Date(a))
      .map((date) => ({
        title: formatDate(date),
        data: groupedTrips[date],
      }));

    setSections(tripSections);
    setPendingTrips(pending);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTripSummary = (trip) => {
    const totalShops = trip.shops.length;
    const closedShops = trip.shops.filter((shop) => shop.isClosed).length;
    const totalAmount = trip.shops.reduce(
      (sum, shop) => sum + (shop.amount || 0),
      0
    );

    return `${totalShops} shops, ${closedShops} closed • ₹${totalAmount}`;
  };

  const renderTripItem = ({ item }) => (
    <TouchableOpacity
      style={styles.tripItem}
      onPress={() => navigation.navigate("TripDetail", { tripId: item.id })}
    >
      <Text style={styles.tripName}>{item.name}</Text>
      <Text style={styles.tripSummary}>{getTripSummary(item)}</Text>
    </TouchableOpacity>
  );

  const renderPendingTrips = () => {
    if (pendingTrips.length === 0) return null;

    return (
      <View style={styles.pendingSection}>
        <Text style={styles.sectionHeader}>Pending Trips</Text>
        {pendingTrips.map((trip) => (
          <TouchableOpacity
            key={trip.id}
            style={[styles.tripItem, styles.pendingTripItem]}
            onPress={() =>
              navigation.navigate("TripDetail", { tripId: trip.id })
            }
          >
            <Text style={styles.tripName}>{trip.name}</Text>
            <Text style={styles.tripStatus}>
              {trip.status === TRIP_STATUS.IN_PROGRESS
                ? "In Progress"
                : "Pending"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderPendingTrips()}
      <SectionList
        sections={sections}
        renderItem={renderTripItem}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={true}
      />
      <Button
        title="Add New Trip"
        onPress={() => navigation.navigate("AddTrip")}
        style={styles.addButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  pendingSection: {
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "bold",
    padding: theme.spacing.md,
  },
  tripItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  pendingTripItem: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  tripName: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: theme.spacing.xs,
  },
  tripSummary: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  tripStatus: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  addButton: {
    margin: theme.spacing.md,
  },
});
