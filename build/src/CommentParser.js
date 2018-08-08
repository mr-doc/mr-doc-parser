"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xdoc_parser_1 = require("xdoc-parser");
/**
 * Creates a position object.
 * @param node: Parser.SyntaxNode
 * @param offset: {
 *  location: Location,
 *  position: Position
 * }
 */
function position(node, offset) {
    return {
        start: offset ? offset.position.start + node.startIndex : node.startIndex,
        end: offset ? offset.position.end + node.endIndex : node.endIndex
    };
}
/**
 * Creates a location object.
 * @param node: Parser.SyntaxNode
 * @param offset: {
 *  location: Location,
 *  position: Position
 * }
 * @return: {
 *  start: {
 *    row: number,
 *    column: number
 *  },
 *  end: {
 *    row: number,
 *    column: number
 *  }
 * }
 */
function location(node, offset) {
    return {
        start: {
            row: offset ? offset.location.start.row + node.startPosition.row : node.startPosition.row,
            column: offset ? offset.location.start.column + node.startPosition.column : node.startPosition.column
        },
        end: {
            row: offset ? offset.location.end.row + node.endPosition.row : node.endPosition.row,
            column: offset ? offset.location.end.column + node.endPosition.column : node.endPosition.column
        }
    };
}
class CommentParser {
    static parse(node, source, offset, comments = []) {
        // console.log(node.type)
        if (node.type === "comment" && node.nextSibling) {
            console.log(node.nextSibling.type);
            // console.log(`${node.nextSibling.type} has a leading comment.`);
            const next = node.nextSibling;
            // console.log(source.substring(next.startIndex, next.endIndex));
            // console.log('');
            comments.push({
                position: position(node, offset),
                location: location(node, offset),
                markdown: (xdoc_parser_1.default(source.substring(node.startIndex, node.endIndex), {
                    visitor: {
                        showNodeText: true
                    }
                })).parse(),
                text: source.substring(node.startIndex, node.endIndex),
                context: {
                    position: position(next, offset),
                    location: location(next, offset),
                    text: source.substring(next.startIndex, next.endIndex),
                    type: next.type,
                    children: []
                }
            });
        }
        node.children.forEach(child => CommentParser.parse(child, source, offset, comments));
        return comments;
    }
}
exports.default = CommentParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWVudFBhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db21tZW50UGFyc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsNkNBQStCO0FBRy9COzs7Ozs7O0dBT0c7QUFDSCxTQUFTLFFBQVEsQ0FDZixJQUF1QixFQUN2QixNQUFtRDtJQUVuRCxPQUFPO1FBQ0wsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVU7UUFDekUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVE7S0FDbEUsQ0FBQTtBQUNILENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpQkc7QUFDSCxTQUFTLFFBQVEsQ0FDZixJQUF1QixFQUN2QixNQUFrRDtJQUVsRCxPQUFPO1FBQ0wsS0FBSyxFQUFFO1lBQ0wsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUc7WUFDekYsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU07U0FDdEc7UUFDRCxHQUFHLEVBQUU7WUFDSCxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRztZQUNuRixNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTTtTQUNoRztLQUNGLENBQUE7QUFDSCxDQUFDO0FBRUQsTUFBcUIsYUFBYTtJQUNoQyxNQUFNLENBQUMsS0FBSyxDQUNWLElBQXVCLEVBQ3ZCLE1BQWMsRUFDZCxNQUFtRCxFQUNuRCxXQUF1QixFQUFFO1FBRXpCLHlCQUF5QjtRQUN6QixJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDL0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQ2xDLGtFQUFrRTtZQUNsRSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBRTlCLGlFQUFpRTtZQUNqRSxtQkFBbUI7WUFDbkIsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDWixRQUFRLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUM7Z0JBQ2hDLFFBQVEsRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQztnQkFDaEMsUUFBUSxFQUFFLENBQUMscUJBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUNoRSxPQUFPLEVBQUU7d0JBQ1AsWUFBWSxFQUFFLElBQUk7cUJBQ25CO2lCQUNGLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRTtnQkFDWCxJQUFJLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUM7Z0JBQ3RELE9BQU8sRUFBRTtvQkFDUCxRQUFRLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUM7b0JBQ2hDLFFBQVEsRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQztvQkFDaEMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDO29CQUN0RCxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7b0JBQ2YsUUFBUSxFQUFFLEVBQUU7aUJBQ2I7YUFDRixDQUFDLENBQUM7U0FDSjtRQUVELElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3JGLE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7Q0FDRjtBQXJDRCxnQ0FxQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgSUNvbW1lbnQgZnJvbSBcIi4vaW50ZXJmYWNlcy9JQ29tbWVudFwiO1xuaW1wb3J0ICogYXMgUGFyc2VyIGZyb20gJ3RyZWUtc2l0dGVyJztcbmltcG9ydCB4ZG9jIGZyb20gJ3hkb2MtcGFyc2VyJztcbmltcG9ydCB7IExvY2F0aW9uLCBQb3NpdGlvbiB9IGZyb20gJy4vaW50ZXJmYWNlcy9JQ29tbWVudCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHBvc2l0aW9uIG9iamVjdC5cbiAqIEBwYXJhbSBub2RlOiBQYXJzZXIuU3ludGF4Tm9kZVxuICogQHBhcmFtIG9mZnNldDoge1xuICogIGxvY2F0aW9uOiBMb2NhdGlvbixcbiAqICBwb3NpdGlvbjogUG9zaXRpb25cbiAqIH1cbiAqL1xuZnVuY3Rpb24gcG9zaXRpb24oXG4gIG5vZGU6IFBhcnNlci5TeW50YXhOb2RlLFxuICBvZmZzZXQ/OiB7IGxvY2F0aW9uOiBMb2NhdGlvbiwgcG9zaXRpb246IFBvc2l0aW9uIH1cbikge1xuICByZXR1cm4ge1xuICAgIHN0YXJ0OiBvZmZzZXQgPyBvZmZzZXQucG9zaXRpb24uc3RhcnQgKyBub2RlLnN0YXJ0SW5kZXggOiBub2RlLnN0YXJ0SW5kZXgsXG4gICAgZW5kOiBvZmZzZXQgPyBvZmZzZXQucG9zaXRpb24uZW5kICsgbm9kZS5lbmRJbmRleCA6IG5vZGUuZW5kSW5kZXhcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBsb2NhdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0gbm9kZTogUGFyc2VyLlN5bnRheE5vZGVcbiAqIEBwYXJhbSBvZmZzZXQ6IHtcbiAqICBsb2NhdGlvbjogTG9jYXRpb24sXG4gKiAgcG9zaXRpb246IFBvc2l0aW9uXG4gKiB9XG4gKiBAcmV0dXJuOiB7XG4gKiAgc3RhcnQ6IHtcbiAqICAgIHJvdzogbnVtYmVyLFxuICogICAgY29sdW1uOiBudW1iZXJcbiAqICB9LFxuICogIGVuZDoge1xuICogICAgcm93OiBudW1iZXIsXG4gKiAgICBjb2x1bW46IG51bWJlclxuICogIH1cbiAqIH1cbiAqL1xuZnVuY3Rpb24gbG9jYXRpb24oXG4gIG5vZGU6IFBhcnNlci5TeW50YXhOb2RlLFxuICBvZmZzZXQ6IHsgbG9jYXRpb246IExvY2F0aW9uLCBwb3NpdGlvbjogUG9zaXRpb24gfVxuKSB7XG4gIHJldHVybiB7XG4gICAgc3RhcnQ6IHtcbiAgICAgIHJvdzogb2Zmc2V0ID8gb2Zmc2V0LmxvY2F0aW9uLnN0YXJ0LnJvdyArIG5vZGUuc3RhcnRQb3NpdGlvbi5yb3cgOiBub2RlLnN0YXJ0UG9zaXRpb24ucm93LFxuICAgICAgY29sdW1uOiBvZmZzZXQgPyBvZmZzZXQubG9jYXRpb24uc3RhcnQuY29sdW1uICsgbm9kZS5zdGFydFBvc2l0aW9uLmNvbHVtbiA6IG5vZGUuc3RhcnRQb3NpdGlvbi5jb2x1bW5cbiAgICB9LFxuICAgIGVuZDoge1xuICAgICAgcm93OiBvZmZzZXQgPyBvZmZzZXQubG9jYXRpb24uZW5kLnJvdyArIG5vZGUuZW5kUG9zaXRpb24ucm93IDogbm9kZS5lbmRQb3NpdGlvbi5yb3csXG4gICAgICBjb2x1bW46IG9mZnNldCA/IG9mZnNldC5sb2NhdGlvbi5lbmQuY29sdW1uICsgbm9kZS5lbmRQb3NpdGlvbi5jb2x1bW4gOiBub2RlLmVuZFBvc2l0aW9uLmNvbHVtblxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21tZW50UGFyc2VyIHtcbiAgc3RhdGljIHBhcnNlKFxuICAgIG5vZGU6IFBhcnNlci5TeW50YXhOb2RlLFxuICAgIHNvdXJjZTogc3RyaW5nLFxuICAgIG9mZnNldD86IHsgbG9jYXRpb246IExvY2F0aW9uLCBwb3NpdGlvbjogUG9zaXRpb24gfSxcbiAgICBjb21tZW50czogSUNvbW1lbnRbXSA9IFtdLFxuICApIHtcbiAgICAvLyBjb25zb2xlLmxvZyhub2RlLnR5cGUpXG4gICAgaWYgKG5vZGUudHlwZSA9PT0gXCJjb21tZW50XCIgJiYgbm9kZS5uZXh0U2libGluZykge1xuICAgICAgY29uc29sZS5sb2cobm9kZS5uZXh0U2libGluZy50eXBlKVxuICAgICAgLy8gY29uc29sZS5sb2coYCR7bm9kZS5uZXh0U2libGluZy50eXBlfSBoYXMgYSBsZWFkaW5nIGNvbW1lbnQuYCk7XG4gICAgICBjb25zdCBuZXh0ID0gbm9kZS5uZXh0U2libGluZztcblxuICAgICAgLy8gY29uc29sZS5sb2coc291cmNlLnN1YnN0cmluZyhuZXh0LnN0YXJ0SW5kZXgsIG5leHQuZW5kSW5kZXgpKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCcnKTtcbiAgICAgIGNvbW1lbnRzLnB1c2goe1xuICAgICAgICBwb3NpdGlvbjogcG9zaXRpb24obm9kZSwgb2Zmc2V0KSxcbiAgICAgICAgbG9jYXRpb246IGxvY2F0aW9uKG5vZGUsIG9mZnNldCksXG4gICAgICAgIG1hcmtkb3duOiAoeGRvYyhzb3VyY2Uuc3Vic3RyaW5nKG5vZGUuc3RhcnRJbmRleCwgbm9kZS5lbmRJbmRleCksIHtcbiAgICAgICAgICB2aXNpdG9yOiB7XG4gICAgICAgICAgICBzaG93Tm9kZVRleHQ6IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH0pKS5wYXJzZSgpLFxuICAgICAgICB0ZXh0OiBzb3VyY2Uuc3Vic3RyaW5nKG5vZGUuc3RhcnRJbmRleCwgbm9kZS5lbmRJbmRleCksXG4gICAgICAgIGNvbnRleHQ6IHtcbiAgICAgICAgICBwb3NpdGlvbjogcG9zaXRpb24obmV4dCwgb2Zmc2V0KSxcbiAgICAgICAgICBsb2NhdGlvbjogbG9jYXRpb24obmV4dCwgb2Zmc2V0KSxcbiAgICAgICAgICB0ZXh0OiBzb3VyY2Uuc3Vic3RyaW5nKG5leHQuc3RhcnRJbmRleCwgbmV4dC5lbmRJbmRleCksXG4gICAgICAgICAgdHlwZTogbmV4dC50eXBlLFxuICAgICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBub2RlLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4gQ29tbWVudFBhcnNlci5wYXJzZShjaGlsZCwgc291cmNlLCBvZmZzZXQsIGNvbW1lbnRzKSk7XG4gICAgcmV0dXJuIGNvbW1lbnRzO1xuICB9XG59Il19