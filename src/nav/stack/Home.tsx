import HomeScreen from "../../screens/App/Home";
import ArticleScreen from "../../screens/App/Home/Article";
import WriteScreen from "../../screens/App/Home/Write";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator<HomeStackParamList>();
export type HomeStackParamList = {
  Home:undefined,
  Write:undefined,
  Article:{postId:string},
}
const HomeStack = () => {
  return (
    <Stack.Navigator >
            <Stack.Screen name="Home" component={HomeScreen} options={{headerShown:false}}/>
            <Stack.Screen name="Write" component={WriteScreen} options={{headerShown:true,title:'새로운 글 작성',presentation:'modal'}}/>
            <Stack.Screen name="Article" component={ArticleScreen} options={{headerShown:true,title:'',presentation:'modal'}}/>
</Stack.Navigator>
  );
};

export default HomeStack;