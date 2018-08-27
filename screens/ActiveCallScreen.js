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
import {getSipData} from '../lib/sip';


class ActiveCallScreen extends React.Component {
    state = {
        status: 'Dialing',
        endpoint: null,
        activeCall: null
    }

    callChanged = null

    componentWillUnmount () {
        this.state.endpoint.removeListener("call_changed", this.callChanged);
    }

    componentWillMount() {
        this.init();
    }

    init () {
        getSipData().then(({endpoint, activeCall}) => {
            this.setState({endpoint, activeCall, status: activeCall.getStateText()});
            this.callChanged = call => {
                if (activeCall.getId() === call.getId()) {
                    this.setState({status: activeCall.getStateText()});
                }
            };
            endpoint.addListener("call_changed", this.callChanged);
        });
    }
    
    pressButton (digit) {
        const {endpoint, activeCall} = this.state;
        endpoint.dtmfCall(activeCall, digit).catch(console.error);
    }

    async hangup () {
        const {endpoint, activeCall} = this.state;
        try {
            await endpoint.hangupCall(activeCall);
        } finally {
            this.props.navigation.navigate('App');
        }
    }
    
    render () {
        const phoneNumber = this.props.navigation.getParam('phoneNumber', 'Unknown number');
        return (<View style={styles.container}>
            <View style={activeCallStyles.phoneNumberContainer}><Text style={activeCallStyles.phoneNumber}>{phoneNumber}</Text></View>
            {this.state.status !== 'CONFIRMED' ? <View style={activeCallStyles.statusContainer}><Text style={activeCallStyles.status}>{this.state.status} ...</Text></View> :
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