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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFyc2VyRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9QYXJzZXJGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsa0RBQWlEO0FBQ2pELGtEQUFpRDtBQUVqRCxNQUFxQixhQUFhO0lBS2hDLFlBQVksSUFBWSxFQUFFLFVBQWUsRUFBRTtRQUhuQyxZQUFPLEdBQUc7WUFDaEIsUUFBUSxFQUFFLFlBQVk7U0FDdkIsQ0FBQTtRQU1ELGNBQVMsR0FBRyxHQUFvQixFQUFFO1lBQ2hDLFFBQVEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JBQzNDLEtBQUssSUFBSSxDQUFDO2dCQUNWLEtBQUssWUFBWTtvQkFDZixPQUFPLElBQUksb0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3ZELEtBQUssSUFBSSxDQUFDO2dCQUNWLEtBQUssWUFBWTtvQkFDZixPQUFPLElBQUksb0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3ZEO29CQUNBLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxVQUFVLENBQUMsQ0FBQTtvQkFDckUsTUFBTTthQUNUO1FBQ0gsQ0FBQyxDQUFBO1FBaEJDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUN0QyxDQUFDO0NBZ0JGO0FBeEJELGdDQXdCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTb3VyY2UgZnJvbSBcIi4vaW50ZXJmYWNlcy9Tb3VyY2VcIjtcbmltcG9ydCBQYXJzZXJJbnRlcmZhY2UgZnJvbSBcIi4vaW50ZXJmYWNlcy9QYXJzZXJJbnRlcmZhY2VcIjtcbmltcG9ydCBKYXZhU2NyaXB0UGFyc2VyIGZyb20gXCIuL2xhbmcvamF2YXNjcmlwdFwiO1xuaW1wb3J0IFR5cGVTY3JpcHRQYXJzZXIgZnJvbSAnLi9sYW5nL3R5cGVzY3JpcHQnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXJzZXJGYWN0b3J5IHtcbiAgcHJpdmF0ZSBmaWxlOiBTb3VyY2VcbiAgcHJpdmF0ZSBvcHRpb25zID0ge1xuICAgIGxhbmd1YWdlOiAnSmF2YVNjcmlwdCdcbiAgfVxuICBjb25zdHJ1Y3RvcihmaWxlOiBTb3VyY2UsIG9wdGlvbnM6IGFueSA9IHt9KSB7XG4gICAgdGhpcy5maWxlID0gZmlsZTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucywgb3B0aW9ucylcbiAgfVxuXG4gIGdldFBhcnNlciA9ICgpOiBQYXJzZXJJbnRlcmZhY2UgPT4ge1xuICAgIHN3aXRjaCAodGhpcy5vcHRpb25zLmxhbmd1YWdlLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgIGNhc2UgJ2pzJzpcbiAgICAgIGNhc2UgJ2phdmFzY3JpcHQnOlxuICAgICAgICByZXR1cm4gbmV3IEphdmFTY3JpcHRQYXJzZXIodGhpcy5maWxlLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgY2FzZSAndHMnOlxuICAgICAgY2FzZSAndHlwZXNjcmlwdCc6XG4gICAgICAgIHJldHVybiBuZXcgVHlwZVNjcmlwdFBhcnNlcih0aGlzLmZpbGUsIHRoaXMub3B0aW9ucyk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgY29uc29sZS5sb2coYFttci1kb2NdOiBObyBwYXJzZXIgZm9yICR7dGhpcy5vcHRpb25zLmxhbmd1YWdlfSBleGlzdHMuYClcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbn0iXX0=