"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var iconv = require("iconv-lite");
var Dither = require("canvas-dither");
var Flatten = require("canvas-flatten");
/**
 * Create a byte stream based on commands for ESC/POS printers
 */
var TsplLabelEncoder = /** @class */ (function () {
    // private fontValue = '28px "Custom"';
    /**
     * Create a new TsplLabelEncoder
     *
     */
    function TsplLabelEncoder() {
        this._codepage = 'ascii';
        this._reset();
    }
    /**
     * Reset the state of the TsplLabelEncoder
     *
     */
    TsplLabelEncoder.prototype._reset = function () {
        this._buffer = [];
    };
    /**
     * Encode a string with the current code page
     *
     * @param  {string}   value  String to encode
     * @returns {Buffer}          Encoded string as a ArrayBuffer
     *
     */
    TsplLabelEncoder.prototype._encode = function (value) {
        return iconv.encode(value, this._codepage);
    };
    /**
     * Add commands to the buffer
     *
     * @param  {Array}   value  And array of numbers, arrays, buffers or Uint8Arrays to add to the buffer
     *
     */
    TsplLabelEncoder.prototype._queue = function (value) {
        var _this = this;
        value.forEach(function (item) { return _this._buffer.push(item); });
    };
    /**
     * 获取单个字符的字节数，也就是打印占宽
     *
     * @param  {string}   char  需要被分割的字符串
     * @returns {number} 返回字节数（占宽）
     */
    TsplLabelEncoder.prototype.getCharLength = function (char) {
        var length;
        // eslint-disable-next-line no-control-regex
        if (/^[\x00-\xff]$/.test(char)) {
            length = 1;
        }
        else {
            length = 2;
        }
        return length;
    };
    /**
     * 根据打印宽度分割字符串
     *
     * @param  {string}   str  需要被分割的字符串
     * @param  {number}   maxLength  分割长度
     * @returns {Array} 返回被分割的字符串数组
     */
    TsplLabelEncoder.prototype.splitByWidth = function (str, maxLength) {
        if (str === void 0) { str = ''; }
        var width = 0;
        var result = [];
        for (var i = 0; i < str.length; i++) {
            var char = str.charAt(i);
            width += this.getCharLength(char);
            if (width > maxLength) {
                result.push(str.slice(0, i));
                result = result.concat(this.splitByWidth(str.slice(i), maxLength));
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
    TsplLabelEncoder.prototype.getStrWidth = function (str) {
        var width = 0;
        for (var i = 0; i < str.length; i++) {
            var char = str.charAt(i);
            width += this.getCharLength(char);
        }
        return width;
    };
    /**
     * 初始化
     *
     * @param  {number}   width  标签宽度 单位mm
     * @param  {number}   height   标签高度 单位mm
     * @param  {number}   isRotate   是否旋转标签
     * @returns {TsplLabelEncoder}          Return the TsplLabelEncoder, for easy chaining commands
     *
     */
    TsplLabelEncoder.prototype.init = function (width, height, isRotate) {
        if (isRotate === void 0) { isRotate = false; }
        this.CVS = document.createElement('canvas');
        this.CVS.width = width * 8;
        this.CVS.height = height * 8;
        this.ctx = this.CVS.getContext('2d');
        this.ctx.textBaseline = 'top';
        if (isRotate) {
            this.ctx.translate(this.CVS.width / 2, this.CVS.height / 2);
            this.ctx.rotate(Math.PI);
            this.ctx.translate(-this.CVS.width / 2, -this.CVS.height / 2);
        }
        this.command("\n        SIZE " + width + " mm, " + height + " mm\n        GAP 2 mm\n        CLS\n      ");
        return this;
    };
    /**
     * Print text
     *
     * @param  {string}   value  Text that needs to be printed
     * @param  {number}   x   文字左上角横坐标
     * @param  {number}   y   文字左上角纵坐标
     * @param  {number}   size   文字大小，0小，1瘦体，2大
     * @returns {TsplLabelEncoder}          Return the TsplLabelEncoder, for easy chaining commands
     *
     */
    TsplLabelEncoder.prototype.text = function (value, x, y, size) {
        switch (size) {
            case 0: // 正常字体
                this.ctx.font = '24px "Custom"';
                this.ctx.fillText(value, x, y);
                break;
            case 1: // 高度加倍
                this.ctx.font = '48px "Custom"';
                this.ctx.transform(.5, 0, 0, 1, 0, 0);
                this.ctx.fillText(value, x * 2, y);
                this.ctx.transform(2, 0, 0, 1, 0, 0);
                break;
            case 2: // 宽高都加倍
                this.ctx.font = '48px "Custom"';
                this.ctx.fillText(value, x, y);
                break;
        }
        return this;
    };
    /**
     * Print text command
     *
     * @param  {string}   value  Text that needs to be printed
     * @returns {TsplLabelEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    TsplLabelEncoder.prototype.command = function (value) {
        var bytes = this._encode(value);
        this._queue([
            bytes,
        ]);
        return this;
    };
    /**
     * Image
     *
     * @param  {object}         element  an element, like a canvas or image that needs to be printed
     * @param  {number}         width  width of the image on the printer
     * @param  {number}         height  height of the image on the printer
     * @param  {string}         algorithm  the dithering algorithm for making the image black and white
     * @param  {number}         threshold  threshold for the dithering algorithm
     * @returns {object}                  Return the object, for easy chaining commands
     *
     */
    TsplLabelEncoder.prototype.image = function (element, width, height) {
        var image = this.ctx.getImageData(0, 0, width, height);
        image = Flatten.flatten(image, [0xff, 0xff, 0xff]);
        image = Dither.threshold(image, 128);
        var getPixel = function (x, y) { return image.data[((width * y) + x) * 4] > 0 ? 1 : 0; };
        var bytes = new Array((width * height) >> 3);
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x = x + 8) {
                var i = (y * (width >> 3)) + (x >> 3);
                bytes[i] =
                    getPixel(x + 0, y) << 7 |
                        getPixel(x + 1, y) << 6 |
                        getPixel(x + 2, y) << 5 |
                        getPixel(x + 3, y) << 4 |
                        getPixel(x + 4, y) << 3 |
                        getPixel(x + 5, y) << 2 |
                        getPixel(x + 6, y) << 1 |
                        getPixel(x + 7, y);
            }
        }
        this.command("BITMAP 0,0," + ((width >> 3) & 0xff) + "," + height + ",0,");
        this.raw(bytes);
        return this;
    };
    /**
     * Add raw printer commands
     *
     * @param  {Array}           data   raw bytes to be included
     * @returns {TsplLabelEncoder}          Return the TsplLabelEncoder, for easy chaining commands
     *
     */
    TsplLabelEncoder.prototype.raw = function (data) {
        this._queue(data);
        return this;
    };
    /**
     * Encode all previous commands
     *
     * @returns {Uint8Array}         Return the encoded bytes
     *
     */
    TsplLabelEncoder.prototype.labelEncode = function () {
        var result;
        this.image(this.CVS, this.CVS.width, this.CVS.height);
        this.command("\n        PRINT 1,1\n      ");
        result = this.encode();
        this._reset();
        return result;
    };
    /**
     * Encode all previous commands
     *
     * @returns {Uint8Array}         Return the encoded bytes
     *
     */
    TsplLabelEncoder.prototype.encode = function () {
        var length = 0;
        this._buffer.forEach(function (item) {
            if (typeof item === 'number') {
                length++;
            }
            else {
                length += item.length;
            }
        });
        var result = new Uint8Array(length);
        var index = 0;
        this._buffer.forEach(function (item) {
            if (typeof item === 'number') {
                result[index] = item;
                index++;
            }
            else {
                result.set(item, index);
                index += item.length;
            }
        });
        this._reset();
        return result;
    };
    return TsplLabelEncoder;
}());
exports.default = TsplLabelEncoder;
