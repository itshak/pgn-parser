import { expect, it, describe } from 'vitest';
import { buildTree, pgnImport } from '../src';

// A tiny PGN with just one move so we can easily inspect the tree
const SAMPLE_PGN = `1. e4 e5 *`;

describe('TreeWrapper.addNode', () => {
  it('adds a new variation and returns its path', () => {
    const analyse = pgnImport(SAMPLE_PGN);
    const tree = buildTree(analyse.treeParts[0]);

    // root -> first move (e4)
    const root = tree.root;
    expect(root.children.length).toBe(1);
    expect(root.children[0].san).toBe('e4');

    // create a new first move alternative (d4)
    const newNode = {
      id: 'd2d4',
      ply: 1,
      san: 'd4',
      fen: root.fen, // not important for this test
      uci: 'd2d4',
      children: [] as any[],
    };

    const newPath = tree.addNode(newNode as any, '');

    // path should be id appended to root path
    expect(newPath).toBe('d2d4');

    // root should now have two children: e4 (main) and d4 (variation)
    expect(root.children.length).toBe(2);
    const sans = root.children.map(c => c.san);
    expect(sans).toContain('d4');
    expect(sans).toContain('e4');
  });
});
