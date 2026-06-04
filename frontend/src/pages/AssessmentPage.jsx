import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAssessmentStore } from '../store/assessmentStore';

export default function AssessmentPage() {
  const { isAuthenticated } = useAuthStore();
  const {
    sessionId,
    questions,
    answers,
    status,
    currentQuestionIndex,
    isLoading,
    error,
    fetchQuestions,
    startAssessment,
    answerQuestion,
    nextQuestion,
    prevQuestion,
    completeAssessment,
    reset,
  } = useAssessmentStore();

  const navigate = useNavigate();
  const [freeTextValues, setFreeTextValues] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    if (sessionId && !questions.length) {
      fetchQuestions();
    }
    if (!sessionId && status === 'idle') {
      fetchQuestions();
    }
  }, [isAuthenticated, navigate, sessionId, questions.length, fetchQuestions, status]);

  useEffect(() => {
    if (!sessionId && status === 'idle') {
      startAssessment('seeker');
    }
  }, [sessionId, status, startAssessment]);

  const handleResetAndRestart = () => {
    const userConfirmed = window.confirm(
      'Вы уверены? Все текущие ответы и сохранённые рекомендации будут удалены. Вы сможете пройти анкету заново.'
    );
    if (!userConfirmed) return;
    reset();
    fetchQuestions();
    startAssessment('seeker');
  };

  const handleCompleteAssessment = async () => {
    await completeAssessment();
    navigate('/dashboard/recommendations');
  };

  // Сохранить ответ и опционально перейти к следующему
  const saveAnswer = (value, autoNext = false) => {
    const q = questions[currentQuestionIndex];
    answerQuestion(q.code, value);
    if (autoNext && currentQuestionIndex < questions.length - 1) {
      nextQuestion();
    }
  };

  // Вычисляем, можно ли нажать "Далее"
  const canGoNext = () => {
    const q = questions[currentQuestionIndex];
    if (!q) return false;
    const answer = answers[q.code];

    if (q.type === 'single') {
      // Если есть freeText у выбранного варианта — нужен ввод
      if (answer) {
        const opt = (q.options || []).find(o => o.value === answer);
        if (opt?.freeText && !freeTextValues[q.code]) return false;
      }
      return answer !== undefined && answer !== null && answer !== '';
    }
    if (q.type === 'multi') {
      return true; // всегда можно перейти (выбор не обязателен)
    }
    return answer !== undefined && answer !== null;
  };

  // === Completed ===
  if (status === 'completed') {
    return (
      <div className="min-h-screen bg-light py-12">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">Анкета уже пройдена</h2>
            <p className="text-gray-600 mb-6">
              Вы уже завершили анкету. Чтобы пройти её заново и обновить рекомендации, нажмите кнопку ниже.
            </p>
            <button onClick={handleResetAndRestart} className="btn btn-primary">
              Пройти анкету заново
            </button>
          </div>
        </div>
      </div>
    );
  }

  // === Loading ===
  if (!sessionId || !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Загрузка анкеты...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

  // === Render single ===
  const renderSingle = () => {
    const selectedValue = answers[currentQuestion.code];
    return (
      <div className="space-y-3">
        {(currentQuestion.options || []).map((opt) => {
          const isSelected = selectedValue === opt.value;
          const showFreeText = isSelected && opt.freeText;
          return (
            <div key={opt.value}>
              <label
                className={`flex items-center border-2 cursor-pointer hover:border-accent transition ${
                  isSelected ? 'border-accent bg-blue-50' : 'border-gray-300'
                }`}
                style={{ padding: '1.25rem', borderRadius: '12px', gap: '0.5rem' }}
              >
                <input
                  type="radio"
                  name={currentQuestion.code}
                  value={opt.value}
                  checked={isSelected}
                  onChange={() => {
                    saveAnswer(opt.value, false);
                    if (opt.freeText) {
                      setFreeTextValues(prev => ({ ...prev, [currentQuestion.code]: '' }));
                    }
                  }}
                  style={{ width: '20px', height: '20px', flexShrink: 0, marginRight: '16px' }}
                />
                <span style={{ fontSize: '1.125rem' }}>{opt.label}</span>
              </label>
              {showFreeText && (
                <input
                  type="text"
                  className="form-control mt-3"
                  placeholder="Уточните..."
                  value={freeTextValues[currentQuestion.code] || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFreeTextValues(prev => ({ ...prev, [currentQuestion.code]: val }));
                    // Сохраняем как объект { value, freeText }
                    saveAnswer({ value: opt.value, freeText: val }, false);
                  }}
                  autoFocus
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // === Render multi ===
  const renderMulti = () => {
    const selectedValues = answers[currentQuestion.code] || [];
    return (
      <div className="space-y-3">
        {(currentQuestion.options || []).map((opt) => {
          const isChecked = selectedValues.some(
            (v) => (typeof v === 'object' ? v.value : v) === opt.value
          );
          const showFreeText = isChecked && opt.freeText;
          return (
            <div key={opt.value}>
              <label
                className={`flex items-center border-2 cursor-pointer hover:border-accent transition ${
                  isChecked ? 'border-accent bg-blue-50' : 'border-gray-300'
                }`}
                style={{ padding: '1.25rem', borderRadius: '12px' }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    let newValues;
                    if (isChecked) {
                      newValues = selectedValues.filter(
                        (v) => (typeof v === 'object' ? v.value : v) !== opt.value
                      );
                    } else {
                      newValues = [...selectedValues, opt.freeText ? { value: opt.value, freeText: '' } : opt.value];
                    }
                    saveAnswer(newValues, false);
                    if (!isChecked && opt.freeText) {
                      setFreeTextValues(prev => ({ ...prev, [`${currentQuestion.code}_${opt.value}`]: '' }));
                    }
                  }}
                  style={{ width: '20px', height: '20px', flexShrink: 0, marginRight: '16px' }}
                />
                <span style={{ fontSize: '1.125rem' }}>{opt.label}</span>
              </label>
              {showFreeText && (
                <input
                  type="text"
                  className="form-control mt-3"
                  placeholder="Уточните..."
                  value={
                    (() => {
                      const found = selectedValues.find(
                        (v) => (typeof v === 'object' ? v.value : v) === opt.value
                      );
                      return typeof found === 'object' ? found.freeText || '' : '';
                    })()
                  }
                  onChange={(e) => {
                    const txt = e.target.value;
                    const newValues = selectedValues.map((v) =>
                      (typeof v === 'object' ? v.value : v) === opt.value
                        ? { value: opt.value, freeText: txt }
                        : v
                    );
                    saveAnswer(newValues, false);
                  }}
                  autoFocus
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleResetAndRestart}
              className="text-sm text-gray-500 hover:text-error transition"
              title="Пройти анкету заново"
            >
              Пройти заново
            </button>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">Шаг {currentQuestionIndex + 1} из {questions.length}</h3>
              <span className="text-sm text-gray-600">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">{currentQuestion.text}</h2>

            {currentQuestion.type === 'single' && renderSingle()}
            {currentQuestion.type === 'multi' && renderMulti()}
          </div>

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex-1 btn-secondary disabled:opacity-50 py-4 px-6 text-lg font-semibold rounded-xl"
            >
              ← Назад
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleCompleteAssessment}
                disabled={isLoading}
                className="flex-1 btn-primary"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Готовим ответ...
                  </>
                ) : 'Завершить и получить рекомендации'}
              </button>
            ) : (
              <button
                onClick={() => {
                  if (canGoNext()) nextQuestion();
                }}
                disabled={!canGoNext() || isLoading}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                Далее →
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-error px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}