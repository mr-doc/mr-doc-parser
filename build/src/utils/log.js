"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mr_doc_utils_1 = require("mr-doc-utils");
const range_1 = require("./range");
var ErrorType;
(function (ErrorType) {
    ErrorType[ErrorType["NodeTypeNotYetSupported"] = 0] = "NodeTypeNotYetSupported";
    ErrorType[ErrorType["TreeSitterParseError"] = 1] = "TreeSitterParseError";
})(ErrorType = exports.ErrorType || (exports.ErrorType = {}));
class ParserLog extends mr_doc_utils_1.Log {
    constructor() {
        super(...arguments);
        this.report = (source, node, error) => {
            const location = range_1.default(node).location;
            const sameLine = location.row.start === location.row.end;
            const getLineRange = () => sameLine ? location.row.start + 1 : location.row.start + 1 + ' - ' + location.row.end + 1;
            const culprit = `Line${sameLine ? '' : 's'} ${getLineRange()} in '${source.path}'`;
            switch (error) {
                case ErrorType.NodeTypeNotYetSupported:
                    this.info(`'${node.type.replace(/[_]/g, ' ')}' is not yet supported:\n${culprit}`);
                    break;
                case ErrorType.TreeSitterParseError:
                    this.error(`'tree-sitter' was not able to parse the program:\n${culprit}`);
                default:
                    break;
            }
        };
    }
}
const log = new ParserLog('mr-doc::parser');
exports.default = log;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL2xvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtDQUFtQztBQUduQyxtQ0FBNEI7QUFFNUIsSUFBWSxTQUdYO0FBSEQsV0FBWSxTQUFTO0lBQ2pCLCtFQUF1QixDQUFBO0lBQ3ZCLHlFQUFvQixDQUFBO0FBQ3hCLENBQUMsRUFIVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQUdwQjtBQUVELE1BQU0sU0FBVSxTQUFRLGtCQUFHO0lBQTNCOztRQUNJLFdBQU0sR0FBRyxDQUFDLE1BQWMsRUFBRSxJQUFnQixFQUFFLEtBQWdCLEVBQVEsRUFBRTtZQUNsRSxNQUFNLFFBQVEsR0FBRyxlQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDO1lBQ3RDLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxLQUFLLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO1lBQ3pELE1BQU0sWUFBWSxHQUFHLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsS0FBSyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNySCxNQUFNLE9BQU8sR0FBRyxPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksWUFBWSxFQUFFLFFBQVEsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDO1lBQ25GLFFBQVEsS0FBSyxFQUFFO2dCQUNYLEtBQUssU0FBUyxDQUFDLHVCQUF1QjtvQkFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsNEJBQTRCLE9BQU8sRUFBRSxDQUFDLENBQUE7b0JBQ2xGLE1BQU07Z0JBQ1YsS0FBSyxTQUFTLENBQUMsb0JBQW9CO29CQUMvQixJQUFJLENBQUMsS0FBSyxDQUFDLHFEQUFxRCxPQUFPLEVBQUUsQ0FBQyxDQUFBO2dCQUM5RTtvQkFDSSxNQUFNO2FBQ2I7UUFDTCxDQUFDLENBQUE7SUFDTCxDQUFDO0NBQUE7QUFHRCxNQUFNLEdBQUcsR0FBRyxJQUFJLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBRTVDLGtCQUFlLEdBQUcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExvZyB9IGZyb20gJ21yLWRvYy11dGlscyc7XHJcbmltcG9ydCBTb3VyY2UgZnJvbSAnLi4vaW50ZXJmYWNlcy9Tb3VyY2UnO1xyXG5pbXBvcnQgeyBTeW50YXhOb2RlIH0gZnJvbSAndHJlZS1zaXR0ZXInO1xyXG5pbXBvcnQgcmFuZ2UgZnJvbSAnLi9yYW5nZSc7XHJcblxyXG5leHBvcnQgZW51bSBFcnJvclR5cGUge1xyXG4gICAgTm9kZVR5cGVOb3RZZXRTdXBwb3J0ZWQsXHJcbiAgICBUcmVlU2l0dGVyUGFyc2VFcnJvclxyXG59XHJcblxyXG5jbGFzcyBQYXJzZXJMb2cgZXh0ZW5kcyBMb2cge1xyXG4gICAgcmVwb3J0ID0gKHNvdXJjZTogU291cmNlLCBub2RlOiBTeW50YXhOb2RlLCBlcnJvcjogRXJyb3JUeXBlKTogdm9pZCA9PiB7XHJcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSByYW5nZShub2RlKS5sb2NhdGlvbjtcclxuICAgICAgICBjb25zdCBzYW1lTGluZSA9IGxvY2F0aW9uLnJvdy5zdGFydCA9PT0gbG9jYXRpb24ucm93LmVuZDtcclxuICAgICAgICBjb25zdCBnZXRMaW5lUmFuZ2UgPSAoKSA9PiBzYW1lTGluZSA/IGxvY2F0aW9uLnJvdy5zdGFydCArIDEgOiBsb2NhdGlvbi5yb3cuc3RhcnQgKyAxICsgJyAtICcgKyBsb2NhdGlvbi5yb3cuZW5kICsgMTtcclxuICAgICAgICBjb25zdCBjdWxwcml0ID0gYExpbmUke3NhbWVMaW5lID8gJycgOiAncyd9ICR7Z2V0TGluZVJhbmdlKCl9IGluICcke3NvdXJjZS5wYXRofSdgO1xyXG4gICAgICAgIHN3aXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY2FzZSBFcnJvclR5cGUuTm9kZVR5cGVOb3RZZXRTdXBwb3J0ZWQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluZm8oYCcke25vZGUudHlwZS5yZXBsYWNlKC9bX10vZywgJyAnKX0nIGlzIG5vdCB5ZXQgc3VwcG9ydGVkOlxcbiR7Y3VscHJpdH1gKVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRXJyb3JUeXBlLlRyZWVTaXR0ZXJQYXJzZUVycm9yOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcihgJ3RyZWUtc2l0dGVyJyB3YXMgbm90IGFibGUgdG8gcGFyc2UgdGhlIHByb2dyYW06XFxuJHtjdWxwcml0fWApXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5jb25zdCBsb2cgPSBuZXcgUGFyc2VyTG9nKCdtci1kb2M6OnBhcnNlcicpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgbG9nOyJdfQ==