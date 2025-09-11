import React, { useEffect, useState } from 'react';
import {BooksStack} from '@/shared/nav/stack/Books';
import {HomeStack} from '@/shared/nav/stack/Home';
import {ProfileStack} from '@/shared/nav/stack/Profile';
import { useActiveTab } from '@store/tabStore';
import { TAB_NAME } from '@/shared/constant/tab';
import { supabase } from '@/shared/libs/supabase/supabase';
import { LoginScreen } from '@profile/screen/LoginScreen';

export const AppTab = () => {
  const activeTab = useActiveTab();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;
        setIsLoggedIn(!!data.session);
      } finally {
        if (isMounted) setIsAuthLoading(false);
      }
    };
    init();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  if (isAuthLoading) {
    return null;
  }

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

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


