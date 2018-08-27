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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvbWF0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQTs7Ozs7OztHQU9HO0FBQ0gsU0FBd0IsS0FBSyxDQUFDLElBQWdCLEVBQUUsR0FBRyxLQUFlO0lBQ2hFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3JDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QixJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQ3RCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7S0FDRjtJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQVJELHdCQVFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3ludGF4Tm9kZSB9IGZyb20gXCJ0cmVlLXNpdHRlclwiO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciBhIG5vZGUgaXMgYSBjZXJ0YWluIHR5cGUuXG4gKiBgYGBcbiAqIEBwYXJhbSBub2RlOiBTeW50YXhOb2RlIC0gVGhlIG5vZGUgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB0eXBlOiBzdHJpbmcgIC0gVGhlIG5vZGUgdHlwZSB0byBtYXRjaC5cbiAqIEByZXR1cm46IGJvb2xlYW5cbiAqIGBgYFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtYXRjaChub2RlOiBTeW50YXhOb2RlLCAuLi50eXBlczogc3RyaW5nW10pOiBib29sZWFuIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0eXBlcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHR5cGUgPSB0eXBlc1tpXTtcbiAgICBpZiAobm9kZS50eXBlID09PSB0eXBlKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufSJdfQ==