"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ops = exports.path = void 0;
exports.build = build;
const treePath = __importStar(require("./path"));
exports.path = treePath;
const ops = __importStar(require("./ops"));
exports.ops = ops;
const common_1 = require("./common");
function build(root) {
    const lastNode = () => ops.findInMainline(root, (node) => !node.children.length);
    const nodeAtPathOrNull = (path) => nodeAtPathOrNullFrom(root, path);
    function nodeAtPathOrNullFrom(node, path) {
        if (path === '')
            return node;
        const child = ops.childById(node, treePath.head(path));
        return child ? nodeAtPathOrNullFrom(child, treePath.tail(path)) : undefined;
    }
    function longestValidPathFrom(node, path) {
        const id = treePath.head(path);
        const child = ops.childById(node, id);
        return child ? id + longestValidPathFrom(child, treePath.tail(path)) : '';
    }
    function getCurrentNodesAfterPly(nodeList, mainline, ply) {
        const nodes = [];
        for (let i = 0; i < nodeList.length; i++) {
            const node = nodeList[i];
            if (node.ply <= ply && mainline[i].id !== node.id)
                break;
            if (node.ply > ply)
                nodes.push(node);
        }
        return nodes;
    }
    const pathIsMainline = (path) => pathIsMainlineFrom(root, path);
    function pathIsMainlineFrom(node, path) {
        if (path === '')
            return true;
        const child = node.children[0];
        return (child === null || child === void 0 ? void 0 : child.id) === treePath.head(path) && pathIsMainlineFrom(child, treePath.tail(path));
    }
    const pathExists = (path) => !!nodeAtPathOrNull(path);
    const pathIsForcedVariation = (path) => !!getNodeList(path).find(n => n.forceVariation);
    function lastMainlineNodeFrom(node, path) {
        if (path === '')
            return node;
        const pathId = treePath.head(path);
        const child = node.children[0];
        if (!child || child.id !== pathId)
            return node;
        return lastMainlineNodeFrom(child, treePath.tail(path));
    }
    const getNodeList = (path) => ops.collect(root, function (node) {
        const id = treePath.head(path);
        if (id === '')
            return;
        path = treePath.tail(path);
        return ops.childById(node, id);
    });
    const extendPath = (path, isMainline) => {
        let currNode = nodeAtPathOrNull(path);
        while ((currNode = currNode === null || currNode === void 0 ? void 0 : currNode.children[0]) && !(isMainline && currNode.forceVariation))
            path += currNode.id;
        return path;
    };
    function updateAt(path, update) {
        const node = nodeAtPathOrNull(path);
        if (node)
            update(node);
        return node;
    }
    // returns new path
    function addNode(node, path) {
        const newPath = path + node.id, existing = nodeAtPathOrNull(newPath);
        if (existing) {
            ['dests', 'drops', 'clock'].forEach(key => {
                if ((0, common_1.defined)(node[key]) && !(0, common_1.defined)(existing[key]))
                    existing[key] = node[key];
            });
            return newPath;
        }
        return updateAt(path, function (parent) {
            var _a;
            if ((_a = parent.children[0]) === null || _a === void 0 ? void 0 : _a.forceVariation) {
                parent.children[0].forceVariation = false;
                parent.children.unshift(node);
            }
            else
                parent.children.push(node);
        })
            ? newPath
            : undefined;
    }
    function addNodes(nodes, path) {
        const node = nodes[0];
        if (!node)
            return path;
        const newPath = addNode(node, path);
        return newPath ? addNodes(nodes.slice(1), newPath) : undefined;
    }
    const deleteNodeAt = (path) => {
        const parent = parentNode(path);
        if (parent)
            ops.removeChild(parent, treePath.last(path));
    };
    function promoteAt(path, toMainline) {
        const nodes = getNodeList(path);
        for (let i = nodes.length - 2; i >= 0; i--) {
            const node = nodes[i + 1];
            const parent = nodes[i];
            if (parent.children[0].id !== node.id) {
                ops.removeChild(parent, node.id);
                parent.children.unshift(node);
                if (!toMainline)
                    break;
            }
            else if (node.forceVariation) {
                node.forceVariation = false;
                if (!toMainline)
                    break;
            }
        }
    }
    const setCommentAt = (comment, path) => !comment.text
        ? deleteCommentAt(comment.id, path)
        : updateAt(path, node => {
            node.comments = node.comments || [];
            const existing = node.comments.find(function (c) {
                return c.id === comment.id;
            });
            if (existing)
                existing.text = comment.text;
            else
                node.comments.push(comment);
        });
    const deleteCommentAt = (id, path) => updateAt(path, node => {
        const comments = (node.comments || []).filter(c => c.id !== id);
        node.comments = comments.length ? comments : undefined;
    });
    const setGlyphsAt = (glyphs, path) => updateAt(path, node => {
        node.glyphs = glyphs;
    });
    const parentNode = (path) => nodeAtPathOrNull(treePath.init(path));
    const getParentClock = (node, path) => {
        const parent = parentNode(path);
        return parent ? parent.clock : node.clock;
    };
    function walkUntilTrue(fn, from = '', branchOnly = false) {
        function traverse(node, isMainline) {
            if (fn(node, isMainline))
                return true;
            let i = branchOnly ? 1 : 0;
            branchOnly = false;
            while (i < node.children.length) {
                const c = node.children[i];
                if (traverse(c, isMainline && i === 0 && !c.forceVariation))
                    return true;
                i++;
            }
            return false;
        }
        const n = nodeAtPathOrNull(from);
        return n ? traverse(n, pathIsMainline(from)) : false;
    }
    return {
        root,
        lastPly: () => { var _a; return ((_a = lastNode()) === null || _a === void 0 ? void 0 : _a.ply) || root.ply; },
        nodeAtPath: nodeAtPathOrNull,
        getNodeList,
        longestValidPath: (path) => longestValidPathFrom(root, path),
        updateAt,
        addNode,
        addNodes,
        addDests: (dests, path) => updateAt(path, (node) => {
            node.dests = dests;
        }),
        setShapes: (shapes, path) => updateAt(path, (node) => {
            node.shapes = shapes.slice();
        }),
        setCommentAt,
        deleteCommentAt,
        setGlyphsAt,
        setClockAt: (clock, path) => updateAt(path, node => {
            node.clock = clock;
        }),
        pathIsMainline,
        pathIsForcedVariation,
        lastMainlineNode: (path) => lastMainlineNodeFrom(root, path),
        extendPath,
        pathExists,
        deleteNodeAt,
        promoteAt,
        forceVariationAt: (path, force) => updateAt(path, node => {
            node.forceVariation = force;
        }),
        getCurrentNodesAfterPly,
        merge: (tree) => ops.merge(root, tree),
        removeCeval: () => ops.updateAll(root, function (n) {
        }),
        parentNode,
        getParentClock,
        walkUntilTrue,
    };
}
