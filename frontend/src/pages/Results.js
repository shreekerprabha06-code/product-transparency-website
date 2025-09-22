import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, calculateScore, generateReport, getScore, getReport } from '../utils/api';

const Results = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [score, setScore] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResults();
  }, [productId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      
      // Load product
      const productResponse = await getProduct(productId);
      if (productResponse.data.success) {
        setProduct(productResponse.data.product);
      }

      // Try to load existing score
      try {
        const scoreResponse = await getScore(productId);
        if (scoreResponse.data.success) {
          setScore(scoreResponse.data);
        }
      } catch (error) {
        // If no existing score, calculate new one
        console.log('No existing score found, calculating...');
        await calculateTransparencyScore();
      }

      // Try to load existing report
      try {
        const reportResponse = await getReport(productId);
        if (reportResponse.data.success) {
          setReport(reportResponse.data.report);
        }
      } catch (error) {
        console.log('No existing report found');
      }

    } catch (error) {
      console.error('Error loading results:', error);
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const calculateTransparencyScore = async () => {
    try {
      const scoreResponse = await calculateScore(productId);
      if (scoreResponse.data.success) {
        setScore(scoreResponse.data);
      }
    } catch (error) {
      console.error('Error calculating score:', error);
      setError('Failed to calculate transparency score');
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      setError('');
      
      const reportResponse = await generateReport(productId);
      if (reportResponse.data.success) {
        setReport(reportResponse.data.report);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  if (loading) {
    return (
      <div className="results-page">
        <div className="container">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="results-page">
      <div className="container">
        <div className="results-header">
          <button 
            className="btn btn-secondary btn-small"
            onClick={() => navigate('/')}
          >
            ← Back to Home
          </button>
          <h1>Transparency Results</h1>
          {product && (
            <div className="product-info">
              <h2>{product.name}</h2>
              <span className="product-category">{product.category}</span>
            </div>
          )}
        </div>

        {score && (
          <div className="score-section">
            <div className="score-card">
              <div className="score-main">
                <div 
                  className="score-circle"
                  style={{ borderColor: getScoreColor(score.transparencyScore) }}
                >
                  <span className="score-number" style={{ color: getScoreColor(score.transparencyScore) }}>
                    {score.transparencyScore}
                  </span>
                  <span className="score-percent">%</span>
                </div>
                <div className="score-info">
                  <h3>Transparency Score</h3>
                  <p className="score-rating">{getScoreLabel(score.transparencyScore)}</p>
                  <p className="score-description">
                    Based on {score.totalQuestions} answered questions
                  </p>
                </div>
              </div>

              {score.breakdown && (
                <div className="score-breakdown">
                  <h4>Score Breakdown</h4>
                  <div className="breakdown-items">
                    <div className="breakdown-item">
                      <span className="breakdown-label">Completeness</span>
                      <div className="breakdown-bar">
                        <div 
                          className="breakdown-fill"
                          style={{ width: `${score.breakdown.completeness}%` }}
                        ></div>
                      </div>
                      <span className="breakdown-value">{score.breakdown.completeness}%</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Detail</span>
                      <div className="breakdown-bar">
                        <div 
                          className="breakdown-fill"
                          style={{ width: `${score.breakdown.detail}%` }}
                        ></div>
                      </div>
                      <span className="breakdown-value">{score.breakdown.detail}%</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Compliance</span>
                      <div className="breakdown-bar">
                        <div 
                          className="breakdown-fill"
                          style={{ width: `${score.breakdown.compliance}%` }}
                        ></div>
                      </div>
                      <span className="breakdown-value">{score.breakdown.compliance}%</span>
                    </div>
                  </div>
                </div>
              )}

              {score.recommendations && score.recommendations.length > 0 && (
                <div className="recommendations">
                  <h4>Recommendations for Improvement</h4>
                  <ul>
                    {score.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="report-section">
          <div className="section-header">
            <h3>Detailed Report</h3>
            {!report && (
              <button 
                className="btn btn-primary"
                onClick={handleGenerateReport}
                disabled={generatingReport}
              >
                {generatingReport ? (
                  <>
                    <span className="loading-spinner small"></span>
                    Generating...
                  </>
                ) : (
                  'Generate Full Report'
                )}
              </button>
            )}
          </div>

          {report && (
            <div className="report-content">
              <div className="report-card">
                <div className="report-header">
                  <h4>{report.title}</h4>
                  <p>Generated: {report.generatedDate}</p>
                </div>

                {report.summary && (
                  <div className="report-section">
                    <h5>Executive Summary</h5>
                    <p>{report.summary.overallAssessment}</p>
                    {report.summary.keyFindings && (
                      <ul>
                        {report.summary.keyFindings.map((finding, index) => (
                          <li key={index}>{finding}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {report.analysis && (
                  <div className="report-section">
                    <h5>Analysis</h5>
                    {report.analysis.strengths && report.analysis.strengths.length > 0 && (
                      <div className="analysis-category">
                        <h6>Strengths</h6>
                        <ul>
                          {report.analysis.strengths.map((strength, index) => (
                            <li key={index} className="strength">{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {report.analysis.weaknesses && report.analysis.weaknesses.length > 0 && (
                      <div className="analysis-category">
                        <h6>Areas for Improvement</h6>
                        <ul>
                          {report.analysis.weaknesses.map((weakness, index) => (
                            <li key={index} className="weakness">{weakness}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="report-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => navigate(`/questionnaire/${productId}`)}
                  >
                    Add More Answers
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleGenerateReport}
                    disabled={generatingReport}
                  >
                    Refresh Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

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

export default Results;