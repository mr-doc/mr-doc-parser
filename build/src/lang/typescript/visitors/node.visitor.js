"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_visitor_1 = require("./class.visitor");
const function_visitor_1 = require("./function.visitor");
const log_1 = require("../../../utils/log");
const declaration_visitor_1 = require("./declaration.visitor");
const statement_visitor_1 = require("./statement.visitor");
function visitNode(source, node, comment, properties) {
    switch (node.type) {
        case 'class':
            return class_visitor_1.visitClass(source, node, comment, properties);
        case 'function':
            return function_visitor_1.visitFunction(source, node, comment, properties);
        case 'comment':
            // noop
            break;
        case 'ERROR':
            log_1.default.report(source, node, log_1.ErrorType.TreeSitterParseError);
            break;
        default:
            if (node.type.includes("statement")) {
                return statement_visitor_1.visitStatement(source, node, comment, properties);
            }
            if (node.type.includes("declaration")) {
                return declaration_visitor_1.visitDeclaration(source, node, comment, properties);
            }
            log_1.default.info(`${node.type.replace(/[_]/g, ' ')}' is not supported yet.`);
            break;
    }
}
exports.visitNode = visitNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS52aXNpdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xhbmcvdHlwZXNjcmlwdC92aXNpdG9ycy9ub2RlLnZpc2l0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxtREFBNkM7QUFFN0MseURBQW1EO0FBQ25ELDRDQUFvRDtBQUVwRCwrREFBb0Y7QUFDcEYsMkRBQXFEO0FBR3JELFNBQWdCLFNBQVMsQ0FDdkIsTUFBYSxFQUNiLElBQWdCLEVBQ2hCLE9BQW1CLEVBQ25CLFVBQW1DO0lBRW5DLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNqQixLQUFLLE9BQU87WUFDVixPQUFPLDBCQUFVLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDdkQsS0FBSyxVQUFVO1lBQ2IsT0FBTyxnQ0FBYSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzFELEtBQUssU0FBUztZQUNaLE9BQU87WUFDUCxNQUFNO1FBQ1IsS0FBSyxPQUFPO1lBQ1YsYUFBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLGVBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3pELE1BQU07UUFDUjtZQUNFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQ25DLE9BQU8sa0NBQWMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQzthQUMxRDtZQUVELElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQ3JDLE9BQU8sc0NBQWdCLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7YUFDNUQ7WUFFRCxhQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBQ3JFLE1BQU07S0FDVDtBQUNILENBQUM7QUE3QkQsOEJBNkJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3ludGF4Tm9kZSB9IGZyb20gXCJ0cmVlLXNpdHRlclwiO1xyXG5pbXBvcnQgeyBOb2RlUHJvcGVydGllcyB9IGZyb20gXCIuLi9Ob2RlXCI7XHJcbmltcG9ydCB7IHZpc2l0Q2xhc3MgfSBmcm9tIFwiLi9jbGFzcy52aXNpdG9yXCI7XHJcbmltcG9ydCByYW5nZSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmFuZ2VcIjtcclxuaW1wb3J0IHsgdmlzaXRGdW5jdGlvbiB9IGZyb20gXCIuL2Z1bmN0aW9uLnZpc2l0b3JcIjtcclxuaW1wb3J0IGxvZywgeyBFcnJvclR5cGUgfSBmcm9tICcuLi8uLi8uLi91dGlscy9sb2cnO1xyXG5cclxuaW1wb3J0IHsgdmlzaXRJbnRlcmZhY2VEZWNsYXJhdGlvbiwgdmlzaXREZWNsYXJhdGlvbiB9IGZyb20gXCIuL2RlY2xhcmF0aW9uLnZpc2l0b3JcIjtcclxuaW1wb3J0IHsgdmlzaXRTdGF0ZW1lbnQgfSBmcm9tIFwiLi9zdGF0ZW1lbnQudmlzaXRvclwiO1xyXG5pbXBvcnQgSUZpbGUgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvSUZpbGVcIjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB2aXNpdE5vZGUoXHJcbiAgc291cmNlOiBJRmlsZSxcclxuICBub2RlOiBTeW50YXhOb2RlLFxyXG4gIGNvbW1lbnQ6IFN5bnRheE5vZGUsXHJcbiAgcHJvcGVydGllczogUGFydGlhbDxOb2RlUHJvcGVydGllcz5cclxuKSB7XHJcbiAgc3dpdGNoIChub2RlLnR5cGUpIHtcclxuICAgIGNhc2UgJ2NsYXNzJzpcclxuICAgICAgcmV0dXJuIHZpc2l0Q2xhc3Moc291cmNlLCBub2RlLCBjb21tZW50LCBwcm9wZXJ0aWVzKTtcclxuICAgIGNhc2UgJ2Z1bmN0aW9uJzpcclxuICAgICAgcmV0dXJuIHZpc2l0RnVuY3Rpb24oc291cmNlLCBub2RlLCBjb21tZW50LCBwcm9wZXJ0aWVzKTtcclxuICAgIGNhc2UgJ2NvbW1lbnQnOlxyXG4gICAgICAvLyBub29wXHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnRVJST1InOlxyXG4gICAgICBsb2cucmVwb3J0KHNvdXJjZSwgbm9kZSwgRXJyb3JUeXBlLlRyZWVTaXR0ZXJQYXJzZUVycm9yKTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICBpZiAobm9kZS50eXBlLmluY2x1ZGVzKFwic3RhdGVtZW50XCIpKSB7XHJcbiAgICAgICAgcmV0dXJuIHZpc2l0U3RhdGVtZW50KHNvdXJjZSwgbm9kZSwgY29tbWVudCwgcHJvcGVydGllcyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChub2RlLnR5cGUuaW5jbHVkZXMoXCJkZWNsYXJhdGlvblwiKSkge1xyXG4gICAgICAgIHJldHVybiB2aXNpdERlY2xhcmF0aW9uKHNvdXJjZSwgbm9kZSwgY29tbWVudCwgcHJvcGVydGllcyk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIGxvZy5pbmZvKGAke25vZGUudHlwZS5yZXBsYWNlKC9bX10vZywgJyAnKX0nIGlzIG5vdCBzdXBwb3J0ZWQgeWV0LmApO1xyXG4gICAgICBicmVhaztcclxuICB9XHJcbn0iXX0=