import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { withNavigation } from 'react-navigation';

import CallButton from '../components/CallButton';
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
            <CallButton onPress={this.answer.bind(this)} color="green" />
            <CallButton onPress={this.cancel.bind(this)} color="red" />
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