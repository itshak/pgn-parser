// GamesList.tsx
// This component displays a list of games loaded from the PGN file.
// It allows the user to select a game to view.

import React from 'react';

// Represents a single chess game in the list.
interface GameEntry {
  index: number; // The original index of the game in the file.
  pgn: string;   // The PGN content of the game.
}

interface Props {
  games: GameEntry[]; // The list of games to display.
  selected: number;   // The index of the currently selected game.
  onSelect: (g: GameEntry) => void; // Callback to notify when a game is selected.
}

const GamesList: React.FC<Props> = ({ games, onSelect, selected }) => (
  <div style={{ marginTop: 16 }}>
    <h2>Games</h2>
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {games.map(g => (
        <li key={g.index} style={{ marginBottom: 4 }}>
          <button
            style={{
              background: g.index === selected ? '#1976d2' : '#eee',
              color: g.index === selected ? '#fff' : '#000',
              padding: '4px 8px',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => onSelect(g)}
          >
            Game {g.index + 1}
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default GamesList;
