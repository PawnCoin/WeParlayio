import React from 'react';
import ReactPlayer from 'react-player';
import { X, ArrowLeft, Share2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LiveGame {
  id: string;
  title: string;
  homeTeam: {
    name: string;
    score: number;
    logo?: string;
  };
  awayTeam: {
    name: string;
    score: number;
    logo?: string;
  };
  sport: string;
  league: string;
  status: 'live' | 'upcoming' | 'finished';
  startTime: string;
  streamUrl: string;
  odds?: {
    homeWin: number;
    awayWin: number;
    draw?: number;
  };
  viewers: number;
  period: string;
  timeRemaining: string;
}

interface ReactPlayerVideoPlayerProps {
  game: LiveGame;
  onClose: () => void;
  onBackToList: () => void;
}

export default function ReactPlayerVideoPlayer({ game, onClose, onBackToList }: ReactPlayerVideoPlayerProps) {
  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
        <div className="flex items-center">
          <Button 
            variant="ghost"
            size="icon"
            onClick={onBackToList}
            className="mr-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-white font-medium">{game.title}</h2>
            <div className="flex items-center mt-0.5">
              <Badge variant="destructive" className="animate-pulse text-xs">
                LIVE
              </Badge>
              <span className="text-xs text-gray-400 ml-2">
                {game.league} • {game.period}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <Share2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <Star className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="md:flex-1 relative">
          <ReactPlayer
            url={game.streamUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
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
              <Badge variant="destructive" className="animate-pulse text-xs">
                LIVE
              </Badge>
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
                  <Button variant="secondary" size="sm" className="bg-gray-700 hover:bg-green-800 text-white text-sm py-2 px-2 transition-colors">
                    {game.homeTeam.name.split(' ').pop()}
                    <div className="font-bold text-green-400">{game.odds.homeWin}</div>
                  </Button>
                  {game.odds.draw !== undefined && (
                    <Button variant="secondary" size="sm" className="bg-gray-700 hover:bg-green-800 text-white text-sm py-2 px-2 transition-colors">
                      Draw
                      <div className="font-bold text-green-400">{game.odds.draw}</div>
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" className="bg-gray-700 hover:bg-green-800 text-white text-sm py-2 px-2 transition-colors">
                    {game.awayTeam.name.split(' ').pop()}
                    <div className="font-bold text-green-400">{game.odds.awayWin}</div>
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <h3 className="text-white font-medium mb-3">Match Stats</h3>
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
}