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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFyc2VyRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9QYXJzZXJGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esa0RBQWlEO0FBQ2pELGtEQUFpRDtBQUdqRCxNQUFxQixhQUFhO0lBS2hDLFlBQVksSUFBWSxFQUFFLFVBQWUsRUFBRTtRQUhuQyxZQUFPLEdBQUc7WUFDaEIsUUFBUSxFQUFFLFlBQVk7U0FDdkIsQ0FBQTtRQU1ELGNBQVMsR0FBRyxHQUFXLEVBQUU7WUFDdkIsUUFBUSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDM0MsS0FBSyxJQUFJLENBQUM7Z0JBQ1YsS0FBSyxZQUFZO29CQUNmLE9BQU8sSUFBSSxvQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDekQsS0FBSyxJQUFJLENBQUM7Z0JBQ1YsS0FBSyxZQUFZO29CQUNmLE9BQU8sSUFBSSxvQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDekQ7b0JBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLFVBQVUsQ0FBQyxDQUFBO29CQUNyRSxNQUFNO2FBQ1Q7UUFDSCxDQUFDLENBQUE7UUFoQkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDbkIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0lBQ3RDLENBQUM7Q0FlRjtBQXZCRCxnQ0F1QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU291cmNlIGZyb20gXCIuL2ludGVyZmFjZXMvU291cmNlXCI7XHJcbmltcG9ydCBKYXZhU2NyaXB0UGFyc2VyIGZyb20gXCIuL2xhbmcvamF2YXNjcmlwdFwiO1xyXG5pbXBvcnQgVHlwZVNjcmlwdFBhcnNlciBmcm9tICcuL2xhbmcvdHlwZXNjcmlwdCc7XHJcbmltcG9ydCBQYXJzZXIgZnJvbSBcIi4vbGFuZy9jb21tb24vcGFyc2VyXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXJzZXJGYWN0b3J5IHtcclxuICBwcml2YXRlIHNvdXJjZTogU291cmNlXHJcbiAgcHJpdmF0ZSBvcHRpb25zID0ge1xyXG4gICAgbGFuZ3VhZ2U6ICdKYXZhU2NyaXB0J1xyXG4gIH1cclxuICBjb25zdHJ1Y3RvcihmaWxlOiBTb3VyY2UsIG9wdGlvbnM6IGFueSA9IHt9KSB7XHJcbiAgICB0aGlzLnNvdXJjZSA9IGZpbGU7XHJcbiAgICBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucywgb3B0aW9ucylcclxuICB9XHJcblxyXG4gIGdldFBhcnNlciA9ICgpOiBQYXJzZXIgPT4ge1xyXG4gICAgc3dpdGNoICh0aGlzLm9wdGlvbnMubGFuZ3VhZ2UudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICBjYXNlICdqcyc6XHJcbiAgICAgIGNhc2UgJ2phdmFzY3JpcHQnOlxyXG4gICAgICAgIHJldHVybiBuZXcgSmF2YVNjcmlwdFBhcnNlcih0aGlzLnNvdXJjZSwgdGhpcy5vcHRpb25zKTtcclxuICAgICAgY2FzZSAndHMnOlxyXG4gICAgICBjYXNlICd0eXBlc2NyaXB0JzpcclxuICAgICAgICByZXR1cm4gbmV3IFR5cGVTY3JpcHRQYXJzZXIodGhpcy5zb3VyY2UsIHRoaXMub3B0aW9ucyk7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgIGNvbnNvbGUubG9nKGBbbXItZG9jXTogTm8gcGFyc2VyIGZvciAke3RoaXMub3B0aW9ucy5sYW5ndWFnZX0gZXhpc3RzLmApXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG59Il19