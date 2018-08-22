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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvbWF0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQTs7Ozs7OztHQU9HO0FBQ0gsU0FBd0IsS0FBSyxDQUFDLElBQWdCLEVBQUUsR0FBRyxLQUFlO0lBQ2hFLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5RCxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUhELHdCQUdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3ludGF4Tm9kZSB9IGZyb20gXCJ0cmVlLXNpdHRlclwiO1xyXG5cclxuLyoqXHJcbiAqIERldGVybWluZXMgd2hldGhlciBhIG5vZGUgaXMgYSBjZXJ0YWluIHR5cGUuXHJcbiAqIGBgYFxyXG4gKiBAcGFyYW0gbm9kZTogU3ludGF4Tm9kZSAtIFRoZSBub2RlIHRvIGNvbXBhcmUuXHJcbiAqIEBwYXJhbSB0eXBlOiBzdHJpbmcgIC0gVGhlIG5vZGUgdHlwZSB0byBtYXRjaC5cclxuICogQHJldHVybjogYm9vbGVhblxyXG4gKiBgYGBcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1hdGNoKG5vZGU6IFN5bnRheE5vZGUsIC4uLnR5cGVzOiBzdHJpbmdbXSk6IGJvb2xlYW4ge1xyXG4gIGNvbnN0IG1hdGNoZXMgPSB0eXBlcy5tYXAodHlwZSA9PiBub2RlICYmIHR5cGUgPT09IG5vZGUudHlwZSk7XHJcbiAgcmV0dXJuIG1hdGNoZXMuaW5jbHVkZXModHJ1ZSk7XHJcbn0iXX0=