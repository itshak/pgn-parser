// --- CLEAN REWRITE (single-source-of-truth: path) ---
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

type TreeWrapper = any; // pgn-parser lacks d.ts – use any for now

interface Props {
  pgn: string;
}

const GameViewer: React.FC<Props> = ({ pgn }) => {
  /* immutable after PGN load */
  const [tree, setTree] = useState<TreeWrapper | null>(null);
  const [rootFen, setRootFen] = useState("");

  /* single mutable state – current path in the move tree */
  const [path, setPath] = useState("");

  /* build tree once when PGN changes */
  useEffect(() => {
    const analyse = pgnImport(pgn);
    setRootFen(analyse.game.fen);
    setTree(buildTree(analyse.treeParts[0]));
    setPath("");
  }, [pgn]);

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
