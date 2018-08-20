"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Determines whether a node is a certain type.
 * ```
 * @param node: SyntaxNode - The node to compare.
 * @param type: string  - The node type to match.
 * @return: boolean
 * ```
 */
function match(node, type) {
    return node && node.type === type;
}
exports.default = match;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvbWF0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQTs7Ozs7OztHQU9HO0FBQ0gsU0FBd0IsS0FBSyxDQUFDLElBQWdCLEVBQUUsSUFBWTtJQUMxRCxPQUFPLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQztBQUNwQyxDQUFDO0FBRkQsd0JBRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTeW50YXhOb2RlIH0gZnJvbSBcInRyZWUtc2l0dGVyXCI7XHJcblxyXG4vKipcclxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIGEgbm9kZSBpcyBhIGNlcnRhaW4gdHlwZS5cclxuICogYGBgXHJcbiAqIEBwYXJhbSBub2RlOiBTeW50YXhOb2RlIC0gVGhlIG5vZGUgdG8gY29tcGFyZS5cclxuICogQHBhcmFtIHR5cGU6IHN0cmluZyAgLSBUaGUgbm9kZSB0eXBlIHRvIG1hdGNoLlxyXG4gKiBAcmV0dXJuOiBib29sZWFuXHJcbiAqIGBgYFxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbWF0Y2gobm9kZTogU3ludGF4Tm9kZSwgdHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgcmV0dXJuIG5vZGUgJiYgbm9kZS50eXBlID09PSB0eXBlO1xyXG59Il19