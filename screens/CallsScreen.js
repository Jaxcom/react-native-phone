import React from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {withNavigation} from 'react-navigation';
import {Ionicons} from '@expo/vector-icons';
import styles from '../constants/Styles';
import Dialpad from '../components/Dialpad';
import CallButton from '../components/CallButton';
import {getSipData} from '../lib/sip';

class CallsScreen extends React.Component {
  static navigationOptions = {
    title: 'Calls',
  };
  
  state = {
    phoneNumber: '+79102148272'
  };

  pressButton(digit){
    let {phoneNumber} = this.state;
    if (!phoneNumber || phoneNumber === '+') {
      phoneNumber = `+1${digit}`;
    } else {
      phoneNumber = `${phoneNumber}${digit}`;
    }
    this.setState({phoneNumber});
  }

  pressBackspace() {
    let {phoneNumber} = this.state;
    if (phoneNumber && phoneNumber.length > 0 && phoneNumber !== '+1'){
      phoneNumber = phoneNumber.slice(0, phoneNumber.length - 1);
      this.setState({phoneNumber});
    }
  }

  pressClear() {
    this.setState({phoneNumber: '+1'});
  }

  async makeCall() {
    const {phoneNumber} = this.state;
    console.log(`Calling to ${phoneNumber}`);
    const data = await getSipData();
    data.activeCall = await data.endpoint.makeCall(data.accounts[0], phoneNumber, {videoCount: 0, audioCount: 1}); // audio only call
    this.props.navigation.navigate('ActiveCall', {phoneNumber});
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={callsStyles.dialer}>
            <Text style={callsStyles.phoneNumber}>{this.state.phoneNumber}</Text>
            {this.state.phoneNumber.length > 2 ? <TouchableOpacity><Ionicons name={
        Platform.OS === 'ios'
          ? `ios-backspace${focused ? '' : '-outline'}`
          : 'md-backspace'
      } style={callsStyles.backspace} size={32} onPress={this.pressBackspace.bind(this)} onLongPress={this.pressClear.bind(this)}/></TouchableOpacity> : null}
          </View>
          <Dialpad pressButton={this.pressButton.bind(this)} />
          <View style={callsStyles.dialer}>
            <CallButton onPress={this.makeCall.bind(this)} />
          </View>
        </ScrollView>
      </View>
    );
  }
}

const callsStyles = StyleSheet.create({
  dialer: {
    flex: 1, 
    flexDirection:'row', 
    justifyContent:'center',
    alignItems:'center',
  },
  button: {
    width: "100%"
  },
  phoneNumber: {
    fontSize: 30,
    height: 40,
    justifyContent:'center',
  },
  backspace: {
    paddingLeft: 20
  }
});

export default withNavigation(CallsScreen);