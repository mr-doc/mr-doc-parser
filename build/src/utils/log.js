"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mr_doc_utils_1 = require("mr-doc-utils");
const range_1 = require("./range");
var ErrorType;
(function (ErrorType) {
    ErrorType[ErrorType["NodeTypeNotSupported"] = 0] = "NodeTypeNotSupported";
    ErrorType[ErrorType["TreeSitterParseError"] = 1] = "TreeSitterParseError";
})(ErrorType = exports.ErrorType || (exports.ErrorType = {}));
class ParserLog extends mr_doc_utils_1.Log {
    constructor() {
        super(...arguments);
        this.report = (source, node, error) => {
            const location = range_1.default(node).location;
            const culprit = `(${location.row.start + 1}:${location.column.start}) in ${source.name} from ${source.path}`;
            switch (error) {
                case ErrorType.NodeTypeNotSupported:
                    this.info(`'${node.type.replace(/[_]/g, ' ')}' is not supported yet:\n${culprit}`);
                    break;
                case ErrorType.TreeSitterParseError:
                    this.error(`'tree-sitter' was not able to parse the program:\n${culprit}`);
                default:
                    break;
            }
        };
    }
}
exports.ParserLog = ParserLog;
const log = new ParserLog('mr-doc::parser');
exports.default = log;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL2xvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtDQUFtQztBQUduQyxtQ0FBNEI7QUFFNUIsSUFBWSxTQUdYO0FBSEQsV0FBWSxTQUFTO0lBQ2pCLHlFQUFvQixDQUFBO0lBQ3BCLHlFQUFvQixDQUFBO0FBQ3hCLENBQUMsRUFIVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQUdwQjtBQUVELE1BQWEsU0FBVSxTQUFRLGtCQUFHO0lBQWxDOztRQUNJLFdBQU0sR0FBRyxDQUFDLE1BQWEsRUFBRSxJQUFnQixFQUFFLEtBQWdCLEVBQVEsRUFBRTtZQUNqRSxNQUFNLFFBQVEsR0FBRyxlQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDO1lBQ3RDLE1BQU0sT0FBTyxHQUFHLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxRQUFRLE1BQU0sQ0FBQyxJQUFJLFNBQVMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzdHLFFBQVEsS0FBSyxFQUFFO2dCQUNYLEtBQUssU0FBUyxDQUFDLG9CQUFvQjtvQkFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsNEJBQTRCLE9BQU8sRUFBRSxDQUFDLENBQUE7b0JBQ2xGLE1BQU07Z0JBQ1YsS0FBSyxTQUFTLENBQUMsb0JBQW9CO29CQUMvQixJQUFJLENBQUMsS0FBSyxDQUFDLHFEQUFxRCxPQUFPLEVBQUUsQ0FBQyxDQUFBO2dCQUM5RTtvQkFDSSxNQUFNO2FBQ2I7UUFDTCxDQUFDLENBQUE7SUFDTCxDQUFDO0NBQUE7QUFkRCw4QkFjQztBQUdELE1BQU0sR0FBRyxHQUFHLElBQUksU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFFNUMsa0JBQWUsR0FBRyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTG9nIH0gZnJvbSAnbXItZG9jLXV0aWxzJztcclxuaW1wb3J0IElGaWxlIGZyb20gJy4uL2ludGVyZmFjZXMvSUZpbGUnO1xyXG5pbXBvcnQgeyBTeW50YXhOb2RlIH0gZnJvbSAndHJlZS1zaXR0ZXInO1xyXG5pbXBvcnQgcmFuZ2UgZnJvbSAnLi9yYW5nZSc7XHJcblxyXG5leHBvcnQgZW51bSBFcnJvclR5cGUge1xyXG4gICAgTm9kZVR5cGVOb3RTdXBwb3J0ZWQsXHJcbiAgICBUcmVlU2l0dGVyUGFyc2VFcnJvclxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgUGFyc2VyTG9nIGV4dGVuZHMgTG9nIHtcclxuICAgIHJlcG9ydCA9IChzb3VyY2U6IElGaWxlLCBub2RlOiBTeW50YXhOb2RlLCBlcnJvcjogRXJyb3JUeXBlKTogdm9pZCA9PiB7XHJcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSByYW5nZShub2RlKS5sb2NhdGlvbjtcclxuICAgICAgICBjb25zdCBjdWxwcml0ID0gYCgke2xvY2F0aW9uLnJvdy5zdGFydCArIDF9OiR7bG9jYXRpb24uY29sdW1uLnN0YXJ0fSkgaW4gJHtzb3VyY2UubmFtZX0gZnJvbSAke3NvdXJjZS5wYXRofWA7XHJcbiAgICAgICAgc3dpdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjYXNlIEVycm9yVHlwZS5Ob2RlVHlwZU5vdFN1cHBvcnRlZDpcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5mbyhgJyR7bm9kZS50eXBlLnJlcGxhY2UoL1tfXS9nLCAnICcpfScgaXMgbm90IHN1cHBvcnRlZCB5ZXQ6XFxuJHtjdWxwcml0fWApXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBFcnJvclR5cGUuVHJlZVNpdHRlclBhcnNlRXJyb3I6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9yKGAndHJlZS1zaXR0ZXInIHdhcyBub3QgYWJsZSB0byBwYXJzZSB0aGUgcHJvZ3JhbTpcXG4ke2N1bHByaXR9YClcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuXHJcbmNvbnN0IGxvZyA9IG5ldyBQYXJzZXJMb2coJ21yLWRvYzo6cGFyc2VyJyk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBsb2c7Il19