import { View } from "react-native";
import { ReadingLogDataForGraph } from "../libs/supabase/supabaseOperations";
type ContributionGraphProps = {
  data: ReadingLogDataForGraph[];
  width: number;
}
const ContributionGraph = ({data}: ContributionGraphProps) => {
  return (
    <View>
    </View>
  );
};

export default ContributionGraph;