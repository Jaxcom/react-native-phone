import React from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {Endpoint} from 'react-native-pjsip';
import { Ionicons } from '@expo/vector-icons';
import styles from '../constants/Styles';
import DialButton from '../components/DialButton';

const endpoint = new Endpoint();

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Calls',
  };
  
  state = {
    phoneNumber: '+1'
  }

  pressButton(digit){
    return () => {
      let {phoneNumber} = this.state;
      if (!phoneNumber || phoneNumber === '+') {
        phoneNumber = `+1${digit}`;
      } else {
        phoneNumber = `${phoneNumber}${digit}`;
      }
      this.setState({phoneNumber});
    }
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

  makeCall() {
    const {phoneNumber} = this.state;
    console.log(`Calling to ${phoneNumber}`);
    //TODO make a call
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
          <View style={callsStyles.dialer}>
            <DialButton title="1" onPress={this.pressButton('1')}/>
            <DialButton title="2" onPress={this.pressButton('2')}/>
            <DialButton title="3" onPress={this.pressButton('3')}/>
          </View>
          <View style={callsStyles.dialer}>
            <DialButton title="4" onPress={this.pressButton('4')}/>
            <DialButton title="5" onPress={this.pressButton('5')}/>
            <DialButton title="6" onPress={this.pressButton('6')}/>
          </View>
          <View style={callsStyles.dialer}>
            <DialButton title="7" onPress={this.pressButton('7')}/>
            <DialButton title="8" onPress={this.pressButton('8')}/>
            <DialButton title="9" onPress={this.pressButton('9')}/>
          </View>
          <View style={callsStyles.dialer}>
            <DialButton title="*" onPress={this.pressButton('*')}/>
            <DialButton title="0" onPress={this.pressButton('0')}/>
            <DialButton title="#" onPress={this.pressButton('#')}/>
          </View>
          <View style={callsStyles.dialer}>
            <DialButton onPress={this.makeCall}>
              <Ionicons name={
        Platform.OS === 'ios'
          ? `ios-call${focused ? '' : '-outline'}`
          : 'md-call'
      } size={32} color="green" />
            </DialButton>
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
