import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput, Image, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/LyriaApi';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { user, updateUser, logout } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setEmail(user.email);
      // Assuming the user object has a `foto_perfil_url` property
      // and the api serves the files from the root.
      if (user.foto_perfil_url) {
        // This needs to be adjusted based on the actual base URL of the API
        setPreviewImage({ uri: `http://172.20.10.12:5001${user.foto_perfil_url}` });
      }
    }
  }, [user]);

  const handleImagePick = async () => {
    Alert.alert(
      "Selecionar Imagem",
      "Escolha uma opção",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Tirar Foto",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permissão necessária', 'Precisamos da sua permissão para acessar a câmera.');
              return;
            }
            let result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 1,
            });
            if (!result.canceled) {
              setProfileImage(result.assets[0]);
              setPreviewImage({ uri: result.assets[0].uri });
            }
          }
        },
        {
          text: "Escolher da Galeria",
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permissão necessária', 'Precisamos da sua permissão para acessar a galeria de fotos.');
              return;
            }
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaType.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 1,
            });
            if (!result.canceled) {
              setProfileImage(result.assets[0]);
              setPreviewImage({ uri: result.assets[0].uri });
            }
          }
        }
      ]
    );
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    const formData = new FormData();
    if (nome !== user.nome) formData.append('nome', nome);
    if (email !== user.email) formData.append('email', email);
    if (profileImage) {
        const uriParts = profileImage.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('foto_perfil', {
            uri: profileImage.uri,
            name: `photo.${fileType}`,
            type: `image/${fileType}`,
        });
    }

    if (formData._parts.length === 0) {
        Alert.alert('Nenhuma alteração', 'Nenhum dado foi alterado.');
        setIsLoading(false);
        return;
    }

    try {
        const response = await updateUserProfile(user.id, formData);
        if (response.sucesso) {
            Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
            updateUser(response.usuario);
        } else {
            Alert.alert('Erro', response.erro || 'Não foi possível atualizar o perfil.');
        }
    } catch (error) {
        Alert.alert('Erro', error.erro || 'Ocorreu um erro inesperado.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Erro', 'Por favor, preencha a senha atual e a nova senha.');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('senha', newPassword);
    // The backend should ideally verify the current password.
    // For this implementation, we are just sending the new one.

    try {
        const response = await updateUserProfile(user.id, formData);
        if (response.sucesso) {
            Alert.alert('Sucesso', 'Senha alterada com sucesso!');
            setCurrentPassword('');
            setNewPassword('');
        } else {
            Alert.alert('Erro', response.erro || 'Não foi possível alterar a senha.');
        }
    } catch (error) {
        Alert.alert('Erro', error.erro || 'Ocorreu um erro inesperado.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <Text style={styles.title}>Seu Perfil</Text>

        <TouchableOpacity onPress={handleImagePick} style={styles.avatarContainer}>
          {previewImage ? (
            <Image source={previewImage} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="camera" size={40} color="#c9b6f2" />
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={20} color="#f0f0f0" />
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Informações Pessoais</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Nome Completo"
          placeholderTextColor="#8e8e93"
        />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#8e8e93"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
          <Text style={styles.buttonText}>Salvar Alterações</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Alterar Senha</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Senha Atual"
          placeholderTextColor="#8e8e93"
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Nova Senha"
          placeholderTextColor="#8e8e93"
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Alterar Senha</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={logout}>
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A051E',
  },
  content: {
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  title: {
    color: '#f0f0f0',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6344a6',
    padding: 8,
    borderRadius: 15,
  },
  sectionTitle: {
    color: '#c9b6f2',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  button: {
    backgroundColor: '#6344a6',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#f0f0f0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 30,
  },
  logoutButton: {
    backgroundColor: '#a64463',
  },
});

export default ProfileScreen;
