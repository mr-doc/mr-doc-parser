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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3JhbS52aXNpdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xhbmcvdHlwZXNjcmlwdC92aXNpdG9ycy9wcm9ncmFtLnZpc2l0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvREFBMEU7QUFFMUUsaURBQTJDO0FBRTNDLGdEQUF5QztBQUV6QyxTQUFnQixZQUFZLENBQUMsTUFBYyxFQUFFLElBQWdCO0lBQzNELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDN0IsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDNUIsSUFBSSx3QkFBYyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDNUMsb0NBQW9DO1lBQ3BDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNwQztRQUNELGFBQWE7UUFDYixPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDMUIsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztZQUN0Qyw2Q0FBNkM7WUFDN0MsSUFBSSxlQUFLLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxJQUFJLDBCQUFnQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsRUFBRTtnQkFDOUQsNENBQTRDO2dCQUM1QyxJQUFJLFdBQVcsRUFBRTtvQkFDZixvQkFBb0I7b0JBQ3BCLHdCQUF3QjtvQkFDeEIsT0FBTyx3QkFBUyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFO3dCQUMzQyxPQUFPLEVBQUU7NEJBQ1AsTUFBTSxFQUFFLEtBQUs7NEJBQ2IsT0FBTyxFQUFFLEtBQUs7eUJBQ2Y7cUJBQ0YsQ0FBQyxDQUFDO2lCQUNKO2FBQ0Y7UUFDSCxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDN0I7QUFDSCxDQUFDO0FBMUJELG9DQTBCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlzSmF2YURvY0NvbW1lbnQsIGlzTGVnYWxDb21tZW50IH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL2NvbW1lbnRcIjtcbmltcG9ydCB7IFN5bnRheE5vZGUgfSBmcm9tIFwidHJlZS1zaXR0ZXJcIjtcbmltcG9ydCB7IHZpc2l0Tm9kZSB9IGZyb20gXCIuL25vZGUudmlzaXRvclwiO1xuaW1wb3J0IFNvdXJjZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9Tb3VyY2VcIjtcbmltcG9ydCBtYXRjaCBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvbWF0Y2hcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0UHJvZ3JhbShzb3VyY2U6IFNvdXJjZSwgbm9kZTogU3ludGF4Tm9kZSkge1xuICBsZXQgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xuICBpZiAobm9kZS5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgaWYgKGlzTGVnYWxDb21tZW50KHNvdXJjZSwgbm9kZS5jaGlsZHJlblswXSkpIHtcbiAgICAgIC8vIFJlbW92ZSB0aGUgbGVnYWwgY29tbWVudCBmcm9tIGFzdFxuICAgICAgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuLnNwbGljZSgxKTtcbiAgICB9XG4gICAgLy8gUGVyZjogTyhuKVxuICAgIHJldHVybiBjaGlsZHJlbi5tYXAoY2hpbGQgPT4ge1xuICAgICAgY29uc3QgbmV4dFNpYmxpbmcgPSBjaGlsZC5uZXh0U2libGluZztcbiAgICAgIC8vIERldGVybWluZSBpZiB0aGUgbm9kZSBpcyBhIGMtc3R5bGUgY29tbWVudFxuICAgICAgaWYgKG1hdGNoKGNoaWxkLCAnY29tbWVudCcpICYmIGlzSmF2YURvY0NvbW1lbnQoc291cmNlLCBjaGlsZCkpIHtcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgYSBjb21tZW50IGhhcyBhIHNpYmxpbmdcbiAgICAgICAgaWYgKG5leHRTaWJsaW5nKSB7XG4gICAgICAgICAgLy8gVmlzaXQgdGhlIHNpYmxpbmdcbiAgICAgICAgICAvLyBQZXJmOiBQb3NzaWJseSBPKG5eMilcbiAgICAgICAgICByZXR1cm4gdmlzaXROb2RlKHNvdXJjZSwgbmV4dFNpYmxpbmcsIGNoaWxkLCB7XG4gICAgICAgICAgICBleHBvcnRzOiB7XG4gICAgICAgICAgICAgIGV4cG9ydDogZmFsc2UsXG4gICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KS5maWx0ZXIoY2hpbGQgPT4gISFjaGlsZCk7XG4gIH1cbn0iXX0=