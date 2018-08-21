"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = require("../Node");
const log_1 = require("../../../utils/log");
const match_1 = require("../../../utils/match");
function visitDeclaration(source, node, comment, properties) {
    switch (node.type) {
        case 'interface_declaration':
            return visitInterfaceDeclaration(source, node, comment, properties);
        case 'lexical_declaration':
            return visitLexicalDeclaration(source, node, comment, properties);
        default:
            log_1.default.report(source, node, log_1.ErrorType.NodeTypeNotYetSupported);
            break;
    }
}
exports.visitDeclaration = visitDeclaration;
function visitInterfaceDeclaration(source, node, comment, properties) {
    console.log(node.children);
}
exports.visitInterfaceDeclaration = visitInterfaceDeclaration;
function visitLexicalDeclaration(source, node, comment, properties) {
    let children = node.children, scope;
    if (match_1.default(children[0], 'const', 'let')) {
        scope = Node_1.createNode(source, children.shift());
    }
    console.log(node.children);
}
exports.visitLexicalDeclaration = visitLexicalDeclaration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjbGFyYXRpb24udmlzaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9sYW5nL3R5cGVzY3JpcHQvdmlzaXRvcnMvZGVjbGFyYXRpb24udmlzaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGtDQUFxRDtBQUVyRCw0Q0FBb0Q7QUFDcEQsZ0RBQXlDO0FBS3pDLFNBQWdCLGdCQUFnQixDQUM1QixNQUFjLEVBQ2QsSUFBZ0IsRUFDaEIsT0FBbUIsRUFDbkIsVUFBbUM7SUFFbkMsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ2YsS0FBSyx1QkFBdUI7WUFDeEIsT0FBTyx5QkFBeUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN4RSxLQUFLLHFCQUFxQjtZQUN0QixPQUFPLHVCQUF1QixDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3RFO1lBQ0ksYUFBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLGVBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBQzVELE1BQU07S0FDYjtBQUNMLENBQUM7QUFmRCw0Q0FlQztBQUVELFNBQWdCLHlCQUF5QixDQUNyQyxNQUFjLEVBQ2QsSUFBZ0IsRUFDaEIsT0FBbUIsRUFDbkIsVUFBbUM7SUFFbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFL0IsQ0FBQztBQVJELDhEQVFDO0FBRUQsU0FBZ0IsdUJBQXVCLENBQ25DLE1BQWMsRUFDZCxJQUFnQixFQUNoQixPQUFtQixFQUNuQixVQUFtQztJQUVuQyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUN4QixLQUFLLENBQUM7SUFFVixJQUFJLGVBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUFFO1FBQ3BDLEtBQUssR0FBRyxpQkFBVSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztLQUNoRDtJQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9CLENBQUM7QUFiRCwwREFhQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN5bnRheE5vZGUgfSBmcm9tIFwidHJlZS1zaXR0ZXJcIjtcbmltcG9ydCB7IE5vZGVQcm9wZXJ0aWVzLCBjcmVhdGVOb2RlIH0gZnJvbSBcIi4uL05vZGVcIjtcbmltcG9ydCBTb3VyY2UgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvU291cmNlXCI7XG5pbXBvcnQgbG9nLCB7IEVycm9yVHlwZSB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9sb2dcIjtcbmltcG9ydCBtYXRjaCBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvbWF0Y2hcIjtcbmltcG9ydCB7IHRleHQgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvdGV4dFwiO1xuXG5cblxuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0RGVjbGFyYXRpb24oXG4gICAgc291cmNlOiBTb3VyY2UsXG4gICAgbm9kZTogU3ludGF4Tm9kZSxcbiAgICBjb21tZW50OiBTeW50YXhOb2RlLFxuICAgIHByb3BlcnRpZXM6IFBhcnRpYWw8Tm9kZVByb3BlcnRpZXM+XG4pIHtcbiAgICBzd2l0Y2ggKG5vZGUudHlwZSkge1xuICAgICAgICBjYXNlICdpbnRlcmZhY2VfZGVjbGFyYXRpb24nOlxuICAgICAgICAgICAgcmV0dXJuIHZpc2l0SW50ZXJmYWNlRGVjbGFyYXRpb24oc291cmNlLCBub2RlLCBjb21tZW50LCBwcm9wZXJ0aWVzKTtcbiAgICAgICAgY2FzZSAnbGV4aWNhbF9kZWNsYXJhdGlvbic6XG4gICAgICAgICAgICByZXR1cm4gdmlzaXRMZXhpY2FsRGVjbGFyYXRpb24oc291cmNlLCBub2RlLCBjb21tZW50LCBwcm9wZXJ0aWVzKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxvZy5yZXBvcnQoc291cmNlLCBub2RlLCBFcnJvclR5cGUuTm9kZVR5cGVOb3RZZXRTdXBwb3J0ZWQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmlzaXRJbnRlcmZhY2VEZWNsYXJhdGlvbihcbiAgICBzb3VyY2U6IFNvdXJjZSxcbiAgICBub2RlOiBTeW50YXhOb2RlLFxuICAgIGNvbW1lbnQ6IFN5bnRheE5vZGUsXG4gICAgcHJvcGVydGllczogUGFydGlhbDxOb2RlUHJvcGVydGllcz5cbikge1xuICAgIGNvbnNvbGUubG9nKG5vZGUuY2hpbGRyZW4pO1xuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2aXNpdExleGljYWxEZWNsYXJhdGlvbihcbiAgICBzb3VyY2U6IFNvdXJjZSxcbiAgICBub2RlOiBTeW50YXhOb2RlLFxuICAgIGNvbW1lbnQ6IFN5bnRheE5vZGUsXG4gICAgcHJvcGVydGllczogUGFydGlhbDxOb2RlUHJvcGVydGllcz5cbikge1xuICAgIGxldCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW4sXG4gICAgICAgIHNjb3BlO1xuXG4gICAgaWYgKG1hdGNoKGNoaWxkcmVuWzBdLCAnY29uc3QnLCAnbGV0JykpIHtcbiAgICAgICAgc2NvcGUgPSBjcmVhdGVOb2RlKHNvdXJjZSwgY2hpbGRyZW4uc2hpZnQoKSk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKG5vZGUuY2hpbGRyZW4pO1xufSJdfQ==