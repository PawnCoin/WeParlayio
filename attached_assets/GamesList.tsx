import React from 'react';
import { LiveGame } from '../types';
import GameCard from './GameCard';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface GamesListProps {
  games: LiveGame[];
  loading: boolean;
  onSelectGame: (game: LiveGame) => void;
}

const GamesList: React.FC<GamesListProps> = ({ games, loading, onSelectGame }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, index) => (
          <div key={index} className="bg-gray-800 rounded-lg overflow-hidden">
            <Skeleton height={160} baseColor="#374151" highlightColor="#4B5563" />
            <div className="p-4">
              <Skeleton count={3} baseColor="#374151" highlightColor="#4B5563" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400">No live games found. Please check back later or select a different sport.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {games.map((game) => (
        <GameCard key={game.id} game={game} onClick={onSelectGame} />
      ))}
    </div>
  );
};

export default GamesList;