"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A class that wraps a SyntaxNode as a Node
 */
class Node {
    constructor(syntaxNode) {
        this.syntaxNode = syntaxNode;
        this.visit = (visitor) => {
            visitor.visitNode(this.syntaxNode);
        };
    }
}
exports.Node = Node;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYW5nL2NvbW1vbi9ub2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBT0E7O0dBRUc7QUFDSCxNQUFhLElBQUk7SUFDZixZQUFtQixVQUFzQjtRQUF0QixlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3pDLFVBQUssR0FBRyxDQUFDLE9BQWdCLEVBQVEsRUFBRTtZQUNqQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNyQyxDQUFDLENBQUE7SUFINEMsQ0FBQztDQUkvQztBQUxELG9CQUtDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3ludGF4Tm9kZSB9IGZyb20gXCJ0cmVlLXNpdHRlclwiO1xyXG5pbXBvcnQgVmlzaXRvciBmcm9tIFwiLi92aXNpdG9yXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFRyZWVTaXR0ZXJOb2RlIHtcclxuICB2aXNpdCh2aXNpdG9yOiBWaXNpdG9yKTogdm9pZFxyXG59XHJcblxyXG4vKipcclxuICogQSBjbGFzcyB0aGF0IHdyYXBzIGEgU3ludGF4Tm9kZSBhcyBhIE5vZGVcclxuICovXHJcbmV4cG9ydCBjbGFzcyBOb2RlIGltcGxlbWVudHMgVHJlZVNpdHRlck5vZGUge1xyXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzeW50YXhOb2RlOiBTeW50YXhOb2RlKSB7IH1cclxuICB2aXNpdCA9ICh2aXNpdG9yOiBWaXNpdG9yKTogdm9pZCA9PiB7XHJcbiAgICB2aXNpdG9yLnZpc2l0Tm9kZSh0aGlzLnN5bnRheE5vZGUpO1xyXG4gIH1cclxufSJdfQ==