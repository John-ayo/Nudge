import { supabase } from './supabase'

export async function fetchTasks(userId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createTask(userId, task) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id:  userId,
      title:    task.title,
      priority: task.priority,
      due_date: task.due,
      done:     false,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTask(taskId, updates) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTask(taskId) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
  if (error) throw error
}