import React from 'react';
import {AsyncStorage} from 'react-native';
import {GiftedChat} from 'react-native-gifted-chat';
import {SecureStore} from 'expo';
import {postJSON} from '../lib/fetch';
import {addIncomingMessagesHandler, removeIncomingMessagesHandler} from '../lib/notification';

export default class MessagesScreen extends React.Component {
  static navigationOptions = {
    title: 'Messages',
  };

  state = {
    phoneNumber: '',
    messages: []
  }

  async componentWillMount() {
    console.log('Loading messages ...')
    const bandwidth = JSON.parse((await SecureStore.getItemAsync('bandwidth')) || '{}');
    const baseUrl = await AsyncStorage.getItem('baseUrl');
    const phoneNumber = await AsyncStorage.getItem('phoneNumber');
    const messages = await postJSON(`${baseUrl}/loadMessages`, Object.assign(bandwidth, {phoneNumber}));
    this.setState({messages: messages.map(this._prepareMessage)});
    this.onIncomingMessage = this.onIncomingMessage.bind(this);
    addIncomingMessagesHandler(this.onIncomingMessage);
  }

  componentWillUnmount() {
    removeIncomingMessagesHandler(this.onIncomingMessage);
  }

  _prepareMessage(message){
    return message;
  }

  onIncomingMessage(message){
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, [this._prepareMessage(message)]),
    }));
  }

  async onSend(messages = []) {
    const bandwidth = JSON.parse((await SecureStore.getItemAsync('bandwidth')) || '{}');
    const baseUrl = await AsyncStorage.getItem('baseUrl');
    const message = postJSON(`${baseUrl}/sendMessage`, Object.assign(bandwidth, messages[0]));
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, [this._prepareMessage(message)]),
    }));
  }
  
  render() {
    return (
      <GiftedChat 
        messages={this.state.messages}
        onSend={messages => this.onSend(messages)}
        user={{
          from: this.state.phoneNumber,
        }}>
      </GiftedChat>
    );
  }
}
