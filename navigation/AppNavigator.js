import { createSwitchNavigator, createStackNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import AuthLoadingScreen from '../screens/AuthLoadingScreen'
import SignInScreen from '../screens/SignInScreen'
import ActiveCallScreen from '../screens/ActiveCallScreen'
import IncomingCallScreen from '../screens/IncomingCallScreen'

const AuthStack = createStackNavigator({ SignIn: SignInScreen });

export default createSwitchNavigator({
  App: MainTabNavigator,
  Auth: AuthStack,
  AuthLoading: AuthLoadingScreen,
  ActiveCall: ActiveCallScreen,
  IncomingCall: IncomingCallScreen,
}, {
  initialRouteName: 'AuthLoading',
});

