import React from 'react';
import { View, Image } from 'react-native';
import { Text } from '@components/Text';
import { DiaryEntry } from '@/shared/types/diary';
import { formatSelectedDate as splitSelectedDate } from '@libs/date';
import { WeatherSelector } from '@/domain/diary/components/WeatherSelector';
import { commentStyle, dateStyle } from '@constants/normal';
import { FLOWER_IMAGES, SMALL_IMAGE_SIZE,PADDING_TOP, HORIZONTAL_PADDING, NUMBER_OF_LINES, LINE_HEIGHT,TEXT_SIZE, MIN_TEXT_HEIGHT } from '@constants/normal';

type DiaryPreviewProps = { date: Date; entry: DiaryEntry };

export const DiaryPreview = ({ date, entry }: DiaryPreviewProps) => {
  const { year, month, day } = splitSelectedDate(date);
  const flowerIndex = entry.flowerIndex;
  const flowerSource = flowerIndex
    ? FLOWER_IMAGES[(Math.max(1, Math.min(flowerIndex, FLOWER_IMAGES.length)) - 1)]
    : undefined;
  
  return (
    <View className="w-full border border border-line rounded-lg">
      {/* 헤더: 날짜/날씨 */}
     <View className="flex-row items-center justify-center border-b border-line p-3">
          <Text text={`${year}`} type="kb2019" className={dateStyle}/>
          <Text text=' 년  ' type="black" className={dateStyle}/>
          <Text text={`${month}`} type="kb2019" className={dateStyle}/>
          <Text text=' 월  ' type="black" className={dateStyle}/>
          <Text text={`${day}`} type="kb2019" className={dateStyle}/>
          <Text text=' 일  ' type="black" className={dateStyle}/>
          <WeatherSelector textStyle={dateStyle} disabled={true} />
      </View>

      {/* 본문: 라인 배경 + 내용 */}
      <View className="relative" style={{ minHeight: MIN_TEXT_HEIGHT }}>
        {/* 라인 배경 */}
        <View className="absolute inset-0" style={{ paddingTop: PADDING_TOP, paddingLeft: 16, paddingRight: 16 }}>
          {Array.from({ length: NUMBER_OF_LINES }, (_, index) => (
            <View
              key={index}
              className="border-b border-line"
              style={{ height: LINE_HEIGHT, marginBottom: 0 }}
            />
          ))}
        </View>

        {/* 내용 */}
        <View 
          className="py-3 px-6"
        >
          <Text
            text={entry.content}
            type="kb2019"
            className="text-text-black"
            style={{ 
              fontSize: TEXT_SIZE,
              lineHeight: LINE_HEIGHT, 
              textAlignVertical: 'top', 
            }}
          />
        </View>

                {/* 작은 이미지 - 글 바로 밑 오른쪽에 배치 */}
        {flowerSource && (
          <View
            pointerEvents="none"
            className="flex-row items-center justify-end w-full z-15"
            style={{ paddingRight: HORIZONTAL_PADDING}}
          >
            <Image
              source={flowerSource}
              resizeMode="contain"
              style={{ width: SMALL_IMAGE_SIZE, height: SMALL_IMAGE_SIZE }}
            />
          </View>
        )}

        {/* 코멘트 - 작은 이미지 바로 아래에 배치 */}
        {entry.comment && (
          <View
            pointerEvents="none"
            className="z-20 px-6 pb-24"
          >
            <Text
              text={entry.comment}
              type="kb2023"
              className={commentStyle}
              style={{ transform: [{ rotate: '-1deg' }] }}
            />
          </View>
)}
      </View>
    </View>
  );
};
