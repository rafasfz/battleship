import express from 'express'
import path from 'path'
import cors from 'cors'
import { fileURLToPath } from 'url'

const app = express()

app.use(express.json())
app.use(cors('*'))

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use(express.static(path.join(__dirname, 'public')))

export default app
