import express from 'express'
import cors from 'cors'
import { supabase } from './supabase.js'
import ocrRouter from './src/routes/ocr.js'
import chatRouter from './src/routes/chat.js'

const app = express()
// Any localhost port, so Vite still works when it falls back to 5174, 5175, ...
app.use(cors({ origin: /^http:\/\/localhost:\d+$/, exposedHeaders: ['ETag', 'Location'] }))
app.use(express.json({ limit: '50kb' }))
app.use('/api/ocr', ocrRouter)
app.use('/api/chat', chatRouter)

app.get('/api/todos', async (req, res) => {
  const { data, error } = await supabase.from('todos').select('*')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

app.listen(process.env.PORT || 5000, () =>
  console.log('Server running on http://localhost:5000')
)