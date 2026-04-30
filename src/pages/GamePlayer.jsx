import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

// Import game components
import MemoryGame from '@/pages/games/MemoryGame';
import DragDropGame from '@/pages/games/DragDropGame';
import WordBuilderGame from '@/pages/games/WordBuilderGame';
import SortingGame from '@/pages/games/SortingGame';
import TileMatchGame from '@/pages/games/TileMatchGame';
import StoryAdventureGame from '@/pages/games/StoryAdventureGame';
import PhysicsGame from '@/pages/games/PhysicsGame';
import TracingGameGamified from '@/pages/games/TracingGameGamified';

const gameComponentMap = {
  memory_game: MemoryGame,
  drag_drop: DragDropGame,
  word_builder: WordBuilderGame,
  shape_sort: SortingGame,
  pattern_fill: TileMatchGame,
  reading: StoryAdventureGame,
  math_puzzle: PhysicsGame,
  writing: TracingGameGamified,
};

export default function GamePlayer() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGame();
  }, [gameId]);

  const loadGame = async () => {
    try {
      const data = await base44.entities.Game.get(gameId);
      if (!data) {
        setError('Game not found');
      } else {
        setGame(data);
      }
    } catch (err) {
      console.error('Failed to load game:', err);
      setError('Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🎮</div>
          <div className="w-8 h-8 border-4 border-game-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-black text-gray-800 mb-4">❌ {error || 'Game not found'}</p>
          <a href="/games-hub" className="text-game-purple font-bold underline">Back to Games</a>
        </div>
      </div>
    );
  }

  const GameComponent = gameComponentMap[game.type];

  if (!GameComponent) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-black text-gray-800 mb-4">❌ Game type not supported</p>
          <a href="/games-hub" className="text-game-purple font-bold underline">Back to Games</a>
        </div>
      </div>
    );
  }

  return <GameComponent game={game} />;
}