import React from 'react';
import {SecureStore} from 'expo';
import validate from 'validate.js'

import {
    Button,
    View,
    AsyncStorage,
} from 'react-native';

import TextField from '../components/TextField';
import styles from '../constants/Styles';

export default class SignInScreen extends React.Component {
    static navigationOptions = {
        title: 'Log in',
    };

    render() {
        return (
        <View style={styles.container}>
            <TextField
                autoFocus={true}
                placeholder="User ID"
                onChangeText={text => this.setState({userId: text})}
                error={this.state.errors.userId}
            />
            <TextField
                placeholder="Api Token"
                onChangeText={text => this.setState({apiToken: text})}
                error={this.state.errors.apiToken}
            />
            <TextField
                placeholder="Api Secret"
                onChangeText={text => this.setState({apiSecret: text})}
                error={this.state.errors.apiSecret}
            />
            <TextField
                placeholder="SIP Domain ID"
                onChangeText={text => this.setState({domainId: text})}
                error={this.state.errors.domainId}
                hint="Leave empty to create new SIP domain automatically."
            />
            <TextField
                placeholder="Phone Number (like +11234567890)"
                keyboardType="phone-pad"
                onChangeText={text => this.setState({phoneNumber: text})}
                error={this.state.errors.phoneNumber}
                hint="Leave empty if you would like to allocate new number."
            />
            <TextField
                placeholder="Backend Server URL"
                onChangeText={text => this.setState({baseUrl: text})}
                error={this.state.errors.baseUrl}
            />
            <Button title="Sign in" onPress={this._signInAsync} disabled={this.state.inProgress} />
            <ActivityIndicator animating={this.state.inProgress}/>
        </View>
        );
    }

    _validate = async () => {
        const result = await validate.async(this.state, {
            userId: {
                presence: true
            },
            apiToken: {
                presence: true
            },
            apiSecret: {
                presence: true
            },
            domainId: {
                presence: true
            },
            phoneNumber: {
                length: {
                    is: 6,
                }
            },
            baseUrl: {
                presence: true
            },
        })
        const errors = {}
        let hasErrors = false
        Object.keys(result || {}).forEach(key => {
            errors[key] = result[key].join(', ')
            hasErrors = true
        })
        this.setState({errors});
        return hasErrors;
    }

    _signInAsync = async () => {
        this.setState({inProgress: true, error: null})
        try {
            const hasErrors = await this._validate();
            if (hasErrors) {
                return;
            }
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
