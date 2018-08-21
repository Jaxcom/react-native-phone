import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default class DialButton extends React.Component {
  render() {
    return <TouchableOpacity {...this.props} style={styles.button}>
    {this.props.title ? <Text style={styles.text} >{this.props.title}</Text> : this.props.children}
    </TouchableOpacity>;
  }
}

const styles = StyleSheet.create({
    button: {
        alignSelf: 'stretch',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: 90,
        height: 90,
        backgroundColor: '#fff',
        borderRadius: 90,
        margin: 8,
    },
    text: {
        fontSize: 40
    }
});