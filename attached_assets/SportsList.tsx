import React from 'react';
import { Sport } from '../types';
import { Footprints, CircleDot, CircleDashed, Snowflake, CircleDotDashed, Gamepad2 } from 'lucide-react';
import clsx from 'clsx';

interface SportsListProps {
  sports: Sport[];
  selectedSport: Sport | null;
  onSelectSport: (sport: Sport | null) => void;
}

const SportsList: React.FC<SportsListProps> = ({ sports, selectedSport, onSelectSport }) => {
  // Map of sport icons by name
  const iconMap: Record<string, React.ReactNode> = {
    Footprints: <Footprints className="h-5 w-5" />,
    CircleDot: <CircleDot className="h-5 w-5" />,
    CircleDashed: <CircleDashed className="h-5 w-5" />,
    Snowflake: <Snowflake className="h-5 w-5" />,
    CircleDotDashed: <CircleDotDashed className="h-5 w-5" />,
    Gamepad2: <Gamepad2 className="h-5 w-5" />
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 text-white">Live Sports</h2>
      <div className="flex space-x-2 overflow-x-auto pb-2 hide-scrollbar">
        <button
          onClick={() => onSelectSport(null)}
          className={clsx(
            "flex items-center gap-2 py-2 px-4 rounded-full text-sm font-medium whitespace-nowrap transition-all",
            !selectedSport 
              ? "bg-green-600 text-white shadow-lg shadow-green-900/30" 
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          )}
        >
          All Sports
        </button>
        
        {sports.map((sport) => (
          <button
            key={sport.id}
            onClick={() => onSelectSport(sport)}
            className={clsx(
              "flex items-center gap-2 py-2 px-4 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              selectedSport?.id === sport.id 
                ? "bg-green-600 text-white shadow-lg shadow-green-900/30" 
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            )}
          >
            {sport.iconName && iconMap[sport.iconName]}
            {sport.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SportsList;