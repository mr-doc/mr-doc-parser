"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function range(node) {
    return {
        position: {
            start: node.startIndex,
            end: node.endIndex
        },
        location: {
            row: { start: node.startPosition.row, end: node.endPosition.row },
            column: { start: node.startPosition.column, end: node.endPosition.column }
        }
    };
}
exports.default = range;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvcmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSxTQUF3QixLQUFLLENBQUMsSUFBdUI7SUFDbkQsT0FBTztRQUNMLFFBQVEsRUFBRTtZQUNSLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVTtZQUN0QixHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVE7U0FDbkI7UUFDRCxRQUFRLEVBQUU7WUFDUixHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFO1lBQ2pFLE1BQU0sRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUU7U0FDM0U7S0FDRixDQUFBO0FBQ0gsQ0FBQztBQVhELHdCQVdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUGFyc2VyIGZyb20gJ3RyZWUtc2l0dGVyJztcbmltcG9ydCBUZXh0UmFuZ2UgZnJvbSAnLi4vaW50ZXJmYWNlcy9UZXh0UmFuZ2UnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByYW5nZShub2RlOiBQYXJzZXIuU3ludGF4Tm9kZSk6IFRleHRSYW5nZSB7XG4gIHJldHVybiB7XG4gICAgcG9zaXRpb246IHtcbiAgICAgIHN0YXJ0OiBub2RlLnN0YXJ0SW5kZXgsXG4gICAgICBlbmQ6IG5vZGUuZW5kSW5kZXhcbiAgICB9LFxuICAgIGxvY2F0aW9uOiB7XG4gICAgICByb3c6IHsgc3RhcnQ6IG5vZGUuc3RhcnRQb3NpdGlvbi5yb3csIGVuZDogbm9kZS5lbmRQb3NpdGlvbi5yb3cgfSxcbiAgICAgIGNvbHVtbjogeyBzdGFydDogbm9kZS5zdGFydFBvc2l0aW9uLmNvbHVtbiwgZW5kOiBub2RlLmVuZFBvc2l0aW9uLmNvbHVtbiB9XG4gICAgfVxuICB9XG59Il19