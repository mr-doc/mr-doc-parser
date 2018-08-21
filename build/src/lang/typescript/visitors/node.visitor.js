"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_visitor_1 = require("./class.visitor");
const declaration_visitor_1 = require("./declaration.visitor");
const function_visitor_1 = require("./function.visitor");
const statement_visitor_1 = require("./statement.visitor");
const log_1 = require("../../../utils/log");
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
            log_1.default.report(source, node, log_1.ErrorType.NodeTypeNotYetSupported);
            break;
    }
}
exports.visitNode = visitNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS52aXNpdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xhbmcvdHlwZXNjcmlwdC92aXNpdG9ycy9ub2RlLnZpc2l0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxtREFBNkM7QUFDN0MsK0RBQXlEO0FBQ3pELHlEQUFtRDtBQUNuRCwyREFBcUQ7QUFFckQsNENBQW9EO0FBRXBELFNBQWdCLFNBQVMsQ0FDdkIsTUFBYyxFQUNkLElBQWdCLEVBQ2hCLE9BQW1CLEVBQ25CLFVBQW1DO0lBRW5DLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNqQixLQUFLLE9BQU87WUFDVixPQUFPLDBCQUFVLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDdkQsS0FBSyxVQUFVO1lBQ2IsT0FBTyxnQ0FBYSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzFELEtBQUssU0FBUztZQUNaLE9BQU87WUFDUCxNQUFNO1FBQ1IsS0FBSyxPQUFPO1lBQ1YsYUFBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLGVBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3pELE1BQU07UUFDUjtZQUNFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQ25DLE9BQU8sa0NBQWMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQzthQUMxRDtZQUVELElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQ3JDLE9BQU8sc0NBQWdCLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7YUFDNUQ7WUFFRCxhQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsZUFBUyxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFDNUQsTUFBTTtLQUNUO0FBQ0gsQ0FBQztBQTdCRCw4QkE2QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOb2RlUHJvcGVydGllcyB9IGZyb20gXCIuLi9Ob2RlXCI7XG5pbXBvcnQgeyBTeW50YXhOb2RlIH0gZnJvbSBcInRyZWUtc2l0dGVyXCI7XG5pbXBvcnQgeyB2aXNpdENsYXNzIH0gZnJvbSBcIi4vY2xhc3MudmlzaXRvclwiO1xuaW1wb3J0IHsgdmlzaXREZWNsYXJhdGlvbiB9IGZyb20gXCIuL2RlY2xhcmF0aW9uLnZpc2l0b3JcIjtcbmltcG9ydCB7IHZpc2l0RnVuY3Rpb24gfSBmcm9tIFwiLi9mdW5jdGlvbi52aXNpdG9yXCI7XG5pbXBvcnQgeyB2aXNpdFN0YXRlbWVudCB9IGZyb20gXCIuL3N0YXRlbWVudC52aXNpdG9yXCI7XG5pbXBvcnQgU291cmNlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL1NvdXJjZVwiO1xuaW1wb3J0IGxvZywgeyBFcnJvclR5cGUgfSBmcm9tICcuLi8uLi8uLi91dGlscy9sb2cnO1xuXG5leHBvcnQgZnVuY3Rpb24gdmlzaXROb2RlKFxuICBzb3VyY2U6IFNvdXJjZSxcbiAgbm9kZTogU3ludGF4Tm9kZSxcbiAgY29tbWVudDogU3ludGF4Tm9kZSxcbiAgcHJvcGVydGllczogUGFydGlhbDxOb2RlUHJvcGVydGllcz5cbikge1xuICBzd2l0Y2ggKG5vZGUudHlwZSkge1xuICAgIGNhc2UgJ2NsYXNzJzpcbiAgICAgIHJldHVybiB2aXNpdENsYXNzKHNvdXJjZSwgbm9kZSwgY29tbWVudCwgcHJvcGVydGllcyk7XG4gICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgcmV0dXJuIHZpc2l0RnVuY3Rpb24oc291cmNlLCBub2RlLCBjb21tZW50LCBwcm9wZXJ0aWVzKTtcbiAgICBjYXNlICdjb21tZW50JzpcbiAgICAgIC8vIG5vb3BcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0VSUk9SJzpcbiAgICAgIGxvZy5yZXBvcnQoc291cmNlLCBub2RlLCBFcnJvclR5cGUuVHJlZVNpdHRlclBhcnNlRXJyb3IpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGlmIChub2RlLnR5cGUuaW5jbHVkZXMoXCJzdGF0ZW1lbnRcIikpIHtcbiAgICAgICAgcmV0dXJuIHZpc2l0U3RhdGVtZW50KHNvdXJjZSwgbm9kZSwgY29tbWVudCwgcHJvcGVydGllcyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChub2RlLnR5cGUuaW5jbHVkZXMoXCJkZWNsYXJhdGlvblwiKSkge1xuICAgICAgICByZXR1cm4gdmlzaXREZWNsYXJhdGlvbihzb3VyY2UsIG5vZGUsIGNvbW1lbnQsIHByb3BlcnRpZXMpO1xuICAgICAgfVxuICAgICAgXG4gICAgICBsb2cucmVwb3J0KHNvdXJjZSwgbm9kZSwgRXJyb3JUeXBlLk5vZGVUeXBlTm90WWV0U3VwcG9ydGVkKTtcbiAgICAgIGJyZWFrO1xuICB9XG59Il19