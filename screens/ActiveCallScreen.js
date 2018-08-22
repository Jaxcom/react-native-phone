import React from 'react';
import {
  View,
  Text,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { withNavigation } from 'react-navigation';

import DialButton from '../components/DialButton';
import styles from '../constants/Styles';


class ActiveCallScreen extends React.Component {
    hangup () {
        this.props.navigation.navigate('App');
    }
    
    render () {
        const phoneNumber = this.props.navigation.getParam('phoneNumber', 'Unknown number');
        return (<View style={styles.container}>
            <View><Text>{phoneNumber}</Text></View>
            <View style={{position: 'absolute', left: 0, right: 0, bottom: 0, justifyContent:'center', alignItems:'center', flex: 1, flexDirection:'row'}}>
            <DialButton onPress={this.hangup.bind(this)}>
              <Ionicons name={
        Platform.OS === 'ios'
          ? `ios-call${focused ? '' : '-outline'}`
          : 'md-call'
      } size={32} color="red" />
            </DialButton>
            </View>
      </View>)
    }
}  

export default withNavigation(ActiveCallScreen);