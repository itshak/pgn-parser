import { Game } from './types';
import { TreeWrapper } from './tree';
interface AnalyseCtrl {
    data: {
        game: Game;
    };
    tree: TreeWrapper;
}
export declare function renderFullTxt(ctrl: AnalyseCtrl): string;
export declare function renderVariationPgn(game: Game, nodeList: Tree.Node[]): string;
export {};
