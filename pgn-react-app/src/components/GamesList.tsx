import React from 'react';

interface GameEntry {
  index: number;
  pgn: string;
}

interface Props {
  games: GameEntry[];
  selected: number;
  onSelect: (g: GameEntry) => void;
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
