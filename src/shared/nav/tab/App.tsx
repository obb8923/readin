import React from 'react';
import {BooksStack} from '@/shared/nav/stack/Books';
import {HomeStack} from '@/shared/nav/stack/Home';
import {ProfileStack} from '@/shared/nav/stack/Profile';
import { useActiveTab } from '@store/tabStore';
import { TAB_NAME } from '@/shared/constant/tab';

export const AppTab = () => {
  const activeTab = useActiveTab();

  // 현재 활성화된 탭에 따라 해당 스택을 렌더링
  switch (activeTab) {
    case TAB_NAME.HOME:
      return <HomeStack />;
    case TAB_NAME.BOOKS:
      return <BooksStack />;
    case TAB_NAME.PROFILE:
            return <ProfileStack />;
    default:
      return <HomeStack />; 
  }
};


