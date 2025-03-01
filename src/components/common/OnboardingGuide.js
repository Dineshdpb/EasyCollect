import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

export const OnboardingGuide = ({ isVisible, onClose }) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Easy Collect! 👋',
      description: 'Your simple solution for managing shop collections and payment tracking.',
      icon: 'home-outline',
    },
    {
      title: 'Create Collections 📁',
      description: 'Start by creating a collection to group your shops. For example: "Downtown Shops" or "Weekly Collections".',
      icon: 'add-circle-outline',
    },
    {
      title: 'Add Shops 🏪',
      description: 'Add shops to your collections with their details. Each shop can track payment history and visit records.',
      icon: 'business-outline',
    },
    {
      title: 'Start Collection Trips 🚶‍♂️',
      description: 'Begin a collection trip to record payments from shops. Mark shops as visited, record amounts, and add notes.',
      icon: 'walk-outline',
    },
    {
      title: 'Track Everything 📊',
      description: 'View collection history, payment records, and shop statistics all in one place.',
      icon: 'stats-chart-outline',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    setCurrentStep(0);
    onClose();
  };

  const styles = getStyles(theme);

  return (
    <Modal
      isVisible={isVisible}
      style={styles.modal}
      backdropOpacity={0.8}
      animationIn="fadeIn"
      animationOut="fadeOut"
    >
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Ionicons
            name={steps[currentStep].icon}
            size={80}
            color={theme.colors.primary}
            style={styles.stepIcon}
          />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {steps[currentStep].title}
          </Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {steps[currentStep].description}
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      currentStep === index
                        ? theme.colors.primary
                        : theme.colors.border,
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.buttonContainer}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={[styles.button, styles.backButton]}
                onPress={handleBack}
              >
                <Text style={[styles.buttonText, { color: theme.colors.primary }]}>
                  Back
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.nextButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleNext}
            >
              <Text style={[styles.buttonText, { color: 'white' }]}>
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme) => StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    maxHeight: '80%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  stepIcon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  footer: {
    width: '100%',
    marginTop: 30,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  backButton: {
    backgroundColor: 'transparent',
  },
  nextButton: {
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
