import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { useAuth } from '@/lib/AuthContext';
import { useSelectedChild } from '@/lib/SelectedChildContext';
import { base44 } from '@/api/base44Client';
import { getGamesByAgeAndCategory, shuffleArray, calculateStars, saveScore } from '@/lib/gameLibrary';
import AppHeader from '@/components/AppHeader';
import GameHeader from '@/components/game/GameHeader';
import FeedbackOverlay from '@/components/game/FeedbackOverlay';
import ScoreScreen from '@/components/game/ScoreScreen';
import TracingCanvas from '@/components/drawing/TracingCanvas';
import GameTutorial from '@/components/game/GameTutorial';
import AudioPlayer from '@/components/audio/AudioPlayer';
import ProgressBar from '@/components/game/ProgressBar';
import AchievementBadges from '@/components/game/AchievementBadges';
import QuestionRenderer from '@/components/game/QuestionRenderer';
import { playSound } from '@/lib/soundManager';
import { checkAchievements, calculateStreak } from '@/lib/achievementManager';
import { queueGameProgress, syncOfflineProgress } from '@/lib/offlineSyncManager';

export default function GamePlayer() {
  const { category, index } = useParams();
  const { ageGroup } = useAgeGroup();
  const { user, isAuthenticated } = useAuth();
  const { selectedChild } = useSelectedChild();
  const gameIndex = parseInt(index);

  const [game, setGame] = useState(null);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  // Load game: try DB first, fallback to gameLibrary + check access
  useEffect(() => {
    const loadGame = async () => {
      // Check subscription tier to enforce locks
      let userTier = 'free';
      if (isAuthenticated && user?.email) {
        try {
          const subs = await base44.entities.UserSubscription.filter({ email: user.email });
          if (subs.length > 0) {
            const sub = subs[0];
            const notExpired = !sub.currentPeriodEnd || new Date(sub.currentPeriodEnd) > new Date();
            if ((sub.status === 'active' || sub.status === 'trial') && notExpired) {
              userTier = sub.tier || 'free';
            }
          }
        } catch (_) {}
      }

      // Determine if this game index is locked for the user's tier
      const isLocked = (() => {
        if (!isAuthenticated) return gameIndex >= 5;
        if (userTier === 'trial' || userTier === 'keluarga' || userTier === 'pro') return false;
        if (userTier === 'standard') return ageGroup === 'prasekolah';
        if (userTier === 'asas') return ageGroup === 'sekolah_rendah';
        if (userTier === 'premium') return false;
        return gameIndex >= 5; // free
      })();

      if (isLocked) {
        setAccessDenied(true);
        setGameLoaded(true);
        return;
      }

      try {
        const dbGames = await base44.entities.Game.filter({ ageGroup, category, isPublished: true });
        dbGames.sort((a, b) => (a.order || 0) - (b.order || 0));
        if (dbGames.length > gameIndex && dbGames[gameIndex]) {
          setGame(dbGames[gameIndex]);
          setGameLoaded(true);
          return;
        }
      } catch (e) {
        // fallback
      }
      // Fallback to hardcoded library
      const libGames = getGamesByAgeAndCategory(ageGroup, category);
      const libGame = libGames && gameIndex >= 0 && gameIndex < libGames.length ? libGames[gameIndex] : null;
      setGame(libGame);
      setGameLoaded(true);
    };
    loadGame();
  }, [ageGroup, category, gameIndex, isAuthenticated, user?.email]);

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
    unlockedBadges: [],
  });

  // Save progress after game finishes — only trigger on `finished` becoming true, not on selectedChild change
  const savedRef = React.useRef(false);
  useEffect(() => {
    if (state.finished && user && game && !savedRef.current) {
      savedRef.current = true;
      saveGameProgress();
    }
  }, [state.finished]);

  const questions = useMemo(() => {
    if (!game?.gameData?.questions) return [];
    // No shuffling — preserve original order so answer index stays correct
    return game.gameData.questions.slice(0, game.totalQuestions || 20);
  }, [game]);

  const handleAnswer = useCallback((answer) => {
    if (state.showFeedback || !questions[state.currentQ]) return;

    const currentQuestion = questions[state.currentQ];
    let correct = false;

    // Check answer based on question type
    if (['multiple_choice', 'true_false', 'yes_no'].includes(currentQuestion.type) || !currentQuestion.type) {
      correct = answer === currentQuestion.answer;
      console.log(`[Answer Check] Selected: ${answer} (${currentQuestion.options?.[answer]}), Correct: ${currentQuestion.answer} (${currentQuestion.options?.[currentQuestion.answer]}), Match: ${correct}`);
    } else if (['short_answer', 'fill_blank'].includes(currentQuestion.type)) {
      const answerText = String(answer).toLowerCase().trim();
      const correctText = String(currentQuestion.answer).toLowerCase().trim();
      correct = answerText === correctText || answerText.includes(correctText) || correctText.includes(answerText);
    } else if (currentQuestion.type === 'matching') {
      correct = JSON.stringify(answer) === JSON.stringify(currentQuestion.pairs?.reduce((acc, p, i) => ({ ...acc, [i]: p.right }), {}));
    } else if (currentQuestion.type === 'ordering') {
      correct = JSON.stringify(answer) === JSON.stringify(currentQuestion.correctOrder || currentQuestion.items);
    } else if (currentQuestion.type === 'word_builder') {
      correct = String(answer).toLowerCase() === String(currentQuestion.answer).toLowerCase();
    }

    if (correct) {
      playSound('correct');
      confetti({
        particleCount: 60,
        spread: 50,
        colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981'],
      });
    } else {
      playSound('wrong');
    }

    setState(prev => ({
      ...prev,
      showFeedback: true,
      isCorrect: correct,
      feedbackMsg: correct ? '✨ Jawapan Betul!' : '💪 Cuba Lagi!',
      score: correct ? prev.score + 1 : prev.score,
      selectedIdx: answer,
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

  const handlePrevious = useCallback(() => {
    if (state.currentQ > 0) {
      setState(prev => ({
        ...prev,
        currentQ: prev.currentQ - 1,
        showFeedback: false,
        selectedIdx: null,
      }));
    }
  }, [state.currentQ]);

  const handlePlayAgain = () => {
    savedRef.current = false; // allow saving again on replay
    setState({
      currentQ: 0,
      score: 0,
      showFeedback: false,
      isCorrect: false,
      feedbackMsg: '',
      finished: false,
      selectedIdx: null,
      showTracing: false,
      unlockedBadges: [],
    });
  };



  const handleTracingComplete = (result) => {
   const correct = result.accuracy >= 70;
   if (correct) playSound('complete');
   else playSound('wrong');
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

      const childName = selectedChild?.name || user.full_name || 'Default';

      // Check if progress exists
      const existing = await base44.entities.ChildGameProgress.filter({
        userEmail: user.email,
        childName: childName,
        gameType: gameKey,
      });

      const progressData = {
        userEmail: user.email,
        childName: childName,
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

      // Update leaderboard
      const leaderboardData = await base44.entities.Leaderboard.filter({
        userEmail: user.email,
        childName: childName,
        ageGroup: ageGroup,
      });

      // Calculate total stars: add newly earned stars above previous best for this specific game
      const oldTotalStars = leaderboardData[0]?.totalStars || 0;
      const previousBestStars = existing[0]?.bestStars || 0; // use game-level best, not leaderboard
      const newStarsEarned = Math.max(stars - previousBestStars, 0);
      const totalStars = oldTotalStars + newStarsEarned;

      const leaderboardEntry = {
        userEmail: user.email,
        childName: childName,
        ageGroup: ageGroup,
        totalStars: totalStars,
        gamesCompleted: (leaderboardData[0]?.gamesCompleted || 0) + 1,
        currentStreak: await calculateStreak({ email: user.email }, childName, base44),
        lastPlayedDate: new Date().toISOString(),
      };

      if (leaderboardData.length > 0) {
        await base44.entities.Leaderboard.update(leaderboardData[0].id, leaderboardEntry);
      } else {
        await base44.entities.Leaderboard.create(leaderboardEntry);
      }

      // Check for achievements
      const badges = await checkAchievements(user, childName, progressData, base44);
      if (badges.length > 0) {
        setState(prev => ({ ...prev, unlockedBadges: badges }));
      }

      // Queue for offline sync if needed
      if (navigator.onLine === false) {
        queueGameProgress(progressData);
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
      // Queue for retry
      if (user) {
        queueGameProgress({
          userEmail: user.email,
          childName: user.full_name || 'Default',
          gameType: `${ageGroup}-${category}-${gameIndex}`,
          category: category,
          ageGroup: ageGroup,
          lastScore: state.score,
          lastTotal: questions.length,
          lastStars: calculateStars(state.score, questions.length),
          lastPlayedDate: new Date().toISOString(),
        });
      }
    }
  };

  if (!gameLoaded) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-4">🎮</div>
          <div className="w-8 h-8 border-4 border-game-purple border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="clay rounded-3xl p-8 text-center max-w-sm"
        >
          <p className="text-5xl mb-4">🔒</p>
          <p className="text-2xl font-black mb-2 text-gray-800">Permainan Terkunci</p>
          <p className="text-gray-600 mb-6">Naik taraf langganan anda untuk akses permainan ini.</p>
          <Link to="/">
            <motion.button whileHover={{ scale: 1.05 }} className="px-6 py-3 bg-orange-500 text-white rounded-full font-bold">
              Lihat Pelan →
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

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
      <div className="min-h-screen bg-pattern">
        <AppHeader showBack={true} backTo={`/games/${category}`} />
        <div className="max-w-lg mx-auto px-4 py-4 md:py-6 pb-24 pt-20">
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
      <AppHeader showBack={true} backTo={`/games/${category}`} />
      <div className="max-w-lg mx-auto px-3 md:px-4 py-4 md:py-6 pb-32 pt-20">

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-game-purple">
            {game.difficulty === 'hard' && <Zap className="w-4 h-4" />}
            <span className="capitalize px-3 py-1 bg-game-purple/10 rounded-full">
              {game.difficulty === 'easy' ? '🟢 Senang' : game.difficulty === 'medium' ? '🟡 Sedang' : '🔴 Susah'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
            <Clock className="w-4 h-4" />
            {game.totalQuestions || 20} soalan
          </div>
        </div>

        <GameHeader
          title={game.title}
          score={state.score}
          total={questions.length}
          currentQ={state.currentQ + 1}
          totalQ={questions.length}
          onPrevious={handlePrevious}
        />

        {/* Progress Bar with encouraging messages */}
        <ProgressBar current={state.currentQ + 1} total={questions.length} score={state.score} />

        {/* Question Display - Adaptive based on game type */}
        <motion.div
          key={state.currentQ}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="clay rounded-3xl p-6 text-center mb-6 bg-gradient-to-br from-sky-50 to-blue-100"
        >


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

          {/* Generic question text — covers all DB game formats */}
           {currentQuestion.question && (
             <p className={`font-bold text-gray-800 mb-2 ${currentQuestion.question.length > 60 ? 'text-base' : 'text-xl'}`}>
               {currentQuestion.question}
             </p>
           )}

           {/* Text Question (math, multiple choice) */}
           {currentQuestion.problem && (
             <div className={`font-black text-game-purple ${currentQuestion.problem.length > 20 ? 'text-2xl' : 'text-4xl'}`}>
               {currentQuestion.problem}
             </div>
           )}

           {/* Question label based on game type */}
           {currentQuestion.image && !currentQuestion.problem && !currentQuestion.question && (
             <p className="text-lg font-bold text-gray-700 mt-2">
               {game.type === 'counting' ? 'Berapakah ini?' : 'Apakah ini?'}
             </p>
           )}

           {/* Audio button for pronunciations */}
           {(currentQuestion.word || currentQuestion.letter || currentQuestion.problem || currentQuestion.question) && (
             <div className="mt-4">
               <AudioPlayer 
                 text={currentQuestion.word || currentQuestion.letter || currentQuestion.problem || currentQuestion.question}
                 language={category === 'english' ? 'en-US' : 'ms-MY'}
               />
             </div>
           )}
          </motion.div>

        {/* Dynamic Question Renderer */}
        <QuestionRenderer
          question={currentQuestion}
          onAnswer={handleAnswer}
          disabled={state.showFeedback}
          selectedIdx={state.selectedIdx}
          isCorrect={state.isCorrect}
          showFeedback={state.showFeedback}
        />
      </div>

      <FeedbackOverlay
        show={state.showFeedback}
        isCorrect={state.isCorrect}
        message={state.feedbackMsg}
        onDone={handleFeedbackDone}
      />

      <AchievementBadges badges={state.unlockedBadges} />
    </div>
  );
}