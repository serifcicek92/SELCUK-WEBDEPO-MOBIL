import React, { useEffect, useState, useRef } from 'react';
import { Platform, View, BackHandler, Alert, ActivityIndicator, StyleSheet, Button, Text, StatusBar, TouchableOpacity, Image, Modal, Dimensions, TouchableWithoutFeedback, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { useFocusEffect, StackActions } from '@react-navigation/native';//The global expo-cli package has been deprecated.
import * as Device from 'expo-device';
import md5 from 'md5';
import { Ionicons } from '@expo/vector-icons';
import { CameraView,useCameraPermissions } from 'expo-camera';
// import { BarCodeScanner } from 'expo-barcode-scanner';

const Main = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [loginURL, setLoginURL] = useState('');
  const [webdepoURL, setWebdepoURL] = useState('');
  const [params, setParams] = useState('');
  const [showWebView, setShowWebView] = useState(true);
  const [showError, setShowError] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false); // Açılır menü görünürlüğü
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [webViewUri, setWebViewUri] = useState('');
  const [permission, requestPermission] = useCameraPermissions();


  const loadSettings = async () => {
    const androidId = Device.osInternalBuildId;
    const hesapKodu = await AsyncStorage.getItem('hesapkodu');
    const kullaniciAdi = await AsyncStorage.getItem('kullaniciadi');
    let kullaniciSifre = await AsyncStorage.getItem('kullanicisifre');
    const storedLoginContract = await AsyncStorage.getItem('loginContract');
    const loginContract = storedLoginContract ? JSON.parse(storedLoginContract) : {};

    if (kullaniciSifre) {
      kullaniciSifre = md5(kullaniciSifre.toUpperCase()); // Ktoupper kaldır
    }
    console.log("şifre=" + kullaniciSifre);
    const { _LOGINURL, _WEBDEPOURL } = loginContract;

    await setLoginURL(_LOGINURL);
    await setWebdepoURL(_WEBDEPOURL);
    await setParams('?DeviceId=' + androidId + '&AppType=4&EczaneKodu=' + hesapKodu + '&KullaniciAdi=' + kullaniciAdi + '&Sifre=' + kullaniciSifre);
    await setWebViewUri(_LOGINURL + params);
    await webViewRef.current.reload();

    console.log("param nedir ? = " + params);
    console.log('_LOGINURL:' + _LOGINURL);
    console.log('_WEBDEPOURL' + _WEBDEPOURL);
    console.log('hesapKodu' + hesapKodu);
    console.log('androidId' + androidId);
    console.log('kullaniciAdi' + kullaniciAdi);
    console.log('kullaniciSifre' + kullaniciSifre);
    console.log('login+paras' + loginURL + params);


  }

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }


  useEffect(() => {
    // const getBarCodeScannerPermissions = async () => {
    //   const { status } = await BarCodeScanner.requestPermissionsAsync();
    //   setHasPermission(status === 'granted');
    // };

    // getBarCodeScannerPermissions();
    loadSettings();
  }, []);



  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (webViewRef.current && webViewRef.current.canGoBack && webViewRef.current.canGoBack()) {
          webViewRef.current.goBack();
        } else {
          Alert.alert(
            'Çıkış',
            'Programdan çıkmak istiyor musunuz?',
            [
              { text: 'Hayır', style: 'cancel' },
              { text: 'Evet', onPress: () => BackHandler.exitApp() },
            ],
            { cancelable: false }
          );
        }
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  const webViewRef = React.useRef(null);

  const handleRefresh = () => {
    if (showError) {
      setShowWebView(true);
      setShowError(false);
    }
    webViewRef.current.reload();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('hesapkodu');
    await AsyncStorage.removeItem('kullaniciadi');
    await AsyncStorage.removeItem('kullanicisifre');
    navigation.dispatch(StackActions.replace('Login'));
  };

  const handleAbout = () => {
    Alert.alert(
      'Boyut Bilgisayar',
      'Boyut Bilgisayar 2016\nv1.0',
      [{ text: 'Tamam', style: 'default' }],
      { cancelable: true }
    );
  };

  const handleBarCodeScanned = ({ type, data }) => {
    // setScanned(true);
    setScannedData(data);
    setQrModalVisible(false);
    Alert.alert('QR Code Data', data);
    console.log("okunan data: " + data);
    const barcode = extractBarcode(data);
    const link = webdepoURL + "/Siparis/hizlisiparis.aspx?ilcAdi=" + barcode.trim()
    if (barcode != null) {
      setWebViewUri(link);
      webViewRef.current.reload();
    }
    console.log("link:" + link);
    console.log("barkod:" + barcode);

  };

  const extractBarcode = (data) => {
    // Barkodun yalnızca rakamlardan oluştuğunu varsayıyoruz ve uzunluğu 13 veya 14 karakter olmalı
    const barcodePattern = /^[0-9]{13,14}$/;

    if (barcodePattern.test(data)) {
      // Data yalnızca rakamlardan oluşuyorsa ve uzunluğu uygun ise, doğrudan barkod olduğunu varsayıyoruz
      return data.length === 14 && data.startsWith('0') ? data.substring(1) : data;
    } else {
      // QR kod içeriğinden barkodu ayıklama
      const match = data.match(/01(\d{14}|\d{13})/);
      if (match && match[1]) {
        const extractedBarcode = match[1];
        return extractedBarcode.length === 14 && extractedBarcode.startsWith('0')
          ? extractedBarcode.substring(1)
          : extractedBarcode;
      } else {
        return null;
      }
    }
  }


  // if (hasPermission === null) {
  //   return <Text>Requesting for camera permission</Text>;
  // }
  // if (hasPermission === false) {
  //   return <Text>No access to camera</Text>;
  // }

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" />}
      {showError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Bir hata oluştu. Lütfen tekrar deneyin.</Text>
          <Button title="Yenile" onPress={handleRefresh} />
        </View>
      )}

      <View style={styles.menu}>
        <Text style={styles.title}>Selçuk Webdepo</Text>
        <TouchableOpacity onPress={() => setQrModalVisible(true)} style={styles.qrButton}>
          <Image source={require('../assets/scanner48.png')} style={styles.qrIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuIcon}>
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>
      {/* {scannedData ? <Text>QR Code Data: {scannedData}</Text> : null} */}
      {
        showWebView && (
          <WebView
            ref={webViewRef}
            source={{ uri: webViewUri /*loginURL + params*/ }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setShowWebView(false);
              setShowError(true);
            }}
            style={styles.webView}
          />
        )
      }
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType='slide-down'
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity style={styles.modalContainer} onPress={() => setMenuVisible(false)}>
          <View style={styles.modal}>
            <TouchableOpacity style={styles.menuItem} onPress={handleRefresh}>
              <Text>Yenile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Text>Oturumu Kapat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
              <Text>Hakkında</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setMenuVisible(false)}>
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal
        visible={qrModalVisible}
        transparent={false}
        onRequestClose={() => setQrModalVisible(false)}
      >
        <CameraView style={styles.camera} facing={facing} flash='on' onBarcodeScanned={scanned ? undefined :handleBarCodeScanned}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
              <Text>Scan Barcode</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
        {/* <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}

        /> */}

        {/* <View style={styles.reactangleContainer}>
          <View style={styles.rectangle}>
            <View style={styles.rectangleColor} />
            <View style={styles.topLeft} />
            <View style={styles.topRight} />
            <View style={styles.bottomLeft} />
            <View style={styles.bottomRight} />
          </View>
        </View>
        <View style={styles.textBg}>
          <Text style={styles.scanText}>Place a barcode inside the viewfinder area to scan it.</Text>
        </View>
        {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />} */}


      </Modal >
    </View >
  );
};

const deviceHeight = Dimensions.get("window").height / 2;

const deviceWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  webView: {
    flex: 1,
  },
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    marginTop: StatusBar.currentHeight,
    backgroundColor: '#289af7',
    color: '#fff'
  },
  title: {
    fontSize: 20,
    color: '#fff'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginBottom: 10,
    fontSize: 18,
    color: 'red',
  },
  qrIcon: {
    textAlign: 'right',
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  menuIcon: {
    padding: 5,
  },
  modal: {
    backgroundColor: 'white',
    position: 'absolute',
    right: 10,
    top: StatusBar.currentHeight + 50,
    width: 150,
    borderRadius: 5,
    elevation: 5,
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: 'red',
  },
  cameraOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },


  rectangleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  rectangle: {
    borderLeftColor: 'rgba(0, 0, 0, .6)',
    borderRightColor: 'rgba(0, 0, 0, .6)',
    borderTopColor: 'rgba(0, 0, 0, .6)',
    borderBottomColor: 'rgba(0, 0, 0, .6)',
    borderLeftWidth: deviceWidth / 5,
    borderRightWidth: deviceWidth / 5,
    borderTopWidth: deviceHeight / 2,
    borderBottomWidth: deviceHeight / 4
  },
  rectangleColor: {
    height: 300,
    width: 300,
    backgroundColor: 'transparent'
  },
  topLeft: {
    width: 50,
    height: 50,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    position: 'absolute',
    left: -1,
    top: -1,
    borderLeftColor: 'white',
    borderTopColor: 'white'
  },
  topRight: {
    width: 50,
    height: 50,
    borderTopWidth: 2,
    borderRightWidth: 2,
    position: 'absolute',
    right: -1,
    top: -1,
    borderRightColor: 'white',
    borderTopColor: 'white'
  },
  bottomLeft: {
    width: 50,
    height: 50,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    position: 'absolute',
    left: -1,
    bottom: -1,
    borderLeftColor: 'white',
    borderBottomColor: 'white'
  },
  bottomRight: {
    width: 50,
    height: 50,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    position: 'absolute',
    right: -1,
    bottom: -1,
    borderRightColor: 'white',
    borderBottomColor: 'white'
  }




});

export default Main;
