import React from 'react';
import {
    Button,
    View,
} from 'react-native';

export default class SignInScreen extends React.Component {
    static navigationOptions = {
        title: 'Please sign in',
    };

    render() {
        return (
        <View style={styles.container}>
            <Button title="Sign in!" onPress={this._signInAsync} />
        </View>
        );
    }

    _signInAsync = async () => {
        await AsyncStorage.setItem('accessToken', '123');
        this.props.navigation.navigate('App');
    };
}
  
 