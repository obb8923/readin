import React from 'react';
import {CalendarStack} from '@nav/stack/Calendar';
import {DiaryStack} from '@nav/stack/Diary';
import {EtcStack} from '@nav/stack/Etc';
import { useActiveTab } from '@store/tabStore';

export const AppTab = () => {
  const activeTab = useActiveTab();

  // 현재 활성화된 탭에 따라 해당 스택을 렌더링
  switch (activeTab) {
    case 'Diary':
      return <DiaryStack />;
    case 'Calendar':
      return <CalendarStack />;
    case 'Etc':
      return <EtcStack />;
    default:
      return <DiaryStack />; 
  }
};


