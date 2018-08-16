import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  StatusBar,
  View,
} from 'react-native';
import styles from '../constants/Styles';

export default class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    this.props.navigation.navigate(token ? 'App' : 'Auth');
  };

  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
        <StatusBar barStyle="default" />
      </View>
    );
  }
}
