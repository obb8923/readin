import {
    BottomTabNavigationOptions,
    createBottomTabNavigator,
  } from '@react-navigation/bottom-tabs';
import HomeStack from '../stack/Home';
import ProfileStack from '../stack/Profile';
import {Platform} from 'react-native';
import HomeIcon from '../../../assets/svgs/Home.svg';
import ProfileIcon from '../../../assets/svgs/Profile.svg';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Colors from '../../constants/Colors';
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
export const TabNavOptions = {
  headerShown: false,
  tabBarStyle: {
    borderTopColor: 'transparent',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 10,
    position: 'absolute' as 'absolute',
  },
  tabBarLabelStyle: {
    fontSize: 11,
    // fontFamily: 'Pretendard-Regular',
    letterSpacing: -0.275,
    
  },
  tabBarActiveTintColor: Colors.black,
  tabBarInactiveTintColor: '#bbbbbb',

}
// <Tab.Navigator screenOptions={TabNavOptions as BottomTabNavigationOptions}>
const AppTab = () => {
  return (
     
<Tab.Navigator screenOptions={TabNavOptions as BottomTabNavigationOptions}>
<Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={({route}) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
          return {
          tabBarLabel: '홈',
          tabBarIcon: ({focused}) =>
            focused ? (
              <HomeIcon style={{color: Colors.black}} />
            ) : (
              <HomeIcon style={{color: '#dddddd'}} />
            ),
            tabBarStyle: routeName === 'Home' ? TabNavOptions.tabBarStyle : {display: 'none'},
          }
        }}
      />
      <Tab.Screen
        name="ProfileStack"
        component={ProfileStack}
        options={({route}) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Profile';
          return {
          tabBarLabel: '프로필',
          tabBarIcon: ({focused}) =>
            focused ? (
              <ProfileIcon style={{color: Colors.black}} />
            ) : (
              <ProfileIcon style={{color: '#dddddd'}} />
            ),
            tabBarStyle: routeName === 'Profile' ? TabNavOptions.tabBarStyle : {display: 'none'},
          }
        }}
      />
   </Tab.Navigator>
  );
};

export default AppTab;



