import React, { useState } from 'react';

const QuizModal = ({ isOpen, onClose, questions, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
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
      onComplete(score + (selectedAnswer === questions[currentQuestion].correct ? 1 : 0));
      onClose();
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowHint(false);
  };

  if (!isOpen) return null;

  return (
    <div className="quiz-modal-overlay">
      <div className="quiz-modal">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Quiz: Test Your Knowledge</h2>
        <div className="question">
          <p>{questions[currentQuestion].question}</p>
          <button className="hint-button" onClick={() => setShowHint(!showHint)}>
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
          {showHint && <p className="hint">{questions[currentQuestion].hint}</p>}
          <div className="options">
            {questions[currentQuestion].options.map((option, index) => {
              let className = 'option';
              if (selectedAnswer !== null) {
                if (index === questions[currentQuestion].correct) {
                  className += ' correct';
                } else if (index === selectedAnswer) {
                  className += ' incorrect';
                } else {
                  className += ' disabled';
                }
              } else if (selectedAnswer === index) {
                className += ' selected';
              }
              return (
                <button
                  key={index}
                  className={className}
                  onClick={() => selectedAnswer === null && handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
        <button
          className="next-button"
          onClick={handleNext}
          disabled={selectedAnswer === null}
        >
          {currentQuestion < questions.length - 1 ? 'Next' : 'Finish'}
        </button>
      </div>
    </div>
  );
};

export default QuizModal;
