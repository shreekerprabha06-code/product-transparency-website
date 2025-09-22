// backend/Routes/questions.js - FIXED VERSION
const express = require('express')
const { MongoClient, ObjectId } = require('mongodb')
const router = express.Router()

const MONGO_URI = 'mongodb+srv://shreeker027:ihJ2UQg4Rr4WTG4X@cluster0.qtmxkjb.mongodb.net/product-transparency'

// POST /questions - Save answer to question
router.post('/', async (req, res) => {
    let client
    try {
        console.log('Received save answer request:', req.body)
        
        const { productId, question, answer, step } = req.body
        
        // Validate required fields
        if (!productId || !question || !answer) {
            return res.status(400).json({
                success: false,
                message: 'ProductId, question, and answer are required'
            })
        }

        // Validate ObjectId
        if (!ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format'
            })
        }

        // Connect to MongoDB
        client = new MongoClient(MONGO_URI)
        await client.connect()
        console.log('Connected to MongoDB')
        
        const db = client.db('product-transparency')
        const collection = db.collection('questions')
        
        // Create question-answer document
        const questionDoc = {
            productId: new ObjectId(productId),
            question,
            answer,
            step: step || 1,
            createdAt: new Date()
        }
        
        console.log('Inserting question-answer:', questionDoc)
        
        // Insert question-answer
        const result = await collection.insertOne(questionDoc)
        console.log('Insert result:', result)
        
        if (result.insertedId) {
            res.status(201).json({
                success: true,
                questionId: result.insertedId,
                message: 'Answer saved successfully'
            })
        } else {
            throw new Error('Failed to save answer')
        }
        
    } catch (error) {
        console.error('Error saving answer:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to save answer',
            error: error.message
        })
    } finally {
        // Always close the connection
        if (client) {
            await client.close()
            console.log('MongoDB connection closed')
        }
    }
})

// GET /questions/:productId - Get all questions and answers for a product
router.get('/:productId', async (req, res) => {
    let client
    try {
        const { productId } = req.params
        console.log('Getting questions for product:', productId)
        
        // Validate ObjectId
        if (!ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format'
            })
        }
        
        // Connect to MongoDB
        client = new MongoClient(MONGO_URI)
        await client.connect()
        
        const db = client.db('product-transparency')
        const collection = db.collection('questions')
        
        // Find all questions for this product
        const questions = await collection
            .find({ productId: new ObjectId(productId) })
            .sort({ step: 1, createdAt: 1 })
            .toArray()
        
        res.json({
            success: true,
            questions,
            count: questions.length
        })
        
    } catch (error) {
        console.error('Error getting questions:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to get questions',
            error: error.message
        })
    } finally {
        if (client) {
            await client.close()
        }
    }
})

// DELETE /questions/:productId - Clear all questions for a product (useful for testing)
router.delete('/:productId', async (req, res) => {
    let client
    try {
        const { productId } = req.params
        console.log('Deleting questions for product:', productId)
        
        // Validate ObjectId
        if (!ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format'
            })
        }
        
        // Connect to MongoDB
        client = new MongoClient(MONGO_URI)
        await client.connect()
        
        const db = client.db('product-transparency')
        const collection = db.collection('questions')
        
        // Delete all questions for this product
        const result = await collection.deleteMany({ productId: new ObjectId(productId) })
        
        res.json({
            success: true,
            deletedCount: result.deletedCount,
            message: `Deleted ${result.deletedCount} questions`
        })
        
    } catch (error) {
        console.error('Error deleting questions:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to delete questions',
            error: error.message
        })
    } finally {
        if (client) {
            await client.close()
        }
    }
})

module.exports = router