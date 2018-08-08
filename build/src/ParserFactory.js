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
                    break;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFyc2VyRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9QYXJzZXJGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsa0RBQWlEO0FBQ2pELGtEQUFpRDtBQUVqRCxNQUFxQixhQUFhO0lBS2hDLFlBQVksSUFBVyxFQUFFLFVBQWUsRUFBRTtRQUhsQyxZQUFPLEdBQUc7WUFDaEIsUUFBUSxFQUFFLFlBQVk7U0FDdkIsQ0FBQTtRQU1ELGNBQVMsR0FBRyxHQUFZLEVBQUU7WUFDeEIsUUFBUSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDM0MsS0FBSyxJQUFJLENBQUM7Z0JBQ1YsS0FBSyxZQUFZO29CQUNmLE9BQU8sSUFBSSxvQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDckQsTUFBTTtnQkFDUixLQUFLLElBQUksQ0FBQztnQkFDVixLQUFLLFlBQVk7b0JBQ2YsT0FBTyxJQUFJLG9CQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN2RDtvQkFDQSxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsVUFBVSxDQUFDLENBQUE7b0JBQ3JFLE1BQU07YUFDVDtRQUNILENBQUMsQ0FBQTtRQWpCQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFDdEMsQ0FBQztDQWlCRjtBQXpCRCxnQ0F5QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgSUZpbGUgZnJvbSBcIi4vaW50ZXJmYWNlcy9JRmlsZVwiO1xuaW1wb3J0IElQYXJzZXIgZnJvbSBcIi4vaW50ZXJmYWNlcy9JUGFyc2VyXCI7XG5pbXBvcnQgSmF2YVNjcmlwdFBhcnNlciBmcm9tIFwiLi9sYW5nL2phdmFzY3JpcHRcIjtcbmltcG9ydCBUeXBlU2NyaXB0UGFyc2VyIGZyb20gJy4vbGFuZy90eXBlc2NyaXB0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFyc2VyRmFjdG9yeSB7XG4gIHByaXZhdGUgZmlsZTogSUZpbGVcbiAgcHJpdmF0ZSBvcHRpb25zID0ge1xuICAgIGxhbmd1YWdlOiAnSmF2YVNjcmlwdCdcbiAgfVxuICBjb25zdHJ1Y3RvcihmaWxlOiBJRmlsZSwgb3B0aW9uczogYW55ID0ge30pIHtcbiAgICB0aGlzLmZpbGUgPSBmaWxlO1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5vcHRpb25zLCBvcHRpb25zKVxuICB9XG5cbiAgZ2V0UGFyc2VyID0gKCk6IElQYXJzZXIgPT4ge1xuICAgIHN3aXRjaCAodGhpcy5vcHRpb25zLmxhbmd1YWdlLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgIGNhc2UgJ2pzJzpcbiAgICAgIGNhc2UgJ2phdmFzY3JpcHQnOlxuICAgICAgICByZXR1cm4gbmV3IEphdmFTY3JpcHRQYXJzZXIodGhpcy5maWxlLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3RzJzpcbiAgICAgIGNhc2UgJ3R5cGVzY3JpcHQnOlxuICAgICAgICByZXR1cm4gbmV3IFR5cGVTY3JpcHRQYXJzZXIodGhpcy5maWxlLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgIGNvbnNvbGUubG9nKGBbbXItZG9jXTogTm8gcGFyc2VyIGZvciAke3RoaXMub3B0aW9ucy5sYW5ndWFnZX0gZXhpc3RzLmApXG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG59Il19