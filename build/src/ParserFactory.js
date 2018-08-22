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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFyc2VyRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9QYXJzZXJGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsa0RBQWlEO0FBQ2pELGtEQUFpRDtBQUVqRCxNQUFxQixhQUFhO0lBS2hDLFlBQVksSUFBWSxFQUFFLFVBQWUsRUFBRTtRQUhuQyxZQUFPLEdBQUc7WUFDaEIsUUFBUSxFQUFFLFlBQVk7U0FDdkIsQ0FBQTtRQU1ELGNBQVMsR0FBRyxHQUFZLEVBQUU7WUFDeEIsUUFBUSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDM0MsS0FBSyxJQUFJLENBQUM7Z0JBQ1YsS0FBSyxZQUFZO29CQUNmLE9BQU8sSUFBSSxvQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdkQsS0FBSyxJQUFJLENBQUM7Z0JBQ1YsS0FBSyxZQUFZO29CQUNmLE9BQU8sSUFBSSxvQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdkQ7b0JBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLFVBQVUsQ0FBQyxDQUFBO29CQUNyRSxNQUFNO2FBQ1Q7UUFDSCxDQUFDLENBQUE7UUFoQkMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0lBQ3RDLENBQUM7Q0FnQkY7QUF4QkQsZ0NBd0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNvdXJjZSBmcm9tIFwiLi9pbnRlcmZhY2VzL1NvdXJjZVwiO1xyXG5pbXBvcnQgSVBhcnNlciBmcm9tIFwiLi9pbnRlcmZhY2VzL0lQYXJzZXJcIjtcclxuaW1wb3J0IEphdmFTY3JpcHRQYXJzZXIgZnJvbSBcIi4vbGFuZy9qYXZhc2NyaXB0XCI7XHJcbmltcG9ydCBUeXBlU2NyaXB0UGFyc2VyIGZyb20gJy4vbGFuZy90eXBlc2NyaXB0JztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcnNlckZhY3Rvcnkge1xyXG4gIHByaXZhdGUgZmlsZTogU291cmNlXHJcbiAgcHJpdmF0ZSBvcHRpb25zID0ge1xyXG4gICAgbGFuZ3VhZ2U6ICdKYXZhU2NyaXB0J1xyXG4gIH1cclxuICBjb25zdHJ1Y3RvcihmaWxlOiBTb3VyY2UsIG9wdGlvbnM6IGFueSA9IHt9KSB7XHJcbiAgICB0aGlzLmZpbGUgPSBmaWxlO1xyXG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLm9wdGlvbnMsIG9wdGlvbnMpXHJcbiAgfVxyXG5cclxuICBnZXRQYXJzZXIgPSAoKTogSVBhcnNlciA9PiB7XHJcbiAgICBzd2l0Y2ggKHRoaXMub3B0aW9ucy5sYW5ndWFnZS50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgIGNhc2UgJ2pzJzpcclxuICAgICAgY2FzZSAnamF2YXNjcmlwdCc6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBKYXZhU2NyaXB0UGFyc2VyKHRoaXMuZmlsZSwgdGhpcy5vcHRpb25zKTtcclxuICAgICAgY2FzZSAndHMnOlxyXG4gICAgICBjYXNlICd0eXBlc2NyaXB0JzpcclxuICAgICAgICByZXR1cm4gbmV3IFR5cGVTY3JpcHRQYXJzZXIodGhpcy5maWxlLCB0aGlzLm9wdGlvbnMpO1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICBjb25zb2xlLmxvZyhgW21yLWRvY106IE5vIHBhcnNlciBmb3IgJHt0aGlzLm9wdGlvbnMubGFuZ3VhZ2V9IGV4aXN0cy5gKVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbn0iXX0=