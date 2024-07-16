import React, { useState } from 'react';
import { View, TextInput, Button, Text, 
    ActivityIndicator, Alert, StyleSheet,
    StatusBar,TouchableOpacity,Image } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import LoginContract from '../contracts/LoginContract';
// import md5 from 'md5';
import { WebView } from 'react-native-webview';
// import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-vector-icons/FontAwesome';


const Login = ({ navigation }) => {
    const [language, setLanguage] = useState('tr');
    const [depo,setDepo] = useState('selcuk');
    const [hesapKodu, setHesapKodu] = useState('');
    const [kullaniciAdi, setKullaniciAdi] = useState('');
    const [kullaniciSifre, setKullaniciSifre] = useState('');
    const [loading, setLoading] = useState(false);
  
    const handleLogin = () => {
        if (hesapKodu && kullaniciAdi && kullaniciSifre) {
            setLoading(true);
            setTimeout(async () => {
              setLoading(false);
      
              // Örnek LoginContract nesnesi
              const loginContract = new LoginContract(
                1, // userId
                'Eczane Adı', // eczaneadi
                'Eczacı Adı', // eczaciadi
                1, // subeId
                'https://webdepo.selcukecza.com.tr/Login.aspx', // loginUrl
                'https://webdepo.selcukecza.com.tr', // webdepourl
                '01', // firmakodu
                'Özel Bölge' // ozelbolge
              );

              await AsyncStorage.setItem('hesapkodu', hesapKodu);
              await AsyncStorage.setItem('kullaniciadi', kullaniciAdi);
              await AsyncStorage.setItem('kullanicisifre', kullaniciSifre);
              await AsyncStorage.setItem('loginContract', JSON.stringify(loginContract));
              
              navigation.replace('Main');
            }, 2000);
          } else {
            Alert.alert(texts[language].err, texts[language].pleasefillspace);
          }
    //   console.log('Login:', username, password);
    };
  
    const handleForgotPassword = () => {
      // Şifremi unuttum işlemleri burada yapılacak
      console.log('Forgot Password');
    };
  
    const handleUserGuide = () => {
      // Kullanım kılavuzu işlemleri burada yapılacak
      console.log('User Guide');
    };
  
    const handleSalesmanLogin = () => {
      // Plasiyer girişi işlemleri burada yapılacak
      console.log('Salesman Login');
    };
    

    const texts = {
      tr: {
        title: 'Selçuk Ecza Webdepo Login Form',
        login: 'Giriş',
        forgotPassword: 'Şifremi Unuttum',
        userGuide: 'Kullanım Kılavuzu',
        salesmanLogin: 'Plasiyer Girişi',
        username: 'Kullanıcı Adı',
        password: 'Şifre',
        accountCode : 'Hesap Kodu',
        err : 'Hata',
        pleasefillspace : 'Lütfen tüm alanları doldurun.',
      },
      en: {
        title: 'Selçuk Ecza Webdepo Login Form',
        login: 'Login',
        forgotPassword: 'Forgot Password',
        userGuide: 'User Guide',
        salesmanLogin: 'Salesman Login',
        username: 'Username',
        password: 'Password',
        accountCode: 'Account Code',
        err : 'Error',
        pleasefillspace : 'Please fill the space.'
      },
    };

    const logos = {
        selcuk :{
            path:require('../assets/selcukecza.png'),
        }
    }
  
    return (
      <View style={styles.container}>
        <Image
        source={logos[depo].path}/>
        <Text style={styles.title}>{texts[language].title}</Text>
  
        <View style={styles.languagePicker}>
          <Picker
            selectedValue={language}
            onValueChange={(itemValue) => setLanguage(itemValue)}
          >
            <Picker.Item label="Türkçe" value="tr" />
            <Picker.Item label="English" value="en" />
          </Picker>
        </View>
  
        <View style={styles.inputContainer}>
          <View style={styles.iconBackground}>
            <Icon name="plus" size={20} color="#000" style={styles.icon} />
          </View>
          <TextInput
            style={styles.input}
            placeholder={texts[language].accountCode}
            value={hesapKodu}
            onChangeText={setHesapKodu}
          />
        </View>
  
        <View style={styles.inputContainer}>
          <View style={styles.iconBackground}>
            <Icon name="user" size={20} color="#000" style={styles.icon} />
          </View>
          <TextInput
            style={styles.input}
            placeholder={texts[language].username}
            value={kullaniciAdi}
            onChangeText={setKullaniciAdi}
          />
        </View>
  
        <View style={styles.inputContainer}>
          <View style={styles.iconBackground}>
            <Icon name="lock" size={20} color="#000" style={styles.icon} />
          </View>
          <TextInput
            style={styles.input}
            placeholder={texts[language].password}
            value={kullaniciSifre}
            onChangeText={setKullaniciSifre}
            secureTextEntry
          />
        </View>
  
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>{texts[language].login}</Text>
        </TouchableOpacity>
  
        <View style={styles.hr} />
  
        <View style={styles.footerButtons}>
          <TouchableOpacity style={styles.footerButtonRed} onPress={handleForgotPassword}>
            <Text style={styles.footerButtonText}>{texts[language].forgotPassword}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButtonYellow} onPress={handleUserGuide}>
            <Text style={styles.footerButtonText}>{texts[language].userGuide}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButtonBlue} onPress={handleSalesmanLogin}>
            <Text style={styles.footerButtonText}>{texts[language].salesmanLogin}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    languagePicker: {
      width: '100%',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      marginBottom: 20,
      overflow: 'hidden',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      marginBottom: 10,
      padding: 5,
    },
    iconBackground: {
      backgroundColor: '#f1f1f1',
      padding: 5,
      borderRadius: 5,
    },
    icon: {
      marginRight: 10,
      marginLeft:10,
    },
    input: {
      flex: 1,
      height: 40,
      paddingLeft: 10,
    },
    loginButton: {
      backgroundColor: '#007bff',
      padding: 10,
      borderRadius: 5,
      width: '100%',
      alignItems: 'center',
      marginVertical: 10,
    },
    loginButtonText: {
      color: '#fff',
      fontSize: 16,
    },
    hr: {
      borderBottomColor: '#ccc',
      borderBottomWidth: 1,
      width: '100%',
      marginVertical: 10,
    },
    footerButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    footerButtonRed: {
      backgroundColor: '#dc3545',
      padding: 10,
      borderRadius: 5,
      flex: 1,
      alignItems: 'center',
      marginRight: 5,
    },
    footerButtonYellow: {
      backgroundColor: '#ffc107',
      padding: 10,
      borderRadius: 5,
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 5,
    },
    footerButtonBlue: {
      backgroundColor: '#007bff',
      padding: 10,
      borderRadius: 5,
      flex: 1,
      alignItems: 'center',
      marginLeft: 5,
    },
    footerButtonText: {
      color: '#fff',
      fontSize: 14,
    },
  });
export default Login;
