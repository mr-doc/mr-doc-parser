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
    constructor(namespace, options) {
        super(namespace, options);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL2xvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtDQUErQztBQUcvQyxtQ0FBNEI7QUFFNUIsSUFBWSxTQUdYO0FBSEQsV0FBWSxTQUFTO0lBQ2pCLCtFQUF1QixDQUFBO0lBQ3ZCLHlFQUFvQixDQUFBO0FBQ3hCLENBQUMsRUFIVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQUdwQjtBQUVELE1BQXFCLFlBQWEsU0FBUSxrQkFBRztJQUN6QyxZQUFZLFNBQWtCLEVBQUUsT0FBb0I7UUFDaEQsS0FBSyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUU5QixXQUFNLEdBQUcsQ0FBQyxNQUFjLEVBQUUsSUFBZ0IsRUFBRSxLQUFnQixFQUFRLEVBQUU7WUFDbEUsTUFBTSxRQUFRLEdBQUcsZUFBSyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUN0QyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssS0FBSyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztZQUN6RCxNQUFNLFlBQVksR0FBRyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDckgsTUFBTSxPQUFPLEdBQUcsT0FBTyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLFlBQVksRUFBRSxRQUFRLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQztZQUNuRixRQUFRLEtBQUssRUFBRTtnQkFDWCxLQUFLLFNBQVMsQ0FBQyx1QkFBdUI7b0JBQ2xDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLDRCQUE0QixPQUFPLEVBQUUsQ0FBQyxDQUFBO29CQUNsRixNQUFNO2dCQUNWLEtBQUssU0FBUyxDQUFDLG9CQUFvQjtvQkFDL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxxREFBcUQsT0FBTyxFQUFFLENBQUMsQ0FBQTtnQkFDOUU7b0JBQ0ksTUFBTTthQUNiO1FBQ0wsQ0FBQyxDQUFBO0lBZkQsQ0FBQztDQWdCSjtBQW5CRCwrQkFtQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMb2csIExvZ09wdGlvbnMgfSBmcm9tICdtci1kb2MtdXRpbHMnO1xuaW1wb3J0IFNvdXJjZSBmcm9tICcuLi9pbnRlcmZhY2VzL1NvdXJjZSc7XG5pbXBvcnQgeyBTeW50YXhOb2RlIH0gZnJvbSAndHJlZS1zaXR0ZXInO1xuaW1wb3J0IHJhbmdlIGZyb20gJy4vcmFuZ2UnO1xuXG5leHBvcnQgZW51bSBFcnJvclR5cGUge1xuICAgIE5vZGVUeXBlTm90WWV0U3VwcG9ydGVkLFxuICAgIFRyZWVTaXR0ZXJQYXJzZUVycm9yXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcnNlckxvZ2dlciBleHRlbmRzIExvZyB7XG4gICAgY29uc3RydWN0b3IobmFtZXNwYWNlPzogc3RyaW5nLCBvcHRpb25zPzogTG9nT3B0aW9ucykge1xuICAgICAgICBzdXBlcihuYW1lc3BhY2UsIG9wdGlvbnMpO1xuICAgIH1cbiAgICByZXBvcnQgPSAoc291cmNlOiBTb3VyY2UsIG5vZGU6IFN5bnRheE5vZGUsIGVycm9yOiBFcnJvclR5cGUpOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSByYW5nZShub2RlKS5sb2NhdGlvbjtcbiAgICAgICAgY29uc3Qgc2FtZUxpbmUgPSBsb2NhdGlvbi5yb3cuc3RhcnQgPT09IGxvY2F0aW9uLnJvdy5lbmQ7XG4gICAgICAgIGNvbnN0IGdldExpbmVSYW5nZSA9ICgpID0+IHNhbWVMaW5lID8gbG9jYXRpb24ucm93LnN0YXJ0ICsgMSA6IGxvY2F0aW9uLnJvdy5zdGFydCArIDEgKyAnIC0gJyArIGxvY2F0aW9uLnJvdy5lbmQgKyAxO1xuICAgICAgICBjb25zdCBjdWxwcml0ID0gYExpbmUke3NhbWVMaW5lID8gJycgOiAncyd9ICR7Z2V0TGluZVJhbmdlKCl9IGluICcke3NvdXJjZS5wYXRofSdgO1xuICAgICAgICBzd2l0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjYXNlIEVycm9yVHlwZS5Ob2RlVHlwZU5vdFlldFN1cHBvcnRlZDpcbiAgICAgICAgICAgICAgICB0aGlzLmluZm8oYCcke25vZGUudHlwZS5yZXBsYWNlKC9bX10vZywgJyAnKX0nIGlzIG5vdCB5ZXQgc3VwcG9ydGVkOlxcbiR7Y3VscHJpdH1gKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBFcnJvclR5cGUuVHJlZVNpdHRlclBhcnNlRXJyb3I6XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcihgJ3RyZWUtc2l0dGVyJyB3YXMgbm90IGFibGUgdG8gcGFyc2UgdGhlIHByb2dyYW06XFxuJHtjdWxwcml0fWApXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufSJdfQ==