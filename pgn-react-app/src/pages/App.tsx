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

  const handlePgnChange = (updatedPgn: string) => {
    if (selectedGame) {
      setGames((prevGames) =>
        prevGames.map((game) =>
          game.index === selectedGame.index
            ? { ...game, pgn: updatedPgn }
            : game
        )
      );
    }
  };

  const handleDownloadPgn = () => {
    const fullPgn = games.map((game) => game.pgn).join("\n\n");
    const blob = new Blob([fullPgn], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "all_games.pgn";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>PGN Analyzer</h1>
      <PGNUploader onLoad={handleFileLoaded} />
      {games.length > 0 && (
        <GamesList games={games} onSelect={handleSelectGame} selected={selectedGame?.index ?? -1} />
      )}
      {selectedGame && <GameViewer pgn={selectedGame.pgn} onPgnChange={handlePgnChange} />}
      {games.length > 0 && (
        <button onClick={handleDownloadPgn} style={{ marginTop: 20, padding: '10px 20px', fontSize: '16px' }}>
          Download All PGNs
        </button>
      )}
    </div>
  );
};

export default App;
