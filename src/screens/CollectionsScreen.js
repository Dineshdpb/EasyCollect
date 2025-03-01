import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Button } from "../components/common/Button";
import { SearchBar } from "../components/common/SearchBar";
import Modal from "react-native-modal";
import { OnboardingGuide } from "../components/common/OnboardingGuide";
import { storage } from "../storage/asyncStorage";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { firstLaunch } from "../storage/firstLaunch";

export default function CollectionsScreen({ navigation }) {
  const [collections, setCollections] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme } = useTheme();
  const [isModalVisible, setModalVisible] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const loadCollections = async () => {
    try {
      const savedCollections = await storage.getCollections();
      setCollections(savedCollections);
    } catch (error) {
      console.error("Error loading collections:", error);
    }
  };

  const checkFirstLaunch = async () => {
    const isFirstLaunch = await firstLaunch.check();
    setShowOnboarding(isFirstLaunch);
  };

  useFocusEffect(
    useCallback(() => {
      loadCollections();
      checkFirstLaunch();
      return () => {};
    }, [])
  );

  const handleOnboardingClose = async () => {
    await firstLaunch.setLaunched();
    setShowOnboarding(false);
  };

  const handleStartTrip = () => {
    if (collections.length === 0) {
      navigation.navigate("AddCollection", {
        onAdd: loadCollections,
      });
    } else {
      setModalVisible(true);
    }
  };

  const handleCollectionSelect = (collection) => {
    setModalVisible(false);
    navigation.navigate("ActiveTrip", {
      collectionId: collection.id,
      collectionName: collection.name,
    });
  };

  const handleAddCollection = () => {
    navigation.navigate("AddCollection", {
      onAdd: loadCollections, // Pass the refresh callback
    });
  };

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const styles = getStyles(theme);

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
        <View style={styles.nameContainer}>
          <Ionicons
            name="folder-outline"
            size={24}
            color={theme.colors.primary}
            style={styles.collectionIcon}
          />
          <Text style={styles.collectionName}>{item.name}</Text>
        </View>
        <Text style={styles.shopCount}>
          <Ionicons name="business-outline" size={16} />{" "}
          {item.shops?.length || 0} shops
        </Text>
      </View>
      <View style={styles.collectionStats}>
        <Text style={styles.statsText}>
          <Ionicons name="time-outline" size={14} /> {item.trips?.length || 0}{" "}
          trips completed
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

  const renderCollectionForTrip = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.tripCollectionItem,
        { backgroundColor: theme.colors.surface },
      ]}
      onPress={() => handleCollectionSelect(item)}
    >
      <View style={styles.tripCollectionContent}>
        <Text style={[styles.tripCollectionName, { color: theme.colors.text }]}>
          {item.name}
        </Text>
        <Text
          style={[
            styles.tripCollectionShops,
            { color: theme.colors.textSecondary },
          ]}
        >
          {item.shops?.length || 0} shops
        </Text>
      </View>
      <Ionicons name="play-circle" size={24} color={theme.colors.primary} />
    </TouchableOpacity>
  );

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
            <Ionicons
              name="folder-open-outline"
              size={60}
              color={theme.colors.textSecondary}
              style={styles.emptyIcon}
            />
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              No collections yet
            </Text>
            <Text
              style={[
                styles.emptySubText,
                { color: theme.colors.textSecondary },
              ]}
            >
              Create your first collection to start{"\n"}managing your shop
              payments!
            </Text>
          </View>
        }
      />

      <Button
        title="Add New Collection"
        onPress={handleAddCollection}
        style={styles.addButton}
        icon="add-circle"
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.success || '#4CAF50' }]}
        onPress={handleStartTrip}
      >
        <View style={styles.fabContent}>
          <Ionicons name="walk" size={24} color="white" />
          <Text style={styles.fabText}>Start Trip</Text>
        </View>
      </TouchableOpacity>

      {/* Modal for Collection Selection */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onSwipeComplete={() => setModalVisible(false)}
        swipeDirection={["down"]}
        style={styles.modal}
        backdropOpacity={0.5}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              <Ionicons name="walk" size={24} /> Start Collection Trip
            </Text>
          </View>
          <FlatList
            data={collections}
            renderItem={renderCollectionForTrip}
            keyExtractor={(item) => item.id}
          />
        </View>
      </Modal>

      {/* Onboarding Guide */}
      <OnboardingGuide
        isVisible={showOnboarding}
        onClose={handleOnboardingClose}
      />
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    collectionItem: {
      borderRadius: 8,
      marginBottom: theme.spacing.md,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
    },
    collectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    nameContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    collectionIcon: {
      marginRight: theme.spacing.sm,
    },
    collectionName: {
      fontSize: 16,
      fontWeight: "500",
      marginBottom: 2,
      color: theme.colors.text,
    },
    shopCount: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    collectionStats: {
      marginTop: theme.spacing.sm,
    },
    statsText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    listContainer: {
      padding: theme.spacing.md,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
    },
    emptyIcon: {
      marginBottom: theme.spacing.md,
    },
    emptyText: {
      fontSize: 20,
      fontWeight: "600",
      marginBottom: theme.spacing.sm,
      textAlign: "center",
      color: theme.colors.text,
    },
    emptySubText: {
      fontSize: 16,
      textAlign: "center",
      color: theme.colors.textSecondary,
    },
    addButton: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      margin: 0,
      borderRadius: 0,
      paddingVertical: theme.spacing.lg,
    },
    fab: {
      position: "absolute",
      right: 16,
      bottom: 80,
      borderRadius: 25,
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    fabContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    fabText: {
      color: 'white',
      marginLeft: theme.spacing.sm,
      fontSize: 16,
      fontWeight: '500',
    },
    modal: {
      justifyContent: "flex-end",
      margin: 0,
    },
    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: theme.colors.surface,
    },
    modalHeader: {
      alignItems: "center",
      paddingVertical: 15,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 5,
      color: theme.colors.text,
    },
    tripCollectionItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tripCollectionContent: {
      flex: 1,
    },
    tripCollectionName: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.text,
    },
    tripCollectionShops: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
  });
