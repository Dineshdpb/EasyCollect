import React from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../common/Button";

export function OngoingTripModal({
  visible,
  currentTrip,
  activeShop,
  amount,
  setAmount,
  notes,
  setNotes,
  isClosed,
  setIsClosed,
  paymentMethod,
  setPaymentMethod,
  onClose,
  onContinueTrip,
  onEndTrip,
  onSave,
}) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={styles.modalHeader}>
            <View style={styles.headerContent}>
              <Text
                style={[
                  styles.collectionTitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {currentTrip?.collectionName}
              </Text>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Current Shop
              </Text>
              <View style={styles.headerActions}>
                <Text
                  style={[
                    styles.collectionName,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {new Date().toLocaleDateString()}
                </Text>
                <TouchableOpacity onPress={onContinueTrip}>
                  <Text
                    style={[
                      styles.textButtonLabel,
                      { color: theme.colors.primary },
                    ]}
                  >
                    Go to Trip
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onEndTrip}>
                  <Text
                    style={[
                      styles.textButtonLabel,
                      { color: theme.colors.error },
                    ]}
                  >
                    End Trip
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            {activeShop && (
              <View style={styles.shopInfo}>
                <Text style={[styles.shopName, { color: theme.colors.text }]}>
                  {activeShop.name}
                </Text>
                <Text
                  style={[
                    styles.shopAddress,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {activeShop.address}
                </Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Amount
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                  },
                ]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Notes
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                  },
                ]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.paymentMethodContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Payment Method
              </Text>
              <View style={styles.paymentButtons}>
                <TouchableOpacity
                  style={[
                    styles.paymentButton,
                    paymentMethod === "CASH" && styles.selectedPayment,
                    {
                      backgroundColor:
                        paymentMethod === "CASH"
                          ? theme.colors.primary
                          : theme.colors.background,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => setPaymentMethod("CASH")}
                >
                  <Ionicons
                    name="cash-outline"
                    size={24}
                    color={
                      paymentMethod === "CASH"
                        ? theme.colors.buttonText
                        : theme.colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.paymentButtonText,
                      {
                        color:
                          paymentMethod === "CASH"
                            ? theme.colors.buttonText
                            : theme.colors.text,
                      },
                    ]}
                  >
                    CASH
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.paymentButton,
                    paymentMethod === "GPAY" && styles.selectedPayment,
                    {
                      backgroundColor:
                        paymentMethod === "GPAY"
                          ? theme.colors.primary
                          : theme.colors.background,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => setPaymentMethod("GPAY")}
                >
                  <FontAwesome5
                    name="google-pay"
                    size={24}
                    color={
                      paymentMethod === "GPAY"
                        ? theme.colors.buttonText
                        : theme.colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.paymentButtonText,
                      {
                        color:
                          paymentMethod === "GPAY"
                            ? theme.colors.buttonText
                            : theme.colors.text,
                      },
                    ]}
                  >
                    GPAY
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.switchContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Shop Closed?
              </Text>
              <Switch
                value={isClosed}
                onValueChange={setIsClosed}
                trackColor={{ false: "#767577", true: theme.colors.error }}
                thumbColor={isClosed ? theme.colors.error : "#f4f3f4"}
              />
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button
              title="Save & Continue"
              onPress={onSave}
              style={styles.saveButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (theme) => ({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    maxWidth: 500,
    borderRadius: 12,
    padding: 20,
    maxHeight: "90%",
    display: "flex",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerContent: {
    flex: 1,
    marginRight: 16,
  },
  headerActions: {
    flexDirection: "row",
    marginTop: 4,
    gap: 16,
  },
  modalScroll: {
    // flex: 1,
  },
  shopInfo: {
    marginBottom: 16,
  },
  shopName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  shopAddress: {
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  paymentMethodContainer: {
    marginBottom: 16,
  },
  paymentButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  paymentButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    elevation: 1,
  },
  selectedPayment: {
    backgroundColor: theme.colors.primary,
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: theme.colors.success,
  },
  collectionTitle: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "500",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  collectionName: {
    fontSize: 14,
  },
  textButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    padding: 8,
  },
});
