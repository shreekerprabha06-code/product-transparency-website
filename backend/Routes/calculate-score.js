// backend/Routes/calculate-score.js - FIXED VERSION
const express = require('express')
const { MongoClient, ObjectId } = require('mongodb')
const router = express.Router()

const MONGO_URI = 'mongodb+srv://shreeker027:ihJ2UQg4Rr4WTG4X@cluster0.qtmxkjb.mongodb.net/product-transparency'

// POST /calculate-score - Calculate transparency score for a product
router.post('/', async (req, res) => {
    let client
    try {
        console.log('Received calculate score request:', req.body)
        
        const { productId } = req.body
        
        // Validate required fields
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'ProductId is required'
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
        
        // Get product details
        const product = await db.collection('products').findOne({ _id: new ObjectId(productId) })
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }
        
        // Get all questions and answers for this product
        const questions = await db.collection('questions')
            .find({ productId: new ObjectId(productId) })
            .toArray()
        
        console.log(`Found ${questions.length} questions for product ${productId}`)
        
        // Calculate transparency score
        const scoreData = calculateTransparencyScore(product, questions)
        
        // Save score to database
        const scoreDoc = {
            productId: new ObjectId(productId),
            transparencyScore: scoreData.transparencyScore,
            breakdown: scoreData.breakdown,
            recommendations: scoreData.recommendations,
            totalQuestions: questions.length,
            calculatedAt: new Date()
        }
        
        // Insert or update score
        await db.collection('scores').replaceOne(
            { productId: new ObjectId(productId) },
            scoreDoc,
            { upsert: true }
        )
        
        console.log('Score calculated and saved:', scoreData.transparencyScore)
        
        res.json({
            success: true,
            transparencyScore: scoreData.transparencyScore,
            breakdown: scoreData.breakdown,
            recommendations: scoreData.recommendations,
            totalQuestions: questions.length
        })
        
    } catch (error) {
        console.error('Error calculating score:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to calculate transparency score',
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

// GET /calculate-score/:productId - Get existing transparency score
router.get('/:productId', async (req, res) => {
    let client
    try {
        const { productId } = req.params
        console.log('Getting existing score for product:', productId)
        
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
        
        // Find existing score
        const scoreData = await db.collection('scores').findOne({ productId: new ObjectId(productId) })
        
        if (scoreData) {
            res.json({
                success: true,
                transparencyScore: scoreData.transparencyScore,
                breakdown: scoreData.breakdown,
                recommendations: scoreData.recommendations,
                totalQuestions: scoreData.totalQuestions,
                calculatedAt: scoreData.calculatedAt
            })
        } else {
            res.status(404).json({
                success: false,
                message: 'No transparency score found for this product'
            })
        }
        
    } catch (error) {
        console.error('Error getting score:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to get transparency score',
            error: error.message
        })
    } finally {
        if (client) {
            await client.close()
        }
    }
})

// Rule-based transparency scoring algorithm
function calculateTransparencyScore(product, questions) {
    let completenessScore = 0
    let detailScore = 0
    let complianceScore = 0
    const recommendations = []
    
    // Base score for having basic product info
    if (product.name && product.category) completenessScore += 20
    if (product.description && product.description.length > 20) completenessScore += 15
    if (product.manufacturer) completenessScore += 15
    
    // Score based on number of questions answered
    const questionCount = questions.length
    if (questionCount >= 5) {
        completenessScore += 30
    } else if (questionCount >= 3) {
        completenessScore += 20
    } else if (questionCount >= 1) {
        completenessScore += 10
    } else {
        recommendations.push("Answer more questions to improve transparency score")
    }
    
    // Score based on answer quality (detail)
    questions.forEach(q => {
        const answerLength = q.answer ? q.answer.length : 0
        
        if (answerLength > 100) {
            detailScore += 20
        } else if (answerLength > 50) {
            detailScore += 15
        } else if (answerLength > 20) {
            detailScore += 10
        } else {
            detailScore += 5
            recommendations.push("Provide more detailed answers for better transparency")
        }
    })
    
    // Normalize detail score (max 100)
    detailScore = Math.min(detailScore, 100)
    
    // Compliance score based on category-specific criteria
    complianceScore = calculateComplianceScore(product, questions)
    
    // Generate category-specific recommendations
    generateRecommendations(product, questions, recommendations)
    
    // Calculate overall transparency score (weighted average)
    const transparencyScore = Math.round(
        (completenessScore * 0.4) + 
        (detailScore * 0.35) + 
        (complianceScore * 0.25)
    )
    
    return {
        transparencyScore: Math.min(transparencyScore, 100),
        breakdown: {
            completeness: Math.min(completenessScore, 100),
            detail: Math.min(detailScore, 100),
            compliance: Math.min(complianceScore, 100)
        },
        recommendations: recommendations.slice(0, 5) // Limit to top 5 recommendations
    }
}

function calculateComplianceScore(product, questions) {
    let score = 50 // Base compliance score
    
    const category = product.category.toLowerCase()
    
    // Category-specific compliance checks
    questions.forEach(q => {
        const answer = q.answer.toLowerCase()
        
        switch(category) {
            case 'food':
                if (answer.includes('organic') || answer.includes('certified')) score += 10
                if (answer.includes('allergen') || answer.includes('gluten')) score += 8
                if (answer.includes('nutritional') || answer.includes('testing')) score += 8
                break
                
            case 'cosmetics':
                if (answer.includes('dermatologist') || answer.includes('tested')) score += 10
                if (answer.includes('allergen') || answer.includes('hypoallergenic')) score += 8
                if (answer.includes('fda') || answer.includes('approved')) score += 8
                break
                
            case 'electronics':
                if (answer.includes('certified') || answer.includes('safety')) score += 10
                if (answer.includes('warranty') || answer.includes('support')) score += 8
                if (answer.includes('recycl') || answer.includes('disposal')) score += 8
                break
        }
    })
    
    return Math.min(score, 100)
}

function generateRecommendations(product, questions, recommendations) {
    const category = product.category.toLowerCase()
    
    if (questions.length < 3) {
        recommendations.push("Complete more questions to demonstrate transparency")
    }
    
    // Category-specific recommendations
    const hasKeywordInAnswers = (keywords) => {
        return questions.some(q => 
            keywords.some(keyword => 
                q.answer.toLowerCase().includes(keyword.toLowerCase())
            )
        )
    }
    
    switch(category) {
        case 'food':
            if (!hasKeywordInAnswers(['organic', 'source', 'origin'])) {
                recommendations.push("Provide information about ingredient sourcing")
            }
            if (!hasKeywordInAnswers(['allergen', 'allergy'])) {
                recommendations.push("Include allergen information for consumer safety")
            }
            break
            
        case 'cosmetics':
            if (!hasKeywordInAnswers(['tested', 'dermatologist'])) {
                recommendations.push("Mention safety testing and dermatological approval")
            }
            if (!hasKeywordInAnswers(['ingredient', 'active'])) {
                recommendations.push("Provide detailed ingredient information")
            }
            break
            
        case 'electronics':
            if (!hasKeywordInAnswers(['warranty', 'support'])) {
                recommendations.push("Include warranty and customer support information")
            }
            if (!hasKeywordInAnswers(['recycl', 'disposal', 'environment'])) {
                recommendations.push("Add environmental impact and disposal information")
            }
            break
    }
}

module.exports = router