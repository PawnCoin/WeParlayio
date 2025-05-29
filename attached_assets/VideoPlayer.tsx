import React from 'react';
import ReactPlayer from 'react-player';
import { LiveGame } from '../types';
import { X, ArrowLeft, Share2, Star } from 'lucide-react';

interface VideoPlayerProps {
  game: LiveGame;
  onClose: () => void;
  onBackToList: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ game, onClose, onBackToList }) => {
  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
        <div className="flex items-center">
          <button 
            onClick={onBackToList}
            className="mr-4 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-white font-medium">{game.title}</h2>
            <div className="flex items-center mt-0.5">
              <span className="text-xs font-medium bg-green-900 text-green-400 px-2 py-0.5 rounded-sm">
                LIVE
              </span>
              <span className="text-xs text-gray-400 ml-2">
                {game.leagueName} • {game.period}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Star className="h-5 w-5" />
          </button>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="md:flex-1 relative">
          <ReactPlayer
            url={game.streamUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}
            width="100%"
            height="100%"
            playing
            controls
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
        </div>
        
        <div className="md:w-80 bg-gray-900 overflow-y-auto p-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-medium">Match Details</h3>
              <span className="text-xs font-medium bg-red-900/50 text-red-400 px-2 py-0.5 rounded-sm">
                LIVE
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                  {game.homeTeam.logo ? (
                    <img src={game.homeTeam.logo} alt={game.homeTeam.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm text-gray-400">{game.homeTeam.name.substring(0, 2)}</span>
                  )}
                </div>
                <p className="text-sm text-white mt-1 line-clamp-1">{game.homeTeam.name}</p>
                <p className="text-2xl font-bold text-white">{game.homeTeam.score || 0}</p>
              </div>
              
              <div className="text-center">
                <span className="text-gray-400 text-sm">VS</span>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                  {game.awayTeam.logo ? (
                    <img src={game.awayTeam.logo} alt={game.awayTeam.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm text-gray-400">{game.awayTeam.name.substring(0, 2)}</span>
                  )}
                </div>
                <p className="text-sm text-white mt-1 line-clamp-1">{game.awayTeam.name}</p>
                <p className="text-2xl font-bold text-white">{game.awayTeam.score || 0}</p>
              </div>
            </div>
            
            {game.odds && (
              <div>
                <h4 className="text-gray-400 text-sm mb-2">Live Odds</h4>
                <div className="grid grid-cols-3 gap-2">
                  <button className="bg-gray-700 hover:bg-green-800 text-white text-sm py-2 px-2 rounded transition-colors">
                    {game.homeTeam.name.split(' ').pop()}
                    <div className="font-bold text-green-400">{game.odds.homeWin}</div>
                  </button>
                  {game.odds.draw !== undefined && (
                    <button className="bg-gray-700 hover:bg-green-800 text-white text-sm py-2 px-2 rounded transition-colors">
                      Draw
                      <div className="font-bold text-green-400">{game.odds.draw}</div>
                    </button>
                  )}
                  <button className="bg-gray-700 hover:bg-green-800 text-white text-sm py-2 px-2 rounded transition-colors">
                    {game.awayTeam.name.split(' ').pop()}
                    <div className="font-bold text-green-400">{game.odds.awayWin}</div>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <h3 className="text-white font-medium mb-3">Match Stats</h3>
            {/* Mock stats - would be replaced with real data from API */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>55%</span>
                  <span>Possession</span>
                  <span>45%</span>
                </div>
                <div className="flex h-2 bg-gray-700 rounded overflow-hidden">
                  <div className="bg-blue-500" style={{ width: '55%' }}></div>
                  <div className="bg-red-500" style={{ width: '45%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>8</span>
                  <span>Shots on Goal</span>
                  <span>6</span>
                </div>
                <div className="flex h-2 bg-gray-700 rounded overflow-hidden">
                  <div className="bg-blue-500" style={{ width: '57%' }}></div>
                  <div className="bg-red-500" style={{ width: '43%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>3</span>
                  <span>Corner Kicks</span>
                  <span>5</span>
                </div>
                <div className="flex h-2 bg-gray-700 rounded overflow-hidden">
                  <div className="bg-blue-500" style={{ width: '37.5%' }}></div>
                  <div className="bg-red-500" style={{ width: '62.5%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;