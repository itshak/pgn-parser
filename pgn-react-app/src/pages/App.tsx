import React, { useState } from 'react';
import PGNUploader from '../components/PGNUploader';
import GamesList from '../components/GamesList';
import GameViewer from '../components/GameViewer';

// Represents a single chess game loaded from the PGN file.
interface GameEntry {
  index: number; // The original index of the game in the file.
  pgn: string;   // The PGN content of the game.
}

/**
 * The main application component. It orchestrates the file upload,
 * game selection, and game viewing functionalities.
 */
const App: React.FC = () => {
  // State to hold all the games loaded from the PGN file.
  const [games, setGames] = useState<GameEntry[]>([]);
  // State to hold the currently selected game.
  const [selectedGame, setSelectedGame] = useState<GameEntry | null>(null);

  /**
   * Handles the loading of a PGN file.
   * @param fileText The content of the loaded PGN file.
   */
  const handleFileLoaded = (fileText: string) => {
    // Split the file content into individual games. This is a simple split
    // that assumes games are separated by a blank line followed by an [Event] tag.
    const gameStrings = fileText.split(/\n\s*\n(?=\[Event)/g);
    const entries: GameEntry[] = gameStrings.map((g, idx) => ({ index: idx, pgn: g.trim() }));
    setGames(entries);
    setSelectedGame(null); // Reset selected game when a new file is loaded.
  };

  /**
   * Handles the selection of a game from the list.
   * @param entry The selected game entry.
   */
  const handleSelectGame = (entry: GameEntry) => {
    setSelectedGame(entry);
  };

  /**
   * Handles changes to the PGN of the currently selected game.
   * This is called by the GameViewer when the user makes moves on the board.
   * @param updatedPgn The updated PGN string.
   */
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

  /**
   * Handles the download of all games as a single PGN file.
   */
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
          Download PGN
        </button>
      )}
    </div>
  );
};

export default App;

