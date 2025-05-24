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
import {TabNavOptions} from '../../constants/TabNavOptions';
import BookcaseStack from '../stack/Bookcase';
import BookIcon from '../../../assets/svgs/Book.svg';
const Tab = createBottomTabNavigator();


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
            tabBarStyle: routeName === 'Home'
              ? { ...TabNavOptions.tabBarStyle, display: 'flex' }
              : { display: 'none' },
          }
    }}
  />
  <Tab.Screen
    name="BookcaseStack"
        component={BookcaseStack}
        options={({route}) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Book';
          return {
            tabBarLabel: '책장',
            tabBarIcon: ({focused}) =>
              focused ? (
                <BookIcon style={{color: Colors.black}} />
              ) : (
                <BookIcon style={{color: '#dddddd'}} />
              ),
            tabBarStyle: routeName === 'Book'
              ? { ...TabNavOptions.tabBarStyle, display: 'flex' }
              : { display: 'none' },
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
            tabBarStyle: routeName === 'Profile'
              ? { ...TabNavOptions.tabBarStyle, display: 'flex' }
              : { display: 'none' },
          }
    }}
  />
   </Tab.Navigator>
  );
};

export default AppTab;



