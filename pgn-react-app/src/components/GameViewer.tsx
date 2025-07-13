import React, { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { buildTree, pgnImport } from 'pgn-parser';

interface Props {
  pgn: string;
}

const GameViewer: React.FC<Props> = ({ pgn }) => {
  const [game, setGame] = useState(() => new Chess());
  const [currentMove, setCurrentMove] = useState(0);
  const [movesSan, setMovesSan] = useState<string[]>([]);

  useEffect(() => {
    const analyse = pgnImport(pgn);
    const tree = buildTree(analyse.treeParts[0]);
    const mainlineMoves: string[] = [];
    tree.walkUntilTrue(node => {
      if (node.san) mainlineMoves.push(node.san);
      return false;
    });
    setMovesSan(mainlineMoves);
    const chess = new Chess();
    chess.loadPgn(pgn, { sloppy: true });
    setGame(chess);
    setCurrentMove(0);
  }, [pgn]);

  const onPieceDrop = (source: string, target: string) => {
    const move = { from: source, to: target, promotion: 'q' } as const;
    const result = game.move(move);
    if (result) {
      setGame(new Chess(game.fen()));
      setMovesSan([...movesSan, result.san]);
      return true;
    }
    return false;
  };

  return (
    <div style={{ marginTop: 16 }}>
      <h2>Game Viewer</h2>
      <Chessboard position={game.fen()} onPieceDrop={onPieceDrop} />
      <div style={{ marginTop: 8 }}>
        Moves: {movesSan.map((m, idx) => (
          <span key={idx}>{m} </span>
        ))}
      </div>
    </div>
  );
};

export default GameViewer;
