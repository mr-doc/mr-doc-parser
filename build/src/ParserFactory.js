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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFyc2VyRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9QYXJzZXJGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esa0RBQWlEO0FBQ2pELGtEQUFpRDtBQUdqRCxNQUFxQixhQUFhO0lBS2hDLFlBQVksSUFBWSxFQUFFLFVBQWUsRUFBRTtRQUhuQyxZQUFPLEdBQUc7WUFDaEIsUUFBUSxFQUFFLFlBQVk7U0FDdkIsQ0FBQTtRQU1ELGNBQVMsR0FBRyxHQUFXLEVBQUU7WUFDdkIsUUFBUSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDM0MsS0FBSyxJQUFJLENBQUM7Z0JBQ1YsS0FBSyxZQUFZO29CQUNmLE9BQU8sSUFBSSxvQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdkQsS0FBSyxJQUFJLENBQUM7Z0JBQ1YsS0FBSyxZQUFZO29CQUNmLE9BQU8sSUFBSSxvQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdkQ7b0JBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLFVBQVUsQ0FBQyxDQUFBO29CQUNyRSxNQUFNO2FBQ1Q7UUFDSCxDQUFDLENBQUE7UUFoQkMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0lBQ3RDLENBQUM7Q0FnQkY7QUF4QkQsZ0NBd0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNvdXJjZSBmcm9tIFwiLi9pbnRlcmZhY2VzL1NvdXJjZVwiO1xyXG5pbXBvcnQgSmF2YVNjcmlwdFBhcnNlciBmcm9tIFwiLi9sYW5nL2phdmFzY3JpcHRcIjtcclxuaW1wb3J0IFR5cGVTY3JpcHRQYXJzZXIgZnJvbSAnLi9sYW5nL3R5cGVzY3JpcHQnO1xyXG5pbXBvcnQgUGFyc2VyIGZyb20gXCIuL2xhbmcvY29tbW9uL3BhcnNlclwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFyc2VyRmFjdG9yeSB7XHJcbiAgcHJpdmF0ZSBmaWxlOiBTb3VyY2VcclxuICBwcml2YXRlIG9wdGlvbnMgPSB7XHJcbiAgICBsYW5ndWFnZTogJ0phdmFTY3JpcHQnXHJcbiAgfVxyXG4gIGNvbnN0cnVjdG9yKGZpbGU6IFNvdXJjZSwgb3B0aW9uczogYW55ID0ge30pIHtcclxuICAgIHRoaXMuZmlsZSA9IGZpbGU7XHJcbiAgICBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucywgb3B0aW9ucylcclxuICB9XHJcblxyXG4gIGdldFBhcnNlciA9ICgpOiBQYXJzZXIgPT4ge1xyXG4gICAgc3dpdGNoICh0aGlzLm9wdGlvbnMubGFuZ3VhZ2UudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICBjYXNlICdqcyc6XHJcbiAgICAgIGNhc2UgJ2phdmFzY3JpcHQnOlxyXG4gICAgICAgIHJldHVybiBuZXcgSmF2YVNjcmlwdFBhcnNlcih0aGlzLmZpbGUsIHRoaXMub3B0aW9ucyk7XHJcbiAgICAgIGNhc2UgJ3RzJzpcclxuICAgICAgY2FzZSAndHlwZXNjcmlwdCc6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUeXBlU2NyaXB0UGFyc2VyKHRoaXMuZmlsZSwgdGhpcy5vcHRpb25zKTtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgY29uc29sZS5sb2coYFttci1kb2NdOiBObyBwYXJzZXIgZm9yICR7dGhpcy5vcHRpb25zLmxhbmd1YWdlfSBleGlzdHMuYClcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG59Il19