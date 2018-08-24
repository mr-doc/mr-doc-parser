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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYW5nL2NvbW1vbi9ub2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBT0E7O0dBRUc7QUFDSCxNQUFhLElBQUk7SUFDZixZQUFtQixVQUFzQjtRQUF0QixlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3pDLFVBQUssR0FBRyxDQUFDLE9BQWdCLEVBQVEsRUFBRTtZQUNqQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNyQyxDQUFDLENBQUE7SUFINEMsQ0FBQztDQUkvQztBQUxELG9CQUtDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3ludGF4Tm9kZSB9IGZyb20gXCJ0cmVlLXNpdHRlclwiO1xuaW1wb3J0IFZpc2l0b3IgZnJvbSBcIi4vdmlzaXRvclwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRyZWVTaXR0ZXJOb2RlIHtcbiAgdmlzaXQodmlzaXRvcjogVmlzaXRvcik6IHZvaWRcbn1cblxuLyoqXG4gKiBBIGNsYXNzIHRoYXQgd3JhcHMgYSBTeW50YXhOb2RlIGFzIGEgTm9kZVxuICovXG5leHBvcnQgY2xhc3MgTm9kZSBpbXBsZW1lbnRzIFRyZWVTaXR0ZXJOb2RlIHtcbiAgY29uc3RydWN0b3IocHVibGljIHN5bnRheE5vZGU6IFN5bnRheE5vZGUpIHsgfVxuICB2aXNpdCA9ICh2aXNpdG9yOiBWaXNpdG9yKTogdm9pZCA9PiB7XG4gICAgdmlzaXRvci52aXNpdE5vZGUodGhpcy5zeW50YXhOb2RlKTtcbiAgfVxufSJdfQ==