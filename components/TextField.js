import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

const TextField = props => (
  <View>
    <TextInput {... props}/>
    props.error ? <Text style={styles.errorText}>{props.error}</Text> : null
    (!props.error && props.hint) ? <Text style={styles.hintText}>{props.hint}</Text> : null
  </View>
);

const styles = StyleSheet.create({
    errorText: {
        color: 'red',
    },
    hintText: {
        fontSize: 14
    },
});

export default TextField;