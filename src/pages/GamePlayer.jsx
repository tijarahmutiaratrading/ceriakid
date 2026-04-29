import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { getGamesByAgeAndCategory, shuffleArray, calculateStars, saveScore } from '@/lib/gameLibrary';
import GameHeader from '@/components/game/GameHeader';
import FeedbackOverlay from '@/components/game/FeedbackOverlay';
import ScoreScreen from '@/components/game/ScoreScreen';
import TracingCanvas from '@/components/drawing/TracingCanvas';
import GameTutorial from '@/components/game/GameTutorial';

export default function GamePlayer() {
  const { category, index } = useParams();
  const { ageGroup } = useAgeGroup();
  const { user } = useAuth();
  const games = getGamesByAgeAndCategory(ageGroup, category);
  const gameIndex = parseInt(index);
  const game = games[gameIndex];

  const [state, setState] = useState({
    currentQ: 0,
    score: 0,
    showFeedback: false,
    isCorrect: false,
    feedbackMsg: '',
    finished: false,
    selectedIdx: null,
    startTime: Date.now(),
    showTracing: false,
  });

  // Save progress after game finishes
  useEffect(() => {
    if (state.finished && user && game) {
      saveGameProgress();
    }
  }, [state.finished]);

  const questions = useMemo(() => {
    if (!game?.gameData?.questions) return [];
    return game.gameData.questions.slice(0, game.totalQuestions || 8);
  }, [game]);

  const handleAnswer = useCallback((selectedIndex) => {
    if (state.showFeedback || !questions[state.currentQ]) return;

    const currentQuestion = questions[state.currentQ];
    const correct = selectedIndex === currentQuestion.answer;

    if (correct) {
      confetti({
        particleCount: 60,
        spread: 50,
        colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981'],
      });
    }

    setState(prev => ({
      ...prev,
      showFeedback: true,
      isCorrect: correct,
      feedbackMsg: correct ? '✨ Jawapan Betul!' : '💪 Cuba Lagi!',
      score: correct ? prev.score + 1 : prev.score,
      selectedIdx: selectedIndex,
    }));
  }, [state.showFeedback, state.currentQ, questions]);

  const handleFeedbackDone = useCallback(() => {
    setState(prev => {
      const nextQ = prev.currentQ + 1;
      if (nextQ >= questions.length) {
        const stars = calculateStars(prev.score, questions.length);
        saveScore(
          `${ageGroup}-${category}-${gameIndex}`,
          prev.score,
          questions.length,
          stars
        );
        return { ...prev, finished: true, showFeedback: false };
      }
      return {
        ...prev,
        currentQ: nextQ,
        showFeedback: false,
        selectedIdx: null,
      };
    });
  }, [questions.length, ageGroup, category, gameIndex]);

  const handlePlayAgain = () => {
    setState({
      currentQ: 0,
      score: 0,
      showFeedback: false,
      isCorrect: false,
      feedbackMsg: '',
      finished: false,
      selectedIdx: null,
      showTracing: false,
    });
  };



  const handleTracingComplete = (result) => {
    const correct = result.accuracy >= 70;
    setState(prev => ({
      ...prev,
      showFeedback: true,
      isCorrect: correct,
      feedbackMsg: correct ? '✨ Sempurna! Bagus Sangat!' : '💪 Cuba Lagi! Hampir Dah!',
      score: correct ? prev.score + 1 : prev.score,
    }));
  };

  const saveGameProgress = async () => {
    if (!user || !game) return;
    try {
      const gameKey = `${ageGroup}-${category}-${gameIndex}`;
      const stars = calculateStars(state.score, questions.length);
      const playRecord = {
        date: new Date().toISOString(),
        score: state.score,
        stars: stars,
      };

      // Check if progress exists
      const existing = await base44.entities.ChildGameProgress.filter({
        userEmail: user.email,
        childName: user.full_name || 'Default',
        gameType: gameKey,
      });

      const progressData = {
        userEmail: user.email,
        childName: user.full_name || 'Default',
        gameType: gameKey,
        category: category,
        ageGroup: ageGroup,
        lastScore: state.score,
        lastTotal: questions.length,
        lastStars: stars,
        lastPlayedDate: new Date().toISOString(),
        timesPlayed: (existing[0]?.timesPlayed || 0) + 1,
        bestScore: Math.max(state.score, existing[0]?.bestScore || 0),
        bestStars: Math.max(stars, existing[0]?.bestStars || 0),
        playHistory: [playRecord, ...(existing[0]?.playHistory || [])].slice(0, 10),
      };

      if (existing.length > 0) {
        await base44.entities.ChildGameProgress.update(existing[0].id, progressData);
      } else {
        await base44.entities.ChildGameProgress.create(progressData);
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="clay rounded-3xl p-8 text-center max-w-sm"
        >
          <p className="text-5xl mb-4">🎮</p>
          <p className="text-2xl font-black mb-2 text-gray-800">Permainan Tidak Dijumpai</p>
          <p className="text-gray-600 mb-6">Permainan yang diminta tidak tersedia.</p>
          <Link to={`/games/${category}`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-6 py-3 bg-game-purple text-white rounded-full font-bold"
            >
              ← Balik
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }



  if (state.finished) {
    return (
      <ScoreScreen
        score={state.score}
        total={questions.length}
        stars={calculateStars(state.score, questions.length)}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center p-4">
        <div className="clay rounded-3xl p-8 text-center max-w-sm">
          <p className="text-3xl mb-3">⚠️</p>
          <p className="text-lg font-bold mb-4">Permainan Belum Siap</p>
          <p className="text-gray-600 mb-6">Permainan ini masih dalam pembangunan.</p>
          <Link to={`/games/${category}`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-6 py-2 bg-game-purple text-white rounded-full font-bold"
            >
              Kembali
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[state.currentQ];
  const isTracingGame = game?.type === 'tracing';

  // Tracing game — render canvas for each letter
  if (isTracingGame) {
    return (
      <div className="min-h-screen bg-amber-50">
        <div className="max-w-lg mx-auto px-4 py-6 pb-24">
          <Link to={`/games/${category}`}>
            <motion.button whileTap={{ scale: 0.9 }} className="clay-button rounded-full w-12 h-12 flex items-center justify-center mb-6">
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
          </Link>
          <GameHeader title={game.title} score={state.score} total={questions.length} currentQ={state.currentQ + 1} totalQ={questions.length} />
          {state.finished ? (
            <ScoreScreen score={state.score} total={questions.length} stars={calculateStars(state.score, questions.length)} onPlayAgain={handlePlayAgain} />
          ) : (
            <TracingCanvas
              targetShape={currentQuestion?.letter || currentQuestion?.tracingTarget || 'A'}
              emoji={game.emoji}
              width={350}
              height={350}
              onComplete={handleTracingComplete}
            />
          )}
        </div>
        <FeedbackOverlay show={state.showFeedback} isCorrect={state.isCorrect} message={state.feedbackMsg} onDone={handleFeedbackDone} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pattern">
      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        <Link to={`/games/${category}`}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="clay-button rounded-full w-12 h-12 flex items-center justify-center mb-6"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
        </Link>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-game-purple">
            {game.difficulty === 'hard' && <Zap className="w-4 h-4" />}
            <span className="capitalize px-3 py-1 bg-game-purple/10 rounded-full">
              {game.difficulty === 'easy' ? '🟢 Senang' : game.difficulty === 'medium' ? '🟡 Sedang' : '🔴 Susah'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
            <Clock className="w-4 h-4" />
            {game.totalQuestions || 8} soalan
          </div>
        </div>

        <GameHeader
          title={game.title}
          score={state.score}
          total={questions.length}
          currentQ={state.currentQ + 1}
          totalQ={questions.length}
        />

        {/* Question Display - Adaptive based on game type */}
        <motion.div
          key={state.currentQ}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="clay rounded-3xl p-6 text-center mb-6 bg-gradient-to-br from-sky-50 to-blue-100"
        >
          {/* Show game emoji only if no question-specific image/letter */}
          {!currentQuestion.image && !currentQuestion.letter && (
            <div className="text-5xl mb-3">{game.emoji}</div>
          )}

          {/* Picture Quiz — image only */}
          {currentQuestion.image && (
            <div className="text-6xl mb-3">{currentQuestion.image}</div>
          )}

          {/* Letter/Number Display */}
          {currentQuestion.letter && (
            <div className="text-6xl font-black text-game-purple mb-2">
              {currentQuestion.letter}
            </div>
          )}

          {currentQuestion.word && (
            <p className="text-2xl font-bold text-gray-700">
              {currentQuestion.word}
            </p>
          )}

          {/* Text Question (math, multiple choice) */}
          {currentQuestion.problem && (
            <div className={`font-black text-game-purple ${currentQuestion.problem.length > 20 ? 'text-2xl' : 'text-4xl'}`}>
              {currentQuestion.problem}
            </div>
          )}

          {/* "Apakah ini?" label for picture quizzes */}
          {currentQuestion.image && !currentQuestion.problem && (
            <p className="text-lg font-bold text-gray-700 mt-2">
              Apakah ini?
            </p>
          )}
        </motion.div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-3">
          {currentQuestion.options?.map((option, i) => (
            <motion.button
              key={`${state.currentQ}-${i}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleAnswer(i)}
              disabled={state.showFeedback}
              className={`clay-button rounded-2xl py-4 px-3 font-bold text-center transition-all ${
                state.showFeedback && state.selectedIdx === i
                  ? state.isCorrect
                    ? 'bg-green-200 ring-2 ring-green-500'
                    : 'bg-red-200 ring-2 ring-red-500'
                  : ''
              }`}
            >
              {typeof option === 'string' ? option : option.label || option}
            </motion.button>
          ))}
        </div>
      </div>

      <FeedbackOverlay
        show={state.showFeedback}
        isCorrect={state.isCorrect}
        message={state.feedbackMsg}
        onDone={handleFeedbackDone}
      />
    </div>
  );
}