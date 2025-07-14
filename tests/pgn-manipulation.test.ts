
import { pgnImport, buildTree } from '../src';

describe('PGN Manipulation', () => {
  const pgn = `[Event "?"]
[Site "?"]
[Date "2025.05.30"]
[Round "?"]
[White "Alexey"]
[Black "Yan"]
[Result "1-0"]

1. e4 ( 1. d4 Nf6 2. c4 g6 3. Nc3 ( 3. Nf3 Bg7 4. Nc3 d5 ) 3... d5 ) ( 1. Nf3
Nf6 2. g3 d5 3. Bg2 c5 4. O-O e6 ) 1... e5 ( 1... c5 2. Nf3 Nc6 ( 2... d6 3.
Bc4 ) 3. d4 ) ( 1... e6 2. Nc3 ) 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 1-0

[Event "?"]
[Site "?"]
[Date "2025.05.30"]
[Round "?"]
[White "Yan"]
[Black "Alexey"]
[Result "1-0"]
[PlyCount "9"]
[GameId "2181391674224734"]
[EventDate "2025.01.01"]

1. d4 Nf6 2. Nc3 d5 3. Bf4 c5 4. e3 Nc6 5. Nb5 1-0`;

  it('should parse a pgn with multiple games', () => {
    const result = pgnImport(pgn);
    expect(result).toBeDefined();
    // pgnImport only parses the first game
    expect(result.game.white?.name).toBe('Alexey');
    expect(result.game.black?.name).toBe('Yan');
  });

  it('should handle mainline and variations correctly', () => {
    const result = pgnImport(pgn);
    const tree = buildTree(result!.treeParts[0]);
    const mainline = tree.getNodeList(tree.extendPath('', true)).slice(1);
    expect(mainline.map(n => n.san)).toEqual(['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5']);
  });

  it('should navigate the tree', () => {
    const result = pgnImport(pgn);
    const tree = buildTree(result!.treeParts[0]);
    const path = tree.root.children[0].id + tree.root.children[0].children[0].id;
    const node = tree.nodeAtPath(path);
    expect(node).toBeDefined();
    expect(node!.san).toBe('e5');
  });

  it('should add a comment', () => {
    const result = pgnImport(pgn);
    const tree = buildTree(result!.treeParts[0]);
    const path = tree.root.children[0].id + tree.root.children[0].children[0].id;
    const comment = { id: 'test', text: 'A test comment' };
    tree.setCommentAt(comment, path);
    const node = tree.nodeAtPath(path);
    expect(node!.comments).toEqual([comment]);
  });

  it('should delete a comment', () => {
    const result = pgnImport(pgn);
    const tree = buildTree(result!.treeParts[0]);
    const path = tree.root.children[0].id + tree.root.children[0].children[0].id;
    const comment = { id: 'test', text: 'A test comment' };
    tree.setCommentAt(comment, path);
    tree.deleteCommentAt('test', path);
    const node = tree.nodeAtPath(path);
    expect(node!.comments).toBeUndefined();
  });
});
