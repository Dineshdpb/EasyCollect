import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Text,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { TabBar } from "../components/common/TabBar";
import { CollectionShopsTab } from "../components/collection/CollectionShopsTab";
import { CollectionTripsTab } from "../components/collection/CollectionTripsTab";
import { storage } from "../storage/asyncStorage";
import { theme } from "../theme";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../components/common/Button";

export default function CollectionDetailScreen({ route, navigation }) {
  const { collectionId } = route.params;
  const [collection, setCollection] = useState(null);
  const [activeTab, setActiveTab] = useState("shops");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  const loadCollection = async () => {
    const collectionData = await storage.getCollectionById(collectionId);
    setCollection(collectionData);
    navigation.setOptions({
      title: collectionData.name,
      headerRight: () => (
        <TouchableOpacity onPress={showCollectionOptions}>
          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      ),
    });
  };

  const showCollectionOptions = () => {
    Alert.alert("Collection Options", "Choose an action", [
      {
        text: "Edit Name",
        onPress: () => {
          setNewCollectionName(collection?.name || "");
          setIsEditModalVisible(true);
        },
      },
      {
        text: "Delete Collection",
        onPress: handleDeleteCollection,
        style: "destructive",
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const handleEditCollection = async () => {
    if (!newCollectionName.trim()) {
      Alert.alert("Error", "Collection name cannot be empty");
      return;
    }

    try {
      const updatedCollection = {
        ...collection,
        name: newCollectionName.trim(),
      };
      await storage.updateCollection(collectionId, updatedCollection);
      setIsEditModalVisible(false);
      loadCollection();
    } catch (error) {
      Alert.alert("Error", "Failed to update collection name");
    }
  };

  const handleDeleteCollection = () => {
    Alert.alert(
      "Delete Collection",
      "Are you sure you want to delete this collection? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await storage.deleteCollection(collectionId);
              navigation.goBack();
            } catch (error) {
              Alert.alert("Error", "Failed to delete collection");
            }
          },
        },
      ]
    );
  };

  // Load when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCollection();
    }, [collectionId])
  );

  return (
    <View style={styles.container}>
      <TabBar
        tabs={[
          { key: "shops", title: "Shops" },
          { key: "history", title: "Trip History" },
        ]}
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />

      {activeTab === "shops" ? (
        <CollectionShopsTab
          collection={collection}
          onRefresh={loadCollection}
          navigation={navigation}
        />
      ) : (
        <CollectionTripsTab
          collection={collection}
          onRefresh={loadCollection}
          navigation={navigation}
        />
      )}

      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Collection Name</Text>
            <TextInput
              style={styles.input}
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              placeholder="Enter new name"
              placeholderTextColor={theme.colors.textSecondary}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setIsEditModalVisible(false)}
                style={styles.cancelButton}
              />
              <Button
                title="Save"
                onPress={handleEditCollection}
                style={styles.saveButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: theme.spacing.lg,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    padding: theme.spacing.md,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: theme.spacing.md,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.spacing.sm,
  },
  cancelButton: {
    backgroundColor: theme.colors.error,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
});
