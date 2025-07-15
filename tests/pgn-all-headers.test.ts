import { pgnImport, pgnExport, buildTree } from '../src';

describe('PGN All Headers', () => {
  const testPgn = `[Event "FIDE World Championship"]
[Site "New York, USA"]
[Date "1995.11.10"]
[Round "1"]
[White "Kasparov, Garry"]
[Black "Anand, Viswanathan"]
[Result "1/2-1/2"]
[WhiteElo "2805"]
[BlackElo "2725"]
[TimeControl "40/120:00, 20/60:00, 15/30:00+30"]
[Termination "normal"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. c4 c6 12. cxb5 axb5 13. Nc3 Bb7 14. Bg5 h6 15. Bh4 Re8 16. a3 exd4 17. Nxd4 Bf8 18. f3 Qb6 19. Bf2 Qa6 20. Nf5 d5 21. exd5 Rxe1+ 22. Qxe1 cxd5 23. Rd1 Re8 24. Qd2 b4 25. axb4 Bxb4 26. Bd4 Bc5 27. Bxc5 Nxc5 28. Kh1 Nxb3 29. Qf4 Nxd4 30. Rxd4 Qa1+ 31. Kh2 Qxb2 32. Nd1 Qb6 33. Nde3 Bc8 34. Nd6 Rd8 35. Nxc8 Rxc8 36. Nf5 Re8 37. Qg3 Nh5 38. Qg4 Qg6 39. Qxg6 fxg6 40. Nd6 Rd8 41. Rxd5 Nf6 42. Rd3 Kf8 43. Kg3 Ke7 44. Nc4 Rxd3 45. Ne5 Rd6 46. Nxg6+ Kf7 47. Ne5+ Ke6 48. Ng6 Kf7 49. Ne5+ Ke6 50. Ng6 Kf7 1/2-1/2`;

  it('should correctly import and export all standard PGN headers', () => {
    const importedData = pgnImport(testPgn);
    expect(importedData).toBeDefined();

    if (importedData) {
      // Assert that all headers are correctly imported
      expect(importedData.game.event).toBe('FIDE World Championship');
      expect(importedData.game.site).toBe('New York, USA');
      expect(importedData.game.date).toBe('1995.11.10');
      expect(importedData.game.round).toBe('1');
      expect(importedData.game.white?.name).toBe('Kasparov, Garry');
      expect(importedData.game.black?.name).toBe('Anand, Viswanathan');
      expect(importedData.game.result).toBe('1/2-1/2');
      expect(importedData.game.whiteElo).toBe('2805');
      expect(importedData.game.blackElo).toBe('2725');
      expect(importedData.game.timeControl).toBe('40/120:00, 20/60:00, 15/30:00+30');
      expect(importedData.game.termination).toBe('normal');

      const tree = buildTree(importedData.treeParts[0]);

      const exportedPgn = pgnExport.renderFullTxt({
        data: { game: importedData.game },
        tree,
      });

      // Assert that all headers are correctly exported
      expect(exportedPgn).toContain('[Event "FIDE World Championship"]');
      expect(exportedPgn).toContain('[Site "New York, USA"]');
      expect(exportedPgn).toContain('[Date "1995.11.10"]');
      expect(exportedPgn).toContain('[Round "1"]');
      expect(exportedPgn).toContain('[White "Kasparov, Garry"]');
      expect(exportedPgn).toContain('[Black "Anand, Viswanathan"]');
      expect(exportedPgn).toContain('[Result "1/2-1/2"]');
      expect(exportedPgn).toContain('[WhiteElo "2805"]');
      expect(exportedPgn).toContain('[BlackElo "2725"]');
      expect(exportedPgn).toContain('[TimeControl "40/120:00, 20/60:00, 15/30:00+30"]');
      expect(exportedPgn).toContain('[Termination "normal"]');
    }
  });
});
