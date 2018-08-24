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
                    return new javascript_1.default(this.source, this.options);
                case 'ts':
                case 'typescript':
                    return new typescript_1.default(this.source, this.options);
                default:
                    console.log(`[mr-doc]: No parser for ${this.options.language} exists.`);
                    break;
            }
        };
        this.source = file;
        Object.assign(this.options, options);
    }
}
exports.default = ParserFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFyc2VyRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9QYXJzZXJGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esa0RBQWlEO0FBQ2pELGtEQUFpRDtBQUdqRCxNQUFxQixhQUFhO0lBS2hDLFlBQVksSUFBWSxFQUFFLFVBQWUsRUFBRTtRQUhuQyxZQUFPLEdBQUc7WUFDaEIsUUFBUSxFQUFFLFlBQVk7U0FDdkIsQ0FBQTtRQU1ELGNBQVMsR0FBRyxHQUFXLEVBQUU7WUFDdkIsUUFBUSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDM0MsS0FBSyxJQUFJLENBQUM7Z0JBQ1YsS0FBSyxZQUFZO29CQUNmLE9BQU8sSUFBSSxvQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDekQsS0FBSyxJQUFJLENBQUM7Z0JBQ1YsS0FBSyxZQUFZO29CQUNmLE9BQU8sSUFBSSxvQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDekQ7b0JBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLFVBQVUsQ0FBQyxDQUFBO29CQUNyRSxNQUFNO2FBQ1Q7UUFDSCxDQUFDLENBQUE7UUFoQkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDbkIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0lBQ3RDLENBQUM7Q0FlRjtBQXZCRCxnQ0F1QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU291cmNlIGZyb20gXCIuL2ludGVyZmFjZXMvU291cmNlXCI7XG5pbXBvcnQgSmF2YVNjcmlwdFBhcnNlciBmcm9tIFwiLi9sYW5nL2phdmFzY3JpcHRcIjtcbmltcG9ydCBUeXBlU2NyaXB0UGFyc2VyIGZyb20gJy4vbGFuZy90eXBlc2NyaXB0JztcbmltcG9ydCBQYXJzZXIgZnJvbSBcIi4vbGFuZy9jb21tb24vcGFyc2VyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcnNlckZhY3Rvcnkge1xuICBwcml2YXRlIHNvdXJjZTogU291cmNlXG4gIHByaXZhdGUgb3B0aW9ucyA9IHtcbiAgICBsYW5ndWFnZTogJ0phdmFTY3JpcHQnXG4gIH1cbiAgY29uc3RydWN0b3IoZmlsZTogU291cmNlLCBvcHRpb25zOiBhbnkgPSB7fSkge1xuICAgIHRoaXMuc291cmNlID0gZmlsZTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucywgb3B0aW9ucylcbiAgfVxuXG4gIGdldFBhcnNlciA9ICgpOiBQYXJzZXIgPT4ge1xuICAgIHN3aXRjaCAodGhpcy5vcHRpb25zLmxhbmd1YWdlLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgIGNhc2UgJ2pzJzpcbiAgICAgIGNhc2UgJ2phdmFzY3JpcHQnOlxuICAgICAgICByZXR1cm4gbmV3IEphdmFTY3JpcHRQYXJzZXIodGhpcy5zb3VyY2UsIHRoaXMub3B0aW9ucyk7XG4gICAgICBjYXNlICd0cyc6XG4gICAgICBjYXNlICd0eXBlc2NyaXB0JzpcbiAgICAgICAgcmV0dXJuIG5ldyBUeXBlU2NyaXB0UGFyc2VyKHRoaXMuc291cmNlLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgIGNvbnNvbGUubG9nKGBbbXItZG9jXTogTm8gcGFyc2VyIGZvciAke3RoaXMub3B0aW9ucy5sYW5ndWFnZX0gZXhpc3RzLmApXG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufSJdfQ==