"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const comment_1 = require("../../../utils/comment");
const Node_1 = require("../Node");
const method_definition_visitor_1 = require("./method_definition.visitor");
const public_field_definition_visitor_1 = require("./public_field_definition.visitor");
const type_visitor_1 = require("./type.visitor");
const log_1 = require("../../../utils/log");
const match_1 = require("../../../utils/match");
const type_parameters_visitor_1 = require("./type_parameters.visitor");
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
                log_1.default.report(source, node, log_1.ErrorType.NodeTypeNotYetSupported);
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
                        log_1.default.report(source, nextSibling, log_1.ErrorType.NodeTypeNotYetSupported);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3MudmlzaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9sYW5nL3R5cGVzY3JpcHQvdmlzaXRvcnMvY2xhc3MudmlzaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9EQUEwRDtBQUMxRCxrQ0FBcUQ7QUFFckQsMkVBQW9FO0FBQ3BFLHVGQUErRTtBQUMvRSxpREFBcUQ7QUFFckQsNENBQW9EO0FBQ3BELGdEQUF5QztBQUN6Qyx1RUFBNEQ7QUFFNUQsU0FBZ0IsVUFBVSxDQUN4QixNQUFjLEVBQ2QsSUFBZ0IsRUFDaEIsT0FBbUIsRUFDbkIsVUFBb0M7SUFFcEMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUM3QixnQ0FBZ0M7SUFDaEMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFBO0lBQ2hCLE1BQU0sVUFBVSxHQUFHLGlCQUFVLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFBO0lBQ3ZELE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDbkMsUUFBUSxLQUFLLENBQUMsSUFBSSxFQUFFO1lBQ2xCLEtBQUssaUJBQWlCO2dCQUNwQixPQUFPLGlDQUFtQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQTtZQUMzQyxLQUFLLGdCQUFnQjtnQkFDbkIsT0FBTyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUE7WUFDMUMsS0FBSyxZQUFZO2dCQUNmLE9BQU8sY0FBYyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQTtZQUN0QztnQkFDRSxhQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsZUFBUyxDQUFDLHVCQUF1QixDQUFDLENBQUM7Z0JBQzVELE1BQU07U0FDVDtJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxlQUFlLEdBQUcsT0FB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SCxDQUFDLENBQUMsQ0FBQztJQUVMLE9BQU87UUFDTCxJQUFJLEVBQUUsWUFBWTtRQUNsQixPQUFPLEVBQUUsaUJBQVUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDO1FBQ2pDLE9BQU87UUFDUCxVQUFVO0tBQ1gsQ0FBQTtBQUNILENBQUM7QUEvQkQsd0NBK0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaXNKYXZhRG9jQ29tbWVudCB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9jb21tZW50XCI7XG5pbXBvcnQgeyBOb2RlUHJvcGVydGllcywgY3JlYXRlTm9kZSB9IGZyb20gXCIuLi9Ob2RlXCI7XG5pbXBvcnQgeyBTeW50YXhOb2RlIH0gZnJvbSBcInRyZWUtc2l0dGVyXCI7XG5pbXBvcnQgeyB2aXNpdE1ldGhvZERlZmluaXRpb24gfSBmcm9tIFwiLi9tZXRob2RfZGVmaW5pdGlvbi52aXNpdG9yXCI7XG5pbXBvcnQgeyB2aXNpdFB1YmxpY0ZpZWxkRGVmaW5pdGlvbiB9IGZyb20gXCIuL3B1YmxpY19maWVsZF9kZWZpbml0aW9uLnZpc2l0b3JcIjtcbmltcG9ydCB7IHZpc2l0VHlwZUlkZW50aWZpZXIgfSBmcm9tIFwiLi90eXBlLnZpc2l0b3JcIjtcbmltcG9ydCBTb3VyY2UgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvU291cmNlXCI7XG5pbXBvcnQgbG9nLCB7IEVycm9yVHlwZSB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9sb2dcIjtcbmltcG9ydCBtYXRjaCBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvbWF0Y2hcIjtcbmltcG9ydCB2aXNpdFR5cGVQYXJhbWV0ZXJzIGZyb20gXCIuL3R5cGVfcGFyYW1ldGVycy52aXNpdG9yXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiB2aXNpdENsYXNzKFxuICBzb3VyY2U6IFNvdXJjZSxcbiAgbm9kZTogU3ludGF4Tm9kZSxcbiAgY29tbWVudDogU3ludGF4Tm9kZSxcbiAgcHJvcGVydGllcz86IFBhcnRpYWw8Tm9kZVByb3BlcnRpZXM+XG4pIHtcbiAgbGV0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbjtcbiAgLy8gUmVtb3ZlICdjbGFzcycgZnJvbSB0aGUgYXJyYXlcbiAgY2hpbGRyZW4uc2hpZnQoKVxuICBjb25zdCBpZGVudGlmaWVyID0gY3JlYXRlTm9kZShzb3VyY2UsIGNoaWxkcmVuLnNoaWZ0KCkpXG4gIGNvbnN0IHZpc2l0ZWQgPSBjaGlsZHJlbi5tYXAoY2hpbGQgPT4ge1xuICAgIHN3aXRjaCAoY2hpbGQudHlwZSkge1xuICAgICAgY2FzZSAndHlwZV9wYXJhbWV0ZXJzJzpcbiAgICAgICAgcmV0dXJuIHZpc2l0VHlwZVBhcmFtZXRlcnMoc291cmNlLCBjaGlsZClcbiAgICAgIGNhc2UgJ2NsYXNzX2hlcml0YWdlJzpcbiAgICAgICAgcmV0dXJuIHZpc2l0Q2xhc3NIZXJpdGFnZShzb3VyY2UsIGNoaWxkKVxuICAgICAgY2FzZSAnY2xhc3NfYm9keSc6XG4gICAgICAgIHJldHVybiB2aXNpdENsYXNzQm9keShzb3VyY2UsIGNoaWxkKVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbG9nLnJlcG9ydChzb3VyY2UsIG5vZGUsIEVycm9yVHlwZS5Ob2RlVHlwZU5vdFlldFN1cHBvcnRlZCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfSk7XG5cbiAgY29uc3QgdHlwZV9wYXJhbWV0ZXJzID0gdmlzaXRlZC5maWx0ZXIoY2hpbGQgPT4gY2hpbGQudHlwZSA9PT0gJ3R5cGVfcGFyYW1ldGVycycpLnNoaWZ0KClcbiAgY29uc3QgaGVyaXRhZ2UgPSB2aXNpdGVkLmZpbHRlcihjaGlsZCA9PiBjaGlsZC50eXBlID09PSAnY2xhc3NfaGVyaXRhZ2UnKS5zaGlmdCgpXG4gIGNvbnN0IGJvZHkgPSB2aXNpdGVkLmZpbHRlcihjaGlsZCA9PiBjaGlsZC50eXBlID09PSAnY2xhc3NfYm9keScpLnNoaWZ0KCk7XG5cbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnY2xhc3MnLFxuICAgIGlkZW50aWZpZXIsXG4gICAgdHlwZV9wYXJhbWV0ZXJzLFxuICAgIGhlcml0YWdlLFxuICAgIGJvZHksXG4gICAgcHJvcGVydGllcyxcbiAgICBjb21tZW50OiBjcmVhdGVOb2RlKHNvdXJjZSwgY29tbWVudCwgbnVsbCwgdHJ1ZSksXG4gICAgY29udGV4dDogY3JlYXRlTm9kZShzb3VyY2UsIG5vZGUpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0Q2xhc3NIZXJpdGFnZShzb3VyY2U6IFNvdXJjZSwgbm9kZTogU3ludGF4Tm9kZSkge1xuICBsZXQgaGVyaXRhZ2VfY2xhdXNlID0gbm9kZS5jaGlsZHJlbi5zaGlmdCgpO1xuICBsZXQgaGVyaXRhZ2VfY2xhdXNlX2NoaWxkcmVuID0gaGVyaXRhZ2VfY2xhdXNlLmNoaWxkcmVuO1xuICAvLyBSZW1vdmUgdGhlIGhlcml0YWdlIHR5cGUgKCdpbXBsZW1lbnRzJyBvciAnZXh0ZW5kcycpXG4gIGxldCBoZXJpdGFnZV90eXBlID0gaGVyaXRhZ2VfY2xhdXNlX2NoaWxkcmVuLnNoaWZ0KCk7XG5cbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnY2xhc3NfaGVyaXRhZ2UnLFxuICAgIGhlcml0YWdlX3R5cGU6IGhlcml0YWdlX3R5cGUudHlwZSxcbiAgICBjb250ZXh0OiBjcmVhdGVOb2RlKHNvdXJjZSwgbm9kZSksXG4gICAgLy8gQSBoZXJpdGFnZSBpcyBlaXRoZXIgJ2ltcGxlbWVudHMnIG9yICdleHRlbmRzJ1xuICAgIGhlcml0YWdlczogaGVyaXRhZ2VfY2xhdXNlX2NoaWxkcmVuXG4gICAgICAuZmlsdGVyKGNoaWxkID0+IGNoaWxkLnR5cGUgPT09ICd0eXBlX2lkZW50aWZpZXInKVxuICAgICAgLm1hcChjaGlsZCA9PiB2aXNpdFR5cGVJZGVudGlmaWVyKHNvdXJjZSwgY2hpbGQpKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2aXNpdENsYXNzQm9keShzb3VyY2U6IFNvdXJjZSwgbm9kZTogU3ludGF4Tm9kZSkge1xuXG4gIGNvbnN0IG1ldGhvZHMgPSBbXVxuICBjb25zdCBwcm9wZXJ0aWVzID0gW11cbiAgbm9kZS5jaGlsZHJlblxuICAgIC5maWx0ZXIoY2hpbGQgPT4gIWNoaWxkLnR5cGUubWF0Y2goL1t7fV0vKSlcbiAgICAuZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgICBjb25zdCBuZXh0U2libGluZyA9IGNoaWxkLm5leHRTaWJsaW5nO1xuICAgICAgaWYgKG1hdGNoKGNoaWxkLCAnY29tbWVudCcpICYmIGlzSmF2YURvY0NvbW1lbnQoc291cmNlLCBjaGlsZCkpIHtcbiAgICAgICAgaWYgKG5leHRTaWJsaW5nKSB7XG4gICAgICAgICAgc3dpdGNoIChuZXh0U2libGluZy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdtZXRob2RfZGVmaW5pdGlvbic6XG4gICAgICAgICAgICAgIG1ldGhvZHMucHVzaCh2aXNpdE1ldGhvZERlZmluaXRpb24oc291cmNlLCBuZXh0U2libGluZywgY2hpbGQpKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdwdWJsaWNfZmllbGRfZGVmaW5pdGlvbic6XG4gICAgICAgICAgICAgIHByb3BlcnRpZXMucHVzaCh2aXNpdFB1YmxpY0ZpZWxkRGVmaW5pdGlvbihzb3VyY2UsIG5leHRTaWJsaW5nLCBjaGlsZCkpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIGxvZy5yZXBvcnQoc291cmNlLCBuZXh0U2libGluZywgRXJyb3JUeXBlLk5vZGVUeXBlTm90WWV0U3VwcG9ydGVkKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnY2xhc3NfYm9keScsXG4gICAgY29udGV4dDogY3JlYXRlTm9kZShzb3VyY2UsIG5vZGUpLFxuICAgIG1ldGhvZHMsXG4gICAgcHJvcGVydGllc1xuICB9XG59Il19