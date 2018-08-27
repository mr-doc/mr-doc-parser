"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mr_doc_utils_1 = require("mr-doc-utils");
const range_1 = require("./range");
var ErrorType;
(function (ErrorType) {
    ErrorType[ErrorType["NodeTypeNotYetSupported"] = 0] = "NodeTypeNotYetSupported";
    ErrorType[ErrorType["TreeSitterParseError"] = 1] = "TreeSitterParseError";
})(ErrorType = exports.ErrorType || (exports.ErrorType = {}));
class ParserLogger extends mr_doc_utils_1.Log {
    constructor(options) {
        super('mr-doc::parser', options);
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
exports.default = ParserLogger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL2xvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtDQUErQztBQUcvQyxtQ0FBNEI7QUFFNUIsSUFBWSxTQUdYO0FBSEQsV0FBWSxTQUFTO0lBQ2pCLCtFQUF1QixDQUFBO0lBQ3ZCLHlFQUFvQixDQUFBO0FBQ3hCLENBQUMsRUFIVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQUdwQjtBQUVELE1BQXFCLFlBQWEsU0FBUSxrQkFBRztJQUN6QyxZQUFZLE9BQW9CO1FBQzVCLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVyQyxXQUFNLEdBQUcsQ0FBQyxNQUFjLEVBQUUsSUFBZ0IsRUFBRSxLQUFnQixFQUFRLEVBQUU7WUFDbEUsTUFBTSxRQUFRLEdBQUcsZUFBSyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUN0QyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssS0FBSyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztZQUN6RCxNQUFNLFlBQVksR0FBRyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDckgsTUFBTSxPQUFPLEdBQUcsT0FBTyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLFlBQVksRUFBRSxRQUFRLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQztZQUNuRixRQUFRLEtBQUssRUFBRTtnQkFDWCxLQUFLLFNBQVMsQ0FBQyx1QkFBdUI7b0JBQ2xDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLDRCQUE0QixPQUFPLEVBQUUsQ0FBQyxDQUFBO29CQUNsRixNQUFNO2dCQUNWLEtBQUssU0FBUyxDQUFDLG9CQUFvQjtvQkFDL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxxREFBcUQsT0FBTyxFQUFFLENBQUMsQ0FBQTtnQkFDOUU7b0JBQ0ksTUFBTTthQUNiO1FBQ0wsQ0FBQyxDQUFBO0lBZkQsQ0FBQztDQWdCSjtBQW5CRCwrQkFtQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMb2csIExvZ09wdGlvbnMgfSBmcm9tICdtci1kb2MtdXRpbHMnO1xuaW1wb3J0IFNvdXJjZSBmcm9tICcuLi9pbnRlcmZhY2VzL1NvdXJjZSc7XG5pbXBvcnQgeyBTeW50YXhOb2RlIH0gZnJvbSAndHJlZS1zaXR0ZXInO1xuaW1wb3J0IHJhbmdlIGZyb20gJy4vcmFuZ2UnO1xuXG5leHBvcnQgZW51bSBFcnJvclR5cGUge1xuICAgIE5vZGVUeXBlTm90WWV0U3VwcG9ydGVkLFxuICAgIFRyZWVTaXR0ZXJQYXJzZUVycm9yXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcnNlckxvZ2dlciBleHRlbmRzIExvZyB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucz86IExvZ09wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIoJ21yLWRvYzo6cGFyc2VyJywgb3B0aW9ucyk7XG4gICAgfVxuICAgIHJlcG9ydCA9IChzb3VyY2U6IFNvdXJjZSwgbm9kZTogU3ludGF4Tm9kZSwgZXJyb3I6IEVycm9yVHlwZSk6IHZvaWQgPT4ge1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHJhbmdlKG5vZGUpLmxvY2F0aW9uO1xuICAgICAgICBjb25zdCBzYW1lTGluZSA9IGxvY2F0aW9uLnJvdy5zdGFydCA9PT0gbG9jYXRpb24ucm93LmVuZDtcbiAgICAgICAgY29uc3QgZ2V0TGluZVJhbmdlID0gKCkgPT4gc2FtZUxpbmUgPyBsb2NhdGlvbi5yb3cuc3RhcnQgKyAxIDogbG9jYXRpb24ucm93LnN0YXJ0ICsgMSArICcgLSAnICsgbG9jYXRpb24ucm93LmVuZCArIDE7XG4gICAgICAgIGNvbnN0IGN1bHByaXQgPSBgTGluZSR7c2FtZUxpbmUgPyAnJyA6ICdzJ30gJHtnZXRMaW5lUmFuZ2UoKX0gaW4gJyR7c291cmNlLnBhdGh9J2A7XG4gICAgICAgIHN3aXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNhc2UgRXJyb3JUeXBlLk5vZGVUeXBlTm90WWV0U3VwcG9ydGVkOlxuICAgICAgICAgICAgICAgIHRoaXMuaW5mbyhgJyR7bm9kZS50eXBlLnJlcGxhY2UoL1tfXS9nLCAnICcpfScgaXMgbm90IHlldCBzdXBwb3J0ZWQ6XFxuJHtjdWxwcml0fWApXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEVycm9yVHlwZS5UcmVlU2l0dGVyUGFyc2VFcnJvcjpcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9yKGAndHJlZS1zaXR0ZXInIHdhcyBub3QgYWJsZSB0byBwYXJzZSB0aGUgcHJvZ3JhbTpcXG4ke2N1bHByaXR9YClcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59Il19