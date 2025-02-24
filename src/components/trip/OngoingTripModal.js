import React, { useState } from "react";
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
  allShops,
  amount,
  setAmount,
  gpayAmount,
  cashAmount,
  setGpayAmount,
  setCashAmount,
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
  onShopChange,
  onSaveAndNext,
  doCurrentGetTotal,
}) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [currentShopIndex, setCurrentShopIndex] = useState(
    allShops?.findIndex((shop) => shop?.id === activeShop?.id)
  );

  const handlePrevious = () => {
    if (currentShopIndex > 0) {
      const newIndex = currentShopIndex - 1;
      setCurrentShopIndex(newIndex);
      onShopChange(allShops[newIndex]);
    }
  };
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
  const handleNext = () => {
    if (currentShopIndex < allShops.length - 1) {
      const newIndex = currentShopIndex + 1;
      setCurrentShopIndex(newIndex);
      onShopChange(allShops[newIndex]);
    }
  };

  const handleCurrentShop = () => {
    const pendingIndex = allShops.findIndex(
      (shop) => !currentTrip.shops.find((s) => s.id === shop.id)
    );
    if (pendingIndex !== -1) {
      setCurrentShopIndex(pendingIndex);
      onShopChange(allShops[pendingIndex]);
    }
  };

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

          <View style={styles.navigationContainer}>
            <TouchableOpacity
              onPress={handlePrevious}
              disabled={currentShopIndex === 0}
              style={[
                styles.navButton,
                currentShopIndex === 0 && styles.disabledButton,
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={
                  currentShopIndex === 0
                    ? theme.colors.textSecondary
                    : theme.colors.primary
                }
              />
              <Text
                style={[
                  styles.navButtonText,
                  {
                    color:
                      currentShopIndex === 0
                        ? theme.colors.textSecondary
                        : theme.colors.primary,
                  },
                ]}
              >
                Previous
              </Text>
            </TouchableOpacity>

            {currentShopIndex !==
              allShops.findIndex(
                (shop) => !currentTrip.shops.find((s) => s.id === shop.id)
              ) && (
              <TouchableOpacity
                onPress={handleCurrentShop}
                style={styles.currentButton}
              >
                <Text
                  style={[
                    styles.navButtonText,
                    { color: theme.colors.primary },
                  ]}
                >
                  Current Shop
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleNext}
              disabled={currentShopIndex === allShops.length - 1}
              style={[
                styles.navButton,
                currentShopIndex === allShops.length - 1 &&
                  styles.disabledButton,
              ]}
            >
              <Text
                style={[
                  styles.navButtonText,
                  {
                    color:
                      currentShopIndex === allShops.length - 1
                        ? theme.colors.textSecondary
                        : theme.colors.primary,
                  },
                ]}
              >
                Next
              </Text>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={
                  currentShopIndex === allShops.length - 1
                    ? theme.colors.textSecondary
                    : theme.colors.primary
                }
              />
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

            <View>
              <Text
                style={{
                  color: theme.colors.text,
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
                    style={[
                      styles.input,
                      {
                        color: theme.colors.text,
                        backgroundColor: theme.colors.background,
                      },
                    ]}
                    onChangeText={setCashAmount}
                    value={cashAmount}
                    keyboardType="numeric"
                    placeholder="CASH "
                    placeholderTextColor={theme.colors.textSecondary}
                  ></TextInput>
                </View>
                <View
                  style={[
                    {
                      flexDirection: "column",
                      flex: 1,
                      padding: theme.spacing.sm,
                      gap: 5,
                    },
                  ]}
                >
                  <Text style={{ color: theme.colors.text }}>
                    ONLINE AMOUNT
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: theme.colors.text,
                        backgroundColor: theme.colors.background,
                      },
                    ]}
                    onChangeText={setGpayAmount}
                    value={gpayAmount}
                    keyboardType="numeric"
                    placeholder="ONLINE"
                    placeholderTextColor={theme.colors.textSecondary}
                  ></TextInput>
                </View>
              </View>
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
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
  currentButton: {
    padding: 8,
  },
});
