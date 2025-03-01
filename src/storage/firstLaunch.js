import AsyncStorage from '@react-native-async-storage/async-storage';

const FIRST_LAUNCH_KEY = '@EasyCollect:firstLaunch';

export const firstLaunch = {
  async isFirstLaunch() {
    try {
      const value = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
      return value === null;
    } catch (error) {
      console.error('Error checking first launch:', error);
      return false;
    }
  },

  async setLaunched() {
    try {
      await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'launched');
    } catch (error) {
      console.error('Error setting first launch:', error);
    }
  },

  // For testing purposes
  async reset() {
    try {
      await AsyncStorage.removeItem(FIRST_LAUNCH_KEY);
    } catch (error) {
      console.error('Error resetting first launch:', error);
    }
  },
};
