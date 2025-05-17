export const contributionGraphConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#ffffff",
    backgroundGradientToOpacity: 0,
    color: (opacityFromLibrary = 1) => {
      const zeroCountOpacityThreshold = 0.15;

      if (opacityFromLibrary <= zeroCountOpacityThreshold + 0.001) {
        return `rgba(240, 242, 244,1)`;
      } else {
        const minMeaningfulOpacity = zeroCountOpacityThreshold + 0.001; //유의미한 count를 가지는 네모칸이 가질 수 있는 최소 투명도
        const maxOpacity = 1.0; // 최대 투명도

        let intensity = 0;
        if (maxOpacity > minMeaningfulOpacity && opacityFromLibrary > minMeaningfulOpacity) {
            intensity = (opacityFromLibrary - minMeaningfulOpacity) / (maxOpacity - minMeaningfulOpacity);
        } else if (opacityFromLibrary >= maxOpacity) {
            intensity = 1;
        }
        
        intensity = Math.min(Math.max(intensity, 0), 1);

        const r_val = 52;
        const g_light = 152; const g_dark = 70;
        const b_light = 219; const b_dark = 170;

        const g = Math.floor(g_light - (g_light - g_dark) * intensity);
        const b = Math.floor(b_light - (b_light - b_dark) * intensity);

        return `rgba(${r_val}, ${g}, ${b}, ${opacityFromLibrary})`;
      }
    },
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 12,
      fill: '#000000',
      fontFamily: 'Pretendard-Regular',
    }
  };
