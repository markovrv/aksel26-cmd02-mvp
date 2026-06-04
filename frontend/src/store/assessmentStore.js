import { create } from 'zustand';
import { assessmentAPI, recommendationsAPI } from '../services/api';
import { useAuthStore } from './authStore'; // <-- добавить эту строку

const STORAGE_KEYS = {
  SESSION_ID: 'assessment_sessionId',
  RECOMMENDATIONS: 'assessment_recommendations',
  FAVORITES: 'assessment_favorites',
};

const getStoredRecommendations = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RECOMMENDATIONS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const getStoredFavorites = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const useAssessmentStore = create((set, get) => ({
  sessionId: localStorage.getItem(STORAGE_KEYS.SESSION_ID),
  userId: JSON.parse(localStorage.getItem('user'))?.id || null,
  questions: [],
  answers: {},
  status: 'idle', // idle, in_progress, completed
  recommendations: getStoredRecommendations(),
  favorites: getStoredFavorites(),
  isLoading: false,
  error: null,
  currentQuestionIndex: 0,

  fetchQuestions: async () => {
    set({ isLoading: true });
    try {
      const { data } = await assessmentAPI.getQuestions();
      set({ questions: data.questions, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  startAssessment: async (roleContext) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await assessmentAPI.startAssessment(roleContext);
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, data.sessionId);
      // Clear any previous recommendations
      localStorage.removeItem(STORAGE_KEYS.RECOMMENDATIONS);
      set({
        sessionId: data.sessionId,
        userId: JSON.parse(localStorage.getItem('user'))?.id || null,
        status: 'in_progress',
        answers: {},
        currentQuestionIndex: 0,
        recommendations: [],
        isLoading: false,
      });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  answerQuestion: async (questionCode, answer) => {
    const { sessionId } = get();
    if (!sessionId) {
      set({ error: 'No active session' });
      return;
    }

    set({ isLoading: true });
    try {
      await assessmentAPI.answerQuestion(sessionId, questionCode, answer);
      set((state) => ({
        answers: { ...state.answers, [questionCode]: answer },
        isLoading: false,
      }));
    } catch (error) {
      // Если сессия не найдена (404) — сбрасываем и начинаем заново
      if (error.response?.status === 404) {
        localStorage.removeItem('assessment_sessionId');
        set({
          sessionId: null,
          answers: {},
          status: 'idle',
          currentQuestionIndex: 0,
          isLoading: false,
          error: 'Сессия устарела. Пожалуйста, начните анкету заново.',
        });
        return;
      }
      set({ error: error.message, isLoading: false });
    }
  },

  nextQuestion: () => {
    set((state) => ({
      currentQuestionIndex: Math.min(
        state.currentQuestionIndex + 1,
        state.questions.length - 1
      ),
    }));
  },

  prevQuestion: () => {
    set((state) => ({
      currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
    }));
  },

  completeAssessment: async () => {
    const { sessionId } = get();
    if (!sessionId) {
      set({ error: 'No active session' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      await assessmentAPI.completeAssessment(sessionId);

      // Generate recommendations first
      const { data } = await recommendationsAPI.generateRecommendations(sessionId);
      localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(data.recommendations));

      // Then mark as completed with recommendations
      set({
        recommendations: data?.recommendations || [],
        status: 'completed',
        isLoading: false,
        error: null,
      });

      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

getRecommendations: async () => {
  const { sessionId, userId: storeUserId } = get();
  const { user } = useAuthStore.getState();
  const currentUserId = user?.id;

  if (!currentUserId) {
    set({ error: 'Пользователь не авторизован' });
    return;
  }

  if (storeUserId && storeUserId !== currentUserId) {
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    set({
      sessionId: null,
      userId: null,
      recommendations: [],
      error: null, // Не показываем ошибку, просто нет сессии
    });
    return;
  }

  let activeSessionId = sessionId;
  if (!activeSessionId) {
    const storedSessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    if (storedSessionId && storeUserId === currentUserId) {
      activeSessionId = storedSessionId;
      set({ sessionId: storedSessionId });
    } else {
      // Нет активной сессии – не ошибка, просто нет рекомендаций
      set({ recommendations: [], isLoading: false, error: null });
      return;
    }
  }

  set({ isLoading: true, error: null });
  try {
    const { data } = await recommendationsAPI.getRecommendations(activeSessionId);
    if (data.userId && data.userId !== currentUserId) {
      throw new Error('Рекомендации принадлежат другому пользователю');
    }
      localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(data?.recommendations || []));
        set({ recommendations: data?.recommendations || [], isLoading: false, error: null });
  } catch (error) {
    console.error('Failed to fetch recommendations:', error);
    const stored = localStorage.getItem(STORAGE_KEYS.RECOMMENDATIONS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        set({ recommendations: parsed, isLoading: false, error: null });
      } catch {
        set({ recommendations: [], isLoading: false, error: null });
      }
    } else {
      set({ recommendations: [], isLoading: false, error: null });
    }
  }
},

  restoreSession: () => {
    const sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    if (sessionId) {
      set({
        sessionId,
        userId: JSON.parse(localStorage.getItem('user'))?.id || null,
        status: 'in_progress',
        isLoading: false,
        error: null,
      });
    }
  },

  reset: () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    localStorage.removeItem(STORAGE_KEYS.RECOMMENDATIONS);
    set({
      sessionId: null,
      userId: null,
      answers: {},
      status: 'idle',
      recommendations: [],
      currentQuestionIndex: 0,
      error: null,
    });
  },
}));
