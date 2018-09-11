import React from 'react';
import {AsyncStorage, Button, View} from 'react-native';
import {GiftedChat} from 'react-native-gifted-chat';
import {SecureStore} from 'expo';
import Prompt from 'react-native-prompt-crossplatform';
import {postJSON} from '../lib/fetch';
import {addIncomingMessagesHandler, removeIncomingMessagesHandler} from '../lib/notification';

export default class MessagesScreen extends React.Component {
  static navigationOptions = ({navigation}) => ({
    title: 'Messages',
    headerRight: (<View>
      <Button title={navigation.getParam('to', '') || 'Enter Contact'} onPress={() => {
      navigation.setParams({visiblePrompt: true});
    }}></Button>
    <Prompt
          title="Phone number for messaging"
          inputPlaceholder="Enter phone number"
          isVisible={navigation.getParam('visiblePrompt', false)}
          defaultValue="+1"
          onBackButtonPress={() => {}}
          onChangeText={newTo => {
            navigation.setParams({newTo});
          }}
          onCancel={() => {
            navigation.setParams({visiblePrompt: false, to: ''});
          }}
          onSubmit={() => {
            navigation.setParams({visiblePrompt: false});
            navigation.navigate('Messages', {to: navigation.getParam('newTo', '')})
          }}
        />
    </View>)
  });

  state = {
    phoneNumber: '111',
    messages: [],
    isLoading: false
  }

  async componentWillMount() {
    this.onIncomingMessage = this.onIncomingMessage.bind(this);
    addIncomingMessagesHandler(this.onIncomingMessage);
    await this._loadMessages();
  }

  componentWillUnmount() {
    removeIncomingMessagesHandler(this.onIncomingMessage);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.navigation.getParam('to') !== this.props.navigation.getParam('to')) {
      this._loadMessages();
    }
  }


  _prepareMessage(message){
    return {
      _id: message.id,
      user: {
        _id: message.from
      },
      text: message.text,
      createdAt: new Date(message.time)
    };
  }

  async _loadMessages(){
    const {navigation} = this.props;
    this.setState({isLoading: true});
    console.log('Loading messages ...')
    const bandwidth = JSON.parse((await SecureStore.getItemAsync('bandwidth')) || '{}');
    const baseUrl = await AsyncStorage.getItem('baseUrl');
    const phoneNumber = await AsyncStorage.getItem('phoneNumber');
    try {
      const messages = await postJSON(`${baseUrl}/loadMessages`, Object.assign(bandwidth, {phoneNumber, contactNumber: navigation.getParam('to', '')}));
      this.setState({messages: messages.map(this._prepareMessage), phoneNumber});
    } catch (err) {
      alert(err.message);
    } finally {
      this.setState({isLoading: false});
    }
  }

  onIncomingMessage(message){
    const to = this.props.navigation.getParam('to', '');
    const {phoneNumber} = this.state;
    if (!(((message.to === to) && (message.from === phoneNumber)) || ((message.to === phoneNumber) && (message.to === phoneNumber)))) {
      return;
    }
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, [this._prepareMessage(message)]),
    }));
  }

  async onSend(messages = []) {
    const {navigation} = this.props;
    const bandwidth = JSON.parse((await SecureStore.getItemAsync('bandwidth')) || '{}');
    const phoneNumber = await AsyncStorage.getItem('phoneNumber');
    const baseUrl = await AsyncStorage.getItem('baseUrl');
    const message = await postJSON(`${baseUrl}/sendMessage`, Object.assign(bandwidth, {to:  navigation.getParam('to', ''), from: phoneNumber, text: messages[0].text}));
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, [this._prepareMessage(message)]),
    }));
  }
  
  render() {
    return (
      <GiftedChat 
        messages={this.state.messages}
        onSend={messages => this.onSend(messages)}
        isLoadingEarlier={this.state.isLoading}
        user={{
          from: this.state.phoneNumber,
        }}>
      </GiftedChat>);
  }
}
