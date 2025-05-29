import React, { useEffect, useState } from 'react';
import SportsList from '../components/SportsList';
import GamesList from '../components/GamesList';
import VideoPlayer from '../components/VideoPlayer';
import { fetchLiveSports, fetchLiveGames } from '../services/api';
import useLiveSportsStore from '../store/liveSportsStore';
import liveSocketService from '../services/socket';

const LiveSportsPage: React.FC = () => {
  const { 
    sports, 
    games, 
    selectedSport, 
    selectedGame, 
    setSelectedSport, 
    setSelectedGame, 
    updateGames 
  } = useLiveSportsStore();
  
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const sportsData = await fetchLiveSports();
        useLiveSportsStore.setState({ sports: sportsData });
        
        const gamesData = await fetchLiveGames();
        updateGames(gamesData);
      } catch (error) {
        console.error('Error loading live sports data:', error);
        useLiveSportsStore.setState({ error: 'Failed to load live sports data. Please try again.' });
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
    
    liveSocketService.connect();
    
    return () => {
      liveSocketService.disconnect();
    };
  }, [updateGames]);
  
  useEffect(() => {
    async function loadFilteredGames() {
      try {
        setLoading(true);
        const gamesData = await fetchLiveGames(selectedSport?.id);
        updateGames(gamesData);
      } catch (error) {
        console.error('Error loading filtered games:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadFilteredGames();
  }, [selectedSport, updateGames]);
  
  const handleSelectSport = (sport: typeof selectedSport) => {
    setSelectedSport(sport);
  };
  
  const handleSelectGame = (game: typeof selectedGame) => {
    setSelectedGame(game);
  };
  
  const handleClosePlayer = () => {
    setSelectedGame(null);
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Live Sports</h1>
          <p className="text-gray-400">
            Watch free live streams of your favorite sports and place bets in real-time.
          </p>
        </div>
        
        <SportsList 
          sports={sports} 
          selectedSport={selectedSport} 
          onSelectSport={handleSelectSport} 
        />
        
        <GamesList 
          games={games} 
          loading={loading} 
          onSelectGame={handleSelectGame} 
        />
      </div>
      
      {selectedGame && (
        <VideoPlayer 
          game={selectedGame} 
          onClose={handleClosePlayer} 
          onBackToList={handleClosePlayer} 
        />
      )}
    </div>
  );
};

export default LiveSportsPage;