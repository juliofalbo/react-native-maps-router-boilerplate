import React from 'react';
import Mapa from './src/components/Mapa/Mapa';
import { SafeAreaView } from 'react-native';

export default class App extends React.Component {
  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Mapa />
      </SafeAreaView>
    );
  }
}