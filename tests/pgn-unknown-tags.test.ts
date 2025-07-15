import { pgnImport, pgnExport, buildTree } from '../src';

describe('PGN Unknown Tags', () => {
  const testPgn = `[Event "Test Game"]
[Site "Example.com"]
[Date "2025.07.14"]
[Round "1"]
[White "Player One"]
[Black "Player Two"]
[Result "1-0"]
[CustomTag "This is a custom value"]
[AnotherTag "Another value here"]

1. e4 e5`;

  it('should preserve unknown PGN tags during import and export', () => {
    const importedData = pgnImport(testPgn);
    expect(importedData).toBeDefined();

    if (importedData) {
      // Assert that unknown tags are imported
      expect(importedData.game.tags.CustomTag).toBe('This is a custom value');
      expect(importedData.game.tags.AnotherTag).toBe('Another value here');

      // Modify a known tag to ensure it's still handled correctly
      importedData.game.white = { name: 'New White Player' };
      importedData.game.tags.White = 'New White Player'; // Ensure it's updated in the generic tags as well

      // Add a new custom tag programmatically
      importedData.game.tags.NewCustomTag = 'Dynamically added value';

      const tree = buildTree(importedData.treeParts[0]);

      const exportedPgn = pgnExport.renderFullTxt({
        data: { game: importedData.game },
        tree,
      });

      // Assert that all tags (known and unknown) are exported
      expect(exportedPgn).toContain('[Event "Test Game"]');
      expect(exportedPgn).toContain('[Site "Example.com"]');
      expect(exportedPgn).toContain('[White "New White Player"]');
      expect(exportedPgn).toContain('[CustomTag "This is a custom value"]');
      expect(exportedPgn).toContain('[AnotherTag "Another value here"]');
      expect(exportedPgn).toContain('[NewCustomTag "Dynamically added value"]');
    }
  });
});
