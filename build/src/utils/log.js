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
            const getRange = () => sameLine ? location.row.start + 1 : location.row.start + 1 + ' - ' + location.row.end + 1;
            const culprit = `Line${sameLine ? '' : 's'} ${getRange()} in '${source.path}${source.name}'`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL2xvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtDQUFtQztBQUduQyxtQ0FBNEI7QUFFNUIsSUFBWSxTQUdYO0FBSEQsV0FBWSxTQUFTO0lBQ2pCLCtFQUF1QixDQUFBO0lBQ3ZCLHlFQUFvQixDQUFBO0FBQ3hCLENBQUMsRUFIVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQUdwQjtBQUVELE1BQU0sU0FBVSxTQUFRLGtCQUFHO0lBQTNCOztRQUNJLFdBQU0sR0FBRyxDQUFDLE1BQWMsRUFBRSxJQUFnQixFQUFFLEtBQWdCLEVBQVEsRUFBRTtZQUNsRSxNQUFNLFFBQVEsR0FBRyxlQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDO1lBQ3RDLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxLQUFLLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO1lBQ3pELE1BQU0sUUFBUSxHQUFHLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsS0FBSyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNqSCxNQUFNLE9BQU8sR0FBRyxPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksUUFBUSxFQUFFLFFBQVEsTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUM7WUFDN0YsUUFBUSxLQUFLLEVBQUU7Z0JBQ1gsS0FBSyxTQUFTLENBQUMsdUJBQXVCO29CQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyw0QkFBNEIsT0FBTyxFQUFFLENBQUMsQ0FBQTtvQkFDbEYsTUFBTTtnQkFDVixLQUFLLFNBQVMsQ0FBQyxvQkFBb0I7b0JBQy9CLElBQUksQ0FBQyxLQUFLLENBQUMscURBQXFELE9BQU8sRUFBRSxDQUFDLENBQUE7Z0JBQzlFO29CQUNJLE1BQU07YUFDYjtRQUNMLENBQUMsQ0FBQTtJQUNMLENBQUM7Q0FBQTtBQUdELE1BQU0sR0FBRyxHQUFHLElBQUksU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFFNUMsa0JBQWUsR0FBRyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTG9nIH0gZnJvbSAnbXItZG9jLXV0aWxzJztcbmltcG9ydCBTb3VyY2UgZnJvbSAnLi4vaW50ZXJmYWNlcy9Tb3VyY2UnO1xuaW1wb3J0IHsgU3ludGF4Tm9kZSB9IGZyb20gJ3RyZWUtc2l0dGVyJztcbmltcG9ydCByYW5nZSBmcm9tICcuL3JhbmdlJztcblxuZXhwb3J0IGVudW0gRXJyb3JUeXBlIHtcbiAgICBOb2RlVHlwZU5vdFlldFN1cHBvcnRlZCxcbiAgICBUcmVlU2l0dGVyUGFyc2VFcnJvclxufVxuXG5jbGFzcyBQYXJzZXJMb2cgZXh0ZW5kcyBMb2cge1xuICAgIHJlcG9ydCA9IChzb3VyY2U6IFNvdXJjZSwgbm9kZTogU3ludGF4Tm9kZSwgZXJyb3I6IEVycm9yVHlwZSk6IHZvaWQgPT4ge1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHJhbmdlKG5vZGUpLmxvY2F0aW9uO1xuICAgICAgICBjb25zdCBzYW1lTGluZSA9IGxvY2F0aW9uLnJvdy5zdGFydCA9PT0gbG9jYXRpb24ucm93LmVuZDtcbiAgICAgICAgY29uc3QgZ2V0UmFuZ2UgPSAoKSA9PiBzYW1lTGluZSA/IGxvY2F0aW9uLnJvdy5zdGFydCArIDEgOiBsb2NhdGlvbi5yb3cuc3RhcnQgKyAxICsgJyAtICcgKyBsb2NhdGlvbi5yb3cuZW5kICsgMTtcbiAgICAgICAgY29uc3QgY3VscHJpdCA9IGBMaW5lJHtzYW1lTGluZSA/ICcnIDogJ3MnfSAke2dldFJhbmdlKCl9IGluICcke3NvdXJjZS5wYXRofSR7c291cmNlLm5hbWV9J2A7XG4gICAgICAgIHN3aXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNhc2UgRXJyb3JUeXBlLk5vZGVUeXBlTm90WWV0U3VwcG9ydGVkOlxuICAgICAgICAgICAgICAgIHRoaXMuaW5mbyhgJyR7bm9kZS50eXBlLnJlcGxhY2UoL1tfXS9nLCAnICcpfScgaXMgbm90IHlldCBzdXBwb3J0ZWQ6XFxuJHtjdWxwcml0fWApXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEVycm9yVHlwZS5UcmVlU2l0dGVyUGFyc2VFcnJvcjpcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9yKGAndHJlZS1zaXR0ZXInIHdhcyBub3QgYWJsZSB0byBwYXJzZSB0aGUgcHJvZ3JhbTpcXG4ke2N1bHByaXR9YClcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuY29uc3QgbG9nID0gbmV3IFBhcnNlckxvZygnbXItZG9jOjpwYXJzZXInKTtcblxuZXhwb3J0IGRlZmF1bHQgbG9nOyJdfQ==