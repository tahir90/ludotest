import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LudoBoardScreen from '$screens/LudoBoardScreen';
import SplashScreen from '$screens/SplashScreen';
import HomeScreen from '$screens/HomeScreen';
import ShopScreen from '$screens/ShopScreen';
import GiftShopScreen from '$screens/GiftShopScreen';
import ProfileScreen from '$screens/ProfileScreen';
import SettingsScreen from '$screens/SettingsScreen';
import ClubsScreen from '$screens/ClubsScreen';
import ClubRoomScreen from '$screens/ClubRoomScreen';
import CreateClubScreen from '$screens/CreateClubScreen';
import FriendsScreen from '$screens/FriendsScreen';
import LobbyScreen from '$screens/LobbyScreen';
import LeaderboardScreen from '$screens/LeaderboardScreen';
import CrownKingScreen from '$screens/CrownKingScreen';
import ChestScreen from '$screens/ChestScreen';
import { navigationRef } from '$helpers/navigationUtils';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  return (
    <NavigationContainer
      ref={navigationRef}
    >
      <Stack.Navigator
            initialRouteName='SplashScreen'
            screenOptions={{headerShown:false}}
        >
            <Stack.Screen name='SplashScreen' component={SplashScreen} />
            <Stack.Screen name='HomeScreen' component={HomeScreen} />
            <Stack.Screen name='LudoBoardScreen' component={LudoBoardScreen} />
            
            {/* Shop Screens */}
            <Stack.Screen name='ShopScreen' component={ShopScreen} />
            <Stack.Screen name='GiftShopScreen' component={GiftShopScreen} />
            
            {/* Profile Screens */}
            <Stack.Screen name='ProfileScreen' component={ProfileScreen} />
            <Stack.Screen name='SettingsScreen' component={SettingsScreen} />
            
            {/* Social Screens */}
            <Stack.Screen name='ClubsScreen' component={ClubsScreen} />
            <Stack.Screen name='ClubRoomScreen' component={ClubRoomScreen} />
            <Stack.Screen name='CreateClubScreen' component={CreateClubScreen} />
            <Stack.Screen name='FriendsScreen' component={FriendsScreen} />
            <Stack.Screen name='LobbyScreen' component={LobbyScreen} />
            
            {/* Competitive Screens */}
            <Stack.Screen name='LeaderboardScreen' component={LeaderboardScreen} />
            <Stack.Screen name='CrownKingScreen' component={CrownKingScreen} />
            
            {/* Other Screens */}
            <Stack.Screen name='ChestScreen' component={ChestScreen} />
        </Stack.Navigator>
    </NavigationContainer>
  )
}

export default RootNavigator