import { createSwitchNavigator, createStackNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import AuthLoadingScreen from '../screens/AuthLoadingScreen'
import SignInScreen from '../screens/SignInScreen'
import ActiveCallScreen from '../screens/ActiveCallScreen'

const AuthStack = createStackNavigator({ SignIn: SignInScreen });

export default createSwitchNavigator({
  App: MainTabNavigator,
  Auth: AuthStack,
  AuthLoading: AuthLoadingScreen,
  ActiveCall: ActiveCallScreen,
}, {
  initialRouteName: 'AuthLoading',
});

