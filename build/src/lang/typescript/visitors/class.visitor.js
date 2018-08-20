"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = require("../Node");
const type_parameters_visitor_1 = require("./type_parameters.visitor");
const match_1 = require("../../../utils/match");
const comment_1 = require("../../../utils/comment");
const method_definition_visitor_1 = require("./method_definition.visitor");
const public_field_definition_visitor_1 = require("../public_field_definition.visitor");
const type_visitor_1 = require("./type.visitor");
const log_1 = require("../../../utils/log");
function visitClass(source, node, comment, properties) {
    let children = node.children;
    // Remove 'class' from the array
    children.shift();
    const identifier = Node_1.createNode(source, children.shift());
    const visited = children.map(child => {
        switch (child.type) {
            case 'type_parameters':
                return type_parameters_visitor_1.default(source, child);
            case 'class_heritage':
                return visitClassHeritage(source, child);
            case 'class_body':
                return visitClassBody(source, child);
            default:
                console.log(`[mr-doc::parser]: info - '${node.type.replace(/[_]/g, ' ')}' is not supported yet.`);
                break;
        }
    });
    const type_parameters = visited.filter(child => child.type === 'type_parameters').shift();
    const heritage = visited.filter(child => child.type === 'class_heritage').shift();
    const body = visited.filter(child => child.type === 'class_body').shift();
    return {
        type: 'class',
        identifier,
        type_parameters,
        heritage,
        body,
        properties,
        comment: Node_1.createNode(source, comment, null, true),
        context: Node_1.createNode(source, node)
    };
}
exports.visitClass = visitClass;
function visitClassHeritage(source, node) {
    let heritage_clause = node.children.shift();
    let heritage_clause_children = heritage_clause.children;
    // Remove the heritage type ('implements' or 'extends')
    let heritage_type = heritage_clause_children.shift();
    return {
        type: 'class_heritage',
        heritage_type: heritage_type.type,
        context: Node_1.createNode(source, node),
        // A heritage is either 'implements' or 'extends'
        heritages: heritage_clause_children
            .filter(child => child.type === 'type_identifier')
            .map(child => type_visitor_1.visitTypeIdentifier(source, child))
    };
}
exports.visitClassHeritage = visitClassHeritage;
function visitClassBody(source, node) {
    const methods = [];
    const properties = [];
    node.children
        .filter(child => !child.type.match(/[{}]/))
        .forEach(child => {
        const nextSibling = child.nextSibling;
        if (match_1.default(child, 'comment') && comment_1.isJavaDocComment(source, child)) {
            if (nextSibling) {
                switch (nextSibling.type) {
                    case 'method_definition':
                        methods.push(method_definition_visitor_1.visitMethodDefinition(source, nextSibling, child));
                        break;
                    case 'public_field_definition':
                        properties.push(public_field_definition_visitor_1.visitPublicFieldDefinition(source, nextSibling, child));
                        break;
                    default:
                        log_1.default.report(source, nextSibling, log_1.ErrorType.NodeTypeNotSupported);
                        break;
                }
            }
        }
    });
    return {
        type: 'class_body',
        context: Node_1.createNode(source, node),
        methods,
        properties
    };
}
exports.visitClassBody = visitClassBody;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3MudmlzaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9sYW5nL3R5cGVzY3JpcHQvdmlzaXRvcnMvY2xhc3MudmlzaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGtDQUFxRDtBQUNyRCx1RUFBNEQ7QUFDNUQsZ0RBQXlDO0FBQ3pDLG9EQUEwRDtBQUMxRCwyRUFBb0U7QUFDcEUsd0ZBQWdGO0FBQ2hGLGlEQUFxRDtBQUVyRCw0Q0FBb0Q7QUFFcEQsU0FBZ0IsVUFBVSxDQUN4QixNQUFhLEVBQ2IsSUFBZ0IsRUFDaEIsT0FBbUIsRUFDbkIsVUFBb0M7SUFFcEMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUM3QixnQ0FBZ0M7SUFDaEMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFBO0lBQ2hCLE1BQU0sVUFBVSxHQUFHLGlCQUFVLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFBO0lBQ3ZELE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDbkMsUUFBUSxLQUFLLENBQUMsSUFBSSxFQUFFO1lBQ2xCLEtBQUssaUJBQWlCO2dCQUNwQixPQUFPLGlDQUFtQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQTtZQUMzQyxLQUFLLGdCQUFnQjtnQkFDbkIsT0FBTyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUE7WUFDMUMsS0FBSyxZQUFZO2dCQUNmLE9BQU8sY0FBYyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQTtZQUN0QztnQkFDRSxPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUE7Z0JBQ2pHLE1BQU07U0FDVDtJQUNILENBQUMsQ0FBQyxD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aEUsTUFBTTtpQkFDVDthQUNGO1NBQ0Y7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVMLE9BQU87UUFDTCxJQUFJLEVBQUUsWUFBWTtRQUNsQixPQUFPLEVBQUUsaUJBQVUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDO1FBQ2pDLE9BQU87UUFDUCxVQUFVO0tBQ1gsQ0FBQTtBQUNILENBQUM7QUEvQkQsd0NBK0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3ludGF4Tm9kZSB9IGZyb20gXCJ0cmVlLXNpdHRlclwiO1xyXG5pbXBvcnQgeyBOb2RlUHJvcGVydGllcywgY3JlYXRlTm9kZSB9IGZyb20gXCIuLi9Ob2RlXCI7XHJcbmltcG9ydCB2aXNpdFR5cGVQYXJhbWV0ZXJzIGZyb20gXCIuL3R5cGVfcGFyYW1ldGVycy52aXNpdG9yXCI7XHJcbmltcG9ydCBtYXRjaCBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvbWF0Y2hcIjtcclxuaW1wb3J0IHsgaXNKYXZhRG9jQ29tbWVudCB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9jb21tZW50XCI7XHJcbmltcG9ydCB7IHZpc2l0TWV0aG9kRGVmaW5pdGlvbiB9IGZyb20gXCIuL21ldGhvZF9kZWZpbml0aW9uLnZpc2l0b3JcIjtcclxuaW1wb3J0IHsgdmlzaXRQdWJsaWNGaWVsZERlZmluaXRpb24gfSBmcm9tIFwiLi4vcHVibGljX2ZpZWxkX2RlZmluaXRpb24udmlzaXRvclwiO1xyXG5pbXBvcnQgeyB2aXNpdFR5cGVJZGVudGlmaWVyIH0gZnJvbSBcIi4vdHlwZS52aXNpdG9yXCI7XHJcbmltcG9ydCBJRmlsZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9JRmlsZVwiO1xyXG5pbXBvcnQgbG9nLCB7IEVycm9yVHlwZSB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9sb2dcIjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB2aXNpdENsYXNzKFxyXG4gIHNvdXJjZTogSUZpbGUsXHJcbiAgbm9kZTogU3ludGF4Tm9kZSxcclxuICBjb21tZW50OiBTeW50YXhOb2RlLFxyXG4gIHByb3BlcnRpZXM/OiBQYXJ0aWFsPE5vZGVQcm9wZXJ0aWVzPlxyXG4pIHtcclxuICBsZXQgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xyXG4gIC8vIFJlbW92ZSAnY2xhc3MnIGZyb20gdGhlIGFycmF5XHJcbiAgY2hpbGRyZW4uc2hpZnQoKVxyXG4gIGNvbnN0IGlkZW50aWZpZXIgPSBjcmVhdGVOb2RlKHNvdXJjZSwgY2hpbGRyZW4uc2hpZnQoKSlcclxuICBjb25zdCB2aXNpdGVkID0gY2hpbGRyZW4ubWFwKGNoaWxkID0+IHtcclxuICAgIHN3aXRjaCAoY2hpbGQudHlwZSkge1xyXG4gICAgICBjYXNlICd0eXBlX3BhcmFtZXRlcnMnOlxyXG4gICAgICAgIHJldHVybiB2aXNpdFR5cGVQYXJhbWV0ZXJzKHNvdXJjZSwgY2hpbGQpXHJcbiAgICAgIGNhc2UgJ2NsYXNzX2hlcml0YWdlJzpcclxuICAgICAgICByZXR1cm4gdmlzaXRDbGFzc0hlcml0YWdlKHNvdXJjZSwgY2hpbGQpXHJcbiAgICAgIGNhc2UgJ2NsYXNzX2JvZHknOlxyXG4gICAgICAgIHJldHVybiB2aXNpdENsYXNzQm9keShzb3VyY2UsIGNoaWxkKVxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbbXItZG9jOjpwYXJzZXJdOiBpbmZvIC0gJyR7bm9kZS50eXBlLnJlcGxhY2UoL1tfXS9nLCAnICcpfScgaXMgbm90IHN1cHBvcnRlZCB5ZXQuYClcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgY29uc3QgdHlwZV9wYXJhbWV0ZXJzID0gdmlzaXRlZC5maWx0ZXIoY2hpbGQgPT4gY2hpbGQudHlwZSA9PT0gJ3R5cGVfcGFyYW1ldGVycycpLnNoaWZ0KClcclxuICBjb25zdCBoZXJpdGFnZSA9IHZpc2l0ZWQuZmlsdGVyKGNoaWxkID0+IGNoaWxkLnR5cGUgPT09ICdjbGFzc19oZXJpdGFnZScpLnNoaWZ0KClcclxuICBjb25zdCBib2R5ID0gdmlzaXRlZC5maWx0ZXIoY2hpbGQgPT4gY2hpbGQudHlwZSA9PT0gJ2NsYXNzX2JvZHknKS5zaGlmdCgpO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgdHlwZTogJ2NsYXNzJyxcclxuICAgIGlkZW50aWZpZXIsXHJcbiAgICB0eXBlX3BhcmFtZXRlcnMsXHJcbiAgICBoZXJpdGFnZSxcclxuICAgIGJvZHksXHJcbiAgICBwcm9wZXJ0aWVzLFxyXG4gICAgY29tbWVudDogY3JlYXRlTm9kZShzb3VyY2UsIGNvbW1lbnQsIG51bGwsIHRydWUpLFxyXG4gICAgY29udGV4dDogY3JlYXRlTm9kZShzb3VyY2UsIG5vZGUpXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdmlzaXRDbGFzc0hlcml0YWdlKHNvdXJjZTogSUZpbGUsIG5vZGU6IFN5bnRheE5vZGUpIHtcclxuICBsZXQgaGVyaXRhZ2VfY2xhdXNlID0gbm9kZS5jaGlsZHJlbi5zaGlmdCgpO1xyXG4gIGxldCBoZXJpdGFnZV9jbGF1c2VfY2hpbGRyZW4gPSBoZXJpdGFnZV9jbGF1c2UuY2hpbGRyZW47XHJcbiAgLy8gUmVtb3ZlIHRoZSBoZXJpdGFnZSB0eXBlICgnaW1wbGVtZW50cycgb3IgJ2V4dGVuZHMnKVxyXG4gIGxldCBoZXJpdGFnZV90eXBlID0gaGVyaXRhZ2VfY2xhdXNlX2NoaWxkcmVuLnNoaWZ0KCk7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICB0eXBlOiAnY2xhc3NfaGVyaXRhZ2UnLFxyXG4gICAgaGVyaXRhZ2VfdHlwZTogaGVyaXRhZ2VfdHlwZS50eXBlLFxyXG4gICAgY29udGV4dDogY3JlYXRlTm9kZShzb3VyY2UsIG5vZGUpLFxyXG4gICAgLy8gQSBoZXJpdGFnZSBpcyBlaXRoZXIgJ2ltcGxlbWVudHMnIG9yICdleHRlbmRzJ1xyXG4gICAgaGVyaXRhZ2VzOiBoZXJpdGFnZV9jbGF1c2VfY2hpbGRyZW5cclxuICAgICAgLmZpbHRlcihjaGlsZCA9PiBjaGlsZC50eXBlID09PSAndHlwZV9pZGVudGlmaWVyJylcclxuICAgICAgLm1hcChjaGlsZCA9PiB2aXNpdFR5cGVJZGVudGlmaWVyKHNvdXJjZSwgY2hpbGQpKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0Q2xhc3NCb2R5KHNvdXJjZTogSUZpbGUsIG5vZGU6IFN5bnRheE5vZGUpIHtcclxuXHJcbiAgY29uc3QgbWV0aG9kcyA9IFtdXHJcbiAgY29uc3QgcHJvcGVydGllcyA9IFtdXHJcbiAgbm9kZS5jaGlsZHJlblxyXG4gICAgLmZpbHRlcihjaGlsZCA9PiAhY2hpbGQudHlwZS5tYXRjaCgvW3t9XS8pKVxyXG4gICAgLmZvckVhY2goY2hpbGQgPT4ge1xyXG4gICAgICBjb25zdCBuZXh0U2libGluZyA9IGNoaWxkLm5leHRTaWJsaW5nO1xyXG4gICAgICBpZiAobWF0Y2goY2hpbGQsICdjb21tZW50JykgJiYgaXNKYXZhRG9jQ29tbWVudChzb3VyY2UsIGNoaWxkKSkge1xyXG4gICAgICAgIGlmIChuZXh0U2libGluZykge1xyXG4gICAgICAgICAgc3dpdGNoIChuZXh0U2libGluZy50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ21ldGhvZF9kZWZpbml0aW9uJzpcclxuICAgICAgICAgICAgICBtZXRob2RzLnB1c2godmlzaXRNZXRob2REZWZpbml0aW9uKHNvdXJjZSwgbmV4dFNpYmxpbmcsIGNoaWxkKSk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3B1YmxpY19maWVsZF9kZWZpbml0aW9uJzpcclxuICAgICAgICAgICAgICBwcm9wZXJ0aWVzLnB1c2godmlzaXRQdWJsaWNGaWVsZERlZmluaXRpb24oc291cmNlLCBuZXh0U2libGluZywgY2hpbGQpKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICBsb2cucmVwb3J0KHNvdXJjZSwgbmV4dFNpYmxpbmcsIEVycm9yVHlwZS5Ob2RlVHlwZU5vdFN1cHBvcnRlZCk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHR5cGU6ICdjbGFzc19ib2R5JyxcclxuICAgIGNvbnRleHQ6IGNyZWF0ZU5vZGUoc291cmNlLCBub2RlKSxcclxuICAgIG1ldGhvZHMsXHJcbiAgICBwcm9wZXJ0aWVzXHJcbiAgfVxyXG59Il19