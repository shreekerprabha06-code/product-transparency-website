require('dotenv').config()
const express = require('express')
const PORT = 5001
const app = express()
const cors = require('cors')
const generateQuestionsRouter = require('./Routes/generate-questions')

app.use(cors())
app.use(express.json())

app.use('/generate-questions', require('./Routes/generate-questions'))
app.use('/', generateQuestionsRouter)

app.listen(PORT, () => {
    console.log(`AI service running on port ${PORT}`)
})