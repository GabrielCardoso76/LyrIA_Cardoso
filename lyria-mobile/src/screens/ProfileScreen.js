import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const ProfileScreen = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [nome, setNome] = useState(user.nome);
  const [email, setEmail] = useState(user.email);
  const [image, setImage] = useState(null);
  const [personas, setPersonas] = useState({});
  const [selectedPersona, setSelectedPersona] = useState(user.persona_escolhida);

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const response = await api.get('/Lyria/personas');
        setPersonas(response.data.personas);
      } catch (error) {
        console.error('Erro ao buscar personas:', error);
      }
    };
    fetchPersonas();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('email', email);

    if (image) {
      const uriParts = image.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('foto_perfil', {
        uri: image,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });
    }

    try {
      const response = await api.put(`/Lyria/profile/${user.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.sucesso) {
        await api.put('/Lyria/PersonaEscolhida', { persona: selectedPersona });
        const updatedUser = { ...response.data.usuario, persona_escolhida: selectedPersona };
        updateUser(updatedUser);
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao atualizar o perfil.');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 20 }}>Perfil</Text>
      <Image
        source={{ uri: user.foto_url ? `${api.defaults.baseURL}${user.foto_url}` : 'https://via.placeholder.com/150' }}
        style={{ width: 150, height: 150, borderRadius: 75, alignSelf: 'center', marginBottom: 20 }}
      />
      <Button title="Escolher Foto de Perfil" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 100, height: 100, alignSelf: 'center', marginVertical: 10 }} />}
      <TextInput
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Picker
        selectedValue={selectedPersona}
        onValueChange={(itemValue) => setSelectedPersona(itemValue)}
      >
        {Object.keys(personas).map((key) => (
          <Picker.Item label={personas[key]} value={key} key={key} />
        ))}
      </Picker>
      <Button title="Atualizar Perfil" onPress={handleUpdate} />
    </View>
  );
};

export default ProfileScreen;
