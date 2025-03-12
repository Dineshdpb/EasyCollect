import { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
} from "react-native";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CollectionsScreen from "./src/screens/CollectionsScreen";
import AddCollectionScreen from "./src/screens/AddCollectionScreen";
import CollectionDetailScreen from "./src/screens/CollectionDetailScreen";
import AddShopScreen from "./src/screens/AddShopScreen";
import ActiveTripScreen from "./src/screens/ActiveTripScreen";
import TripDetailsScreen from "./src/screens/TripDetailsScreen";
import ShopDetailsScreen from "./src/screens/ShopDetailsScreen";
import UpdateShopScreen from "./src/screens/UpdateShopScreen";
import EditShopScreen from "./src/screens/EditShopScreen";
import EditTripScreen from "./src/screens/EditTripScreen";
import { storage, TRIP_STATUS } from "./src/storage/asyncStorage";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { Button } from "./src/components/common/Button";

import { OngoingTripModal } from "./src/components/trip/OngoingTripModal";

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const { theme, isLoading } = useTheme();
  const navigationRef = useNavigationContainerRef();
  const [showTripModal, setShowTripModal] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [activeShop, setActiveShop] = useState(null);
  const [amount, setAmount] = useState("");
  const [gpayAmount, setGpayAmount] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isClosed, setIsClosed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [shops, setShops] = useState([]);

  useEffect(() => {
    checkOngoingTrip();
  }, []);

  const checkOngoingTrip = async () => {
    try {
      const currentTrip = await storage.getCurrentTrip();
      if (currentTrip && currentTrip.status === TRIP_STATUS.IN_PROGRESS) {
        setCurrentTrip(currentTrip);
        // Find the first pending shop
        const collection = await storage.getCollectionById(
          currentTrip.collectionId
        );
        const pendingShop = collection.shops.find(
          (shop) => !currentTrip.shops.find((s) => s.id === shop.id)
        );
        if (pendingShop) {
          setActiveShop(pendingShop);
          setShowTripModal(true);
          // Check if there's any saved data for this shop
          const savedShopData = currentTrip.shops.find(
            (s) => s.id === pendingShop.id
          );
          if (savedShopData) {
            setAmount(savedShopData.amount?.toString() || "");
            setGpayAmount(savedShopData.gpayAmount?.toString() || "");
            setCashAmount(savedShopData.cashAmount?.toString() || "");
            setNotes(savedShopData.notes || "");
            setIsClosed(savedShopData.isClosed || false);
            setPaymentMethod(savedShopData.paymentMethod || "CASH");
          } else {
            setGpayAmount("");
            setCashAmount("");
            setAmount("");
            setNotes("");
            setIsClosed(false);
            setPaymentMethod("CASH");
          }
        }
        setShops(collection.shops);
      }
    } catch (error) {
      console.error("Error checking ongoing trip:", error);
    }
  };

  const handleCloseModal = () => {
    setShowTripModal(false);
  };

  const handleContinueTrip = () => {
    setShowTripModal(false);
    if (navigationRef.current) {
      navigationRef.current.navigate("ActiveTrip", {
        collectionId: currentTrip.collectionId,
        collectionName: currentTrip.collectionName,
      });
    }
  };

  const handleEndTrip = async () => {
    try {
      await storage.clearCurrentTrip();
      setShowTripModal(false);
    } catch (error) {
      console.error("Error ending trip:", error);
    }
  };

  const doCurrentGetTotal = () => {
    let sum = 0;
    if (parseFloat(gpayAmount) > 0) {
      sum += parseFloat(gpayAmount);
    }
    if (parseFloat(cashAmount) > 0) {
      sum += parseFloat(cashAmount);
    }
    return sum;
  };
  const handleShopUpdate = async () => {
    try {
      const updateData = {
        amount: doCurrentGetTotal(),
        gpayAmount: gpayAmount,
        cashAmount: cashAmount,
        notes: notes.trim(),
        isClosed,
        paymentMethod,
        visitTime: new Date().toISOString(),
      };

      const updatedShops = [
        ...currentTrip.shops,
        { ...activeShop, ...updateData },
      ];
      const updatedTrip = {
        ...currentTrip,
        shops: updatedShops,
        visitedShops: updatedShops.length,
        totalAmount: updatedShops.reduce((sum, s) => sum + (s.amount || 0), 0),
      };

      await storage.saveCurrentTrip(updatedTrip);
      handleContinueTrip();
    } catch (error) {
      console.error("Error updating shop:", error);
    }
  };

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
      elevation: 5,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 20,
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
    collectionName: {
      fontSize: 14,
      marginTop: 4,
    },
    modalScroll: {
      maxHeight: "80%",
    },
    closeButton: {
      padding: 4,
    },
    textButtonsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 16,
      paddingHorizontal: 8,
    },
    textButton: {
      padding: 8,
      flex: 1,
      alignItems: "center",
    },
    textButtonLabel: {
      fontSize: 16,
      fontWeight: "600",
      fontSize: 14,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 16,
      textAlign: "center",
    },
    shopInfo: {
      marginBottom: 20,
    },
    shopName: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 4,
    },
    shopAddress: {
      fontSize: 14,
    },
    buttonContainer: {
      gap: 12,
    },
    continueButton: {
      marginTop: 8,
    },
    endButton: {
      marginTop: 8,
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
    saveButton: {
      backgroundColor: theme.colors.success,
    },
    goToTripButton: {
      backgroundColor: theme.colors.primary,
    },
  });

  const styles = getStyles(theme);

  if (isLoading) {
    return null; // Or return a loading component
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <StatusBar style={theme.dark ? "light" : "dark"} />
        <Stack.Navigator
          initialRouteName="Collections"
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
            headerTintColor: theme.colors.text,
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          <Stack.Screen
            name="Collections"
            component={CollectionsScreen}
            options={{ title: "Easy Collect" }}
          />
          <Stack.Screen
            name="AddCollection"
            component={AddCollectionScreen}
            options={{ title: "New Collection" }}
          />
          <Stack.Screen
            name="CollectionDetail"
            component={CollectionDetailScreen}
            options={({ route }) => ({ title: route.params.collectionName })}
          />
          <Stack.Screen
            name="AddShop"
            component={AddShopScreen}
            options={{ title: "Add New Shop" }}
          />
          <Stack.Screen
            name="ActiveTrip"
            component={ActiveTripScreen}
            options={{ title: "Active Trip" }}
          />
          <Stack.Screen
            name="TripDetails"
            component={TripDetailsScreen}
            options={{ title: "Trip Details" }}
          />
          <Stack.Screen
            name="ShopDetails"
            component={ShopDetailsScreen}
            options={{ title: "Shop Details" }}
          />
          <Stack.Screen
            name="UpdateShop"
            component={UpdateShopScreen}
            options={{ title: "Update Shop" }}
          />
          <Stack.Screen
            name="EditShop"
            component={EditShopScreen}
            options={{ title: "Edit Shop" }}
          />
          <Stack.Screen
            name="EditTrip"
            component={EditTripScreen}
            options={{ title: "Edit Trip Details" }}
          />
        </Stack.Navigator>

        <OngoingTripModal
          doCurrentGetTotal={doCurrentGetTotal}
          visible={showTripModal}
          currentTrip={currentTrip}
          activeShop={activeShop}
          allShops={shops}
          amount={amount}
          setAmount={setAmount}
          gpayAmount={gpayAmount}
          cashAmount={cashAmount}
          setGpayAmount={setGpayAmount}
          setCashAmount={setCashAmount}
          notes={notes}
          setNotes={setNotes}
          isClosed={isClosed}
          setIsClosed={setIsClosed}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          onClose={handleCloseModal}
          onContinueTrip={handleContinueTrip}
          onEndTrip={handleEndTrip}
          onSave={handleShopUpdate}
          onShopChange={(shop) => {
            setActiveShop(shop);
            // Check if this shop has been visited in current trip
            const visitedShop = currentTrip.shops.find((s) => s.id === shop.id);
            if (visitedShop) {
              // Load saved data
              setAmount(visitedShop.amount?.toString() || "");
              setNotes(visitedShop.notes || "");
              setIsClosed(visitedShop.isClosed || false);
              setPaymentMethod(visitedShop.paymentMethod || "CASH");
            } else {
              // Reset form for unvisited shops
              setAmount("");
              setNotes("");
              setIsClosed(false);
              setPaymentMethod("CASH");
            }
          }}
        />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AppContent />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </ThemeProvider>
  );
};

export default App;
