import React from 'react';
import {
  View,
  Text,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { withNavigation } from 'react-navigation';

import DialButton from '../components/DialButton';
import styles from '../constants/Styles';


class IncomingCallScreen extends React.Component {
    
    answer () {
        const phoneNumber = this.props.navigation.getParam('phoneNumber', '');
        //TODO answer incoming call
        this.props.navigation.navigate('ActiveCall', {phoneNumber});
    }
    
    cancel () {
        //TODO cancel incoming call
        this.props.navigation.navigate('App');
    }
    
    render () {
        const phoneNumber = this.props.navigation.getParam('phoneNumber', 'Unknown number');
        return (<View style={styles.container}>
            <View style={activeCallStyles.phoneNumberContainer}><Text style={activeCallStyles.phoneNumber}>{phoneNumber}</Text></View>
            <View style={{position: 'absolute', left: 0, right: 0, bottom: 0, justifyContent:'center', alignItems:'center', flex: 1, flexDirection:'row'}}>
            <DialButton onPress={this.answer.bind(this)}>
              <Ionicons name={
        Platform.OS === 'ios'
          ? `ios-call${focused ? '' : '-outline'}`
          : 'md-call'
      } size={32} color="green" />
            </DialButton>
            <DialButton onPress={this.cancel.bind(this)}>
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

const activeCallStyles = StyleSheet.create({
    phoneNumberContainer: {
        flex: 1, 
        flexDirection:'row', 
        justifyContent:'center',
        top: 80
    },
    phoneNumber: {
        fontSize: 30,
        height: 40,
    },
  });

export default withNavigation(IncomingCallScreen);