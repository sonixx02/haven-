// components/SignIn.js (your existing sign-in code)
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';

export default function SignIn() {
  const [activeTab, setActiveTab] = useState('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dummyUser = {
    email: 'user@example.com',
    password: 'password123',
  };

  const onSubmit = () => {
    if (activeTab === 'signIn') {
      if (email === dummyUser.email && password === dummyUser.password) {
        // Navigate to the Dashboard on successful sign-in
        Alert.alert('Login Successful', 'Welcome to Apkaraksha App!');
        // Replace the Alert with navigation to Dashboard
        navigation.navigate('Dashboard'); // Pass navigation as a prop
      } else {
        Alert.alert('Login Failed', 'Invalid email or password.');
      }
    } else {
      Alert.alert('Sign Up', 'Sign Up clicked (implement your logic here)');
    }
  };

  return (
    <View style={styles.container}>
      {/* ... (existing code) */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={onSubmit}
      >
        <Text style={styles.submitButtonText}>
          {activeTab === 'signIn' ? 'Sign In' : 'Sign Up'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Add styles here...
