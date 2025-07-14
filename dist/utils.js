"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plyToTurn = void 0;
exports.fixCrazySan = fixCrazySan;
function fixCrazySan(san) {
    return san[0] === 'P' ? san.slice(1) : san;
}
const plyToTurn = (ply) => Math.floor((ply - 1) / 2) + 1;
exports.plyToTurn = plyToTurn;
