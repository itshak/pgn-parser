"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderFullTxt = renderFullTxt;
exports.renderVariationPgn = renderVariationPgn;
const fen_1 = require("chessops/fen");
const utils_1 = require("./utils");
const plyPrefix = (node) => `${Math.floor((node.ply + 1) / 2)}${node.ply % 2 === 1 ? '. ' : '... '}`;
function renderNodesTxt(node, forcePly) { if (node.children.length === 0)
    return ''; let s = ''; const first = node.children[0]; if (forcePly || first.ply % 2 === 1)
    s += plyPrefix(first); s += (0, utils_1.fixCrazySan)(first.san); for (let i = 1; i < node.children.length; i++) {
    const child = node.children[i];
    s += ` (${plyPrefix(child)}${(0, utils_1.fixCrazySan)(child.san)}`;
    const variation = renderNodesTxt(child, false);
    if (variation)
        s += ' ' + variation;
    s += ')';
} const mainline = renderNodesTxt(first, node.children.length > 1); if (mainline)
    s += ' ' + mainline; return s; }
function renderPgnTags(game) { let txt = ''; const tags = []; if (game.variant.key !== 'standard')
    tags.push(['Variant', game.variant.name]); if (game.fen && game.fen !== fen_1.INITIAL_FEN)
    tags.push(['FEN', game.fen]); if (tags.length)
    txt = tags.map(t => '[' + t[0] + ' "' + t[1] + '"]').join('\n') + '\n\n'; return txt; }
function renderFullTxt(ctrl) { const g = ctrl.data.game; return renderPgnTags(g) + renderNodesTxt(ctrl.tree.root, true) + ' ' + g.result; }
function renderVariationPgn(game, nodeList) { const filteredNodeList = nodeList.filter(node => node.san); if (filteredNodeList.length === 0)
    return ''; let variationPgn = ''; const first = filteredNodeList[0]; variationPgn += `${plyPrefix(first)}${first.san} `; for (let i = 1; i < filteredNodeList.length; i++) {
    const node = filteredNodeList[i];
    if (node.ply % 2 === 1) {
        variationPgn += (0, utils_1.plyToTurn)(node.ply) + '. ';
    }
    variationPgn += (0, utils_1.fixCrazySan)(node.san) + ' ';
} return renderPgnTags(game) + variationPgn; }
