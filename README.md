# PGN Parser

This library is a standalone PGN parser extracted from the Lichess.org source code. It provides a simple and efficient way to parse, manipulate, and export PGN files.

## Installation

This library is not available on npm. You can install it directly from its GitHub repository:

```bash
npm install https://github.com/itshak/pgn-parser
# or, if you use yarn
yarn add https://github.com/itshak/pgn-parser
```

## Usage

### Basic Usage

```typescript
import { pgnImport, pgnExport, buildTree } from 'pgn-parser';

const pgn = '[Event "Test"]\n[Site "Test"]\n[Date "2025.07.13"]\n[Round "-"]\n[White "Test"]\n[Black "Test"]\n[Result "*"]\n\n1. e4 e5 *';

const importedPgn = pgnImport(pgn);

if (importedPgn) {
  const tree = buildTree(importedPgn.treeParts[0]);

  // ... manipulate the tree

  const exportedPgn = pgnExport.renderFullTxt({
    data: { game: importedPgn.game },
    tree,
  });

  console.log(exportedPgn);
}
```

### Advanced Usage: React Integration

This example demonstrates how to integrate `pgn-parser` into a React component to manage chess game state, handle moves, and persist changes. It uses `chess.js` for move validation and `react-chessboard` for the UI.

```typescript
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  KeyboardEvent,
} from "react";
import { Chess, Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import { buildTree, pgnImport, pgnExport, path } from "pgn-parser";

type TreeWrapper = any; // pgn-parser lacks d.ts – use any for now

interface Props {
  pgn: string;
  onPgnChange: (pgn: string) => void;
}

const GameViewer: React.FC<Props> = ({ pgn, onPgnChange }) => {
  /* immutable after PGN load */
  const [tree, setTree] = useState<TreeWrapper | null>(null);
  const [rootFen, setRootFen] = useState("");
  const [gameData, setGameData] = useState<any>(null);

  /* single mutable state – current path in the move tree */
  const [path, setPath] = useState("");

  /* build tree once when PGN changes */
  useEffect(() => {
    const analyse = pgnImport(pgn);
    setRootFen(analyse.game.fen);
    setTree(buildTree(analyse.treeParts[0]));
    setPath("");
    setGameData(analyse.game);
  }, [pgn]);

  /* call onPgnChange when tree updates */
  useEffect(() => {
    if (tree && gameData) {
      const analyseCtrl = {
        data: { game: gameData },
        tree: tree,
      };
      onPgnChange(pgnExport.renderFullTxt(analyseCtrl));
    }
  }, [tree, gameData, onPgnChange]);

  /* helpers derived from tree + path */
  const currentNode = useMemo(() => {
    if (!tree) return undefined;
    return tree.nodeAtPath(path);
  }, [tree, path]);

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

  const nextMoves: { id: string; san: string; isMain: boolean }[] =
    useMemo(() => {
      if (!currentNode) return [];
      return currentNode.children.map((c: any, idx: number) => ({
        id: c.id,
        san: c.san ?? "",
        isMain: idx === 0,
      }));
    }, [currentNode]);

  /* keyboard navigation */
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

  /* board interaction */
  const onPieceDrop = useCallback(
    (source: string, target: string) => {
      if (!tree) return false;
      const chess = new Chess(fen);

      // decide if promotion needed
      const piece = chess.get(source as any);
      const needsPromotion =
        piece?.type === "p" &&
        ((piece.color === "w" && target[1] === "8") ||
          (piece.color === "b" && target[1] === "1"));
      const moveObj: Move & { promotion?: string } = {
        from: source,
        to: target,
      } as any;
      if (needsPromotion) moveObj.promotion = "q";

      const result = chess.move(moveObj);
      if (!result) return false; // illegal

      const newMovePgn = `[FEN "${fen}"] ${result.san}`;
      const newMoveAnalysis = pgnImport(newMovePgn);
      const newMoveNode = buildTree(newMoveAnalysis.treeParts[0]).root.children[0];

      const newPath = tree.addNode(newMoveNode, path);
      if (newPath) {
        setPath(newPath);
        const newRoot = JSON.parse(JSON.stringify(tree.root));
        setTree(buildTree(newRoot));
      } else {
        console.warn("addNode returned undefined, path not updated.");
      }
      return true;
    },
    [tree, path, fen, currentNode]
  );

  /* render */
  return (
    <div
      tabIndex={0}
      onKeyDown={handleKey}
      style={{ marginTop: 16, outline: "none" }}
    >
      <Chessboard position={fen} onPieceDrop={onPieceDrop} boardWidth={400} />

      {/* last move */}
      <div style={{ marginTop: 12 }}>
        <strong>Last move:</strong>{" "}
        {currentNode && currentNode.san
          ? `${Math.ceil(currentNode.ply / 2)}${
              currentNode.ply % 2 ? "." : "..."
            } ${currentNode.san}`
          : "-"}
      </div>

      {/* next moves */}
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
```





## API

### `pgnImport(pgn: string): Partial<AnalyseData> | undefined`

Parses a PGN string and returns an object with the parsed data. The `AnalyseData` interface is defined in the Lichess source code.

### `pgnExport.renderFullTxt(ctrl: AnalyseCtrl): string`

Exports a game tree to a PGN string. The `AnalyseCtrl` interface is defined in the Lichess source code.

### `buildTree(root: Tree.Node): TreeWrapper`

Builds a game tree from a root node. The `Tree.Node` and `TreeWrapper` interfaces are defined in the Lichess source code.

```