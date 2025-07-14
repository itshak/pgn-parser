"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPgnError = void 0;
exports.default = default_1;
const fen_1 = require("chessops/fen");
const san_1 = require("chessops/san");
const chessops_1 = require("chessops");
const pgn_1 = require("chessops/pgn");
const chess_1 = require("chessops/chess");
const compat_1 = require("chessops/compat");
const util_1 = require("chessops/util");
const traverse = (node, pos, ply) => {
    const move = (0, san_1.parseSan)(pos, node.data.san);
    if (!move)
        throw new Error(`Can't play ${node.data.san} at move ${Math.ceil(ply / 2)}, ply ${ply}`);
    const newNode = {
        id: (0, compat_1.scalachessCharPair)(move),
        ply,
        san: (0, san_1.makeSanAndPlay)(pos, move),
        fen: (0, fen_1.makeFen)(pos.toSetup()),
        uci: (0, chessops_1.makeUci)(move),
        children: node.children.map(child => traverse(child, pos.clone(), ply + 1)),
        check: pos.isCheck() ? (0, util_1.makeSquare)(pos.toSetup().board.kingOf(pos.turn)) : undefined,
    };
    return newNode;
};
function default_1(pgn) {
    const game = (0, pgn_1.parsePgn)(pgn)[0];
    const headers = new Map(Array.from(game.headers, ([key, value]) => [key.toLowerCase(), value]));
    const start = (0, pgn_1.startingPosition)(game.headers).unwrap();
    const fen = (0, fen_1.makeFen)(start.toSetup());
    const initialPly = (start.toSetup().fullmoves - 1) * 2 + (start.turn === 'white' ? 0 : 1);
    const root = {
        id: '',
        ply: initialPly,
        fen,
        uci: '',
        children: game.moves.children.map(child => traverse(child, start.clone(), initialPly + 1)),
    };
    const rules = (0, pgn_1.parseVariant)(headers.get('variant')) || 'chess';
    const variantKey = rulesToVariantKey[rules] || rules;
    const variantName = (0, pgn_1.makeVariant)(rules) || variantKey;
    const white = headers.get('white');
    const black = headers.get('black');
    return {
        game: {
            fen,
            id: 'synthetic',
            opening: undefined, // TODO
            player: start.turn,
            result: game.headers.get('Result') || '*-',
            status: { id: 20, name: 'started' },
            turns: root.children.length > 0 ? Math.ceil(root.children[root.children.length - 1].ply / 2) : 0,
            variant: {
                key: variantKey,
                name: variantName,
                short: variantName,
            },
            white: white ? { name: white } : undefined,
            black: black ? { name: black } : undefined,
        },
        player: { color: 'white', name: white },
        opponent: { color: 'black', name: black },
        treeParts: [root],
        sidelines: [],
        userAnalysis: true,
    };
}
const rulesToVariantKey = {
    chess: 'standard',
    kingofthehill: 'kingOfTheHill',
    '3check': 'threeCheck',
    racingkings: 'racingKings',
};
const renderPgnError = (error = '') => {
    var _a;
    return `PGN error: ${(_a = {
        [chess_1.IllegalSetup.Empty]: 'empty board',
        [chess_1.IllegalSetup.OppositeCheck]: 'king in check',
        [chess_1.IllegalSetup.PawnsOnBackrank]: 'pawns on back rank',
        [chess_1.IllegalSetup.Kings]: 'king(s) missing',
        [chess_1.IllegalSetup.Variant]: 'invalid Variant header',
    }[error]) !== null && _a !== void 0 ? _a : error}`;
};
exports.renderPgnError = renderPgnError;
