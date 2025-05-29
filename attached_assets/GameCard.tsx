import React from 'react';
import { PlayCircleIcon, TimerIcon } from 'lucide-react';
import { LiveGame } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface GameCardProps {
  game: LiveGame;
  onClick: (game: LiveGame) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => {
  const timeSinceStart = formatDistanceToNow(new Date(game.startTime), { addSuffix: true });
  
  return (
    <div 
      className="bg-gray-800 rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
      onClick={() => onClick(game)}
    >
      <div className="relative">
        <img 
          src={game.thumbnailUrl || 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg'} 
          alt={game.title} 
          className="w-full h-40 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        <div className="absolute top-2 left-2 flex items-center">
          <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded flex items-center">
            <span className="h-2 w-2 bg-white rounded-full mr-1 animate-pulse" />
            LIVE
          </span>
          {game.isEsport && (
            <span className="bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded ml-2">
              ESPORTS
            </span>
          )}
        </div>
        
        <div className="absolute bottom-2 right-2">
          <button className="bg-green-600 hover:bg-green-700 text-white rounded-full p-1.5 transition-colors">
            <PlayCircleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 flex items-center">
            <TimerIcon className="h-3 w-3 mr-1" />
            {game.period} • {timeSinceStart}
          </span>
          <span className="text-xs font-medium bg-gray-700 px-2 py-0.5 rounded text-gray-300">
            {game.leagueName}
          </span>
        </div>
        
        <h3 className="text-white font-medium line-clamp-1 mb-3">{game.title}</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden mr-2">
              {game.homeTeam.logo ? (
                <img src={game.homeTeam.logo} alt={game.homeTeam.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-gray-400">{game.homeTeam.name.substring(0, 2)}</span>
              )}
            </div>
            <div>
              <p className="text-sm text-white font-medium line-clamp-1">{game.homeTeam.name}</p>
              <p className="text-2xl font-bold text-white">{game.homeTeam.score || 0}</p>
            </div>
          </div>
          
          <div className="text-center mx-2">
            <span className="text-gray-400 text-sm">VS</span>
          </div>
          
          <div className="flex items-center">
            <div>
              <p className="text-sm text-white font-medium text-right line-clamp-1">{game.awayTeam.name}</p>
              <p className="text-2xl font-bold text-white text-right">{game.awayTeam.score || 0}</p>
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden ml-2">
              {game.awayTeam.logo ? (
                <img src={game.awayTeam.logo} alt={game.awayTeam.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-gray-400">{game.awayTeam.name.substring(0, 2)}</span>
              )}
            </div>
          </div>
        </div>
        
        {game.odds && (
          <div className="flex justify-between mt-4 space-x-2">
            <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-1.5 px-3 rounded flex-1 transition-colors">
              Home <span className="font-bold">{game.odds.homeWin}</span>
            </button>
            {game.odds.draw !== undefined && (
              <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-1.5 px-3 rounded flex-1 transition-colors">
                Draw <span className="font-bold">{game.odds.draw}</span>
              </button>
            )}
            <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-1.5 px-3 rounded flex-1 transition-colors">
              Away <span className="font-bold">{game.odds.awayWin}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCard;