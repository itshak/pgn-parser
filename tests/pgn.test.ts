import { pgnImport } from '../src';

it('should parse a pgn', () => {
  const pgn = '[Event "Test"]\n[Site "Test"]\n[Date "2025.07.13"]\n[Round "-"]\n[White "Test"]\n[Black "Test"]\n[Result "*"]\n\n1. e4 e5 *';
  const result = pgnImport(pgn);
  expect(result.game?.turns).toBe(3);
});
