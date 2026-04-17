'use client';

import { useState, useEffect } from 'react';
import Chatbot from '@/components/Chatbot';

export default function ClientLayout() {
  const [showChatbot, setShowChatbot] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  return <>{user && showChatbot && <Chatbot courseTitle="LMS Platform" />}</>;
}