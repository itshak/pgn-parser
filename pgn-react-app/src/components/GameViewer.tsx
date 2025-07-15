// GameViewer.tsx
// This component is the core of the chess game interaction.
// It displays the chessboard, handles user moves, and shows game variations.

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  KeyboardEvent,
} from "react";
import { Chess, Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import { buildTree, pgnImport, pgnExport } from "pgn-parser";

// The pgn-parser library lacks TypeScript definitions, so we use 'any' for now.
type TreeWrapper = any;

interface Props {
  pgn: string; // The PGN string of the game to display.
  onPgnChange: (pgn: string) => void; // Callback to notify when the PGN changes.
}

const GameViewer: React.FC<Props> = ({ pgn, onPgnChange }) => {
  // The move tree, which is the primary data structure for the game.
  const [tree, setTree] = useState<TreeWrapper | null>(null);
  // The FEN string of the root position of the game.
  const [rootFen, setRootFen] = useState("");
  // Additional game data extracted from the PGN headers.
  const [gameData, setGameData] = useState<any>(null);

  // The current path in the move tree, representing the current board position.
  const [path, setPath] = useState("");

  // This effect is triggered whenever the PGN string changes.
  // It parses the PGN, builds the move tree, and initializes the component's state.
  useEffect(() => {
    const analyse = pgnImport(pgn);
    setRootFen(analyse.game.fen);
    setTree(buildTree(analyse.treeParts[0]));
    setPath("");
    setGameData(analyse.game);
  }, [pgn]);

  // This effect is triggered whenever the move tree or game data changes.
  // It exports the current game state to a PGN string and calls the onPgnChange callback.
  useEffect(() => {
    if (tree && gameData) {
      const analyseCtrl = {
        data: { game: gameData },
        tree: tree,
      };
      onPgnChange(pgnExport.renderFullTxt(analyseCtrl));
    }
  }, [tree, gameData, onPgnChange]);

  // Memoized value for the current node in the move tree.
  const currentNode = useMemo(() => {
    if (!tree) return undefined;
    return tree.nodeAtPath(path);
  }, [tree, path]);

  // Memoized value for the FEN string of the current board position.
  const fen = useMemo(() => {
    if (!tree) return rootFen;
    const chess = new Chess(rootFen || undefined);
    const nodes: any[] = tree.getNodeList(path);
    nodes.slice(1).forEach((n) => {
      if (n.uci)
        chess.move({
          from: n.uci.slice(0, 2),
          to: n.uci.slice(2, 4),
          promotion: n.uci.slice(4) || undefined,
        } as any);
    });
    return chess.fen();
  }, [tree, path, rootFen]);

  // Memoized list of next possible moves from the current position.
  const nextMoves: { id: string; san: string; isMain: boolean }[] =
    useMemo(() => {
      if (!currentNode) return [];
      return currentNode.children.map((c: any, idx: number) => ({
        id: c.id,
        san: c.san ?? "",
        isMain: idx === 0,
      }));
    }, [currentNode]);

  // Handles keyboard navigation (left and right arrow keys).
  const parentPath = path.length > 1 ? path.slice(0, -2) : "";
  const handleKey = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!tree) return;
      if (e.key === "ArrowLeft" && path !== "") setPath(parentPath);
      else if (e.key === "ArrowRight" && nextMoves.length)
        setPath(path + nextMoves[0].id);
    },
    [path, parentPath, nextMoves, tree]
  );

  // Handles a piece being dropped on the board to make a move.
  const onPieceDrop = useCallback(
    (source: string, target: string) => {
      if (!tree) return false;
      const chess = new Chess(fen);

      // Check if a promotion is needed for the move.
      const piece = chess.get(source as any);
      const needsPromotion =
        piece?.type === "p" &&
        ((piece.color === "w" && target[1] === "8") ||
          (piece.color === "b" && target[1] === "1"));
      const moveObj: Move & { promotion?: string } = {
        from: source,
        to: target,
      } as any;
      if (needsPromotion) moveObj.promotion = "q"; // Default to queen promotion.

      const result = chess.move(moveObj);
      if (!result) return false; // Illegal move.

      // Create a new move node and add it to the tree.
      const newMovePgn = `[FEN "${fen}"] ${result.san}`;
      const newMoveAnalysis = pgnImport(newMovePgn);
      const newMoveNode = buildTree(newMoveAnalysis.treeParts[0]).root.children[0];

      const newPath = tree.addNode(newMoveNode, path);
      if (newPath) {
        setPath(newPath);
        // Create a new tree object to trigger a re-render.
        const newRoot = JSON.parse(JSON.stringify(tree.root));
        setTree(buildTree(newRoot));
      } else {
        console.warn("addNode returned undefined, path not updated.");
      }
      return true;
    },
    [tree, path, fen, currentNode]
  );

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKey}
      style={{ marginTop: 16, outline: "none" }}
    >
      <Chessboard position={fen} onPieceDrop={onPieceDrop} boardWidth={400} />

      {/* Display the last move made. */}
      <div style={{ marginTop: 12 }}>
        <strong>Last move:</strong>{" "}
        {currentNode && currentNode.san
          ? `${Math.ceil(currentNode.ply / 2)}${
              currentNode.ply % 2 ? "." : "..."
            } ${currentNode.san}`
          : "-"}
      </div>

      {/* Display the list of next possible moves. */}
      <div style={{ marginTop: 12 }}>
        <strong>Next moves:</strong>
        {nextMoves.length === 0 ? (
          <em> none</em>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {nextMoves.map((m) => (
              <li key={m.id} style={{ marginBottom: 4 }}>
                <button
                  style={{
                    background: m.isMain ? "#1976d2" : "#eee",
                    color: m.isMain ? "#fff" : "#000",
                    border: "none",
                    padding: "2px 6px",
                    cursor: "pointer",
                  }}
                  onClick={() => setPath(path + m.id)}
                >
                  {m.san}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GameViewer;
