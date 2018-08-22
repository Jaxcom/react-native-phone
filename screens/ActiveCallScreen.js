import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import {withNavigation} from 'react-navigation';

import CallButton from '../components/CallButton';
import Dialpad from '../components/Dialpad';
import styles from '../constants/Styles';


class ActiveCallScreen extends React.Component {
    state = {
        status: 'Dialing'
    }
    
    pressButton () {
        //TODO send dtmf
    }

    hangup () {
        //TODO hangup active call
        this.props.navigation.navigate('App');
    }
    
    render () {
        const phoneNumber = this.props.navigation.getParam('phoneNumber', 'Unknown number');
        return (<View style={styles.container}>
            <View style={activeCallStyles.phoneNumberContainer}><Text style={activeCallStyles.phoneNumber}>{phoneNumber}</Text></View>
            {this.state.status !== 'Active' ? <View style={activeCallStyles.statusContainer}><Text style={activeCallStyles.status}>{this.state.status} ...</Text></View> :
            <View style={activeCallStyles.dialerContainer}><Dialpad pressButton={this.pressButton.bind(this)}/></View>}
            <View style={{position: 'absolute', left: 0, right: 0, bottom: 0, justifyContent:'center', alignItems:'center', flex: 1, flexDirection:'row'}}>
            <CallButton onPress={this.hangup.bind(this)} color="red" />
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
    statusContainer: {
        flex: 1, 
        flexDirection:'row', 
        justifyContent:'center',
        top: 30
    },
    dialerContainer: {
        flex: 1, 
        flexDirection:'row', 
        justifyContent:'center',
        top: -110
    },
    phoneNumber: {
        fontSize: 30,
        height: 40,
    },
    status: {
        fontSize: 16,
    }
  });

export default withNavigation(ActiveCallScreen);