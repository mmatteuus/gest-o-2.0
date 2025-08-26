
'use client';

import { supabase } from './supabase';
import { Profile } from './types';

export const isMasterAccount = (email: string): boolean => {
  return email === process.env.NEXT_PUBLIC_MASTER_EMAIL;
};

export const getCurrentUser = async (): Promise<Profile | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return profile as Profile;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

export const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
};
