# PGN Parser

This library is a standalone PGN parser extracted from the Lichess.org source code. It provides a simple and efficient way to parse, manipulate, and export PGN files.

## Installation

```bash
npm install pgn-parser
```

## Usage

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

## API

### `pgnImport(pgn: string): Partial<AnalyseData> | undefined`

Parses a PGN string and returns an object with the parsed data. The `AnalyseData` interface is defined in the Lichess source code.

### `pgnExport.renderFullTxt(ctrl: AnalyseCtrl): string`

Exports a game tree to a PGN string. The `AnalyseCtrl` interface is defined in the Lichess source code.

### `buildTree(root: Tree.Node): TreeWrapper`

Builds a game tree from a root node. The `Tree.Node` and `TreeWrapper` interfaces are defined in the Lichess source code.

```