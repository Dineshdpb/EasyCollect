import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import { Button } from "../components/common/Button";
import { useTheme } from "../context/ThemeContext";
import { storage } from "../storage/asyncStorage";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

export default function UpdateShopScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { shopId, onUpdate, initialData, collectionId } = route.params;
  const [activeTab, setActiveTab] = useState("update");
  const [amount, setAmount] = useState(
    initialData?.amount ? initialData?.amount?.toString() || "" : ""
  );

  const cashInputRef = useRef(null);
  const onlineInputRef = useRef(null);

  const [notes, setNotes] = useState(initialData?.notes || "");
  const [isClosed, setIsClosed] = useState(initialData?.isClosed || false);
  const [gpayAmount, setGpayAmount] = useState(
    initialData?.gpayAmount ? initialData?.gpayAmount?.toString() || "" : ""
  );
  const [cashAmount, setCashAmount] = useState(
    initialData?.cashAmount ? initialData?.cashAmount?.toString() || "" : ""
  );
  const [paymentMethod, setPaymentMethod] = useState(
    initialData?.paymentMethod || "CASH"
  );
  const [shopHistory, setShopHistory] = useState([]);

  useEffect(() => {
    loadShopHistory();
  }, []);

  useEffect(() => {
    // Focus cash amount input by default
    if (cashInputRef.current) {
      cashInputRef.current.focus();
    }
  }, []);

  const loadShopHistory = async () => {
    try {
      const collection = await storage.getCollectionById(collectionId);
      if (!collection) {
        console.warn("Collection not found");
        return;
      }

      // Get all visits from completed trips
      const allVisits = collection.trips
        .filter((trip) => trip.status === "COMPLETED")
        .flatMap((trip) => {
          const shopVisit = trip.shops.find((s) => s.id === shopId);
          if (shopVisit) {
            return [
              {
                ...shopVisit,
                tripDate: trip.startTime,
                tripId: trip.id,
              },
            ];
          }
          return [];
        })
        .sort((a, b) => new Date(b.visitTime) - new Date(a.visitTime));

      setShopHistory(allVisits);
    } catch (error) {
      console.warn("Error loading shop history:", error);
      setShopHistory([]);
    }
  };

  const handleSubmit = () => {
    const onlineAmountTemp = gpayAmount ? parseFloat(gpayAmount) : 0;
    const cashAmountTemp = cashAmount ? parseFloat(cashAmount) : 0;
    const updateData = {
      amount: doGetTotal(),
      gpayAmount: onlineAmountTemp,
      cashAmount: cashAmountTemp,
      notes: notes.trim(),
      isClosed,
      paymentMethod,
      visitTime: new Date().toISOString(),
    };

    onUpdate(updateData);
    navigation.goBack();
  };

  const handleCashSubmit = () => {
    // When cash amount is submitted, focus online amount
    if (onlineInputRef.current) {
      onlineInputRef.current.focus();
    }
  };

  const handleOnlineSubmit = () => {
    // When online amount is submitted, call handleSubmit
    handleSubmit();
  };

  const styles = getStyles(theme);
  const doGetTotal = () => {
    let sum = 0;
    if (parseFloat(gpayAmount) > 0) {
      sum += parseFloat(gpayAmount);
    }
    if (parseFloat(cashAmount) > 0) {
      sum += parseFloat(cashAmount);
    }
    return sum;
  };
  const renderUpdateForm = () => (
    <View>
      <View style={styles.inputGroup}>
        <Text
          style={{
            color: theme.colors.text,
            justifyContent: "center",
            textAlign: "center",
            fontSize: 18,
          }}
        >
          Total Amount: {doGetTotal()}
        </Text>
      </View>
      <View style={styles.inputGroup}>
        <View
          style={[
            {
              flexDirection: "row",
              paddingTop: 10,
              justifyContent: "space-between",
            },
          ]}
        >
          <View
            style={{
              flexDirection: "column",
              flex: 1,
              padding: theme.spacing.sm,
              gap: 5,
            }}
          >
            <Text style={{ color: theme.colors.text }}>CASH AMOUNT</Text>
            <TextInput
              ref={cashInputRef}
              style={[styles.input]}
              onChangeText={setCashAmount}
              value={cashAmount}
              keyboardType="numeric"
              placeholder="CASH"
              placeholderTextColor={theme.colors.textSecondary}
              returnKeyType="next"
              onSubmitEditing={handleCashSubmit}
              blurOnSubmit={false}
            />
          </View>
          <View
            style={{
              flexDirection: "column",
              flex: 1,
              padding: theme.spacing.sm,
              gap: 5,
            }}
          >
            <Text style={{ color: theme.colors.text }}>ONLINE AMOUNT</Text>
            <TextInput
              ref={onlineInputRef}
              style={[styles.input]}
              onChangeText={setGpayAmount}
              value={gpayAmount}
              keyboardType="numeric"
              placeholder="ONLINE"
              placeholderTextColor={theme.colors.textSecondary}
              returnKeyType="done"
              onSubmitEditing={handleOnlineSubmit}
            />
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add notes about the visit"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Shop Closed?</Text>
        <Switch
          value={isClosed}
          onValueChange={setIsClosed}
          trackColor={{ false: "#767577", true: theme.colors.error }}
          thumbColor={isClosed ? theme.colors.error : "#f4f3f4"}
        />
      </View>

      <KeyboardAvoidingView behavior="position">
        <Button
          title="Save"
          onPress={handleSubmit}
          style={styles.submitButton}
        />
      </KeyboardAvoidingView>
    </View>
  );

  const renderHistoryTab = () => (
    <View>
      {shopHistory.length > 0 ? (
        shopHistory.map((visit, index) => (
          <View key={index} style={styles.historyItem}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyDate}>
                {new Date(visit.tripDate).toLocaleDateString()}
              </Text>
              <Text style={styles.historyAmount}>₹{visit.amount || 0}</Text>
            </View>
            <View style={styles.historyDetails}>
              <Text style={styles.paymentMethod}>
                {visit.paymentMethod || "CASH"}
              </Text>
              {visit.isClosed && <Text style={styles.closedTag}>CLOSED</Text>}
            </View>
            {visit.notes && <Text style={styles.notes}>{visit.notes}</Text>}
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No collection history available</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "update" && styles.activeTab]}
          onPress={() => setActiveTab("update")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "update" && styles.activeTabText,
            ]}
          >
            Update
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.activeTab]}
          onPress={() => setActiveTab("history")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "history" && styles.activeTabText,
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContent}>
        {activeTab === "update" ? renderUpdateForm() : renderHistoryTab()}
      </View>
    </ScrollView>
  );
}

const getStyles = (theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  inputGroup: {
    // marginBottom: theme.spacing.lg,
  },
  label: {
    color: theme.colors.text,
    fontSize: 16,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    padding: theme.spacing.md,
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    height: 60,
    textAlignVertical: "top",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // marginBottom: theme.spacing.lg,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  paymentButtons: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  paymentButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  selectedPayment: {
    backgroundColor: theme.colors.primary,
  },
  paymentButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  historySection: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
  },
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyDate: {
    color: theme.colors.text,
    fontSize: 14,
  },
  historyAmount: {
    color: theme.colors.success,
    fontSize: 16,
    fontWeight: "600",
  },
  historyDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.xs,
  },
  paymentMethod: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  closedTag: {
    color: theme.colors.error,
    fontSize: 14,
    fontWeight: "600",
  },
  notes: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontStyle: "italic",
    marginTop: theme.spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xs,
  },
  tab: {
    flex: 1,
    padding: theme.spacing.sm,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: "500",
  },
  activeTabText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  tabContent: {
    flex: 1,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
  },
});
