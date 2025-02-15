import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Button } from "../components/common/Button";
import { storage } from "../storage/asyncStorage";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { SearchBar } from "../components/common/SearchBar";

export default function CollectionsScreen({ navigation }) {
  const [collections, setCollections] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { isDarkMode, toggleTheme, theme } = useTheme();

  const loadCollections = async () => {
    const savedCollections = await storage.getCollections();
    setCollections(savedCollections);
  };

  // Load when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCollections();
    }, [])
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRight}>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>
      ),
    });
  }, [isDarkMode]);

  const handleAddCollection = () => {
    navigation.navigate("AddCollection", {
      onAdd: loadCollections, // Pass the refresh callback
    });
  };

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCollectionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.collectionItem}
      onPress={() =>
        navigation.navigate("CollectionDetail", {
          collectionId: item.id,
          collectionName: item.name,
        })
      }
    >
      <View style={styles.collectionHeader}>
        <Text style={styles.collectionName}>{item.name}</Text>
        <Text style={styles.shopCount}>{item.shops?.length || 0} shops</Text>
      </View>
      <View style={styles.collectionStats}>
        <Text style={styles.statsText}>
          {item.trips?.length || 0} trips completed
        </Text>
        <Text style={styles.statsText}>
          Last trip:{" "}
          {item.trips?.length
            ? new Date(
                item.trips[item.trips.length - 1].endTime
              ).toLocaleDateString()
            : "Never"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search collections..."
      />

      <FlatList
        data={filteredCollections}
        renderItem={renderCollectionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No collections yet.</Text>
            <Text style={styles.emptySubText}>
              Add your first collection to get started!
            </Text>
          </View>
        }
      />
      <Button
        title="Add New Collection"
        onPress={handleAddCollection}
        style={styles.addButton}
      />
    </View>
  );
}

const getStyles = (theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  collectionItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: 8,
    marginBottom: theme.spacing.md,
  },
  collectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  collectionName: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
  shopCount: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  collectionStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statsText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
  },
});
