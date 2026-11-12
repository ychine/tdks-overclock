import express from 'express'
import cors from 'cors'
import { supabase } from './supabase.js'

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/todos', async (req, res) => {
  const { data, error } = await supabase.from('todos').select('*')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

app.listen(process.env.PORT || 5000, () =>
  console.log('Server running on http://localhost:5000')
)