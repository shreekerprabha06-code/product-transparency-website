// ai-service/Routes/generate-questions.js
const express = require('express')
const router = express.Router()
const Groq = require('groq-sdk')

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'your-groq-api-key-here'
})

// POST /generate-questions - Generate smart questions using Groq LLM
router.post('/', async (req, res) => {
    try {
        const { category, currentStep, previousAnswer, productName, productDescription } = req.body
        
        const maxQuestions = 5
        
        if (currentStep >= maxQuestions) {
            return res.json({
                success: true,
                nextQuestion: null,
                isComplete: true,
                message: "All questions completed"
            })
        }

        // Create context-aware prompt for Groq
        const prompt = createPrompt(category, currentStep, previousAnswer, productName, productDescription)
        
        // Call Groq API
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a product transparency expert who generates insightful questions to help assess product transparency. Generate only ONE specific question that would help evaluate product transparency. Be direct and professional."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 100
        })

        const generatedQuestion = chatCompletion.choices[0]?.message?.content?.trim()

        if (!generatedQuestion) {
            throw new Error('Failed to generate question')
        }

        res.json({
            success: true,
            nextQuestion: generatedQuestion,
            isComplete: false,
            currentStep: currentStep + 1
        })

    } catch (error) {
        console.error('Groq API Error:', error)
        
        // Fallback to static questions if Groq fails
        const fallbackQuestions = getFallbackQuestions(req.body.category, req.body.currentStep)
        
        res.json({
            success: true,
            nextQuestion: fallbackQuestions,
            isComplete: false,
            currentStep: req.body.currentStep + 1,
            note: "Using fallback question due to API error"
        })
    }
})

router.get('/test-groq', async (req, res) => {
    try {
        const response = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Hello" }],
            model: "llama-3.1-8b-instant",
            max_tokens: 10
        })
        res.json(response)
    } catch (err) {
        console.error("Groq test error:", err.response?.data || err.message)
        res.status(500).json({ error: err.message })
    }
})


// Create intelligent prompts based on context
function createPrompt(category, currentStep, previousAnswer, productName, productDescription) {
    let baseContext = `Product: ${productName || 'Unknown Product'}
Category: ${category}
Description: ${productDescription || 'No description provided'}
Question #${currentStep + 1} of 5`

    if (previousAnswer && currentStep > 0) {
        baseContext += `\nPrevious answer: ${previousAnswer}`
    }

    const categoryPrompts = {
        food: `${baseContext}
        
Generate a specific question about food transparency such as:
- Ingredient sourcing and origin
- Manufacturing processes and quality control
- Nutritional information and testing
- Allergen information and safety measures
- Sustainability and ethical practices
- Regulatory compliance and certifications`,

        cosmetics: `${baseContext}
        
Generate a specific question about cosmetics transparency such as:
- Active ingredient concentrations and sources
- Safety testing and dermatological approval
- Skin compatibility and allergen information
- Manufacturing standards and quality control
- Packaging sustainability and recycling
- Regulatory compliance and certifications`,

        electronics: `${baseContext}
        
Generate a specific question about electronics transparency such as:
- Component sourcing and material composition
- Manufacturing processes and quality standards
- Safety certifications and testing procedures
- Environmental impact and recycling programs
- Warranty terms and customer support
- Data privacy and security measures`,

        default: `${baseContext}
        
Generate a specific transparency question about:
- Material sourcing and supply chain
- Manufacturing processes and quality control
- Safety standards and testing procedures
- Environmental impact and sustainability
- Regulatory compliance and certifications`
    }

    return categoryPrompts[category] || categoryPrompts.default
}

// Fallback questions in case Groq API fails
function getFallbackQuestions(category, step) {
    const fallbackBank = {
        food: [
            "What are the specific sources and origins of your main ingredients?",
            "What quality control measures are in place during manufacturing?",
            "What allergens are present and how are cross-contamination risks managed?",
            "What nutritional testing and verification processes do you follow?",
            "What sustainability practices are implemented in your supply chain?"
        ],
        cosmetics: [
            "What are the concentrations and sources of active ingredients used?",
            "What dermatological testing has been conducted on this product?",
            "What allergens or potential irritants should consumers be aware of?",
            "What preservation methods are used to maintain product stability?",
            "What sustainability measures are implemented in packaging and production?"
        ],
        electronics: [
            "What materials and components are used in manufacturing this product?",
            "What safety certifications and testing standards does this product meet?",
            "What is the expected product lifespan and failure rates?",
            "What recycling or disposal programs are available for this product?",
            "What data privacy and security measures are implemented?"
        ]
    }
    
    const questions = fallbackBank[category] || fallbackBank.food
    return questions[step] || "What additional transparency information would you like to share?"
}

module.exports = router