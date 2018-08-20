import React from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Button,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {Endpoint} from 'react-native-pjsip';
import { Ionicons } from '@expo/vector-icons';
import styles from '../constants/Styles';

const endpoint = new Endpoint();

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Calls',
  };
  
  state = {
    phoneNumber: ''
  }

  pressButton(digit){
    return () => this.setState({phoneNumber: `${this.state.phoneNumber}${digit}`})
  }

  makeCall() {

  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={callsStyles.dialer}>
            <Text>{this.state.phoneNumber}</Text>
          </View>
          <View style={callsStyles.dialer}>
            <Button title="1" style={callsStyles.button} onPress={this.pressButton('1')}/>
            <Button title="2" style={callsStyles.button} onPress={this.pressButton('2')}/>
            <Button title="3" style={callsStyles.button} onPress={this.pressButton('3')}/>
          </View>
          <View style={callsStyles.dialer}>
            <Button title="4" style={callsStyles.button} onPress={this.pressButton('4')}/>
            <Button title="5" style={callsStyles.button} onPress={this.pressButton('5')}/>
            <Button title="6" style={callsStyles.button} onPress={this.pressButton('6')}/>
          </View>
          <View style={callsStyles.dialer}>
            <Button title="7" style={callsStyles.button} onPress={this.pressButton('7')}/>
            <Button title="8" style={callsStyles.button} onPress={this.pressButton('8')}/>
            <Button title="9" style={callsStyles.button} onPress={this.pressButton('9')}/>
          </View>
          <View style={callsStyles.dialer}>
            <Button title="*" style={callsStyles.button} onPress={this.pressButton('*')}/>
            <Button title="0" style={callsStyles.button} onPress={this.pressButton('0')}/>
            <Button title="#" style={callsStyles.button} onPress={this.pressButton('#')}/>
          </View>
          <View style={callsStyles.dialer}>
            <TouchableOpacity onPress={this.makeCall} style={callsStyles.callButton}>
              <Ionicons name={
        Platform.OS === 'ios'
          ? `ios-call${focused ? '' : '-outline'}`
          : 'md-call'
      } size={32} color="green" />
            </TouchableOpacity>
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
    alignItems:'center'
  },
  button: {
    width: "100%"
  },
  callButton: {
    alignSelf: 'stretch',
    borderWidth:1,
    borderColor:'rgba(0,0,0,0.2)',
    alignItems:'center',
    justifyContent:'center',
    width:100,
    height:100,
    backgroundColor:'#fff',
    borderRadius:100,
  }
});
