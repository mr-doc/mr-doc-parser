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
function match(node, ...types) {
    const matches = types.map(type => node && type === node.type);
    return matches.includes(true);
}
exports.default = match;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvbWF0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQTs7Ozs7OztHQU9HO0FBQ0gsU0FBd0IsS0FBSyxDQUFDLElBQWdCLEVBQUUsR0FBRyxLQUFlO0lBQ2hFLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5RCxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUhELHdCQUdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3ludGF4Tm9kZSB9IGZyb20gXCJ0cmVlLXNpdHRlclwiO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciBhIG5vZGUgaXMgYSBjZXJ0YWluIHR5cGUuXG4gKiBgYGBcbiAqIEBwYXJhbSBub2RlOiBTeW50YXhOb2RlIC0gVGhlIG5vZGUgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB0eXBlOiBzdHJpbmcgIC0gVGhlIG5vZGUgdHlwZSB0byBtYXRjaC5cbiAqIEByZXR1cm46IGJvb2xlYW5cbiAqIGBgYFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtYXRjaChub2RlOiBTeW50YXhOb2RlLCAuLi50eXBlczogc3RyaW5nW10pOiBib29sZWFuIHtcbiAgY29uc3QgbWF0Y2hlcyA9IHR5cGVzLm1hcCh0eXBlID0+IG5vZGUgJiYgdHlwZSA9PT0gbm9kZS50eXBlKTtcbiAgcmV0dXJuIG1hdGNoZXMuaW5jbHVkZXModHJ1ZSk7XG59Il19