import React from 'react';
import {View, StyleSheet} from 'react-native';

import DialButton from '../components/DialButton';


export default class Dialpad extends React.Component {
  pressButton(digit) {
      return () => {
          this.props.pressButton(digit);
      }
  }
  
  render() {
    const pressButton = this.pressButton.bind(this);
    return (<View>
        <View style={styles.dialer}>
        <DialButton title="1" onPress={pressButton('1')}/>
        <DialButton title="2" onPress={pressButton('2')}/>
        <DialButton title="3" onPress={pressButton('3')}/>
        </View>
        <View style={styles.dialer}>
        <DialButton title="4" onPress={pressButton('4')}/>
        <DialButton title="5" onPress={pressButton('5')}/>
        <DialButton title="6" onPress={pressButton('6')}/>
        </View>
        <View style={styles.dialer}>
        <DialButton title="7" onPress={pressButton('7')}/>
        <DialButton title="8" onPress={pressButton('8')}/>
        <DialButton title="9" onPress={pressButton('9')}/>
        </View>
        <View style={styles.dialer}>
        <DialButton title="*" onPress={pressButton('*')}/>
        <DialButton title="0" onPress={pressButton('0')}/>
        <DialButton title="#" onPress={pressButton('#')}/>
        </View>
    </View>);
  }
}

const styles = StyleSheet.create({
    dialer: {
      flex: 1, 
      flexDirection:'row', 
      justifyContent:'center',
      alignItems:'center',
    }
});
