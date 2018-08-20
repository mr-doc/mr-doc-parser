"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const comment_1 = require("../../../utils/comment");
const node_visitor_1 = require("./node.visitor");
const match_1 = require("../../../utils/match");
function visitProgram(source, node) {
    let children = node.children;
    if (node.children.length > 0) {
        if (comment_1.isLegalComment(source, node.children[0])) {
            // Remove the legal comment from ast
            children = node.children.splice(1);
        }
        // Perf: O(n)
        return children.map(child => {
            const nextSibling = child.nextSibling;
            // Determine if the node is a c-style comment
            if (match_1.default(child, 'comment') && comment_1.isJavaDocComment(source, child)) {
                // Determine whether a comment has a sibling
                if (nextSibling) {
                    // Visit the sibling
                    // Perf: Possibly O(n^2)
                    return node_visitor_1.visitNode(source, nextSibling, child, {
                        exports: {
                            export: false,
                            default: false
                        }
                    });
                }
            }
        }).filter(child => !!child);
    }
}
exports.visitProgram = visitProgram;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3JhbS52aXNpdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xhbmcvdHlwZXNjcmlwdC92aXNpdG9ycy9wcm9ncmFtLnZpc2l0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvREFBMEU7QUFFMUUsaURBQTJDO0FBRTNDLGdEQUF5QztBQUV6QyxTQUFnQixZQUFZLENBQUMsTUFBYSxFQUFFLElBQWdCO0lBQzFELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDN0IsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDNUIsSUFBSSx3QkFBYyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDNUMsb0NBQW9DO1lBQ3BDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNwQztRQUNELGFBQWE7UUFDYixPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDMUIsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztZQUN0Qyw2Q0FBNkM7WUFDN0MsSUFBSSxlQUFLLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxJQUFJLDBCQUFnQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsRUFBRTtnQkFDOUQsNENBQTRDO2dCQUM1QyxJQUFJLFdBQVcsRUFBRTtvQkFDZixvQkFBb0I7b0JBQ3BCLHdCQUF3QjtvQkFDeEIsT0FBTyx3QkFBUyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFO3dCQUMzQyxPQUFPLEVBQUU7NEJBQ1AsTUFBTSxFQUFFLEtBQUs7NEJBQ2IsT0FBTyxFQUFFLEtBQUs7eUJBQ2Y7cUJBQ0YsQ0FBQyxDQUFDO2lCQUNKO2FBQ0Y7UUFDSCxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDN0I7QUFDSCxDQUFDO0FBMUJELG9DQTBCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlzSmF2YURvY0NvbW1lbnQsIGlzTGVnYWxDb21tZW50IH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL2NvbW1lbnRcIjtcclxuaW1wb3J0IHsgU3ludGF4Tm9kZSB9IGZyb20gXCJ0cmVlLXNpdHRlclwiO1xyXG5pbXBvcnQgeyB2aXNpdE5vZGUgfSBmcm9tIFwiLi9ub2RlLnZpc2l0b3JcIjtcclxuaW1wb3J0IElGaWxlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL0lGaWxlXCI7XHJcbmltcG9ydCBtYXRjaCBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvbWF0Y2hcIjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB2aXNpdFByb2dyYW0oc291cmNlOiBJRmlsZSwgbm9kZTogU3ludGF4Tm9kZSkge1xyXG4gIGxldCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW47XHJcbiAgaWYgKG5vZGUuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xyXG4gICAgaWYgKGlzTGVnYWxDb21tZW50KHNvdXJjZSwgbm9kZS5jaGlsZHJlblswXSkpIHtcclxuICAgICAgLy8gUmVtb3ZlIHRoZSBsZWdhbCBjb21tZW50IGZyb20gYXN0XHJcbiAgICAgIGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbi5zcGxpY2UoMSk7XHJcbiAgICB9XHJcbiAgICAvLyBQZXJmOiBPKG4pXHJcbiAgICByZXR1cm4gY2hpbGRyZW4ubWFwKGNoaWxkID0+IHtcclxuICAgICAgY29uc3QgbmV4dFNpYmxpbmcgPSBjaGlsZC5uZXh0U2libGluZztcclxuICAgICAgLy8gRGV0ZXJtaW5lIGlmIHRoZSBub2RlIGlzIGEgYy1zdHlsZSBjb21tZW50XHJcbiAgICAgIGlmIChtYXRjaChjaGlsZCwgJ2NvbW1lbnQnKSAmJiBpc0phdmFEb2NDb21tZW50KHNvdXJjZSwgY2hpbGQpKSB7XHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgYSBjb21tZW50IGhhcyBhIHNpYmxpbmdcclxuICAgICAgICBpZiAobmV4dFNpYmxpbmcpIHtcclxuICAgICAgICAgIC8vIFZpc2l0IHRoZSBzaWJsaW5nXHJcbiAgICAgICAgICAvLyBQZXJmOiBQb3NzaWJseSBPKG5eMilcclxuICAgICAgICAgIHJldHVybiB2aXNpdE5vZGUoc291cmNlLCBuZXh0U2libGluZywgY2hpbGQsIHtcclxuICAgICAgICAgICAgZXhwb3J0czoge1xyXG4gICAgICAgICAgICAgIGV4cG9ydDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KS5maWx0ZXIoY2hpbGQgPT4gISFjaGlsZCk7XHJcbiAgfVxyXG59Il19