import React, { useState } from 'react';
import { View } from 'react-native';
import { Background } from '@/shared/component/Background';
import { Text } from '@/shared/component/Text';
import { SearchBar } from '@/shared/component/SearchBar';
import { Button } from '@/shared/component/Button';
import { callPerplexityViaEdge } from '@/shared/libs/supabase/supabase-perplexity';
export const HomeScreen = () => {
  const [resp, setResp] = useState<string>('');

  const onTestPerplexity = async () => {
    try {
      const data = await callPerplexityViaEdge(
        {
          model: 'sonar',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: '데일 카네기의 인간관계론 책은 페이지 수는 몇페이지?' },
          ],
          stream: false,
        }
      )
      console.log("data", data)
      const content = data?.choices?.[0]?.message?.content
      setResp(typeof content === 'string' && content.length > 0 ? content : JSON.stringify(data))
    } catch (e: any) {
      setResp(String(e?.message ?? e))
    }
  }
  return (
    <Background>
      {/* 검색 바 */}
      <View className="w-full px-4 mt-2">
        <SearchBar placeholder="검색어를 입력하세요" />
      </View>
      <View className="w-full px-4 mt-2">
        <Button text="Perplexity 테스트" onPress={onTestPerplexity} />
      </View>
      {resp ? (
        <View className="w-full px-4 mt-2">
          <Text text={resp} type="body2" />
        </View>
      ) : null}
      <Text text="Title1" type="title1"/>
      <Text text="Title2" type="title2"/>
      <Text text="Title3" type="title3"/>
      <Text text="Title4" type="title4"/>
      <Text text="Body1" type="body1"/>
      <Text text="Body2" type="body2"/>
      <Text text="Body3" type="body3"/>
      <Text text="Caption1" type="caption1"/>
      <Text text="Handwriting" type="handwriting"/>
    </Background>
  );
};