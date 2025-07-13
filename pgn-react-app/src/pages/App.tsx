import React, { useState } from 'react';
import PGNUploader from '../components/PGNUploader';
import GamesList from '../components/GamesList';
import GameViewer from '../components/GameViewer';
import { buildTree, pgnImport } from 'pgn-parser';

interface GameEntry {
  index: number;
  pgn: string;
}

const App: React.FC = () => {
  const [games, setGames] = useState<GameEntry[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameEntry | null>(null);

  const handleFileLoaded = (fileText: string) => {
    const gameStrings = fileText.split(/\n\s*\n(?=\[Event)/g); // naive split by blank line before [Event]
    const entries: GameEntry[] = gameStrings.map((g, idx) => ({ index: idx, pgn: g.trim() }));
    setGames(entries);
    setSelectedGame(null);
  };

  const handleSelectGame = (entry: GameEntry) => {
    setSelectedGame(entry);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>PGN Analyzer</h1>
      <PGNUploader onLoad={handleFileLoaded} />
      {games.length > 0 && (
        <GamesList games={games} onSelect={handleSelectGame} selected={selectedGame?.index ?? -1} />
      )}
      {selectedGame && <GameViewer pgn={selectedGame.pgn} />}
    </div>
  );
};

export default App;
