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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL2xvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtDQUFtQztBQUduQyxtQ0FBNEI7QUFFNUIsSUFBWSxTQUdYO0FBSEQsV0FBWSxTQUFTO0lBQ2pCLCtFQUF1QixDQUFBO0lBQ3ZCLHlFQUFvQixDQUFBO0FBQ3hCLENBQUMsRUFIVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQUdwQjtBQUVELE1BQU0sU0FBVSxTQUFRLGtCQUFHO0lBQTNCOztRQUNJLFdBQU0sR0FBRyxDQUFDLE1BQWMsRUFBRSxJQUFnQixFQUFFLEtBQWdCLEVBQVEsRUFBRTtZQUNsRSxNQUFNLFFBQVEsR0FBRyxlQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDO1lBQ3RDLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxLQUFLLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO1lBQ3pELE1BQU0sWUFBWSxHQUFHLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsS0FBSyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNySCxNQUFNLE9BQU8sR0FBRyxPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksWUFBWSxFQUFFLFFBQVEsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDO1lBQ25GLFFBQVEsS0FBSyxFQUFFO2dCQUNYLEtBQUssU0FBUyxDQUFDLHVCQUF1QjtvQkFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsNEJBQTRCLE9BQU8sRUFBRSxDQUFDLENBQUE7b0JBQ2xGLE1BQU07Z0JBQ1YsS0FBSyxTQUFTLENBQUMsb0JBQW9CO29CQUMvQixJQUFJLENBQUMsS0FBSyxDQUFDLHFEQUFxRCxPQUFPLEVBQUUsQ0FBQyxDQUFBO2dCQUM5RTtvQkFDSSxNQUFNO2FBQ2I7UUFDTCxDQUFDLENBQUE7SUFDTCxDQUFDO0NBQUE7QUFHRCxNQUFNLEdBQUcsR0FBRyxJQUFJLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBRTVDLGtCQUFlLEdBQUcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExvZyB9IGZyb20gJ21yLWRvYy11dGlscyc7XG5pbXBvcnQgU291cmNlIGZyb20gJy4uL2ludGVyZmFjZXMvU291cmNlJztcbmltcG9ydCB7IFN5bnRheE5vZGUgfSBmcm9tICd0cmVlLXNpdHRlcic7XG5pbXBvcnQgcmFuZ2UgZnJvbSAnLi9yYW5nZSc7XG5cbmV4cG9ydCBlbnVtIEVycm9yVHlwZSB7XG4gICAgTm9kZVR5cGVOb3RZZXRTdXBwb3J0ZWQsXG4gICAgVHJlZVNpdHRlclBhcnNlRXJyb3Jcbn1cblxuY2xhc3MgUGFyc2VyTG9nIGV4dGVuZHMgTG9nIHtcbiAgICByZXBvcnQgPSAoc291cmNlOiBTb3VyY2UsIG5vZGU6IFN5bnRheE5vZGUsIGVycm9yOiBFcnJvclR5cGUpOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSByYW5nZShub2RlKS5sb2NhdGlvbjtcbiAgICAgICAgY29uc3Qgc2FtZUxpbmUgPSBsb2NhdGlvbi5yb3cuc3RhcnQgPT09IGxvY2F0aW9uLnJvdy5lbmQ7XG4gICAgICAgIGNvbnN0IGdldExpbmVSYW5nZSA9ICgpID0+IHNhbWVMaW5lID8gbG9jYXRpb24ucm93LnN0YXJ0ICsgMSA6IGxvY2F0aW9uLnJvdy5zdGFydCArIDEgKyAnIC0gJyArIGxvY2F0aW9uLnJvdy5lbmQgKyAxO1xuICAgICAgICBjb25zdCBjdWxwcml0ID0gYExpbmUke3NhbWVMaW5lID8gJycgOiAncyd9ICR7Z2V0TGluZVJhbmdlKCl9IGluICcke3NvdXJjZS5wYXRofSdgO1xuICAgICAgICBzd2l0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjYXNlIEVycm9yVHlwZS5Ob2RlVHlwZU5vdFlldFN1cHBvcnRlZDpcbiAgICAgICAgICAgICAgICB0aGlzLmluZm8oYCcke25vZGUudHlwZS5yZXBsYWNlKC9bX10vZywgJyAnKX0nIGlzIG5vdCB5ZXQgc3VwcG9ydGVkOlxcbiR7Y3VscHJpdH1gKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBFcnJvclR5cGUuVHJlZVNpdHRlclBhcnNlRXJyb3I6XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcihgJ3RyZWUtc2l0dGVyJyB3YXMgbm90IGFibGUgdG8gcGFyc2UgdGhlIHByb2dyYW06XFxuJHtjdWxwcml0fWApXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbmNvbnN0IGxvZyA9IG5ldyBQYXJzZXJMb2coJ21yLWRvYzo6cGFyc2VyJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGxvZzsiXX0=