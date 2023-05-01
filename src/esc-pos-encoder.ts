import * as iconv from 'iconv-lite';
import * as linewrap from 'linewrap';
import * as Dither from 'canvas-dither';
import * as Flatten from 'canvas-flatten';
import * as QRCode from 'qrcode';

interface PrinterParam {
  width: number;
  singleCharLength: number;
  doubleCharLength: number;
}

export enum PrinterWidthEnum {
  '_58' = 58,
  '_80' = 80,
}

/**
 * Create a byte stream based on commands for ESC/POS printers
 */
export default class EscPosEncoder {
    protected _buffer
    private _codepage
    private _state
    protected _size = 0
    private _58printerParam: PrinterParam = {
      width: 384,
      singleCharLength: 31,
      doubleCharLength: 15,
    }
    private _80printerParam: PrinterParam = {
      width: 568,
      singleCharLength: 47,
      doubleCharLength: 23,
    }

    private _printerParam: PrinterParam


    /**
     * 返回每行的单字节长度
     *
     * @returns {number} 每行的单字节长度
     */
    protected get singleCharLengthPerLine(): number {
      return Math.floor(this._size===2?this._printerParam.singleCharLength/2:this._printerParam.singleCharLength);
    }

    /**
     * Create a new EscPosEncoder
     *
     */
    constructor() {
      this._reset();
    }

    /**
     * Reset the state of the EscPosEncoder
     *
     */
    protected _reset(): void {
      this._buffer = [];
      this._codepage = 'ascii';
      this._printerParam = this._58printerParam;

      this._state = {
        'bold': false,
        'italic': false,
        'underline': false,
        'hanzi': false,
      };
    }

    /**
     * Encode a string with the current code page
     *
     * @param  {string}   value  String to encode
     * @returns {Buffer}          Encoded string as a ArrayBuffer
     *
     */
    private _encode(value: string): Buffer {
      return iconv.encode(value, this._codepage);
    }

    /**
     * Add commands to the buffer
     *
     * @param  {Array}   value  And array of numbers, arrays, buffers or Uint8Arrays to add to the buffer
     *
     */
    protected _queue(value): void {
      value.forEach((item) => this._buffer.push(item));
    }

    /**
     * 获取单个字符的字节数，也就是打印占宽
     *
     * @param  {string}   char  需要被分割的字符串
     * @returns {number} 返回字节数（占宽）
     */
    private getCharLength(char: string): number {
      let length;
      // eslint-disable-next-line no-control-regex
      if (/^[\x00-\xff]$/.test(char)) {
        length = 1;
      } else {
        length = 2;
      }
      return length;
    }

    /**
     * 根据打印宽度分割字符串
     *
     * @param  {string}   str  需要被分割的字符串
     * @param  {number}   maxLength  分割长度
     * @returns {Array} 返回被分割的字符串数组
     */
    protected splitByWidth(str='', maxLength: number): string[] {
      let width = 0;
      let result: string[] = [];
      for (let i = 0; i < str.length; i++) {
        const char = str.charAt(i);
        width += this.getCharLength(char);
        if (width > maxLength) {
          result.push(str.slice(0, i));
          result = result.concat(this.splitByWidth(str.slice(i), maxLength));
          return result;
        }
      }
      return [str];
    }

    /**
     * 计算字符串的字节长度，也就是打印的宽度
     *
     * @param  {string}   str  需要计算的字符串
     * @returns {number} 返回被分割的字符串数组
     */
    protected getStrWidth(str: string): number {
      let width = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charAt(i);
        width += this.getCharLength(char);
      }
      return width;
    }

    /**
     * Initialize the printer
     *
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    initialize(): EscPosEncoder {
      this._queue([
        0x1b, 0x40,
      ]);

      return this;
    }

    /**
     * 设置打印机宽度
     *
     * @param  {PrinterWidthEnum}   type  需要被分割的字符串
     * @returns {EscPosEncoder} 返回this
     */
    setPinterType(type: PrinterWidthEnum): EscPosEncoder {
      if (type===PrinterWidthEnum._58) {
        this._printerParam = this._58printerParam;
      } else if (type===PrinterWidthEnum._80) {
        this._printerParam = this._80printerParam;
      }
      return this;
    }

    /**
     * 打印一行字符
     *
     * @param {string} char 打印成行的字符
     * @param {string} message 提示信息
     * @param {boolean} middle 提示信息显示在行间
     * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
     */
    printLine(char: string, message='', middle= false): EscPosEncoder {
      char = char.slice(0, 1);
      const restLength = this.singleCharLengthPerLine - this.getStrWidth(message);
      if (middle) {
        this.line(char.repeat(Math.floor(restLength/2))+message+char.repeat(Math.ceil(restLength/2)));
      } else {
        this.line(char.repeat(this.singleCharLengthPerLine));
        if (message) {
          this.line(' '.repeat(Math.floor(restLength/2))+message+' '.repeat(Math.ceil(restLength/2)));
        }
      }
      return this;
    }

    /**
     * 打印空行
     *
     * @param {number} num 行数
     * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
     */
    emptyLine(num=1): EscPosEncoder {
      for (let i = 0; i < num; i++) {
        this.line('');
      }
      return this;
    }

    /**
     * 前台打印菜品，包含菜品名称，数量，价格
     *
     * @param {Array} dishes 菜品信息数组
     * @param {number} size 字体大小,默认1
     * @param {boolean} bigPrice 小币种价格，默认false
     * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
     */
    printFrontDeskDishs({dishes, size=1, bigPrice, largeLineHeight, lineBetweenDishes, specificationInNewLine, showUnitPrice}: {
      dishes: {name: string; count: number; price: number; specifications: string[]}[];
      size: number;
      bigPrice: boolean;
      largeLineHeight: boolean;
      lineBetweenDishes: boolean;
      specificationInNewLine: boolean;
      showUnitPrice: boolean;
    }): EscPosEncoder {
      const originSize = this._size;
      const countAndPriceLength = (bigPrice || showUnitPrice) ?13:10; // 价格和个数的长度
      const countAndPriceLengthWithUnitPrice = 24; // 包含单价情况价格和个数的长度
      const getCountAndPriceStr = (count: number, price: number): string => {
        const unitPriceStr = bigPrice?this.bigPriceFormat(price):price.toFixed(2);
        const totalPriceStr = bigPrice?this.bigPriceFormat(price*count):(price*count).toFixed(2);
        const countStr = 'x' + count;
        if (showUnitPrice) {
          const countAndUnitPrice = this.fixLength(countStr, unitPriceStr, countAndPriceLength);
          return this.fixLength(countAndUnitPrice, totalPriceStr, countAndPriceLengthWithUnitPrice);
        } else {
          return this.fixLength(countStr, totalPriceStr, countAndPriceLength);
        }
      };
      this.size(size);
      if (largeLineHeight) {
        this.enlargeLineHeight(Boolean(size));
      }
      dishes.forEach((dish, index) => {
        if (dish.count <= 0) {
          return;
        }
        if (showUnitPrice) {
          this.line(dish.name);
          this.oneLine('', getCountAndPriceStr(dish.count, dish.price));
        } else {
          const nameArr = dish.name.split('\n');
          for (let i=0; i<nameArr.length; i++) {
            const name = nameArr[i];
            const fixedWidthStrArr = this.splitByWidth(
                name,
                this.singleCharLengthPerLine-countAndPriceLength-2
            );
            fixedWidthStrArr.forEach((str, index) => {
              if (i===0 && index === 0) {
                this.oneLine(str, getCountAndPriceStr(dish.count, dish.price));
              } else {
                this.line(str);
              }
            });
          }
        }
        if (specificationInNewLine) {
          dish.specifications?.forEach((str, index) => {
            if (str) {
              const strArr = str.split('\n');
              strArr.forEach((specString)=>{
                this.line('  * '+str+' *');
              });
            }
          });
        }
        if (lineBetweenDishes) {
          this.defaultLineHeight();
          this.size(0);
          if (dishes.length !== index+1) {
            this.printLine('-');
          }
          this.size(size);
          if (largeLineHeight) {
            this.enlargeLineHeight(Boolean(size));
          }
        }
      });
      this.size(0);
      this.defaultLineHeight();
      this.printLine('=');
      this.size(originSize);
      return this;
    }

    /**
     * 后厨打印菜品，包含菜品名称，数量，不包含价格
     *
     * @param {Array} dishes 菜品信息数组
     * @param {number} size 字体大小,默认2
     * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
     */
    printChefDishs({dishes, size=2, largeLineHeight, lineBetweenDishes, specificationInNewLine, countFront}: {
      dishes: {name: string; count: number; specifications: string[]}[];
      size: number;
      largeLineHeight: boolean;
      lineBetweenDishes: boolean;
      specificationInNewLine: boolean;
      countFront: boolean;
    }): EscPosEncoder {
      const originSize = this._size;
      const countAndPriceLength = 3; // 价格和个数的长度
      this.size(size);
      if (largeLineHeight) {
        this.enlargeLineHeight(Boolean(size));
      }
      dishes.forEach((dish, index) => {
        if (dish.count<=0) {
          return;
        }
        if (countFront) {
          this.line((dish.count>1?`${dish.count}x  `:'')+dish.name);
        } else {
          const fixedWidthStrArr = this.splitByWidth(
              dish.name,
              this.singleCharLengthPerLine-countAndPriceLength
          );
          fixedWidthStrArr.forEach((str, index) => {
            if (index === 0) {
              this.oneLine(str, `x${dish.count}`);
            } else {
              this.line(str);
            }
          });
        }
        if (specificationInNewLine) {
          dish.specifications?.forEach((str, index) => {
            if (str) {
              this.line('  * '+str+' *');
            }
          });
        }
        if (lineBetweenDishes) {
          this.defaultLineHeight();
          this.size(0);
          if (dishes.length !== index+1) {
            this.printLine('-');
          } else {
            // this.printLine('=');
          }
          this.size(size);
          if (largeLineHeight) {
            this.enlargeLineHeight(Boolean(size));
          }
        }
      });
      this.defaultLineHeight();
      this.size(originSize);
      return this;
    }

    /**
     * Change the code page
     *
     * @param  {string}   value  The codepage that we set the printer to
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    codepage(value: string): EscPosEncoder {
      const codepages = {
        'utf-8': [null, false],
        'cp850': [0x02, false],
        'cp949': [null, true],
        'cp936': [null, true],
        'cp1258': [null, false],
        // 'cp437': [0x00, false],
        // 'cp737': [0x40, false],
        // 'cp775': [0x5f, false],
        // 'cp852': [0x12, false],
        // 'cp855': [0x3c, false],
        // 'cp857': [0x3d, false],
        // 'cp858': [0x13, false],
        // 'cp860': [0x03, false],
        // 'cp861': [0x38, false],
        // 'cp862': [0x3e, false],
        // 'cp863': [0x04, false],
        // 'cp864': [0x1c, false],
        // 'cp865': [0x05, false],
        // 'cp866': [0x11, false],
        // 'cp869': [0x42, false],
        // 'cp949': [0xfd, true],
        // 'cp950': [0xfe, true],
        // 'cp1252': [0x10, false],
        // 'iso88596': [0x16, false],
        // 'shiftjis': [0xfc, true],
        // 'windows874': [0x1e, false],
        // 'windows1250': [0x48, false],
        // 'windows1251': [0x49, false],
        // 'windows1252': [0x47, false],
        // 'windows1253': [0x5a, false],
        // 'windows1254': [0x5b, false],
        // 'windows1255': [0x20, false],
        // 'windows1256': [0x5c, false],
        // 'windows1257': [0x19, false],
        // 'windows1258': [0x5e, false],
      };

      if (!iconv.encodingExists(value)) {
        throw new Error('Unknown codepage');
      }

      const codepage = value;

      if (typeof codepages[codepage] !== 'undefined') {
        this._codepage = codepage;
        this._state.hanzi = codepages[codepage][1];

        // 大部分打印机的codepage顺序表都是不一样的, 只有比较确定的这里开启自动设置, 不太确定的这里跳过设置, 要让用户自己用工具设置打印机
        if (codepages[codepage][0]!==null) {
          this._queue([
            0x1b, 0x74, codepages[codepage][0],
          ]);
        }
      } else {
        throw new Error('Codepage not supported by printer');
      }

      return this;
    }

    /**
     * Print text
     *
     * @param  {string}   value  Text that needs to be printed
     * @param  {number}   wrap   Wrap text after this many positions
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    text(value: string, wrap?: number): EscPosEncoder {
      if (wrap) {
        const w = linewrap(wrap, {lineBreak: '\r\n'});
        value = w(value);
      }

      const bytes = this._encode(value);

      if (this._state.hanzi) {
        this._queue([
          0x1c, 0x26, bytes, 0x1c, 0x2e,
        ]);
      } else {
        this._queue([
          bytes,
        ]);
      }

      return this;
    }

    /**
     * Print a newline
     *
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    newline(): EscPosEncoder {
      this._queue([
        0x0a, 0x0d,
      ]);

      return this;
    }

    /**
     * Print text, followed by a newline
     *
     * @param  {string}   value  Text that needs to be printed
     * @param  {number}   wrap   Wrap text after this many positions
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    line(value: string, wrap?: number): EscPosEncoder {
      if (value.includes('\n')) {
        value.split('\n').forEach((item)=>{
          this.line(item);
        });
        return this;
      }
      this.text(value, wrap);
      this.newline();

      return this;
    }

    /**
     * 打印两个字符分别在纸的左右两侧
     *
     * @param  {string}   str1  左侧的字符串
     * @param  {string}   str2  右侧的字符串
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    oneLine(str1: string, str2: string): EscPosEncoder {
      let multiToMulti = false;
      if (str1.includes('\n')) {
        if (str2.includes('\n')) {
          multiToMulti = true;
        } else {
          str1.split('\n').forEach((item, index)=>{
            this.oneLine(item, index===0?str2:'');
          });
          return this;
        }
      }
      this.align('left');
      const spaceNum = this.singleCharLengthPerLine - this.getStrWidth(str1) - this.getStrWidth(str2);
      if (spaceNum<0 || multiToMulti) {
        this.line(str1);
        this.line(str2);
      } else {
        this.line(str1 + ' '.repeat(spaceNum) + str2);
      }
      return this;
    }

    /**
     * Underline text
     *
     * @param  {boolean|number}   value  true to turn on underline, false to turn off, or 2 for double underline
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    underline(value: boolean | number): EscPosEncoder {
      if (typeof value === 'undefined') {
        value = !this._state.underline;
      }

      this._state.underline = value;

      this._queue([
        0x1b, 0x2d, Number(value),
      ]);

      return this;
    }

    /**
     * Italic text
     *
     * @param  {boolean}          value  true to turn on italic, false to turn off
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    italic(value: boolean): EscPosEncoder {
      if (typeof value === 'undefined') {
        value = !this._state.italic;
      }

      this._state.italic = value;

      this._queue([
        0x1b, 0x34, Number(value),
      ]);

      return this;
    }

    /**
     * Bold text
     *
     * @param  {boolean}          value  true to turn on bold, false to turn off, or 2 for double underline
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    bold(value: boolean): EscPosEncoder {
      if (typeof value === 'undefined') {
        value = !this._state.bold;
      }

      this._state.bold = value;

      this._queue([
        0x1b, 0x45, Number(value),
      ]);

      return this;
    }

    /**
     * 设置行间距
     *
     * @param  {boolean}          bigFont  是否大号字体
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    enlargeLineHeight(bigFont: boolean): EscPosEncoder {
      const height=bigFont?47:30;
      this._queue([0x1d, 0x50, 0x00, 127]);
      this._queue([
        0x1b, 0x33, height,
      ]);

      return this;
    }

    /**
     * 回到默认行间距
     *
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    defaultLineHeight(): EscPosEncoder {
      this._queue([
        0x1b, 0x32, 0,
      ]);

      return this;
    }

    /**
     * Change text size
     *
     * @param  {number}          value   small or normal
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    size(value: number): EscPosEncoder {
      let realSize = 0;
      this._size = value;
      switch (value) {
        case 0:// 正常字体
          realSize = 0;
          break;
        case 1:// 高度加倍
          realSize = 1;
          break;
        case 2:// 宽高都加倍
          realSize = 17;
          break;
      }

      this._queue([
        0x1b, 0x4d, 0x00,
      ]);
      this._queue([
        0x1d, 0x21, realSize,
      ]);

      return this;
    }

    /**
     * Change text alignment
     *
     * @param  {string}          value   left, center or right
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    align(value: string): EscPosEncoder {
      const alignments = {
        'left': 0x00,
        'center': 0x01,
        'right': 0x02,
      };

      if (value in alignments) {
        this._queue([
          0x1b, 0x61, alignments[value],
        ]);
      } else {
        throw new Error('Unknown alignment');
      }

      return this;
    }

    /**
     * Barcode
     *
     * @param  {string}           value  the value of the barcode
     * @param  {string}           symbology  the type of the barcode
     * @param  {number}           height  height of the barcode
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    barcode(value: string, symbology: string, height: number): EscPosEncoder {
      const symbologies = {
        'upca': 0x00,
        'upce': 0x01,
        'ean13': 0x02,
        'ean8': 0x03,
        'code39': 0x04,
        'itf': 0x05,
        'codabar': 0x06,
        'code93': 0x48,
        'code128': 0x49,
        'gs1-128': 0x50,
        'gs1-databar-omni': 0x51,
        'gs1-databar-truncated': 0x52,
        'gs1-databar-limited': 0x53,
        'gs1-databar-expanded': 0x54,
        'code128-auto': 0x55,
      };

      if (symbology in symbologies) {
        const bytes = iconv.encode(value, 'ascii');

        this._queue([
          0x1d, 0x68, height,
          0x1d, 0x77, symbology === 'code39' ? 0x02 : 0x03,
        ]);


        if (symbology == 'code128' && bytes[0] !== 0x7b) {
        /* Not yet encodeded Code 128, assume data is Code B, which is similar to ASCII without control chars */

          this._queue([
            0x1d, 0x6b, symbologies[symbology],
            bytes.length + 2,
            0x7b, 0x42,
            bytes,
          ]);
        } else if (symbologies[symbology] > 0x40) {
        /* Function B symbologies */

          this._queue([
            0x1d, 0x6b, symbologies[symbology],
            bytes.length,
            bytes,
          ]);
        } else {
        /* Function A symbologies */

          this._queue([
            0x1d, 0x6b, symbologies[symbology],
            bytes,
            0x00,
          ]);
        }
      } else {
        throw new Error('Symbology not supported by printer');
      }

      return this;
    }

    /**
     * QR code
     *
     * @param  {string}           value  the value of the qr code
     * @param  {number}           model  model of the qrcode, either 1 or 2
     * @param  {number}           size   size of the qrcode, a value between 1 and 8
     * @param  {string}           errorlevel  the amount of error correction used, either 'l', 'm', 'q', 'h'
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    qrcode(value: string, model: number, size: number, errorlevel: string): EscPosEncoder {
      /* Force printing the print buffer and moving to a new line */

      this._queue([
        0x0a,
      ]);

      /* Model */

      const models = {
        1: 0x31,
        2: 0x32,
      };

      if (typeof model === 'undefined') {
        model = 2;
      }

      if (model in models) {
        this._queue([
          0x1d, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, models[model], 0x00,
        ]);
      } else {
        throw new Error('Model must be 1 or 2');
      }

      /* Size */

      if (typeof size === 'undefined') {
        size = 6;
      }

      if (typeof size !== 'number') {
        throw new Error('Size must be a number');
      }

      if (size < 1 || size > 8) {
        throw new Error('Size must be between 1 and 8');
      }

      this._queue([
        0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, size,
      ]);

      /* Error level */

      const errorlevels = {
        'l': 0x30,
        'm': 0x31,
        'q': 0x32,
        'h': 0x33,
      };

      if (typeof errorlevel === 'undefined') {
        errorlevel = 'm';
      }

      if (errorlevel in errorlevels) {
        this._queue([
          0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, errorlevels[errorlevel],
        ]);
      } else {
        throw new Error('Error level must be l, m, q or h');
      }

      /* Data */

      const bytes = iconv.encode(value, 'iso88591');
      const length = bytes.length + 3;

      this._queue([
        0x1d, 0x28, 0x6b, length % 0xff, length / 0xff, 0x31, 0x50, 0x30, bytes,
      ]);

      /* Print QR code */

      this._queue([
        0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30,
      ]);

      return this;
    }

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
    async qrcodeImg(value: string, model?: number, size?: number, errorlevel?: string): Promise<EscPosEncoder> {
      const canvas = await QRCode.toCanvas(value);
      this.image(canvas, this._printerParam.width, this._printerParam.width, 'threshold');
      return this;
    }

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
    image(element, width, height, algorithm, threshold?): EscPosEncoder {
      if (width % 8 !== 0) {
        throw new Error('Width must be a multiple of 8');
      }

      if (height % 8 !== 0) {
        throw new Error('Height must be a multiple of 8');
      }

      if (typeof algorithm === 'undefined') {
        algorithm = 'threshold';
      }

      if (typeof threshold === 'undefined') {
        threshold = 128;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      context.drawImage(element, 0, 0, width, height);
      let image = context.getImageData(0, 0, width, height);

      image = Flatten.flatten(image, [0xff, 0xff, 0xff]);

      switch (algorithm) {
        case 'threshold': image = Dither.threshold(image, threshold); break;
        case 'bayer': image = Dither.bayer(image, threshold); break;
        case 'floydsteinberg': image = Dither.floydsteinberg(image); break;
        case 'atkinson': image = Dither.atkinson(image); break;
      }

      const getPixel = (x, y) => image.data[((width * y) + x) * 4] > 0 ? 0 : 1;

      const bytes = new Uint8Array((width * height) >> 3);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x = x + 8) {
          const i = (y * (width >> 3)) + (x >> 3);
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
      this._queue([
        0x1d, 0x76, 0x30, 0x00,
        (width >> 3) & 0xff, (((width >> 3) >> 8) & 0xff),
        height & 0xff, ((height >> 8) & 0xff),
        bytes,
      ]);

      return this;
    }

    /**
     * Cut paper
     *
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    cut(): EscPosEncoder {
      this._queue([
        0x1d, 0x56, 0x41, 0x00,
      ]);

      return this;
    }

    /**
     * 打开钱箱
     *
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    openCashBox(): EscPosEncoder {
      this._queue([
        0x1b, 0x70, 0x00, 0x3c, 0xff,
      ]);

      return this;
    }

    /**
     * Cut paper partial
     *
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    cutPartial(): EscPosEncoder {
      this._queue([
        0x1d, 0x56, 0x42, 0x00,
      ]);

      return this;
    }

    /**
     * Add raw printer commands
     *
     * @param  {Array}           data   raw bytes to be included
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    raw(data: Array<number>): EscPosEncoder {
      this._queue(data);

      return this;
    }

    /**
     * Encode all previous commands
     *
     * @returns {Uint8Array}         Return the encoded bytes
     *
     */
    encode(): Uint8Array {
      let length = 0;

      this._buffer.forEach((item) => {
        if (typeof item === 'number') {
          length++;
        } else {
          length += item.length;
        }
      });

      const result = new Uint8Array(length);

      let index = 0;

      this._buffer.forEach((item) => {
        if (typeof item === 'number') {
          result[index] = item;
          index++;
        } else {
          result.set(item, index);
          index += item.length;
        }
      });

      this._reset();

      return result;
    }

    /**
     * 格式化小额币种价格
     *
     * @param  {number}   price   原始价格
     * @returns {string}   返回处理后的价格字符串，10000.54 =》 10,000
     *
     */
    bigPriceFormat(price: number): string {
      const removeTailPriceStrArr = String(Math.floor(price)).split('').reverse();
      for (let i=3; i<removeTailPriceStrArr.length; i+=3) {
        console.log(i);
        removeTailPriceStrArr.splice(i, 0, ',');
        i++;
      }
      return removeTailPriceStrArr.reverse().join('');
    }

    /**
     * 拼接两个字符串到固定长度，自动中间加空格
     *
     * @param {string} str1   字符串1
     * @param {string} str2   字符串2
     * @param length
     * @returns {string}   返回处理后的价格字符串
     */
    protected fixLength(str1: string, str2: string, length: number): string {
      const spaceNum = length - this.getStrWidth(str1) - this.getStrWidth(str2);
      return str1 + ' '.repeat(spaceNum<0?0:spaceNum) + str2;
    }
}
