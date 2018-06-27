import React, { Component } from 'react';
import { Platform, Dimensions, StyleSheet, View, TouchableOpacity, Text, Alert, Modal } from 'react-native';
import { MapView, Constants, Location, Permissions } from 'expo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapViewDirections from '../../services/MapViewDirections';
import AutocompleteModal from '../Modal/AutocompleteModal';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Spinner from 'react-native-loading-spinner-overlay';

const { width, height } = Dimensions.get('window');

const GOOGLE_MAPS_APIKEY = 'AIzaSyA_R9iPnJ1B6WKZZF1LH9V7-8CrrEQUXSc';

const pin1 = require('../../../assets/imgs/pin1.png');
const pin2 = require('../../../assets/imgs/pin2.png');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

class Mapa extends Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      origin: {},
      destination: {},
      coordinates: [

      ],
      destinationText: 'Informar seu destino',
      originText: 'Informar sua origem',
      modalOriginVisible: false,
      modalDestinationVisible: false,
      duration: '0 min',
      distance: 0,
      currentLocation: {},
      errorMessage: null
    };

    this.mapView = null;
  }

  saveOrigin = (originParam, originText) => {
    const origin =
    {
      latitude: originParam.lat,
      longitude: originParam.lng,
    };
    this.setState({ origin, modalOriginVisible: false, originText });
  }

  goTo = (goToLocation, destinationText) => {
    const coordinates = [
      {
        latitude: this.state.origin.latitude,
        longitude: this.state.origin.longitude,
      },
      {
        latitude: goToLocation.lat,
        longitude: goToLocation.lng,
      },
    ]
    this.setState({ coordinates, modalDestinationVisible: false, destinationText });
  }

  setModalDestinationVisible = (visible) => {
    this.setState({ modalDestinationVisible: visible });
  }

  setModalOriginVisible = (visible) => {
    this.setState({ modalOriginVisible: visible });
  }

  openEstimateDuration = () => {
    if (this.state.duration !== '0 min') {
      return (
        <View style={styles.boxContainer}>
          <View style={[styles.boxBubbleBottom, styles.box]}>
            <Text style={styles.textButtonLarge}>Tempo Estimado</Text>
            <Text style={styles.textButtonLargeValue}>{this.state.duration}</Text>
          </View>
        </View>
      );
    }
  }

  showCurrentLocationMarker = () => {
    if (this.state.duration === '0 min') {
      return (
        <MapView.Marker coordinate={this.state.currentLocation}
          image={pin1} />
      );
    }
  }

  componentWillMount = () => {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      Alert.alert('Opa, não é possível recuperar o GPS do Emulador Android, tente em um aparelho!');
    } else {
      this.getLocationAsync();
    }
  }

  getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      Alert.alert('Para que o Aplicativo funcione, precisamos da sua permissão para recupermos sua localização!');
    } else {
      let data = await Location.getCurrentPositionAsync({});
      const currentLocation = {
        latitude: data.coords.latitude,
        longitude: data.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      };
      await this.setState({ currentLocation, loading: true });
    }
  };

  render() {
    if (this.state.loading) {
      return (
        <View style={styles.container}>








          <AutocompleteModal
            text="Informar sua origem"
            modalVisible={this.state.modalOriginVisible}
            setModalVisible={this.setModalOriginVisible}
            save={this.saveOrigin}
            googleKey={GOOGLE_MAPS_APIKEY}
            showCurrentLocationButton={true}
            currentLocation={this.state.currentLocation}
          />


          <AutocompleteModal
            text="Informar seu destino"
            modalVisible={this.state.modalDestinationVisible}
            setModalVisible={this.setModalDestinationVisible}
            save={this.goTo}
            googleKey={GOOGLE_MAPS_APIKEY}
            showCurrentLocationButton={false}
            currentLocation={this.state.currentLocation}
          />

          <MapView
            initialRegion={this.state.currentLocation}
            style={styles.map}
            ref={c => this.mapView = c}
          // onPress={this.onMapPress}
          >
            {this.showCurrentLocationMarker()}

            {this.state.coordinates.map((coordinate, index) => {
              if (index === 1) {
                return (
                  <MapView.Marker image={pin2} ref={ref => this.marker1 = ref} key={`coordinate_${index}`} coordinate={coordinate} />
                )
              } else {
                return (
                  <MapView.Marker image={pin1} key={`coordinate_${index}`} coordinate={coordinate} />
                )
              }
            })}
            {(this.state.coordinates.length >= 2) && (
              <MapViewDirections
                origin={this.state.coordinates[0]}
                waypoints={(this.state.coordinates.length > 2) ? this.state.coordinates.slice(1, -1) : null}
                destination={this.state.coordinates[this.state.coordinates.length - 1]}
                apikey={GOOGLE_MAPS_APIKEY}
                mode='driving'
                strokeWidth={3}
                strokeColor="#007584"
                onStart={(params) => {
                  console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
                }}
                onReady={(result) => {
                  this.mapView.fitToCoordinates(result.coordinates, {
                    edgePadding: {
                      right: parseInt((width / 20), 10),
                      bottom: parseInt((height / 20), 10),
                      left: parseInt((width / 20), 10),
                      top: parseInt((height / 20), 10)
                    }
                  });

                  {
                    const duration = Math.round(result.duration) + ' min';
                    const distance = result.distance;
                    this.setState({ duration, distance });
                  }

                }}
                onError={(errorMessage) => {
                  // console.log('GOT AN ERROR');
                }}
              />
            )}
          </MapView>

          <View style={styles.header}>
            <Text style={styles.textLogo}>JFalbo</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => this.setModalOriginVisible(true)} style={[styles.bubbleTop, styles.button]}>
              <MaterialCommunityIcons name="checkbox-blank" size={20} color="#ffc854" />
              <Text style={styles.textButtonSearchAdress}>{this.state.originText}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => this.setModalDestinationVisible(true)} style={[styles.bubbleBottom, styles.button]}>
              <MaterialCommunityIcons name="checkbox-blank" size={20} color="#ffc854" />
              <Text style={styles.textButtonSearchAdress}>{this.state.destinationText}</Text>
            </TouchableOpacity>
          </View>

          {
            this.openEstimateDuration()
          }

        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <Spinner visible={this.state.loading} textContent={"Loading..."} textStyle={{ color: '#FFF' }} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 20
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  bubbleTop: {
    flex: 1,
    backgroundColor: 'rgba(1,33,54,1)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomColor: '#063746',
    borderBottomWidth: 1,
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5
  },
  bubbleBottom: {
    flex: 1,
    backgroundColor: 'rgba(1,33,54,1)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomColor: '#063746',
    borderBottomWidth: 1,
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textButtonLarge: {
    flex: 1,
    margin: 10,
    fontSize: 16,
    color: 'white'
  },
  textButtonLargeValue: {
    flex: 1,
    margin: 10,
    fontSize: 20,
    color: '#ffc854'
  },
  textButtonSearchAdress: {
    flex: 1,
    margin: 10,
    fontSize: 14,
    color: '#ffc854'
  },
  buttonContainer: {
    height: 70,
    flexDirection: 'row',
    backgroundColor: 'transparent'
  },
  boxContainer: {
    height: 50,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  boxBubbleBottom: {
    flex: 1,
    backgroundColor: '#008c9d',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
  },
  box: {
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    flex: 1,
    marginTop: 50
  },
  textLogo: {
    fontWeight: 'bold',
    fontSize: 24,
  }
});

export default Mapa;