"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var esc_pos_encoder_1 = require("./esc-pos-encoder");
var QRCode = require("qrcode");
var AlignEnum;
(function (AlignEnum) {
    AlignEnum["left"] = "left";
    AlignEnum["center"] = "center";
    AlignEnum["right"] = "right";
})(AlignEnum || (AlignEnum = {}));
/**
 * Create a byte stream based on commands for ESC/POS printers
 */
var EscPosImgEncoder = /** @class */ (function (_super) {
    __extends(EscPosImgEncoder, _super);
    /**
     * Create a new EscPosEncoder
     */
    function EscPosImgEncoder(_a) {
        var fontFamily = _a.fontFamily, canvas = _a.canvas, _b = _a.rtl, rtl = _b === void 0 ? false : _b;
        var _this = _super.call(this) || this;
        _this.alignValue = AlignEnum.left;
        _this.fontValue = '28px "Custom"';
        _this.width58 = 384;
        _this.width80 = 568;
        _this.lineHeight = 32;
        _this.lineHeight0 = 32;
        _this.lineHeight2 = 56;
        _this.heightPosition = 32;
        _this.cutAtFinal = false;
        _this.fontFoot = 16; // 给字体下方留下空间，防止截断
        _this.fontFamily = "Custom";
        _this.lineHeightInterval = 0;
        _this.rtl = false;
        _this.CVS = canvas;
        if (rtl) {
            _this.rtl = true;
            _this.CVS.setAttribute('dir', 'rtl');
        }
        else {
            _this.rtl = false;
            _this.CVS.setAttribute('dir', 'ltr');
        }
        if (fontFamily) {
            _this.fontFamily = fontFamily;
        }
        _this._reset();
        return _this;
        // registerFont('../../../../src/assets/font/锐字云字库胖头鱼体GBK.ttf', {family: 'Custom'});
    }
    /**
     * Reset the state of the EscPosEncoder
     *
     */
    EscPosImgEncoder.prototype._reset = function () {
        if (this.CVS) { // 如果是子类调用再执行，父类构造函数调用不能执行，因为this还没初始化
            this.heightPosition = 32;
            this.ctx = this.CVS.getContext('2d');
            this.ctx.textBaseline = 'bottom';
            this.resize(this.width58, 0);
        }
        _super.prototype._reset.call(this);
    };
    /**
     * Change the code page
     *
     * @param  {string}   value  The codepage that we set the printer to
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    EscPosImgEncoder.prototype.codepage = function (value) {
        return this;
    };
    /**
     * Change text size
     *
     * @param  {number}          value   small or normal
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    EscPosImgEncoder.prototype.size = function (value) {
        this._size = value;
        switch (value) {
            case 0: // 正常字体
                this.fontValue = "28px \"" + this.fontFamily + "\"";
                this.lineHeight = this.lineHeight0 + this.lineHeightInterval;
                break;
            case 1: // 高度加倍
                this.fontValue = "56px \"" + this.fontFamily + "\"";
                this.lineHeight = this.lineHeight2 + this.lineHeightInterval;
                break;
            case 2: // 宽高都加倍
                this.fontValue = "56px \"" + this.fontFamily + "\"";
                this.lineHeight = this.lineHeight2 + this.lineHeightInterval;
                break;
        }
        this.ctx.font = this.fontValue;
        return this;
    };
    /**
     * 设置打印机宽度
     *
     * @param  {PrinterWidthEnum}   type  需要被分割的字符串
     * @returns {EscPosEncoder} 返回this
     */
    EscPosImgEncoder.prototype.setPinterType = function (type) {
        if (type === esc_pos_encoder_1.PrinterWidthEnum._58) {
            this.resize(this.width58, this.CVS.height);
        }
        else if (type === esc_pos_encoder_1.PrinterWidthEnum._80) {
            this.resize(this.width80, this.CVS.height);
        }
        _super.prototype.setPinterType.call(this, type);
        return this;
    };
    /**
     * Change text alignment
     *
     * @param  {string}          value   left, center or right
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    EscPosImgEncoder.prototype.align = function (value) {
        if (!AlignEnum[value]) {
            throw new Error('Unknown alignment');
        }
        this.alignValue = value;
        return this;
    };
    /**
     * Print text, followed by a newline
     *
     * @param  {string}   value  Text that needs to be printed
     * @param  {number}   wrap   Wrap text after this many positions
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    EscPosImgEncoder.prototype.line = function (value, wrap) {
        var _this = this;
        if (value.includes('\n')) {
            value.split('\n').forEach(function (item) {
                _this.line(item);
            });
            return this;
        }
        var fixedWidthStrArr = this.splitByWidth(value, this.CVS.width);
        fixedWidthStrArr.forEach(function (str) {
            _this.newline();
            _this.text(str, wrap);
        });
        return this;
    };
    /**
     * Print text
     *
     * @param  {string}   value  Text that needs to be printed
     * @param  {number}   wrap   Wrap text after this many positions
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    EscPosImgEncoder.prototype.text = function (value, wrap) {
        var width = this.getStrWidth(value);
        switch (this.alignValue) {
            case AlignEnum.left:
                this._fillText(value, this.getPositionByDir(0), this.heightPosition);
                break;
            case AlignEnum.center:
                this._fillText(value, this.getPositionByDir((this.CVS.width - width) / 2), this.heightPosition);
                break;
            case AlignEnum.right:
                this._fillText(value, this.getPositionByDir(this.CVS.width - width), this.heightPosition);
                break;
            default:
                throw new Error('align error');
        }
        return this;
    };
    /**
   * fill text
   *
   * @param  {string}   value  Text that needs to be printed
   * @param  {number}   wrap   Wrap text after this many positions
   * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
   *
   */
    EscPosImgEncoder.prototype._fillText = function (text, x, y) {
        if (this._size === 1) {
            this.ctx.transform(.5, 0, 0, 1, 0, 0);
            this.ctx.fillText(this._handleDerection(text), x * 2, y);
            this.ctx.transform(2, 0, 0, 1, 0, 0);
        }
        else {
            this.ctx.fillText(this._handleDerection(text), x, y);
        }
    };
    /**
   * handle text direction for ltr and rtl mix print
   *
   * @param  {string}   text  Text that needs to be printed
   * @returns {string}          return fixed string
   *
   */
    EscPosImgEncoder.prototype._handleDerection = function (text) {
        var direction = this._getTextDirection(text);
        var bidiChar = direction === "rtl" ? "\u202B" : "\u202A";
        var bidiText = bidiChar + text;
        return bidiText;
    };
    EscPosImgEncoder.prototype._getTextDirection = function (text) {
        var ltrChars = /[\u0000-\u05FF\u2000-\u206F]/; // LTR character range
        var rtlChars = /[\u0590-\u07FF\uFB1D-\uFDFF\uFE70-\uFEFC]/; // RTL character range
        var rtlCount = 0;
        var ltrCount = 0;
        // iterate over each character in the string
        for (var i = 0; i < text.length; i++) {
            var char = text[i];
            if (rtlChars.test(char)) {
                rtlCount++;
            }
            else if (ltrChars.test(char)) {
                ltrCount++;
            }
        }
        if (rtlCount > ltrCount) {
            return "rtl";
        }
        else {
            return "ltr";
        }
    };
    /**
     * Print a newline
     *
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    EscPosImgEncoder.prototype.newline = function () {
        this.heightPosition += this.lineHeight;
        this.resize(this.CVS.width, this.heightPosition);
        return this;
    };
    /**
     * 动态修改画布大小
     *
     * @param {number} w  宽
     * @param {number} h  高
     */
    EscPosImgEncoder.prototype.resize = function (w, h) {
        var imgData = this.ctx.getImageData(0, 0, this.CVS.width, this.CVS.height);
        this.CVS.width = w;
        this.CVS.height = h + this.fontFoot;
        this.ctx.putImageData(imgData, 0, 0);
        this.ctx.font = this.fontValue;
    };
    /**
     * Encode all previous commands
     *
     * @returns {Uint8Array}         Return the encoded bytes
     *
     */
    EscPosImgEncoder.prototype.encode = function () {
        var result;
        try {
            // 初始化打印机，防止持续乱码
            this._queue([0x1B, 0x40]);
            var interval = 1000; // 每个图片的最大高度
            var count = Math.ceil(this.CVS.height / interval); // 打碎成多少个图片的拼接
            for (var i = 0; i < count; i++) {
                var canvas = document.createElement('canvas');
                canvas.width = this.CVS.width;
                if (i === count - 1) {
                    // 最后一张图片的高度
                    canvas.height = this.CVS.height - i * interval;
                }
                else {
                    canvas.height = interval;
                }
                var context = canvas.getContext('2d');
                context.drawImage(this.CVS, 0, i * interval, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
                this.image(canvas, canvas.width, canvas.height, 'threshold');
            }
            if (this.cutAtFinal) {
                _super.prototype.cutPartial.call(this);
            }
            result = _super.prototype.encode.call(this);
            this._reset();
        }
        catch (error) {
            console.error(error);
            throw error;
        }
        return result;
    };
    /**
     * Bold text
     *
     * @param  {boolean}          value  true to turn on bold, false to turn off, or 2 for double underline
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    EscPosImgEncoder.prototype.bold = function (value) {
        return this;
    };
    /**
     * 放大行间距
     *
     * @param  {boolean}          bigFont  是否大号字体
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    EscPosImgEncoder.prototype.enlargeLineHeight = function (bigFont) {
        this.lineHeightInterval = bigFont ? 2 * 8 : 1 * 8;
        this.size(this._size);
        return this;
    };
    /**
     * 回到默认行间距
     *
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    EscPosImgEncoder.prototype.defaultLineHeight = function () {
        this.lineHeightInterval = 0;
        this.size(this._size);
        return this;
    };
    /**
     * 打印一行字符
     *
     * @param {string} char 打印成行的字符
     * @param {string} message 提示信息
     * @param {boolean} middle 提示信息显示在行间
     * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
     */
    EscPosImgEncoder.prototype.printLine = function (char, message, middle) {
        if (message === void 0) { message = ''; }
        if (middle === void 0) { middle = false; }
        char = char.slice(0, 1);
        var restLength = this.CVS.width - this.getStrWidth(message);
        var charLength = this.getStrWidth(char);
        if (middle) {
            this.line(char.repeat(restLength / 2 / charLength) + message + char.repeat(restLength / 2 / charLength));
        }
        else {
            this.line(char.repeat(restLength / charLength));
            if (message) {
                var temp = this.alignValue;
                this.alignValue = AlignEnum.center;
                this.line(message);
                this.alignValue = temp;
            }
        }
        return this;
    };
    /**
     * Cut paper partial
     *
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    EscPosImgEncoder.prototype.cutPartial = function () {
        this.cutAtFinal = true;
        return this;
    };
    /**
     * 打印两个字符分别在纸的左右两侧
     *
     * @param  {string}   str1  左侧的字符串
     * @param  {string}   str2  右侧的字符串
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    EscPosImgEncoder.prototype.oneLine = function (str1, str2) {
        var _this = this;
        var multiToMulti = false;
        if (str1.includes('\n')) {
            if (str2.includes('\n')) {
                multiToMulti = true;
            }
            else {
                str1.split('\n').forEach(function (item, index) {
                    _this.oneLine(item, index === 0 ? str2 : '');
                });
                return this;
            }
        }
        this.align(AlignEnum.left);
        this.newline();
        var width1 = this.getStrWidth(str1);
        var width2 = this.getStrWidth(str2);
        if (this.CVS.width - width1 - width2 < 0 || multiToMulti) {
            this.line(str1);
            this.line(str2);
        }
        else {
            this._fillText(str1, this.getPositionByDir(0), this.heightPosition);
            this._fillText(str2, this.getPositionByDir(this.CVS.width - width2), this.heightPosition);
        }
        return this;
    };
    /**
     * 前台打印菜品，包含菜品名称，数量，价格
     *
     * @param {Array} dishes 菜品信息数组
     * @param {number} size 字体大小,默认1
     * @param {boolean} bigPrice 小币种价格，默认false
     * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
     */
    EscPosImgEncoder.prototype.printFrontDeskDishs = function (_a) {
        var _this = this;
        var dishes = _a.dishes, _b = _a.size, size = _b === void 0 ? 1 : _b, bigPrice = _a.bigPrice, largeLineHeight = _a.largeLineHeight, lineBetweenDishes = _a.lineBetweenDishes, specificationInNewLine = _a.specificationInNewLine, showUnitPrice = _a.showUnitPrice;
        var originSize = this._size;
        var measureTextStr = (bigPrice || showUnitPrice) ? 'x99 9,999,999' : 'x99 999.99';
        var countAndPriceLength = this.getStrWidth(measureTextStr);
        var countAndPriceLengthWithUnitPrice = this.getStrWidth('99,999,999 x9 99,999,999'); // 包含单价情况价格和个数的长度
        var getCountAndPriceStr = function (count, price) {
            var unitPriceStr = bigPrice ? _this.bigPriceFormat(price) : price.toFixed(2);
            var totalPriceStr = bigPrice ? _this.bigPriceFormat(price * count) : (price * count).toFixed(2);
            var countStr = (_this.rtl ? '*' : 'x') + count;
            if (showUnitPrice) {
                var countAndUnitPrice = _this.fixLength(countStr, unitPriceStr, countAndPriceLength);
                return _this.fixLength(countAndUnitPrice, totalPriceStr, countAndPriceLengthWithUnitPrice);
            }
            else {
                return _this.fixLength(countStr, totalPriceStr, countAndPriceLength);
            }
        };
        this.size(size);
        if (largeLineHeight) {
            this.enlargeLineHeight(Boolean(size));
        }
        dishes.forEach(function (dish, index) {
            var _a;
            if (dish.count <= 0) {
                return;
            }
            if (showUnitPrice) {
                _this.line(dish.name);
                _this.oneLine('', getCountAndPriceStr(dish.count, dish.price));
            }
            else {
                var nameArr = dish.name.split('\n');
                var _loop_1 = function (i) {
                    var name_1 = nameArr[i];
                    var fixedWidthStrArr = _this.splitByWidth(name_1, _this.CVS.width - countAndPriceLength - _this.getStrWidth('  '));
                    fixedWidthStrArr.forEach(function (str, index) {
                        if (i === 0 && index === 0) {
                            _this.oneLine(str, getCountAndPriceStr(dish.count, dish.price));
                        }
                        else {
                            _this.line(str);
                        }
                    });
                };
                for (var i = 0; i < nameArr.length; i++) {
                    _loop_1(i);
                }
            }
            if (specificationInNewLine) {
                (_a = dish.specifications) === null || _a === void 0 ? void 0 : _a.forEach(function (str, index) {
                    if (str) {
                        var strArr = str.split('\n');
                        strArr.forEach(function (specString) {
                            _this.line('  ※ ' + specString + ' ※  ');
                        });
                    }
                });
            }
            if (lineBetweenDishes) {
                _this.defaultLineHeight();
                _this.size(0);
                if (dishes.length !== index + 1) {
                    _this.printLine('-');
                }
                _this.size(size);
                if (largeLineHeight) {
                    _this.enlargeLineHeight(Boolean(size));
                }
            }
        });
        this.size(0);
        this.defaultLineHeight();
        this.printLine('=');
        this.size(originSize);
        return this;
    };
    /**
     * 后厨打印菜品，包含菜品名称，数量，不包含价格
     *
     * @param {Array} dishes 菜品信息数组
     * @param {number} size 字体大小,默认2
     * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
     */
    EscPosImgEncoder.prototype.printChefDishs = function (_a) {
        var _this = this;
        var dishes = _a.dishes, _b = _a.size, size = _b === void 0 ? 2 : _b, largeLineHeight = _a.largeLineHeight, lineBetweenDishes = _a.lineBetweenDishes, specificationInNewLine = _a.specificationInNewLine, countFront = _a.countFront;
        var originSize = this._size;
        var countAndPriceLength = this.getStrWidth('  x99');
        this.size(size);
        if (largeLineHeight) {
            this.enlargeLineHeight(Boolean(size));
        }
        dishes.forEach(function (dish, index) {
            var _a;
            if (dish.count <= 0) {
                return;
            }
            if (countFront) {
                _this.line((dish.count > 1 ? dish.count + "x    " : '') + dish.name);
            }
            else {
                var fixedWidthStrArr = _this.splitByWidth(dish.name, _this.CVS.width - countAndPriceLength);
                fixedWidthStrArr.forEach(function (str, index) {
                    if (dish.count <= 0) {
                        return;
                    }
                    if (index === 0) {
                        _this.oneLine(str, "x" + dish.count);
                    }
                    else {
                        _this.line(str);
                    }
                });
            }
            if (specificationInNewLine) {
                (_a = dish.specifications) === null || _a === void 0 ? void 0 : _a.forEach(function (str, index) {
                    if (str) {
                        _this.line('    ※ ' + str + ' ※');
                    }
                });
            }
            if (lineBetweenDishes) {
                _this.defaultLineHeight();
                _this.size(0);
                if (dishes.length !== index + 1) {
                    _this.printLine('-');
                }
                else {
                    // this.printLine('=');
                }
                _this.size(size);
                if (largeLineHeight) {
                    _this.enlargeLineHeight(Boolean(size));
                }
            }
        });
        this.defaultLineHeight();
        this.size(originSize);
        return this;
    };
    /**
     * 根据打印宽度分割字符串
     *
     * @param  {string}   str  需要被分割的字符串
     * @param  {number}   maxLength  分割长度
     * @returns {Array} 返回被分割的字符串数组
     */
    EscPosImgEncoder.prototype.splitByWidth = function (str, maxLength) {
        if (str === void 0) { str = ''; }
        var result = [];
        for (var i = 0; i < str.length; i++) {
            var char = str.slice(0, i);
            var width = this.getStrWidth(char);
            if (width > maxLength) {
                result.push(str.slice(0, i - 1));
                result = result.concat(this.splitByWidth(str.slice(i - 1), maxLength));
                return result;
            }
        }
        return [str];
    };
    /**
     * 计算字符串的字节长度，也就是打印的宽度
     *
     * @param  {string}   str  需要计算的字符串
     * @returns {number} 返回被分割的字符串数组
     */
    EscPosImgEncoder.prototype.getStrWidth = function (str) {
        var width = this.ctx.measureText(str).width;
        if (this._size === 1) {
            width = width / 2;
        }
        return width;
    };
    /**
     * 打印空行
     *
     * @param {number} num 行数
     * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
     */
    EscPosImgEncoder.prototype.emptyLine = function (num) {
        if (num === void 0) { num = 1; }
        for (var i = 0; i < num; i++) {
            this.heightPosition += this.lineHeight0;
            this.resize(this.CVS.width, this.heightPosition);
        }
        return this;
    };
    /**
     * 根据打印方向返回打印机位置
     *
     * @param {number} pos 正常打印位置
     * @returns {number}  根据打印方向的打印机位置
     */
    EscPosImgEncoder.prototype.getPositionByDir = function (pos) {
        if (this.rtl) {
            return this.CVS.width - pos;
        }
        else {
            return pos;
        }
    };
    /**
     * 拼接两个字符串到固定长度，自动中间加空格
     *
     * @param {string} str1   字符串1
     * @param {string} str2   字符串2
     * @param length
     * @returns {string}   返回处理后的价格字符串
     */
    EscPosImgEncoder.prototype.fixLength = function (str1, str2, length) {
        var spaceNum = (length - this.getStrWidth(str1) - this.getStrWidth(str2)) / this.getStrWidth(' ');
        return str1 + ' '.repeat(spaceNum < 0 ? 0 : spaceNum) + str2;
    };
    /**
     * QR code Img
     *
     * @param  {string}           value  the value of the qr code
     * @param  {number}           model  model of the qrcode, either 1 or 2
     * @param  {number}           size   size of the qrcode, a value between 1 and 8
     * @param  {string}           errorlevel  the amount of error correction used, either 'l', 'm', 'q', 'h'
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    EscPosImgEncoder.prototype.qrcodeImg = function (value, model, size, errorlevel) {
        return __awaiter(this, void 0, void 0, function () {
            var canvas, originHeight;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, QRCode.toCanvas(value)];
                    case 1:
                        canvas = _a.sent();
                        originHeight = this.heightPosition;
                        this.heightPosition += this.CVS.width;
                        this.resize(this.CVS.width, this.heightPosition);
                        this.ctx.drawImage(canvas, 0, originHeight, this.CVS.width, this.CVS.width);
                        return [2 /*return*/, this];
                }
            });
        });
    };
    return EscPosImgEncoder;
}(esc_pos_encoder_1.default));
exports.default = EscPosImgEncoder;
