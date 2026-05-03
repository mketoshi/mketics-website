import { supabase } from "../supabaseClient";

// SIGN UP
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

// LOGIN
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

// LOGOUT
export const signOut = async () => {
  await supabase.auth.signOut();
};

// GET USER
export const getUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data.user;
};