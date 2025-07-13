import { pgnImport, pgnExport, buildTree } from '../src';

describe('PGN Parser', () => {
  const pgn = `[Event "?"]
[Site "?"]
[Date "2025.05.30"]
[Round "?"]
[White "Alexey"]
[Black "Yan"]
[Result "1-0"]

1. e4 ( 1. d4 Nf6 2. c4 g6 3. Nc3 ( 3. Nf3 Bg7 4. Nc3 d5 ) 3... d5 ) ( 1. Nf3
Nf6 2. g3 d5 3. Bg2 c5 4. O-O e6 ) 1... e5 ( 1... c5 2. Nf3 Nc6 ( 2... d6 3.
Bc4 ) 3. d4 ) ( 1... e6 2. Nc3 ) 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 1-0`;

  it('should parse a pgn with multiple variations', () => {
    const result = pgnImport(pgn);
    expect(result).toBeDefined();
    const tree = buildTree(result!.treeParts[0]);
    expect(tree.root.children.length).toBe(3);
    expect(tree.root.children[0].san).toBe('e4');
    expect(tree.root.children[1].san).toBe('d4');
    expect(tree.root.children[2].san).toBe('Nf3');

    // Check nested variations
    const d4Variation = tree.root.children[1];
    expect(d4Variation.children.length).toBe(1);
    expect(d4Variation.children[0].san).toBe('Nf6');

    const d4Nf6Variation = d4Variation.children[0];
    expect(d4Nf6Variation.children.length).toBe(1);
    expect(d4Nf6Variation.children[0].san).toBe('c4');

    const d4Nf6c4Variation = d4Nf6Variation.children[0];
    expect(d4Nf6c4Variation.children.length).toBe(1);
    expect(d4Nf6c4Variation.children[0].san).toBe('g6');

    const d4Nf6c4g6Variation = d4Nf6c4Variation.children[0];
    expect(d4Nf6c4g6Variation.children.length).toBe(2);
    expect(d4Nf6c4g6Variation.children[0].san).toBe('Nc3');
    expect(d4Nf6c4g6Variation.children[1].san).toBe('Nf3');

    // Check mainline after variations
    const e4Variation = tree.root.children[0];
    expect(e4Variation.children.length).toBe(3);
    expect(e4Variation.children[0].san).toBe('e5');
    expect(e4Variation.children[1].san).toBe('c5');
    expect(e4Variation.children[2].san).toBe('e6');
  });

  it('should export a pgn with multiple variations', () => {
    const result = pgnImport(pgn);
    expect(result).toBeDefined();
    const exportedPgn = pgnExport.renderFullTxt({
      data: { game: result!.game },
      tree: buildTree(result!.treeParts[0]),
    });
    // Basic check, full validation would require a PGN parser
    expect(exportedPgn).toContain('1. e4 (1. d4 Nf6 2. c4 g6 3. Nc3 (3. Nf3 Bg7 4. Nc3 d5) 3... d5) (1. Nf3 Nf6 2. g3 d5 3. Bg2 c5 4. O-O e6) 1... e5 (1... c5 2. Nf3 Nc6 (2... d6 3. Bc4) 3. d4) (1... e6 2. Nc3) 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 1-0');
  });

  it('should add a new move', () => {
    const result = pgnImport(pgn);
    expect(result).toBeDefined();
    const tree = buildTree(result!.treeParts[0]);
    const newMoveNode: Tree.Node = {
      id: 'test',
      ply: 1,
      san: 'd4',
      fen: '',
      uci: '',
      children: [],
    };
    const newPath = tree.addNode(newMoveNode, '');
    expect(newPath).toBeDefined();
    expect(tree.root.children.length).toBe(4);
    expect(tree.root.children[3].san).toBe('d4');
  });

  it('should delete a move', () => {
    const result = pgnImport(pgn);
    expect(result).toBeDefined();
    const tree = buildTree(result!.treeParts[0]);
    const pathToDelete = tree.root.children[0].id; // Delete 1. e4
    tree.deleteNodeAt(pathToDelete);
    expect(tree.root.children.length).toBe(2);
    expect(tree.root.children[0].san).toBe('d4');
  });

  it('should promote a variation', () => {
    const result = pgnImport(pgn);
    expect(result).toBeDefined();
    const tree = buildTree(result!.treeParts[0]);
    const pathToPromote = tree.root.children[1].id; // Promote 1. d4
    tree.promoteAt(pathToPromote, true);
    expect(tree.root.children[0].san).toBe('d4');
    expect(tree.root.children[1].san).toBe('e4');
  });
});