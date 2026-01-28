import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { api } from '../services/api';

// 用户类型
export interface User {
  id: string;
  isAnonymous: boolean;
  email?: string;
  phone?: string;
}

// 认证状态
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isConfigured: boolean;
}

// 认证Hook
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isConfigured: isSupabaseConfigured(),
  });

  // 初始化：检查当前登录状态
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // 获取当前会话
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setState({
            user: {
              id: session.user.id,
              isAnonymous: session.user.is_anonymous || false,
              email: session.user.email,
              phone: session.user.phone,
            },
            isLoading: false,
            isConfigured: true,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('检查会话失败:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkSession();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setState({
            user: {
              id: session.user.id,
              isAnonymous: session.user.is_anonymous || false,
              email: session.user.email,
              phone: session.user.phone,
            },
            isLoading: false,
            isConfigured: true,
          });
        } else {
          setState(prev => ({ ...prev, user: null, isLoading: false }));
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 匿名登录
  const signInAnonymously = useCallback(async (): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      console.log('Supabase未配置，无法登录');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.error('匿名登录失败:', error);
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      if (data.user) {
        await api.init(); // 重新初始化API
        return true;
      }

      return false;
    } catch (error) {
      console.error('匿名登录异常:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  // 邮箱登录
  const signInWithEmail = useCallback(async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase未配置' };
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: error.message };
      }

      if (data.user) {
        await api.init();
        return { success: true };
      }

      return { success: false, error: '登录失败' };
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.message };
    }
  }, []);

  // 邮箱注册
  const signUpWithEmail = useCallback(async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase未配置' };
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: error.message };
      }

      if (data.user) {
        return { success: true };
      }

      return { success: false, error: '注册失败' };
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.message };
    }
  }, []);

  // 登出
  const signOut = useCallback(async (): Promise<void> => {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase.auth.signOut();
      setState(prev => ({ ...prev, user: null }));
    } catch (error) {
      console.error('登出失败:', error);
    }
  }, []);

  return {
    ...state,
    signInAnonymously,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };
}
