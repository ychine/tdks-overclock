import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

export default function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTodos() {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('id', { ascending: true })
      if (error) setError(error.message)
      else setTodos(data)
      setLoading(false)
    }
    loadTodos()
  }, [])

  async function addTodo(e) {
    e.preventDefault()
    if (!title.trim()) return
    const { data, error } = await supabase
      .from('todos')
      .insert({ title: title.trim() })
      .select()
      .single()
    if (error) return setError(error.message)
    setError(null)
    setTodos(prev => [...prev, data])
    setTitle('')
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>My Todos</h1>
      <form onSubmit={addTodo} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="New todo"
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit">Add</button>
      </form>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {loading && <p>Loading...</p>}
      <ul>
        {todos.map(t => <li key={t.id}>{t.title}</li>)}
      </ul>
    </div>
  )
}