import React from 'react';
import {SecureStore} from 'expo';
import {
    Button,
    View,
    AsyncStorage,
} from 'react-native';
import styles from '../constants/Styles';

export default class SignInScreen extends React.Component {
    static navigationOptions = {
        title: 'Log in',
    };

    render() {
        return (
        <View style={styles.container}>
            <TextInput
                autoFocus={true}
                placeholder="User ID"
                onChangeText={text => this.setState({userId: text})}
            />
            <TextInput
                placeholder="Api Token"
                onChangeText={text => this.setState({apiToken: text})}
            />
            <TextInput
                placeholder="Api Secret"
                onChangeText={text => this.setState({apiSecret: text})}
            />
            <TextInput
                placeholder="Phone Number"
                keyboardType="phone-pad"
                onChangeText={text => this.setState({phoneNumber: text})}
            />
            <TextInput
                placeholder="SIP Domain ID"
                onChangeText={text => this.setState({sipUserDomainId: text})}
            />
            <TextInput
                placeholder="Backend Server URL"
                onChangeText={text => this.setState({baseUrl: text})}
            />
            <Button title="Sign in" onPress={this._signInAsync} disabled={this.state.inProgress} />
            <ActivityIndicator animating={this.state.inProgress}/>
        </View>
        );
    }

    _signInAsync = async () => {
        this.setState({inProgress: true, error: null})
        try {
            let baseUrl = this.state.baseUrl;
            if (baseUrl.endsWith('/')) {
                baseUrl = baseUrl.substr(0, baseUrl.length - 1)
            }
            const {userId, apiToken, apiSecret, phoneNumber, sipUserName, sipPassword} = this.state;
            const response = await await fetch(`${baseUrl}/login`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({userId, apiToken, apiSecret, phoneNumber, sipUserName, sipPassword}),
            });
            if (response.ok) {
                const {sipUri, password, phoneNumber} = await response.json();
                await SecureStore.setItemAsync('sip', JSON.stringify({sipUri, password}));
                await AsyncStorage.setItem('userId', userId);
                await AsyncStorage.setItem('phoneNumber', phoneNumber);
                await AsyncStorage.setItem('baseUrl', baseUrl);
            } else {
                const {error} = await response.json();
                throw new Error(error || 'Unknown error from backend server');
            }
            this.props.navigation.navigate('App');
        } catch(err) {
            this.setState({error: err.message});
        } finally {
            this.setState({inProgress: false});
        }
    };
}
