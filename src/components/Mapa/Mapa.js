import React, { Component } from 'react';
import { Platform, Dimensions, StyleSheet, View, TouchableOpacity, Text, Alert, Modal } from 'react-native';
import { MapView, Constants, Location, Permissions } from 'expo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapViewDirections from '../../services/MapViewDirections';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Spinner from 'react-native-loading-spinner-overlay';

const { width, height } = Dimensions.get('window');

const GOOGLE_MAPS_APIKEY = 'SUA_KEY';

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
        latitude: origin.latitude,
        longitude: origin.longitude,
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

  componentWillMount = async () => {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      Alert.alert('Opa, não é possível recuperar o GPS do Emulador Android, tente em um aparelho!');
    } else {
      await this.getLocationAsync();
    }
  }

  getLocationAsync = async () => {
    console.log('entrou no willMount');
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
      console.log(this.state.currentLocation);
    }
  };

  render() {
    if(this.state.loading){
      return (
        <View style={styles.container}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.modalOriginVisible}
            onRequestClose={() => {
              // alert('Destino escolhido.');
            }}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <Text>Informar sua origem</Text>
                <TouchableOpacity onPress={() => this.setModalOriginVisible(false)}>
                  <Text style={styles.textCloseModal}>Cancelar</Text>
                </TouchableOpacity>
              </View>
              <GooglePlacesAutocomplete
                placeholder='Pesquisar'
                minLength={7} // minimum length of text to search
                autoFocus={false}
                fetchDetails={true}
                onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                  this.saveOrigin(details.geometry.location, details.formatted_address);
                }}
                getDefaultValue={() => {
                  return ''; // text input default value
                }}
                query={{
                  // available options: https://developers.google.com/places/web-service/autocomplete
                  key: GOOGLE_MAPS_APIKEY,
                  language: 'pt_BR', // language of the results
                  location: `${this.state.currentLocation.latitude}, ${this.state.currentLocation.longitude}`,
                  radius: '90000', //90km
                  components: 'country:br',
                  types: ['geocode', 'establishment'], // default: 'geocode',
                  strictbounds: true
                }}
                styles={{
                  container: {
                    flex: 1
                  },
                  listView: {
                    flex: 1
                  },
                  description: {
                    fontWeight: 'bold',
                  },
                  predefinedPlacesDescription: {
                    color: '#1faadb',
                    borderBottomColor: '#063746',
                    borderBottomWidth: 1,
                  },
                  textInputContainer: {
                    backgroundColor: 'white',
                    borderBottomColor: '#063746',
                    borderBottomWidth: 1,
                  }
                }}
                currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
                currentLocationLabel="Localização Atual"
                nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                GoogleReverseGeocodingQuery={{
                  // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
                }}
                GooglePlacesSearchQuery={{
                  // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                  rankby: 'distance',
                  types: 'food',
                }}
                predefinedPlacesAlwaysVisible={true}
              />

            </View>
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.modalDestinationVisible}
            onRequestClose={() => {
              // alert('Destino escolhido.');
            }}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <Text>Informar seu destino</Text>
                <TouchableOpacity onPress={() => this.setModalDestinationVisible(false)}>
                  <Text style={styles.textCloseModal}>Cancelar</Text>
                </TouchableOpacity>
              </View>
              <GooglePlacesAutocomplete
                placeholder='Pesquisar'
                minLength={7} // minimum length of text to search
                autoFocus={false}
                fetchDetails={true}
                onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                  this.goTo(details.geometry.location, details.formatted_address);
                }}
                getDefaultValue={() => {
                  return ''; // text input default value
                }}
                query={{
                  // available options: https://developers.google.com/places/web-service/autocomplete
                  key: GOOGLE_MAPS_APIKEY,
                  language: 'pt_BR', // language of the results
                  location: `${this.state.currentLocation.latitude}, ${this.state.currentLocation.longitude}`,
                  radius: '90000', //90km
                  components: 'country:br',
                  types: ['geocode', 'establishment'], // default: 'geocode',
                  strictbounds: true
                }}
                styles={{
                  container: {
                    flex: 1
                  },
                  listView: {
                    flex: 1
                  },
                  description: {
                    fontWeight: 'bold',
                  },
                  predefinedPlacesDescription: {
                    color: '#1faadb',
                    borderBottomColor: '#063746',
                    borderBottomWidth: 1,
                  },
                  textInputContainer: {
                    backgroundColor: 'white',
                    borderBottomColor: '#063746',
                    borderBottomWidth: 1,
                  }
                }}
                currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
                nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                GoogleReverseGeocodingQuery={{
                  // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
                }}
                GooglePlacesSearchQuery={{
                  // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                  rankby: 'distance',
                  types: 'food',
                }}
                predefinedPlacesAlwaysVisible={true}
              />

            </View>
          </Modal>

          <MapView
            initialRegion={this.state.currentLocation}
            style={styles.map}
            ref={c => this.mapView = c}
          // onPress={this.onMapPress}
          >
            <MapView.Marker coordinate={this.state.currentLocation}
              image={pin1} />

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
            <Text style={styles.taxiRio}>JFalbo</Text>
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
        <Spinner visible={this.state.loading} textContent={"Loading..."} textStyle={{color: '#FFF'}} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  customView: {
    width: 140,
    height: 100,
  },
  plainView: {
    width: 60,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 20
  },
  modal: {
    flex: 1,
    backgroundColor: 'white',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10
  },
  modalRATR: {
    flex: 1,
    backgroundColor: 'white',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    alignItems: 'center',
    borderTopColor: '#063746',
    borderTopWidth: 5,
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
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5
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
  textCloseButtonEstimatedValue: {
    color: '#ffc854'
  },
  textButton: {
    flex: 1,
    margin: 10,
    fontSize: 14,
    color: 'white'
  },
  textButtonSearchAdress: {
    flex: 1,
    margin: 10,
    fontSize: 14,
    color: '#ffc854'
  },

  buttonContainer: {
    height: 50,
    flexDirection: 'row',
    backgroundColor: 'transparent'
  },
  boxContainer: {
    height: 50,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  boxContainerButtonRATR: {
    height: 80,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  boxContainerHeader: {
    height: 40,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },

  boxBubbleHeader: {
    flex: 1,
    backgroundColor: '#007889',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
    marginTop: 10
  },
  boxBubbleTop: {
    flex: 1,
    backgroundColor: '#008c9d',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5
  },
  boxBubbleMiddle: {
    flex: 1,
    backgroundColor: '#008c9d',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomColor: '#007889',
    borderBottomWidth: 1,
  },
  boxBubbleBottom: {
    flex: 1,
    backgroundColor: '#008c9d',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
  },
  iconMarker: {
    borderWidth: 3,
    borderColor: 'rgba(1,33,54,1)'
  },
  box: {
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calloutPrice: {
    backgroundColor: '#ffc854',
    borderLeftWidth: 2,
    borderColor: 'rgba(1,33,54,1)',
    width: 100
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10
  },
  textCloseModal: {
    color: 'red'
  },
  buttonValidateRATROpenModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffc854',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 5,
    marginHorizontal: 10,
    flexDirection: 'row',
    marginTop: 10
  },
  buttonValidateCalculatorModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffc854',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 5,
    marginBottom: 10,
    marginHorizontal: 10,
    flexDirection: 'row',
    marginTop: 10
  },
  textButtonValidateRATR: {
    color: 'black',
    fontWeight: 'bold',
  },
  titleModalRATR: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  viewTitleModalRATR: {
    flex: 1,
    alignItems: 'flex-end'
  },
  inputTextRATRView: {
    margin: 30
  },
  inputTextRATR: {
    width: 200,
    height: 44,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  buttonValidateRATR: {
    width: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffc854',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 5,
    marginBottom: 10,
    marginHorizontal: 10,
    flexDirection: 'row',
    width: 200,
  },
  resultValidateRATR: {
    flexDirection: 'row',
  },
  unavailableRATR: {
    margin: 5,
    fontWeight: 'bold',
    fontSize: 20,
    color: 'red'
  },
  availableRATR: {
    margin: 5,
    fontWeight: 'bold',
    fontSize: 20,
    color: 'green'
  },
  header: {
    alignItems: 'center',
    flex: 1,
    marginTop: 50
  },
  taxiRio: {
    fontWeight: 'bold',
    fontSize: 24,
  }
});

export default Mapa;