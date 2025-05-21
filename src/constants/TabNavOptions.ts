import Colors from "./Colors";

const TabNavOptions0 = {
    headerShown: false,
    tabBarStyle: {
      borderTopColor: 'transparent',
      // backgroundColor: '#36384E',
      height: 78,
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
      backgroundColor: Colors.backgroundf8,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      padding: 10,
      // position: 'absolute' as 'absolute',
      display: 'flex',
      elevation: 0,
    },
    tabBarLabelStyle: {
      fontSize: 11,
      // fontFamily: 'Pretendard-Regular',
      letterSpacing: -0.275,
      
    },
    tabBarActiveTintColor: Colors.black,
    tabBarInactiveTintColor: '#bbbbbb',
  }
export const TabNavOptionsNone = {
  headerShown: false,
  tabBarStyle: {
    display: 'none',
  },
}