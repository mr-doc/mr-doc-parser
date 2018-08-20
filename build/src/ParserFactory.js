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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFyc2VyRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9QYXJzZXJGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsa0RBQWlEO0FBQ2pELGtEQUFpRDtBQUVqRCxNQUFxQixhQUFhO0lBS2hDLFlBQVksSUFBVyxFQUFFLFVBQWUsRUFBRTtRQUhsQyxZQUFPLEdBQUc7WUFDaEIsUUFBUSxFQUFFLFlBQVk7U0FDdkIsQ0FBQTtRQU1ELGNBQVMsR0FBRyxHQUFZLEVBQUU7WUFDeEIsUUFBUSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDM0MsS0FBSyxJQUFJLENBQUM7Z0JBQ1YsS0FBSyxZQUFZO29CQUNmLE9BQU8sSUFBSSxvQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdkQsS0FBSyxJQUFJLENBQUM7Z0JBQ1YsS0FBSyxZQUFZO29CQUNmLE9BQU8sSUFBSSxvQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdkQ7b0JBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLFVBQVUsQ0FBQyxDQUFBO29CQUNyRSxNQUFNO2FBQ1Q7UUFDSCxDQUFDLENBQUE7UUFoQkMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0lBQ3RDLENBQUM7Q0FnQkY7QUF4QkQsZ0NBd0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IElGaWxlIGZyb20gXCIuL2ludGVyZmFjZXMvSUZpbGVcIjtcclxuaW1wb3J0IElQYXJzZXIgZnJvbSBcIi4vaW50ZXJmYWNlcy9JUGFyc2VyXCI7XHJcbmltcG9ydCBKYXZhU2NyaXB0UGFyc2VyIGZyb20gXCIuL2xhbmcvamF2YXNjcmlwdFwiO1xyXG5pbXBvcnQgVHlwZVNjcmlwdFBhcnNlciBmcm9tICcuL2xhbmcvdHlwZXNjcmlwdCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXJzZXJGYWN0b3J5IHtcclxuICBwcml2YXRlIGZpbGU6IElGaWxlXHJcbiAgcHJpdmF0ZSBvcHRpb25zID0ge1xyXG4gICAgbGFuZ3VhZ2U6ICdKYXZhU2NyaXB0J1xyXG4gIH1cclxuICBjb25zdHJ1Y3RvcihmaWxlOiBJRmlsZSwgb3B0aW9uczogYW55ID0ge30pIHtcclxuICAgIHRoaXMuZmlsZSA9IGZpbGU7XHJcbiAgICBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucywgb3B0aW9ucylcclxuICB9XHJcblxyXG4gIGdldFBhcnNlciA9ICgpOiBJUGFyc2VyID0+IHtcclxuICAgIHN3aXRjaCAodGhpcy5vcHRpb25zLmxhbmd1YWdlLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgY2FzZSAnanMnOlxyXG4gICAgICBjYXNlICdqYXZhc2NyaXB0JzpcclxuICAgICAgICByZXR1cm4gbmV3IEphdmFTY3JpcHRQYXJzZXIodGhpcy5maWxlLCB0aGlzLm9wdGlvbnMpO1xyXG4gICAgICBjYXNlICd0cyc6XHJcbiAgICAgIGNhc2UgJ3R5cGVzY3JpcHQnOlxyXG4gICAgICAgIHJldHVybiBuZXcgVHlwZVNjcmlwdFBhcnNlcih0aGlzLmZpbGUsIHRoaXMub3B0aW9ucyk7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgIGNvbnNvbGUubG9nKGBbbXItZG9jXTogTm8gcGFyc2VyIGZvciAke3RoaXMub3B0aW9ucy5sYW5ndWFnZX0gZXhpc3RzLmApXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxufSJdfQ==