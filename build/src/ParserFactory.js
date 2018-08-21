"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const javascript_1 = require("./lang/javascript");
const typescript_1 = require("./lang/typescript");
class ParserFactory {
    constructor(file, options = {}) {
        this.options = {
            language: 'JavaScript'
        };
        this.getParser = () => {
            switch (this.options.language.toLowerCase()) {
                case 'js':
                case 'javascript':
                    return new javascript_1.default(this.file, this.options);
                case 'ts':
                case 'typescript':
                    return new typescript_1.default(this.file, this.options);
                default:
                    console.log(`[mr-doc]: No parser for ${this.options.language} exists.`);
                    break;
            }
        };
        this.file = file;
        Object.assign(this.options, options);
    }
}
exports.default = ParserFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFyc2VyRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9QYXJzZXJGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsa0RBQWlEO0FBQ2pELGtEQUFpRDtBQUVqRCxNQUFxQixhQUFhO0lBS2hDLFlBQVksSUFBWSxFQUFFLFVBQWUsRUFBRTtRQUhuQyxZQUFPLEdBQUc7WUFDaEIsUUFBUSxFQUFFLFlBQVk7U0FDdkIsQ0FBQTtRQU1ELGNBQVMsR0FBRyxHQUFZLEVBQUU7WUFDeEIsUUFBUSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDM0MsS0FBSyxJQUFJLENBQUM7Z0JBQ1YsS0FBSyxZQUFZO29CQUNmLE9BQU8sSUFBSSxvQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdkQsS0FBSyxJQUFJLENBQUM7Z0JBQ1YsS0FBSyxZQUFZO29CQUNmLE9BQU8sSUFBSSxvQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdkQ7b0JBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLFVBQVUsQ0FBQyxDQUFBO29CQUNyRSxNQUFNO2FBQ1Q7UUFDSCxDQUFDLENBQUE7UUFoQkMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0lBQ3RDLENBQUM7Q0FnQkY7QUF4QkQsZ0NBd0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNvdXJjZSBmcm9tIFwiLi9pbnRlcmZhY2VzL1NvdXJjZVwiO1xuaW1wb3J0IElQYXJzZXIgZnJvbSBcIi4vaW50ZXJmYWNlcy9JUGFyc2VyXCI7XG5pbXBvcnQgSmF2YVNjcmlwdFBhcnNlciBmcm9tIFwiLi9sYW5nL2phdmFzY3JpcHRcIjtcbmltcG9ydCBUeXBlU2NyaXB0UGFyc2VyIGZyb20gJy4vbGFuZy90eXBlc2NyaXB0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFyc2VyRmFjdG9yeSB7XG4gIHByaXZhdGUgZmlsZTogU291cmNlXG4gIHByaXZhdGUgb3B0aW9ucyA9IHtcbiAgICBsYW5ndWFnZTogJ0phdmFTY3JpcHQnXG4gIH1cbiAgY29uc3RydWN0b3IoZmlsZTogU291cmNlLCBvcHRpb25zOiBhbnkgPSB7fSkge1xuICAgIHRoaXMuZmlsZSA9IGZpbGU7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLm9wdGlvbnMsIG9wdGlvbnMpXG4gIH1cblxuICBnZXRQYXJzZXIgPSAoKTogSVBhcnNlciA9PiB7XG4gICAgc3dpdGNoICh0aGlzLm9wdGlvbnMubGFuZ3VhZ2UudG9Mb3dlckNhc2UoKSkge1xuICAgICAgY2FzZSAnanMnOlxuICAgICAgY2FzZSAnamF2YXNjcmlwdCc6XG4gICAgICAgIHJldHVybiBuZXcgSmF2YVNjcmlwdFBhcnNlcih0aGlzLmZpbGUsIHRoaXMub3B0aW9ucyk7XG4gICAgICBjYXNlICd0cyc6XG4gICAgICBjYXNlICd0eXBlc2NyaXB0JzpcbiAgICAgICAgcmV0dXJuIG5ldyBUeXBlU2NyaXB0UGFyc2VyKHRoaXMuZmlsZSwgdGhpcy5vcHRpb25zKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICBjb25zb2xlLmxvZyhgW21yLWRvY106IE5vIHBhcnNlciBmb3IgJHt0aGlzLm9wdGlvbnMubGFuZ3VhZ2V9IGV4aXN0cy5gKVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxufSJdfQ==