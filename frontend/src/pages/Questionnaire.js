import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, getNextQuestion, saveAnswer, getQuestions } from '../utils/api';

const Questionnaire = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [answeredQuestions, setAnsweredQuestions] = useState([]);

  useEffect(() => {
    loadProductAndQuestions();
  }, [productId]);

  const loadProductAndQuestions = async () => {
    try {
      setLoading(true);
      
      // Load product details
      const productResponse = await getProduct(productId);
      if (productResponse.data.success) {
        setProduct(productResponse.data.product);
      }

      // Load existing questions
      const questionsResponse = await getQuestions(productId);
      if (questionsResponse.data.success) {
        setAnsweredQuestions(questionsResponse.data.questions);
        setCurrentStep(questionsResponse.data.questions.length);
      }

      // Get next question
      await loadNextQuestion(questionsResponse.data.questions.length);
      
    } catch (error) {
      console.error('Error loading product and questions:', error);
      setError('Failed to load product information');
    } finally {
      setLoading(false);
    }
  };

  const loadNextQuestion = async (step = currentStep) => {
    try {
      const lastAnswer = answeredQuestions.length > 0 
        ? answeredQuestions[answeredQuestions.length - 1].answer 
        : '';

      const questionResponse = await getNextQuestion({
        category: product?.category || 'food',
        currentStep: step,
        previousAnswer: lastAnswer,
        productName: product?.name,
        productDescription: product?.description
      });

      if (questionResponse.data.success) {
        if (questionResponse.data.isComplete) {
          setIsComplete(true);
          setCurrentQuestion('');
        } else {
          setCurrentQuestion(questionResponse.data.nextQuestion);
          setIsComplete(false);
        }
      }
    } catch (error) {
      console.error('Error getting next question:', error);
      setError('Failed to load next question');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      setError('Please provide an answer before continuing');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Save the answer
      const saveResponse = await saveAnswer({
        productId,
        question: currentQuestion,
        answer: currentAnswer,
        step: currentStep + 1
      });

      if (saveResponse.data.success) {
        // Update answered questions
        const newQuestion = {
          question: currentQuestion,
          answer: currentAnswer,
          step: currentStep + 1
        };
        
        setAnsweredQuestions([...answeredQuestions, newQuestion]);
        setCurrentAnswer('');
        setCurrentStep(currentStep + 1);

        // Load next question
        await loadNextQuestion(currentStep + 1);
      }

    } catch (error) {
      console.error('Error saving answer:', error);
      setError('Failed to save answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishQuestionnaire = () => {
    navigate(`/results/${productId}`);
  };

  if (loading) {
    return (
      <div className="questionnaire-page">
        <div className="container">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading questionnaire...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="questionnaire-page">
      <div className="container">
        <div className="questionnaire-header">
          <h1>Transparency Questionnaire</h1>
          {product && (
            <div className="product-info">
              <h2>{product.name}</h2>
              <span className="product-category">{product.category}</span>
            </div>
          )}
          <div className="progress-info">
            <span>Question {currentStep + 1} of 5</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentStep + 1) / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {!isComplete && currentQuestion && (
          <div className="question-section">
            <div className="question-card">
              <h3>Question {currentStep + 1}</h3>
              <p className="question-text">{currentQuestion}</p>
              
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Enter your detailed answer here..."
                rows="6"
                className="answer-textarea"
              />
              
              <div className="question-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !currentAnswer.trim()}
                >
                  {submitting ? (
                    <>
                      <span className="loading-spinner small"></span>
                      Saving...
                    </>
                  ) : (
                    'Submit Answer'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {isComplete && (
          <div className="completion-section">
            <div className="completion-card">
              <div className="completion-icon">✅</div>
              <h2>Questionnaire Complete!</h2>
              <p>
                You've answered {answeredQuestions.length} questions. 
                Your transparency score is being calculated.
              </p>
              <button 
                className="btn btn-primary btn-large"
                onClick={handleFinishQuestionnaire}
              >
                View Results & Generate Report
              </button>
            </div>
          </div>
        )}

        {answeredQuestions.length > 0 && (
          <div className="answered-questions-section">
            <h3>Previous Answers</h3>
            <div className="answered-questions">
              {answeredQuestions.map((qa, index) => (
                <div key={index} className="answered-question">
                  <div className="question-number">Q{qa.step}</div>
                  <div className="question-content">
                    <p className="question">{qa.question}</p>
                    <p className="answer">{qa.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Questionnaire;