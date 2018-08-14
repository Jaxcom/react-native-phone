import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {Endpoint} from 'react-native-pjsip'

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
