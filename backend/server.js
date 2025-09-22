const express = require('express')
const PORT = 5000
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())

app.use('/products', require('./Routes/products'))
app.use('/questions', require('./Routes/questions'))
app.use('/reports', require('./Routes/reports'))
app.use('/calculate-score', require('./Routes/calculate-score'))

app.listen(PORT, () => {
    console.log(`Main backend server running on port ${PORT}`)
})