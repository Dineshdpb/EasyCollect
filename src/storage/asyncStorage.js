import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  COLLECTIONS: "@collections",
  CURRENT_TRIP: "@current_trip",
};

export const TRIP_STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
};

export const storage = {
  // Collection Methods
  async getCollections() {
    try {
      const collections = await AsyncStorage.getItem(STORAGE_KEYS.COLLECTIONS);
      return collections ? JSON.parse(collections) : [];
    } catch (error) {
      console.error("Error getting collections:", error);
      return [];
    }
  },

  async saveCollections(collections) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.COLLECTIONS,
        JSON.stringify(collections)
      );
    } catch (error) {
      console.error("Error saving collections:", error);
    }
  },

  async getCollectionById(collectionId) {
    const collections = await this.getCollections();
    return collections.find((c) => c.id === collectionId);
  },

  async updateCollection(collectionId, updatedCollection) {
    try {
      const collections = await this.getCollections();
      const updatedCollections = collections.map((collection) =>
        collection.id === collectionId ? updatedCollection : collection
      );
      await this.saveCollections(updatedCollections);
    } catch (error) {
      console.error("Error updating collection:", error);
      throw error;
    }
  },

  // Shop Methods
  async addShopToCollection(collectionId, shop) {
    const collections = await this.getCollections();
    const updatedCollections = collections.map((collection) => {
      if (collection.id === collectionId) {
        return {
          ...collection,
          shops: [...(collection.shops || []), shop],
        };
      }
      return collection;
    });
    await this.saveCollections(updatedCollections);
  },

  async updateShopInCollection(collectionId, shopId, updateData) {
    const collections = await this.getCollections();
    const updatedCollections = collections.map((collection) => {
      if (collection.id === collectionId) {
        const updatedShops = collection.shops.map((shop) =>
          shop.id === shopId ? { ...shop, ...updateData } : shop
        );
        return { ...collection, shops: updatedShops };
      }
      return collection;
    });
    await this.saveCollections(updatedCollections);
  },

  // Trip Methods
  async getCurrentTrip() {
    try {
      const currentTrip = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_TRIP);
      return currentTrip ? JSON.parse(currentTrip) : null;
    } catch (error) {
      console.error("Error getting current trip:", error);
      return null;
    }
  },

  async saveCurrentTrip(tripData) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_TRIP,
        JSON.stringify(tripData)
      );
    } catch (error) {
      console.error("Error saving current trip:", error);
      throw error;
    }
  },

  async clearCurrentTrip() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_TRIP);
    } catch (error) {
      console.error("Error clearing current trip:", error);
      throw error;
    }
  },

  async addTripToCollection(collectionId, trip) {
    const collections = await this.getCollections();
    const updatedCollections = collections.map((collection) => {
      if (collection.id === collectionId) {
        return {
          ...collection,
          trips: [...(collection.trips || []), trip],
        };
      }
      return collection;
    });
    await this.saveCollections(updatedCollections);
  },

  async getCollectionTrips(collectionId) {
    const collection = await this.getCollectionById(collectionId);
    return collection?.trips || [];
  },

  async completeTrip(collectionId, tripId, tripData) {
    const collections = await this.getCollections();
    const updatedCollections = collections.map((collection) => {
      if (collection.id === collectionId) {
        const updatedTrips = [...(collection.trips || [])];
        const tripIndex = updatedTrips.findIndex((t) => t.id === tripId);

        if (tripIndex >= 0) {
          updatedTrips[tripIndex] = {
            ...updatedTrips[tripIndex],
            ...tripData,
            status: TRIP_STATUS.COMPLETED,
            endTime: new Date().toISOString(),
          };
        } else {
          updatedTrips.push({
            ...tripData,
            id: tripId,
            status: TRIP_STATUS.COMPLETED,
            endTime: new Date().toISOString(),
          });
        }

        return { ...collection, trips: updatedTrips };
      }
      return collection;
    });

    await this.saveCollections(updatedCollections);
    await this.saveCurrentTrip(null);
  },

  async updateTripInCollection(collectionId, tripId, updatedTrip) {
    try {
      const collections = await this.getCollections();
      const updatedCollections = collections.map((collection) => {
        if (collection.id === collectionId) {
          return {
            ...collection,
            trips: collection.trips.map((trip) =>
              trip.id === tripId ? updatedTrip : trip
            ),
          };
        }
        return collection;
      });
      await this.saveCollections(updatedCollections);
    } catch (error) {
      console.error("Error updating trip:", error);
      throw error;
    }
  },

  async deleteCollection(collectionId) {
    try {
      const collections = await this.getCollections();
      const updatedCollections = collections.filter(
        (collection) => collection.id !== collectionId
      );
      await this.saveCollections(updatedCollections);
    } catch (error) {
      console.error("Error deleting collection:", error);
      throw error;
    }
  },

  async deleteShopFromCollection(collectionId, shopId) {
    try {
      const collections = await this.getCollections();
      const updatedCollections = collections.map((collection) => {
        if (collection.id === collectionId) {
          return {
            ...collection,
            shops: collection.shops.filter((shop) => shop.id !== shopId),
          };
        }
        return collection;
      });
      await this.saveCollections(updatedCollections);
    } catch (error) {
      console.error("Error deleting shop:", error);
      throw error;
    }
  },

  async deleteTripFromCollection(collectionId, tripId) {
    try {
      const collections = await this.getCollections();
      const updatedCollections = collections.map((collection) => {
        if (collection.id === collectionId) {
          return {
            ...collection,
            trips: collection.trips.filter((trip) => trip.id !== tripId),
          };
        }
        return collection;
      });
      await this.saveCollections(updatedCollections);
    } catch (error) {
      console.error("Error deleting trip:", error);
      throw error;
    }
  },
};
