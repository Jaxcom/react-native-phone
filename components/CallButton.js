import React from 'react';
import {Platform} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

import DialButton from '../components/DialButton';

export default class CallButton extends React.Component {
  render() {
    return (<DialButton {...this.props}>
    <Ionicons name={
Platform.OS === 'ios'
? `ios-call${focused ? '' : '-outline'}`
: 'md-call'
} size={32} color={this.props.color || 'green'} />
    </DialButton>);
  }
}
