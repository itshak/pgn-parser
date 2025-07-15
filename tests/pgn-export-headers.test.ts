import { pgnImport, pgnExport, buildTree } from '../src';

describe('PGN Export Headers', () => {
  const testPgn = `[Event "?"]
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

  it('should correctly export PGN with modified headers', () => {
    const importedData = pgnImport(testPgn);
    expect(importedData).toBeDefined();

    if (importedData) {
      // Modify some headers
      importedData.game.white = { name: 'Modified White' };
      importedData.game.black = { name: 'Modified Black' };
      importedData.game.result = '0-1';
      importedData.game.event = 'New Event'; // Add a new header
      importedData.game.site = 'New Site';
      importedData.game.date = '2024.01.01';

      const tree = buildTree(importedData.treeParts[0]);

      const exportedPgn = pgnExport.renderFullTxt({
        data: { game: importedData.game },
        tree,
      });

      // Assertions to check if headers are correctly exported
      expect(exportedPgn).toContain('[White "Modified White"]');
      expect(exportedPgn).toContain('[Black "Modified Black"]');
      expect(exportedPgn).toContain('[Result "0-1"]');
      expect(exportedPgn).toContain('[Event "New Event"]');
      expect(exportedPgn).toContain('[Site "New Site"]');
      expect(exportedPgn).toContain('[Date "2024.01.01"]');

      // Ensure original headers are not present if replaced
      expect(exportedPgn).not.toContain('[White "Alexey"]');
      expect(exportedPgn).not.toContain('[Black "Yan"]');
      expect(exportedPgn).not.toContain('[Result "1-0"]');
    }
  });
});
