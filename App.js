import { useEffect } from "react";
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
import { Alert } from "react-native";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const navigationRef = useNavigationContainerRef();
  const { theme } = useTheme();

  useEffect(() => {
    checkOngoingTrip();
  }, []);

  const checkOngoingTrip = async () => {
    try {
      const currentTrip = await storage.getCurrentTrip();
      if (currentTrip && currentTrip.status === TRIP_STATUS.IN_PROGRESS) {
        Alert.alert(
          "Ongoing Trip",
          "You have an unfinished collection trip. Would you like to continue?",
          [
            {
              text: "Continue",
              onPress: () => {
                if (navigationRef.current) {
                  navigationRef.current.navigate("ActiveTrip", {
                    collectionId: currentTrip.collectionId,
                    collectionName: currentTrip.collectionName,
                  });
                }
              },
            },
            {
              text: "End Trip",
              style: "destructive",
              onPress: async () => {
                await storage.clearCurrentTrip();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error checking ongoing trip:", error);
    }
  };

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
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
