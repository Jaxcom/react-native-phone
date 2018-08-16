import React from 'react';
import {
  ScrollView,
  View,
} from 'react-native';

import styles from '../constants/Styles';

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
