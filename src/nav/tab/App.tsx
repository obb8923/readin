import {
    BottomTabNavigationOptions,
    createBottomTabNavigator,
  } from '@react-navigation/bottom-tabs';
import HomeStack from '../stack/Home';
import ProfileStack from '../stack/Profile';
import {Platform} from 'react-native';
import HomeIcon from '../../../assets/svgs/Home.svg';
import ProfileIcon from '../../../assets/svgs/Profile.svg';
const isIOS = Platform.OS === 'ios';

const Tab = createBottomTabNavigator();

const TabNavOptions0 = {
  headerShown: false,
  tabBarStyle: {
    borderTopColor: 'transparent',
    // backgroundColor: '#36384E',
    height: isIOS ? 100 : 78,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 10,
    position: 'absolute',
  },
  tabBarItemStyle: {flex: 1},
  tabBarIconStyle: {flex: 1},
  tabBarLabelStyle: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Pretendard-Regular',
    lineHeight: 16.5,
    letterSpacing: -0.275,
  },
  // tabBarActiveTintColor: '#fafafa',
  // tabBarInactiveTintColor: '#585a6c',
};
const TabNavOptions = {
  headerShown: false,
  tabBarStyle: {
    borderTopColor: 'transparent',
    // backgroundColor: 'red',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 10,
    position: 'absolute',
  }

}
// <Tab.Navigator screenOptions={TabNavOptions as BottomTabNavigationOptions}>
const AppTab = () => {
  return (
     
<Tab.Navigator screenOptions={TabNavOptions as BottomTabNavigationOptions}>
<Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({focused}) =>
            focused ? (
              <HomeIcon style={{color: '#3B82F6'}} />
            ) : (
              <HomeIcon style={{color: '#dddddd'}} />
            ),
        }}
      />
      <Tab.Screen
        name="ProfileStack"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({focused}) =>
            focused ? (
              <ProfileIcon style={{color: '#3B82F6'}} />
            ) : (
              <ProfileIcon style={{color: '#dddddd'}} />
            ),
        }}
      />
   </Tab.Navigator>
  );
};

export default AppTab;



