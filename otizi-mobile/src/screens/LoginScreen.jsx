// src/screens/LoginScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, StatusBar, Dimensions, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import API from '../services/api';
import { useAuth } from '../store/authStore';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email.includes('@')) e.email = 'Email invalide';
    if (password.length < 6) e.password = 'Mot de passe trop court';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await API.post('/login', { email: email.trim(), password });
      await login(res.data.access_token, res.data.user);
    } catch (err) {
      console.error('Login error:', err);
      const serverMsg = err.response?.data?.msg;
      const errorDetail = err.message || '';
      // On affiche l'URL pour vérifier que le mobile essaie de contacter le bon serveur
      const fullUrl = API.defaults.baseURL + '/login';
      
      const msg = serverMsg || `Erreur technique.\n\nTentative sur: ${fullUrl}\n\nDétail: ${errorDetail}`;
      Alert.alert('Erreur de Connexion', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <View style={styles.container}>

          {/* Header simple sans logo */}
          <View style={styles.logoSection}>
            <Text style={styles.brand}>OtiZi</Text>
            <Text style={styles.tagline}>Gestion de Crédit Magasin</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.title}>Connexion</Text>
            <Text style={styles.subtitle}>Entrez vos identifiants pour continuer</Text>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrap, errors.email && styles.inputError]}>
                <Text style={styles.inputLabelIcon}>@</Text>
                <TextInput
                  style={styles.input}
                  placeholder="vous@exemple.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={[styles.inputWrap, errors.password && styles.inputError]}>
                <Text style={styles.inputLabelIcon}>*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  <Text style={styles.eyeIconText}>{showPass ? 'CACHE' : 'VOIR'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              style={styles.btnWrap}
            >
              <LinearGradient
                colors={['#a16207', '#ca8a04']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btn}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Se connecter →</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            {/* Demo hint */}

          </View>

          {/* Footer */}
          <Text style={styles.footer}>OtiZi · Sécurisé & Chiffré</Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(99,102,241,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.4)',
  },
  logoIconText: { fontSize: 24, fontWeight: '900', color: '#6366f1' },
  brand: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  brandAccent: { color: '#818cf8' },
  tagline: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 24,
  },
  fieldGroup: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    height: 52,
  },
  inputError: { borderColor: '#ef4444' },
  inputLabelIcon: { fontSize: 14, fontWeight: '900', color: '#94a3b8', marginRight: 10 },
  eyeIconText: { fontSize: 10, fontWeight: '800', color: '#94a3b8' },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '600',
  },
  eyeBtn: { padding: 4 },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  btnWrap: { marginTop: 8 },
  btn: {
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  demoBtn: { marginTop: 14, alignItems: 'center' },
  demoText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  footer: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 24,
  },
});
