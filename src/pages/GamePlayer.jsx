import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Zap } from 'lucide-react';
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
import CikguMascot from '@/components/game/CikguMascot';
import { playSound } from '@/lib/soundManager';
import { playCorrectReward, playGentleWrong, playComboFanfare, playVictory, getComboMessage, haptic } from '@/lib/gameRewards';
import StreakIndicator from '@/components/game/StreakIndicator';
import AnswerBurst, { triggerAnswerBurst } from '@/components/game/AnswerBurst';
import { checkAchievements, calculateStreak } from '@/lib/achievementManager';
import { queueGameProgress, syncOfflineProgress } from '@/lib/offlineSyncManager';
import { getActiveTier, isGameIndexLocked } from '@/lib/tierAccess';

const DARJAH_ORDER = ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6'];

export default function GamePlayer() {
  const { category, index } = useParams();
  const { ageGroup } = useAgeGroup();
  const { user, isAuthenticated } = useAuth();
  const { selectedChild } = useSelectedChild();
  const gameIndex = parseInt(index);

  const [game, setGame] = useState(null);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [userTier, setUserTier] = useState('free');
  const [questionSeed, setQuestionSeed] = useState(0);

  // Load game: try DB first, fallback to gameLibrary + check access
  useEffect(() => {
    const loadGame = async () => {
      // Check subscription tier to enforce locks
      let resolvedTier = 'free';
      if (isAuthenticated && user?.email) {
        try {
          const subs = await base44.entities.UserSubscription.filter({ email: user.email });
          if (subs.length > 0) {
            resolvedTier = getActiveTier(subs[0]);
          }
        } catch (_) {}
      }
      setUserTier(resolvedTier);

      const isLocked = isGameIndexLocked({ index: gameIndex, tier: resolvedTier, isAuthenticated });

      if (isLocked) {
        setAccessDenied(true);
        setGameLoaded(true);
        return;
      }

      try {
        const dbGames = await base44.entities.Game.filter({ ageGroup, category, isPublished: true });
        dbGames.sort((a, b) => {
          const da = DARJAH_ORDER.indexOf(a.darjah);
          const db = DARJAH_ORDER.indexOf(b.darjah);
          if (da !== db) return (da === -1 ? 99 : da) - (db === -1 ? 99 : db);
          return (a.order || 0) - (b.order || 0);
        });
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
    streak: 0,
    bestStreak: 0,
    comboMessage: null,
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
    const all = game.gameData.questions;
    const limit = game.totalQuestions || 20;
    if (questionSeed === 0) return all.slice(0, limit);
    // Shuffle with seed so each replay gives different order
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(limit, shuffled.length));
  }, [game, questionSeed]);

  const handleAnswer = useCallback((answer, event) => {
    if (state.showFeedback || !questions[state.currentQ]) return;

    const currentQuestion = questions[state.currentQ];
    let correct = false;

    // Check answer based on question type
    if (['multiple_choice', 'true_false', 'yes_no'].includes(currentQuestion.type) || !currentQuestion.type) {
      correct = answer === currentQuestion.answer;
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

    // Trigger burst at tap location (fallback to centre if no event)
    const burstX = event?.clientX ?? window.innerWidth / 2;
    const burstY = event?.clientY ?? window.innerHeight / 2;
    triggerAnswerBurst(burstX, burstY, correct ? 'correct' : 'wrong');

    const newStreak = correct ? state.streak + 1 : 0;
    const comboMsg = correct ? getComboMessage(newStreak) : null;
    const isMilestone = correct && (newStreak === 3 || newStreak === 5 || newStreak === 7 || newStreak === 10);

    if (correct) {
      playCorrectReward(newStreak);
      if (isMilestone) {
        setTimeout(() => playComboFanfare(newStreak), 200);
      }
      const particleCount = newStreak >= 5 ? 90 : 60;
      confetti({
        particleCount,
        spread: 55,
        colors: newStreak >= 5
          ? ['#f59e0b', '#ef4444', '#ec4899', '#a855f7', '#facc15']
          : ['#f59e0b', '#ec4899', '#3b82f6', '#10b981'],
      });
    } else {
      playGentleWrong();
    }

    setState(prev => ({
      ...prev,
      showFeedback: true,
      isCorrect: correct,
      feedbackMsg: correct ? '✨ Jawapan Betul!' : '💪 Cuba Lagi!',
      score: correct ? prev.score + 1 : prev.score,
      selectedIdx: answer,
      streak: newStreak,
      bestStreak: Math.max(prev.bestStreak, newStreak),
      comboMessage: comboMsg,
    }));
  }, [state.showFeedback, state.currentQ, state.streak, questions]);

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
        // Big satisfying victory cue on game completion
        setTimeout(() => playVictory(), 100);
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

  const resetState = () => ({
    currentQ: 0,
    score: 0,
    showFeedback: false,
    isCorrect: false,
    feedbackMsg: '',
    finished: false,
    selectedIdx: null,
    showTracing: false,
    unlockedBadges: [],
    streak: 0,
    bestStreak: 0,
    comboMessage: null,
  });

  const handlePlayAgain = () => {
    savedRef.current = false;
    setState(resetState());
  };

  const handleGenerateNew = () => {
    savedRef.current = false;
    setQuestionSeed(s => s + 1); // triggers shuffle
    setState(resetState());
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



  const isPremium = ['premium', 'pro', 'keluarga', 'standard', 'asas'].includes(userTier);

  if (state.finished) {
    return (
      <ScoreScreen
        score={state.score}
        total={questions.length}
        stars={calculateStars(state.score, questions.length)}
        onPlayAgain={handlePlayAgain}
        onGenerateNew={handleGenerateNew}
        isPremium={isPremium}
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
        <div className="max-w-lg mx-auto px-4 md:px-6 py-4 md:py-6 pb-40 pt-28 md:pt-32">
          <Link to={`/games/${category}`} className="inline-flex items-center gap-2 mb-4 px-4 py-2.5 rounded-full bg-white/80 text-game-purple font-black text-sm shadow-lg hover:bg-white transition-all">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Subjek
          </Link>
          <GameHeader title={game.title} score={state.score} total={questions.length} currentQ={state.currentQ + 1} totalQ={questions.length} />
          {state.finished ? (
            <ScoreScreen score={state.score} total={questions.length} stars={calculateStars(state.score, questions.length)} onPlayAgain={handlePlayAgain} onGenerateNew={handleGenerateNew} isPremium={isPremium} />
          ) : (
            <TracingCanvas
              targetShape={currentQuestion?.letter || currentQuestion?.tracingTarget || 'A'}
              emoji={game.emoji}
              width={Math.min(350, window.innerWidth - 32)}
              height={Math.min(350, window.innerWidth - 32)}
              onComplete={handleTracingComplete}
            />
          )}
        </div>
        <FeedbackOverlay show={state.showFeedback} isCorrect={state.isCorrect} message={state.feedbackMsg} onDone={handleFeedbackDone} combo={state.streak} comboMessage={state.comboMessage} />
        <StreakIndicator streak={state.streak} />
        <AnswerBurst />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden relative"
      style={{
        background: 'linear-gradient(135deg, #312e81 0%, #581c87 45%, #be185d 100%)',
      }}
    >
      {/* Floating sparkle decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-6 text-2xl text-white/30 animate-float">✨</div>
        <div className="absolute top-44 right-10 text-xl text-yellow-300/40 animate-float" style={{ animationDelay: '1.2s' }}>⭐</div>
        <div className="absolute top-1/2 left-4 text-2xl text-pink-300/40 animate-float" style={{ animationDelay: '2.4s' }}>💫</div>
        <div className="absolute bottom-40 right-6 text-2xl text-cyan-300/35 animate-float" style={{ animationDelay: '3.1s' }}>✨</div>
        <div className="absolute bottom-24 left-10 text-xl text-yellow-300/40 animate-float" style={{ animationDelay: '4s' }}>⭐</div>
        <div className="absolute top-1/3 right-1/4 text-lg text-white/25 animate-float" style={{ animationDelay: '1.7s' }}>✨</div>
      </div>

      {/* Glow orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full opacity-30 pointer-events-none blur-3xl" style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }} />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 rounded-full opacity-25 pointer-events-none blur-3xl" style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }} />

      {/* Cikgu Firdaus SVG mascot — waving */}
      <div className="hidden md:block fixed bottom-2 left-4 lg:left-8 z-0">
        <CikguMascot size={220} />
      </div>
      <div className="md:hidden fixed bottom-2 -right-4 z-0 opacity-90">
        <CikguMascot size={110} />
      </div>

      <AppHeader showBack={true} backTo={`/games/${category}`} />
      <div className="relative max-w-lg mx-auto px-4 md:px-6 py-4 md:py-6 pb-40 pt-28 md:pt-32">

         <Link to={`/games/${category}`} className="inline-flex items-center gap-2 mb-4 px-4 py-2.5 rounded-full font-black text-sm transition-all"
           style={{
             background: 'rgba(255,255,255,0.15)',
             backdropFilter: 'blur(12px)',
             border: '1px solid rgba(255,255,255,0.25)',
             color: 'white',
             boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
           }}
         >
           <ArrowLeft className="w-4 h-4" />
           Kembali ke Subjek
         </Link>

         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
           <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
             {game.difficulty === 'hard' && <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />}
             <span className="capitalize px-3 py-1.5 text-xs sm:text-sm rounded-full whitespace-nowrap"
               style={{
                 background: 'rgba(255,255,255,0.18)',
                 backdropFilter: 'blur(12px)',
                 border: '1px solid rgba(255,255,255,0.3)',
                 color: 'white',
               }}
             >
               {game.difficulty === 'easy' ? '🟢 Senang' : game.difficulty === 'medium' ? '🟡 Sedang' : '🔴 Susah'}
             </span>
           </div>
           <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white/80">
             <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
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

        {/* Question Display - glass card with vibrant gradient border */}
         <motion.div
           key={state.currentQ}
           initial={{ opacity: 0, y: 30, scale: 0.95 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           className="rounded-3xl mb-6 relative overflow-hidden"
           style={{
             background: 'rgba(255,255,255,0.12)',
             backdropFilter: 'blur(20px)',
             border: '1px solid rgba(255,255,255,0.2)',
           }}
         >
         <div className="rounded-3xl p-5 md:p-7 text-center relative">


          {/* Picture Quiz — image only */}
          {currentQuestion.image && (
            <div className="text-4xl sm:text-6xl mb-3">{currentQuestion.image}</div>
          )}

          {/* Letter/Number Display */}
          {currentQuestion.letter && (
            <div className="text-5xl sm:text-7xl font-black mb-2 text-white">
              {currentQuestion.letter}
            </div>
          )}

          {currentQuestion.word && (
            <p className="text-lg sm:text-2xl font-bold text-white">
              {currentQuestion.word}
            </p>
          )}

          {/* Generic question text — covers all DB game formats */}
           {currentQuestion.question && (
             <p className={`font-black mb-2 text-white ${currentQuestion.question.length > 60 ? 'text-sm sm:text-lg' : 'text-base sm:text-2xl'}`}>
               {currentQuestion.question}
             </p>
           )}

           {/* Text Question (math, multiple choice) */}
           {currentQuestion.problem && (
             <div className={`font-black text-white ${currentQuestion.problem.length > 20 ? 'text-lg sm:text-2xl' : 'text-2xl sm:text-4xl'}`}>
               {currentQuestion.problem}
             </div>
           )}

           {/* Question label based on game type */}
           {currentQuestion.image && !currentQuestion.problem && !currentQuestion.question && (
             <p className="text-base sm:text-lg font-bold text-white mt-2">
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
          </div>
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
        combo={state.streak}
        comboMessage={state.comboMessage}
      />

      <StreakIndicator streak={state.streak} />
      <AnswerBurst />

      <AchievementBadges badges={state.unlockedBadges} />
    </div>
  );
}