import { makeFen } from 'chessops/fen';
import { makeSanAndPlay, parseSan } from 'chessops/san';
import { makeUci, Rules } from 'chessops';
import {
  makeVariant,
  parsePgn,
  parseVariant,
  startingPosition,
  type ChildNode,
  type PgnNodeData,
} from 'chessops/pgn';
import { IllegalSetup, type Position } from 'chessops/chess';
import { scalachessCharPair } from 'chessops/compat';
import { makeSquare } from 'chessops/util';
import type { AnalyseData, Player, VariantKey, Ply, San, Uci } from './types';

const traverse = (node: ChildNode<PgnNodeData>, pos: Position, ply: Ply): Tree.Node => {
  const move = parseSan(pos, node.data.san);
  if (!move) throw new Error(`Can't play ${node.data.san} at move ${Math.ceil(ply / 2)}, ply ${ply}`);

  const newNode: Tree.Node = {
    id: scalachessCharPair(move),
    ply,
    san: makeSanAndPlay(pos, move),
    fen: makeFen(pos.toSetup()),
    uci: makeUci(move),
    children: node.children.map(child => traverse(child, pos.clone(), ply + 1)),
    check: pos.isCheck() ? makeSquare(pos.toSetup().board.kingOf(pos.turn)!) : undefined,
  };

  return newNode;
};

export default function (pgn: string): AnalyseData {
  const game = parsePgn(pgn)[0];
  const headers = new Map(Array.from(game.headers, ([key, value]) => [key.toLowerCase(), value]));
  const start = startingPosition(game.headers).unwrap();
  const fen = makeFen(start.toSetup());
  const initialPly = (start.toSetup().fullmoves - 1) * 2 + (start.turn === 'white' ? 0 : 1);

  const root: Tree.Node = {
    id: '',
    ply: initialPly,
    fen,
    uci: '',
    children: game.moves.children.map(child => traverse(child, start.clone(), initialPly + 1)),
  };

  const rules: Rules = parseVariant(headers.get('variant')) || 'chess';
  const variantKey: VariantKey = rulesToVariantKey[rules] || rules;
  const variantName = makeVariant(rules) || variantKey;

  const tags: Record<string, string> = {};
  for (const [key, value] of game.headers) {
    tags[key] = value;
  }

  const white = tags.White;
  const black = tags.Black;
  const event = tags.Event;
  const site = tags.Site;
  const date = tags.Date;
  const round = tags.Round;
  const whiteElo = tags.WhiteElo;
  const blackElo = tags.BlackElo;
  const timeControl = tags.TimeControl;
  const termination = tags.Termination;

  return {
    game: {
      fen,
      id: 'synthetic',
      opening: undefined, // TODO
      player: start.turn,
      result: tags.Result || '*-',
      status: { id: 20, name: 'started' },
      turns: root.children.length > 0 ? Math.ceil(root.children[root.children.length - 1].ply / 2) : 0,
      variant: {
        key: variantKey,
        name: variantName,
        short: variantName,
      },
      white: white ? { name: white } : undefined,
      black: black ? { name: black } : undefined,
      event: event || undefined,
      site: site || undefined,
      date: date || undefined,
      round: round || undefined,
      whiteElo: whiteElo || undefined,
      blackElo: blackElo || undefined,
      timeControl: timeControl || undefined,
      termination: termination || undefined,
      tags,
    },
    player: { color: 'white', name: white } as Player,
    opponent: { color: 'black', name: black } as Player,
    treeParts: [root],
    sidelines: [],
    userAnalysis: true,
  };
}

const rulesToVariantKey: { [key: string]: VariantKey } = {
  chess: 'standard',
  kingofthehill: 'kingOfTheHill',
  '3check': 'threeCheck',
  racingkings: 'racingKings',
};

export const renderPgnError = (error: string = '') =>
  `PGN error: ${
    {
      [IllegalSetup.Empty]: 'empty board',
      [IllegalSetup.OppositeCheck]: 'king in check',
      [IllegalSetup.PawnsOnBackrank]: 'pawns on back rank',
      [IllegalSetup.Kings]: 'king(s) missing',
      [IllegalSetup.Variant]: 'invalid Variant header',
    }[error] ?? error
  }`;
