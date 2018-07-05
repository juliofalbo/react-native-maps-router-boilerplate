import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Modal } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

export default class App extends React.Component {
    render() {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={this.props.modalVisible}
                onRequestClose={() => {
                    // alert('Local escolhido.');
                }}>
                <View style={styles.modal}>
                    <View style={styles.modalHeader}>
                        <Text>{this.props.text}</Text>
                        <TouchableOpacity onPress={() => this.props.setModalVisible(false)}>
                            <Text style={styles.textCloseModal}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                    <GooglePlacesAutocomplete
                        placeholder='Pesquisar'
                        minLength={5} // minimum length of text to search
                        autoFocus={false}
                        listViewDisplayed='auto'
                        fetchDetails={true}
                        onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                            this.props.save(details.geometry.location, details.formatted_address);
                        }}
                        getDefaultValue={() => {
                            return ''; // text input default value
                        }}
                        query={{
                            // available options: https://developers.google.com/places/web-service/autocomplete
                            key: this.props.googleKey,
                            language: 'pt_BR', // language of the results
                            location: `${this.props.currentLocation.latitude}, ${this.props.currentLocation.longitude}`,
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
                        currentLocation={this.props.showCurrentLocationButton} // Will add a 'Current location' button at the top of the predefined places list
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
                    />

                </View>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        backgroundColor: 'white',
        marginLeft: 10,
        marginRight: 10,
        marginTop: 10
    },
    textCloseModal: {
        color: 'red'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 10
    }
});