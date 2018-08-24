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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvcmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSxTQUF3QixLQUFLLENBQUMsSUFBdUI7SUFDbkQsT0FBTztRQUNMLFFBQVEsRUFBRTtZQUNSLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVTtZQUN0QixHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVE7U0FDbkI7UUFDRCxRQUFRLEVBQUU7WUFDUixHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFO1lBQ2pFLE1BQU0sRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUU7U0FDM0U7S0FDRixDQUFBO0FBQ0gsQ0FBQztBQVhELHdCQVdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUGFyc2VyIGZyb20gJ3RyZWUtc2l0dGVyJztcclxuaW1wb3J0IFRleHRSYW5nZSBmcm9tICcuLi9pbnRlcmZhY2VzL1RleHRSYW5nZSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByYW5nZShub2RlOiBQYXJzZXIuU3ludGF4Tm9kZSk6IFRleHRSYW5nZSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHBvc2l0aW9uOiB7XHJcbiAgICAgIHN0YXJ0OiBub2RlLnN0YXJ0SW5kZXgsXHJcbiAgICAgIGVuZDogbm9kZS5lbmRJbmRleFxyXG4gICAgfSxcclxuICAgIGxvY2F0aW9uOiB7XHJcbiAgICAgIHJvdzogeyBzdGFydDogbm9kZS5zdGFydFBvc2l0aW9uLnJvdywgZW5kOiBub2RlLmVuZFBvc2l0aW9uLnJvdyB9LFxyXG4gICAgICBjb2x1bW46IHsgc3RhcnQ6IG5vZGUuc3RhcnRQb3NpdGlvbi5jb2x1bW4sIGVuZDogbm9kZS5lbmRQb3NpdGlvbi5jb2x1bW4gfVxyXG4gICAgfVxyXG4gIH1cclxufSJdfQ==