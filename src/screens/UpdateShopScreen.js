import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Button } from "../components/common/Button";
import { useTheme } from "../context/ThemeContext";

export default function UpdateShopScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { shopId, onUpdate, initialData } = route.params;
  const [activeTab, setActiveTab] = useState("update");
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [isClosed, setIsClosed] = useState(initialData?.isClosed || false);
  const [paymentMethod, setPaymentMethod] = useState(
    initialData?.paymentMethod || "CASH"
  );

  const handleSubmit = () => {
    const updateData = {
      amount: amount ? parseFloat(amount) : 0,
      notes: notes.trim(),
      isClosed,
      paymentMethod,
      visitTime: new Date().toISOString(),
    };

    onUpdate(updateData);
    navigation.goBack();
  };

  const styles = getStyles(theme);

  const renderUpdateForm = () => (
    <View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Collection Amount</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="Enter amount"
          placeholderTextColor={theme.colors.textSecondary}
        />
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

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Payment Method</Text>
        <View style={styles.paymentButtons}>
          <TouchableOpacity
            style={[
              styles.paymentButton,
              paymentMethod === "CASH" && styles.selectedPayment,
            ]}
            onPress={() => setPaymentMethod("CASH")}
          >
            <Text style={styles.paymentButtonText}>CASH</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paymentButton,
              paymentMethod === "GPAY" && styles.selectedPayment,
            ]}
            onPress={() => setPaymentMethod("GPAY")}
          >
            <Text style={styles.paymentButtonText}>GPAY</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Button title="Save" onPress={handleSubmit} style={styles.submitButton} />
    </View>
  );

  const renderHistoryTab = () => (
    <View>
      {initialData?.previousAmounts?.length > 0 ? (
        initialData.previousAmounts.map((prev, index) => (
          <View key={index} style={styles.historyItem}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyDate}>
                {new Date(prev.date).toLocaleDateString()}
              </Text>
              <Text style={styles.historyAmount}>₹{prev.amount || 0}</Text>
            </View>
            <View style={styles.historyDetails}>
              <Text style={styles.paymentMethod}>
                {prev.paymentMethod || "CASH"}
              </Text>
              {prev.isClosed && <Text style={styles.closedTag}>CLOSED</Text>}
            </View>
            {prev.notes && <Text style={styles.notes}>{prev.notes}</Text>}
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
    marginBottom: theme.spacing.lg,
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
    height: 100,
    textAlignVertical: "top",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
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
