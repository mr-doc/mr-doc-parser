"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sibling(node, children, filter) {
    if (node) {
        if (children) {
            const index = filter ?
                children.filter(filter).indexOf(node) :
                children.indexOf(node);
            return children[index + 1];
        }
        return node.nextSibling;
    }
}
exports.sibling = sibling;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2libGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9zaWJsaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsU0FBZ0IsT0FBTyxDQUNyQixJQUFnQixFQUNoQixRQUF1QixFQUN2QixNQUFzQjtJQUV0QixJQUFJLElBQUksRUFBRTtRQUNSLElBQUksUUFBUSxFQUFFO1lBQ1osTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUM7Z0JBQ3BCLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekIsT0FBTyxRQUFRLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQzVCO1FBQ0QsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO0tBQ3pCO0FBQ0gsQ0FBQztBQWRELDBCQWNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3ludGF4Tm9kZSB9IGZyb20gXCJ0cmVlLXNpdHRlclwiO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNpYmxpbmcoXHJcbiAgbm9kZTogU3ludGF4Tm9kZSxcclxuICBjaGlsZHJlbj86IFN5bnRheE5vZGVbXSxcclxuICBmaWx0ZXI/OiAoKSA9PiBib29sZWFuXHJcbikge1xyXG4gIGlmIChub2RlKSB7XHJcbiAgICBpZiAoY2hpbGRyZW4pIHtcclxuICAgICAgY29uc3QgaW5kZXggPSBmaWx0ZXIgP1xyXG4gICAgICAgIGNoaWxkcmVuLmZpbHRlcihmaWx0ZXIpLmluZGV4T2Yobm9kZSkgOlxyXG4gICAgICAgIGNoaWxkcmVuLmluZGV4T2Yobm9kZSk7XHJcbiAgICAgIHJldHVybiBjaGlsZHJlbltpbmRleCArIDFdO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5vZGUubmV4dFNpYmxpbmc7XHJcbiAgfVxyXG59Il19