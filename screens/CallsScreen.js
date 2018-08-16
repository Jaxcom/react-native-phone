import React from 'react';
import {
  ScrollView,
  View,
} from 'react-native';
import {Endpoint} from 'react-native-pjsip';
import styles from '../constants/Styles';

const endpoint = new Endpoint();

export default class HomeScreen extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        </ScrollView>
      </View>
    );
  }
}
