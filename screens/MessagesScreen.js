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
    headerRight: (<Button title={navigation.getParam('to', '') || 'Enter Contact'} onPress={() => {
      navigation.setParams({visiblePrompt: true});
    }}></Button>)
  });

  state = {
    phoneNumber: '111',
    messages: [],
    isLoading: false
  }

  async componentWillMount() {
    this.onIncomingMessage = this.onIncomingMessage.bind(this);
    addIncomingMessagesHandler(this.onIncomingMessage);
  }

  componentWillUnmount() {
    removeIncomingMessagesHandler(this.onIncomingMessage);
  }

  _prepareMessage(message){
    return message;
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
    const to = this.params.navigation.getParam('to', '');
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
    const baseUrl = await AsyncStorage.getItem('baseUrl');
    const message = postJSON(`${baseUrl}/sendMessage`, Object.assign(bandwidth, {to:  navigation.getParam('to', ''), from: this.state.phoneNumber, text: messages[0].text}));
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, [this._prepareMessage(message)]),
    }));
  }
  
  render() {
    const {navigation} = this.props;
    return (
      <View>
        <Prompt
          title="Phone number for messaging"
          inputPlaceholder="Enter phone number"
          isVisible={navigation.getParam('visiblePrompt', false)}
          defaultValue="+1"
          onBackButtonPress={() => {}}
          onChangeText={to => {
            navigation.setParams({to});
          }}
          onCancel={() => {
            navigation.setParams({visiblePrompt: false, to: ''});
          }}
          onSubmit={() => {
            navigation.setParams({visiblePrompt: false});
            this._loadMessages();
          }}
        />
        <GiftedChat 
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          isLoadingEarlier={this.state.isLoading}
          user={{
            from: this.state.phoneNumber,
          }}>
        </GiftedChat>
      </View>
    );
  }
}
