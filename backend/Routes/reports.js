// backend/Routes/reports.js - FIXED VERSION
const express = require('express')
const { MongoClient, ObjectId } = require('mongodb')
const router = express.Router()

const MONGO_URI = 'mongodb+srv://shreeker027:ihJ2UQg4Rr4WTG4X@cluster0.qtmxkjb.mongodb.net/product-transparency'

// POST /reports - Generate transparency report for a product
router.post('/', async (req, res) => {
    let client
    try {
        console.log('Received generate report request:', req.body)
        
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
        
        // Get all questions and answers
        const questions = await db.collection('questions')
            .find({ productId: new ObjectId(productId) })
            .sort({ step: 1 })
            .toArray()
        
        // Get transparency score
        let scoreData = await db.collection('scores').findOne({ productId: new ObjectId(productId) })
        
        // If no score exists, calculate it
        if (!scoreData) {
            console.log('No existing score found, calculating new score...')
            // Import the scoring function from calculate-score route
            const { calculateTransparencyScore } = require('./calculate-score-utils')
            const calculatedScore = calculateTransparencyScore(product, questions)
            
            scoreData = {
                productId: new ObjectId(productId),
                transparencyScore: calculatedScore.transparencyScore,
                breakdown: calculatedScore.breakdown,
                recommendations: calculatedScore.recommendations,
                calculatedAt: new Date()
            }
            
            // Save the calculated score
            await db.collection('scores').insertOne(scoreData)
        }
        
        console.log(`Generating report for product ${productId}`)
        
        // Generate comprehensive report
        const report = generateReport(product, questions, scoreData)
        
        // Save report to database
        const reportDoc = {
            productId: new ObjectId(productId),
            report: report,
            transparencyScore: scoreData.transparencyScore,
            generatedAt: new Date()
        }
        
        // Insert or update report
        const reportResult = await db.collection('reports').replaceOne(
            { productId: new ObjectId(productId) },
            reportDoc,
            { upsert: true }
        )
        
        console.log('Report generated and saved successfully')
        
        res.json({
            success: true,
            report: report,
            reportId: reportResult.upsertedId || 'updated',
            message: 'Report generated successfully'
        })
        
    } catch (error) {
        console.error('Error generating report:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to generate report',
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

// GET /reports/:productId - Get existing report
router.get('/:productId', async (req, res) => {
    let client
    try {
        const { productId } = req.params
        console.log('Getting existing report for product:', productId)
        
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
        
        // Find existing report
        const reportData = await db.collection('reports').findOne({ productId: new ObjectId(productId) })
        
        if (reportData) {
            res.json({
                success: true,
                report: reportData.report,
                transparencyScore: reportData.transparencyScore,
                generatedAt: reportData.generatedAt
            })
        } else {
            res.status(404).json({
                success: false,
                message: 'No report found for this product'
            })
        }
        
    } catch (error) {
        console.error('Error getting report:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to get report',
            error: error.message
        })
    } finally {
        if (client) {
            await client.close()
        }
    }
})

// Generate comprehensive transparency report
function generateReport(product, questions, scoreData) {
    const reportDate = new Date().toLocaleDateString()
    
    const report = {
        title: `Product Transparency Report`,
        generatedDate: reportDate,
        
        // Product Information Section
        productInfo: {
            name: product.name,
            category: product.category,
            description: product.description || 'No description provided',
            manufacturer: product.manufacturer || 'Not specified',
            createdDate: product.createdAt ? product.createdAt.toLocaleDateString() : 'Unknown'
        },
        
        // Transparency Score Section
        transparencyScore: {
            overall: scoreData.transparencyScore,
            breakdown: scoreData.breakdown,
            rating: getScoreRating(scoreData.transparencyScore)
        },
        
        // Questions and Answers Section
        questionsAnswered: {
            total: questions.length,
            details: questions.map(q => ({
                step: q.step,
                question: q.question,
                answer: q.answer,
                answeredDate: q.createdAt ? q.createdAt.toLocaleDateString() : 'Unknown'
            }))
        },
        
        // Analysis Section
        analysis: generateAnalysis(product.category, questions, scoreData.transparencyScore),
        
        // Recommendations Section
        recommendations: scoreData.recommendations || [],
        
        // Compliance Section
        compliance: generateComplianceSection(product.category, questions),
        
        // Summary
        summary: generateSummary(product, scoreData.transparencyScore, questions.length)
    }
    
    return report
}

function getScoreRating(score) {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Very Good'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Fair'
    if (score >= 50) return 'Needs Improvement'
    return 'Poor'
}

function generateAnalysis(category, questions, score) {
    const analysis = {
        strengths: [],
        weaknesses: [],
        insights: []
    }
    
    // Analyze based on score
    if (score >= 80) {
        analysis.strengths.push('High transparency score demonstrates commitment to openness')
        analysis.strengths.push('Comprehensive information provided to consumers')
    } else if (score >= 60) {
        analysis.strengths.push('Good foundation for transparency established')
        analysis.weaknesses.push('Opportunities exist to improve transparency further')
    } else {
        analysis.weaknesses.push('Transparency score indicates significant room for improvement')
        analysis.weaknesses.push('Limited information available to consumers')
    }
    
    // Analyze based on question count
    if (questions.length >= 5) {
        analysis.strengths.push('Answered comprehensive set of transparency questions')
    } else if (questions.length >= 3) {
        analysis.insights.push('Moderate engagement with transparency questions')
    } else {
        analysis.weaknesses.push('Limited number of transparency questions answered')
    }
    
    // Category-specific analysis
    const categoryInsights = {
        food: 'Food products require transparency about ingredients, sourcing, and safety measures',
        cosmetics: 'Cosmetic products benefit from transparency about ingredients, testing, and safety',
        electronics: 'Electronic products should provide information about materials, safety, and environmental impact'
    }
    
    analysis.insights.push(categoryInsights[category] || 'Product transparency builds consumer trust and confidence')
    
    return analysis
}

function generateComplianceSection(category, questions) {
    const compliance = {
        category: category,
        assessedAreas: [],
        recommendations: []
    }
    
    // Category-specific compliance areas
    const complianceAreas = {
        food: ['Ingredient disclosure', 'Allergen information', 'Nutritional data', 'Safety testing'],
        cosmetics: ['Ingredient listing', 'Safety testing', 'Allergen warnings', 'Regulatory approval'],
        electronics: ['Material composition', 'Safety certifications', 'Warranty information', 'Environmental impact']
    }
    
    compliance.assessedAreas = complianceAreas[category] || ['General product information', 'Safety data', 'Quality standards']
    
    // Generate recommendations based on answers
    const hasDetailedAnswers = questions.some(q => q.answer && q.answer.length > 100)
    const hasComplianceKeywords = questions.some(q => 
        q.answer && (
            q.answer.toLowerCase().includes('certified') ||
            q.answer.toLowerCase().includes('approved') ||
            q.answer.toLowerCase().includes('tested')
        )
    )
    
    if (!hasDetailedAnswers) {
        compliance.recommendations.push('Provide more detailed responses to transparency questions')
    }
    
    if (!hasComplianceKeywords) {
        compliance.recommendations.push('Include information about certifications and regulatory compliance')
    }
    
    return compliance
}

function generateSummary(product, score, questionCount) {
    const rating = getScoreRating(score)
    
    return {
        overallAssessment: `${product.name} has achieved a transparency score of ${score}% (${rating}), based on ${questionCount} answered questions.`,
        
        keyFindings: [
            `Product category: ${product.category}`,
            `Transparency rating: ${rating} (${score}%)`,
            `Questions answered: ${questionCount}`,
            `Report generated: ${new Date().toLocaleDateString()}`
        ],
        
        nextSteps: questionCount < 5 
            ? ['Complete additional transparency questions', 'Provide more detailed product information']
            : ['Maintain current transparency standards', 'Regular updates to product information']
    }
}

module.exports = router