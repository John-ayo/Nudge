import { supabase } from './supabase'

export async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name }
    }
  })
  if (error) throw error

  // Fire welcome email in the background, don't block signup
  if (data?.user) {
    supabase.functions.invoke('welcome-email', {
      body: {
        record: {
          email: data.user.email,
          raw_user_meta_data: { full_name: name }
        }
      }
    }).catch(err => console.error('Welcome email failed:', err))
  }

  return data
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return data
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

export async function requestPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })
  if (error) throw error
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error

  // A reset usually means the old password may be compromised, so end other sessions
  try {
    await supabase.auth.signOut({ scope: 'others' })
  } catch (err) {
    console.error('Could not end other sessions:', err)
  }
}