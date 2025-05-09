import { NavigationContainer } from "@react-navigation/native";
import RootStack from "./src/nav/stack/Root";
import "./global.css"

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
     <RootStack />
    </NavigationContainer>
  );
}

export default App;
