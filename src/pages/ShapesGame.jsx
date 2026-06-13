import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import confetti from 'canvas-confetti';
import { useLang } from '@/lib/LanguageContext';
import GameHeader from '@/components/game/GameHeader';
import FeedbackOverlay from '@/components/game/FeedbackOverlay';
import ScoreScreen from '@/components/game/ScoreScreen';
import { shapeItems, colorItems, shuffleArray, calculateStars, saveScore } from '@/lib/gameData';

const TOTAL_ROUNDS = 6;

function generateRound(roundIndex) {
  // Alternate between shapes and colors
  const isShapeRound = roundIndex % 2 === 0;

  if (isShapeRound) {
    const shuffled = shuffleArray(shapeItems);
    const target = shuffled[0];
    const distractors = shuffled.slice(1, 4);
    const options = shuffleArray([target, ...distractors]);
    return { type: 'shape', target, options, answerId: target.id };
  } else {
    const shuffled = shuffleArray(colorItems);
    const target = shuffled[0];
    const distractors = shuffled.slice(1, 4);
    const options = shuffleArray([target, ...distractors]);
    return { type: 'color', target, options, answerId: target.id };
  }
}

export default function ShapesGame() {
  const { t } = useLang();

  const rounds = useMemo(() => {
    return Array.from({ length: TOTAL_ROUNDS }, (_, i) => generateRound(i));
  }, []);

  const [state, setState] = useState({
    currentRound: 0,
    score: 0,
    showFeedback: false,
    isCorrect: false,
    feedbackMsg: '',
    finished: false,
    droppedId: null,
  });

  const handleDragEnd = useCallback((result) => {
    if (!result.destination || state.showFeedback) return;
    if (result.destination.droppableId !== 'dropzone') return;

    const draggedId = result.draggableId;
    const round = rounds[state.currentRound];
    const correct = draggedId === round.answerId;

    if (correct) {
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981'],
      });
    }

    setState(prev => ({
      ...prev,
      showFeedback: true,
      isCorrect: correct,
      feedbackMsg: correct ? t('correct') : t('wrong'),
      score: correct ? prev.score + 1 : prev.score,
      droppedId: draggedId,
    }));
  }, [state.showFeedback, state.currentRound, rounds, t]);

  const handleFeedbackDone = useCallback(() => {
    setState(prev => {
      const nextRound = prev.currentRound + 1;
      if (nextRound >= TOTAL_ROUNDS) {
        const stars = calculateStars(prev.score, TOTAL_ROUNDS);
        saveScore('shapes', prev.score, TOTAL_ROUNDS, stars);
        return { ...prev, finished: true, showFeedback: false };
      }
      return {
        ...prev,
        currentRound: nextRound,
        showFeedback: false,
        droppedId: null,
      };
    });
  }, []);

  const handlePlayAgain = () => {
    setState({
      currentRound: 0,
      score: 0,
      showFeedback: false,
      isCorrect: false,
      feedbackMsg: '',
      finished: false,
      droppedId: null,
    });
  };

  if (state.finished) {
    return (
      <ScoreScreen
        score={state.score}
        total={TOTAL_ROUNDS}
        stars={calculateStars(state.score, TOTAL_ROUNDS)}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  const round = rounds[state.currentRound];

  return (
    <div className="min-h-screen bg-pattern">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <GameHeader
          title={t('shapeGame')}
          score={state.score}
          total={TOTAL_ROUNDS}
          currentQ={state.currentRound + 1}
          totalQ={TOTAL_ROUNDS}
        />

        {/* Question */}
        <motion.div
          key={state.currentRound}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="clay rounded-3xl p-6 text-center mb-6 bg-gradient-to-br from-emerald-50 to-green-100"
        >
          <p className="text-lg font-bold text-muted-foreground mb-3">
            {round.type === 'shape' ? t('matchShape') : t('matchColor')}
          </p>
          <div className="text-6xl mb-2">{round.target.emoji}</div>
          <p className="text-xl font-extrabold">
            {round.type === 'shape' ? t(round.target.shape) : t(round.target.id)}
          </p>
        </motion.div>

        <DragDropContext onDragEnd={handleDragEnd}>
          {/* Drop Zone */}
          <Droppable droppableId="dropzone">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`clay rounded-3xl p-6 mb-6 text-center border-2 border-dashed transition-colors min-h-[80px] flex items-center justify-center ${
                  snapshot.isDraggingOver
                    ? 'border-game-green bg-green-50/50'
                    : 'border-gray-300'
                }`}
              >
                {!state.droppedId && (
                  <p className="text-lg font-bold text-muted-foreground">
                    {t('dragHere')} 👇
                  </p>
                )}
                {state.droppedId && (
                  <div className="text-4xl">
                    {round.options.find(o => o.id === state.droppedId)?.emoji}
                  </div>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Draggable Options */}
          <Droppable droppableId="options" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid grid-cols-4 gap-3"
              >
                {round.options.map((option, index) => (
                  <Draggable
                    key={`${state.currentRound}-${option.id}`}
                    draggableId={option.id}
                    index={index}
                    isDragDisabled={state.showFeedback}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`clay-button rounded-2xl p-4 text-center text-4xl cursor-grab active:cursor-grabbing transition-shadow ${
                          snapshot.isDragging ? 'shadow-xl scale-110 z-10' : ''
                        }`}
                      >
                        {option.emoji}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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