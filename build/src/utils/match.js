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
    for (let i = 0; i < types.length; i++) {
        const type = types[i];
        if (node.type === type) {
            return true;
        }
    }
    return false;
}
exports.default = match;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvbWF0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQTs7Ozs7OztHQU9HO0FBQ0gsU0FBd0IsS0FBSyxDQUFDLElBQWdCLEVBQUUsR0FBRyxLQUFlO0lBQ2hFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3JDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QixJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQ3RCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7S0FDRjtJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQVJELHdCQVFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3ludGF4Tm9kZSB9IGZyb20gXCJ0cmVlLXNpdHRlclwiO1xyXG5cclxuLyoqXHJcbiAqIERldGVybWluZXMgd2hldGhlciBhIG5vZGUgaXMgYSBjZXJ0YWluIHR5cGUuXHJcbiAqIGBgYFxyXG4gKiBAcGFyYW0gbm9kZTogU3ludGF4Tm9kZSAtIFRoZSBub2RlIHRvIGNvbXBhcmUuXHJcbiAqIEBwYXJhbSB0eXBlOiBzdHJpbmcgIC0gVGhlIG5vZGUgdHlwZSB0byBtYXRjaC5cclxuICogQHJldHVybjogYm9vbGVhblxyXG4gKiBgYGBcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1hdGNoKG5vZGU6IFN5bnRheE5vZGUsIC4uLnR5cGVzOiBzdHJpbmdbXSk6IGJvb2xlYW4ge1xyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdHlwZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIGNvbnN0IHR5cGUgPSB0eXBlc1tpXTtcclxuICAgIGlmIChub2RlLnR5cGUgPT09IHR5cGUpIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBmYWxzZTtcclxufSJdfQ==