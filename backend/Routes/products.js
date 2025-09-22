// backend/Routes/products.js - FIXED VERSION
const express = require('express')
const { MongoClient, ObjectId } = require('mongodb')
const router = express.Router()

const MONGO_URI = 'mongodb+srv://shreeker027:ihJ2UQg4Rr4WTG4X@cluster0.qtmxkjb.mongodb.net/product-transparency'

// POST /products - Create new product
router.post('/', async (req, res) => {
    let client
    try {
        console.log('Received product creation request:', req.body)
        
        const { name, category, description, manufacturer } = req.body
        
        // Validate required fields
        if (!name || !category) {
            return res.status(400).json({
                success: false,
                message: 'Name and category are required'
            })
        }

        // Connect to MongoDB
        client = new MongoClient(MONGO_URI)
        await client.connect()
        console.log('Connected to MongoDB')
        
        const db = client.db('product-transparency')
        const collection = db.collection('products')
        
        // Create product document
        const productDoc = {
            name,
            category,
            description: description || '',
            manufacturer: manufacturer || '',
            createdAt: new Date(),
            updatedAt: new Date()
        }
        
        console.log('Inserting product:', productDoc)
        
        // Insert product
        const result = await collection.insertOne(productDoc)
        console.log('Insert result:', result)
        
        if (result.insertedId) {
            res.status(201).json({
                success: true,
                productId: result.insertedId,
                message: 'Product created successfully'
            })
        } else {
            throw new Error('Failed to insert product')
        }
        
    } catch (error) {
        console.error('Error creating product:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
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

// GET /products/:id - Get product by ID
router.get('/:id', async (req, res) => {
    let client
    try {
        const { id } = req.params
        console.log('Getting product with ID:', id)
        
        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format'
            })
        }
        
        // Connect to MongoDB
        client = new MongoClient(MONGO_URI)
        await client.connect()
        
        const db = client.db('product-transparency')
        const collection = db.collection('products')
        
        // Find product
        const product = await collection.findOne({ _id: new ObjectId(id) })
        
        if (product) {
            res.json({
                success: true,
                product
            })
        } else {
            res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }
        
    } catch (error) {
        console.error('Error getting product:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to get product',
            error: error.message
        })
    } finally {
        if (client) {
            await client.close()
        }
    }
})

// GET /products - Get all products
router.get('/', async (req, res) => {
    let client
    try {
        console.log('Getting all products')
        
        // Connect to MongoDB
        client = new MongoClient(MONGO_URI)
        await client.connect()
        
        const db = client.db('product-transparency')
        const collection = db.collection('products')
        
        // Get all products
        const products = await collection.find({}).toArray()
        
        res.json({
            success: true,
            products,
            count: products.length
        })
        
    } catch (error) {
        console.error('Error getting products:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to get products',
            error: error.message
        })
    } finally {
        if (client) {
            await client.close()
        }
    }
})

module.exports = router