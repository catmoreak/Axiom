import React, { useState } from 'react';

const QuizModal = ({ isOpen, onClose, questions, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    if (selectedAnswer === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowHint(false);
    } else {
      setShowResult(true);
      onComplete(score + (selectedAnswer === questions[currentQuestion].correct ? 1 : 0));
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setShowHint(false);
  };

  if (!isOpen) return null;

  return (
    <div className="quiz-modal-overlay">
      <div className="quiz-modal">
        <button className="close-button" onClick={onClose}>×</button>
        {!showResult ? (
          <>
            <h2>Quiz: Test Your Knowledge</h2>
            <div className="question">
              <p>{questions[currentQuestion].question}</p>
              <button className="hint-button" onClick={() => setShowHint(!showHint)}>
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
              {showHint && <p className="hint">{questions[currentQuestion].hint}</p>}
              <div className="options">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    className={`option ${selectedAnswer === index ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="next-button"
              onClick={handleNext}
              disabled={selectedAnswer === null}
            >
              {currentQuestion < questions.length - 1 ? 'Next' : 'Finish'}
            </button>
          </>
        ) : (
          <>
            <h2>Quiz Complete!</h2>
            <p>Your Score: {score} / {questions.length}</p>
            <p>{score === questions.length ? 'Perfect! You mastered this reaction.' : 'Great effort! Review the simulation to learn more.'}</p>
            <button className="restart-button" onClick={handleRestart}>Try Again</button>
            <button className="close-button" onClick={onClose}>Close</button>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizModal;