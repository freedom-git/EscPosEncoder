import EscPosEncoder, { PrinterWidthEnum } from './esc-pos-encoder';
import * as QRCode from 'qrcode';


enum AlignEnum {
  'left' = 'left',
  'center' = 'center',
  'right' = 'right',
}


/**
 * Create a byte stream based on commands for ESC/POS printers
 */
export default class EscPosImgEncoder extends EscPosEncoder {
  private CVS: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D
  private alignValue: AlignEnum = AlignEnum.left
  private fontValue = '28px "Custom"';
  private width58 = 384;
  private width80 = 568;
  private lineHeight = 32;
  private lineHeight0 = 32;
  private lineHeight2 = 56;
  private heightPosition = 32
  private cutAtFinal = false
  private fontFoot = 16; // 给字体下方留下空间，防止截断
  private fontFamily = "Custom";
  private lineHeightInterval = 0;
  private rtl = false;


  /**
   * Create a new EscPosEncoder
   */
  constructor({fontFamily,canvas,rtl=false}:{fontFamily?:string,canvas:HTMLCanvasElement,rtl?:boolean}) {
    super();
    this.CVS = canvas;
    if(rtl) {
      this.rtl = true;
      this.CVS.setAttribute('dir','rtl')
    }else {
      this.rtl = false;
      this.CVS.setAttribute('dir','ltr')
    }
    if (fontFamily) {
      this.fontFamily = fontFamily;
    }
    this._reset();
    // registerFont('../../../../src/assets/font/锐字云字库胖头鱼体GBK.ttf', {family: 'Custom'});
  }

  /**
   * Reset the state of the EscPosEncoder
   *
   */
  protected _reset(): void {
    if (this.CVS) {// 如果是子类调用再执行，父类构造函数调用不能执行，因为this还没初始化
      this.heightPosition = 32;
      this.ctx = this.CVS.getContext('2d');
      this.ctx.textBaseline = 'bottom';
      this.resize(this.width58, 0);
    }
    super._reset();
  }

  /**
   * Change the code page
   *
   * @param  {string}   value  The codepage that we set the printer to
   * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
   *
   */
  codepage(value: string): EscPosEncoder {
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
    this._size = value;
    switch (value) {
      case 0:// 正常字体
        this.fontValue = `28px "${this.fontFamily}"`;
        this.lineHeight = this.lineHeight0 + this.lineHeightInterval;
        break;
      case 1:// 高度加倍
        this.fontValue = `56px "${this.fontFamily}"`;
        this.lineHeight = this.lineHeight2 + this.lineHeightInterval;
        break;
      case 2:// 宽高都加倍
        this.fontValue = `56px "${this.fontFamily}"`;
        this.lineHeight = this.lineHeight2 + this.lineHeightInterval;
        break;
    }
    this.ctx.font = this.fontValue;
    return this;
  }

  /**
   * 设置打印机宽度
   *
   * @param  {PrinterWidthEnum}   type  需要被分割的字符串
   * @returns {EscPosEncoder} 返回this
   */
  setPinterType(type: PrinterWidthEnum): EscPosEncoder {
    if (type === PrinterWidthEnum._58) {
      this.resize(this.width58, this.CVS.height);
    } else if (type === PrinterWidthEnum._80) {
      this.resize(this.width80, this.CVS.height);
    }
    super.setPinterType(type);
    return this;
  }

  /**
   * Change text alignment
   *
   * @param  {string}          value   left, center or right
   * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
   *
   */
  align(value: AlignEnum | string): EscPosEncoder {
    if (!AlignEnum[value]) {
      throw new Error('Unknown alignment');
    }
    this.alignValue = value as AlignEnum;
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
    if(value.includes('\n')) {
      value.split('\n').forEach((item)=>{
        this.line(item);
      })
      return this;
    }
    const fixedWidthStrArr = this.splitByWidth(
      value,
      this.CVS.width
    );
    fixedWidthStrArr.forEach((str) => {
      this.newline();
      this.text(str, wrap);
    });
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
    const width = this.getStrWidth(value);
    switch (this.alignValue) {
      case AlignEnum.left:
        this._fillText(value, this.getPositionByDir(0), this.heightPosition);
        break;
      case AlignEnum.center:
        this._fillText(value,this.getPositionByDir((this.CVS.width - width) / 2), this.heightPosition);
        break;
      case AlignEnum.right:
        this._fillText(value, this.getPositionByDir(this.CVS.width - width), this.heightPosition);
        break;
      default:
        throw new Error('align error');
    }
    return this;
  }

    /**
   * fill text
   *
   * @param  {string}   value  Text that needs to be printed
   * @param  {number}   wrap   Wrap text after this many positions
   * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
   *
   */
  private _fillText(text,x,y){
    if(this._size === 1) {
      this.ctx.transform(.5, 0, 0, 1, 0, 0);
      this.ctx.fillText(this._handleDerection(text), x*2, y);
      this.ctx.transform(2, 0, 0, 1, 0, 0);
    }else {
      this.ctx.fillText(this._handleDerection(text), x, y);
    }
  }

    /**
   * handle text direction for ltr and rtl mix print
   *
   * @param  {string}   text  Text that needs to be printed
   * @returns {string}          return fixed string
   *
   */
  private _handleDerection(text) {
    const direction = this._getTextDirection(text)
    const bidiChar = direction === "rtl" ? "\u202B" : "\u202A";
    const bidiText = bidiChar + text;
    return bidiText
  }

  private _getTextDirection(text) {
    const ltrChars = /[\u0000-\u05FF\u2000-\u206F]/; // LTR character range
    const rtlChars = /[\u0590-\u07FF\uFB1D-\uFDFF\uFE70-\uFEFC]/; // RTL character range
  
    let rtlCount = 0;
    let ltrCount = 0;
  
    // iterate over each character in the string
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (rtlChars.test(char)) {
        rtlCount++;
      } else if (ltrChars.test(char)) {
        ltrCount++;
      }
    }
  
    if (rtlCount > ltrCount) {
      return "rtl";
    } else {
      return "ltr";
    }
  }

  /**
   * Print a newline
   *
   * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
   *
   */
  newline(): EscPosEncoder {
    this.heightPosition += this.lineHeight;
    this.resize(this.CVS.width, this.heightPosition);
    return this;
  }

  /**
   * 动态修改画布大小
   *
   * @param {number} w  宽
   * @param {number} h  高
   */
  resize(w, h): void {
    const imgData = this.ctx.getImageData(0, 0, this.CVS.width, this.CVS.height);
    this.CVS.width = w;
    this.CVS.height = h + this.fontFoot;
    this.ctx.putImageData(imgData, 0, 0);
    this.ctx.font = this.fontValue;
  }

  /**
   * Encode all previous commands
   *
   * @returns {Uint8Array}         Return the encoded bytes
   *
   */
  encode(): Uint8Array {
    let result;
    try {
      // 初始化打印机，防止持续乱码
      this._queue([0x1B, 0x40]);
      const interval = 1000; // 每个图片的最大高度
      const count = Math.ceil(this.CVS.height/interval); // 打碎成多少个图片的拼接
      for(let i=0;i<count;i++) {
        const canvas = document.createElement('canvas');
        canvas.width = this.CVS.width;
        if(i===count-1) {
          // 最后一张图片的高度
          canvas.height = this.CVS.height-i*interval;
        }else{
          canvas.height = interval;
        }
        const context = canvas.getContext('2d');
        context.drawImage(this.CVS, 0, i*interval,canvas.width,canvas.height,0,0 ,canvas.width, canvas.height);
        this.image(canvas, canvas.width, canvas.height, 'threshold');
      }
      if (this.cutAtFinal) {
        super.cutPartial();
      }
      result = super.encode();
      this._reset();
    } catch (error) {
      console.error(error)
      throw error
    }
    return result;
  }

  /**
   * Bold text
   *
   * @param  {boolean}          value  true to turn on bold, false to turn off, or 2 for double underline
   * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
   *
   */
  bold(value: boolean): EscPosEncoder {
    return this;
  }

  /**
   * 放大行间距
   *
   * @param  {boolean}          bigFont  是否大号字体
   * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
   *
   */
  enlargeLineHeight(bigFont:boolean): EscPosEncoder {
    this.lineHeightInterval = bigFont?2*8:1*8;
    this.size(this._size)
    return this;
  }

  /**
   * 回到默认行间距
   *
   * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
   *
   */
  defaultLineHeight(): EscPosEncoder {
    this.lineHeightInterval = 0;
    this.size(this._size)
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
  printLine(char: string, message = '', middle = false): EscPosEncoder {
    char = char.slice(0, 1);
    const restLength = this.CVS.width - this.getStrWidth(message);
    const charLength = this.getStrWidth(char);
    if (middle) {
      this.line(char.repeat(restLength / 2 / charLength) + message + char.repeat(restLength / 2 / charLength));
    } else {
      this.line(char.repeat(restLength / charLength));
      if (message) {
        const temp = this.alignValue;
        this.alignValue = AlignEnum.center;
        this.line(message);
        this.alignValue = temp;
      }
    }
    return this;
  }

  /**
   * Cut paper partial
   *
   * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
   *
   */
  cutPartial(): EscPosEncoder {
    this.cutAtFinal = true;
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
    if(str1.includes('\n')) {
      if(str2.includes('\n')) {
        multiToMulti = true;
      } else {
        str1.split('\n').forEach((item, index)=>{
          this.oneLine(item, index===0?str2:'');
        })
        return this;
      }
    }
    this.align(AlignEnum.left)
    this.newline();
    const width1 = this.getStrWidth(str1);
    const width2 = this.getStrWidth(str2);
    if(this.CVS.width-width1-width2<0 || multiToMulti) {
      this.line(str1)
      this.line(str2)
    }else {
      this._fillText(str1, this.getPositionByDir(0), this.heightPosition);
      this._fillText(str2, this.getPositionByDir(this.CVS.width - width2), this.heightPosition);
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
    const measureTextStr = (bigPrice || showUnitPrice) ? 'x99 9,999,999' : 'x99 999.99';
    const countAndPriceLength = this.getStrWidth(measureTextStr);
    const countAndPriceLengthWithUnitPrice = this.getStrWidth('99,999,999 x9 99,999,999'); // 包含单价情况价格和个数的长度
    const getCountAndPriceStr = (count: number, price: number): string => {
      const unitPriceStr = bigPrice?this.bigPriceFormat(price):price.toFixed(2);
      const totalPriceStr = bigPrice ? this.bigPriceFormat(price*count) : (price*count).toFixed(2);
      const countStr = (this.rtl?'*':'x') + count;
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
        for(let i=0; i<nameArr.length; i++) {
          const name = nameArr[i];
          const fixedWidthStrArr = this.splitByWidth(
            name,
            this.CVS.width - countAndPriceLength - this.getStrWidth('  ')
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
            const strArr = str.split('\n')
            strArr.forEach((specString)=>{
              this.line('  ※ '+specString+' ※  ');
            })
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
  printChefDishs({dishes, size=2, largeLineHeight, lineBetweenDishes, specificationInNewLine,countFront}: {
    dishes: {name: string; count: number; specifications: string[]}[];
    size: number;
    largeLineHeight: boolean;
    lineBetweenDishes: boolean;
    specificationInNewLine: boolean;
    countFront: boolean;
  }): EscPosEncoder {
    const originSize = this._size;
    const countAndPriceLength = this.getStrWidth('  x99');
    this.size(size);
    if (largeLineHeight) {
      this.enlargeLineHeight(Boolean(size));
    }
    dishes.forEach((dish,index) => {
      if (dish.count<=0) {
        return;
      }
      if(countFront){
        this.line((dish.count>1?`${dish.count}x    `:'')+dish.name);
      }else {
        const nameArr = dish.name.split('\n');
        for(let i=0; i<nameArr.length; i++) {
          const name = nameArr[i];
          const fixedWidthStrArr = this.splitByWidth(
            name,
            this.CVS.width - countAndPriceLength
          );
          fixedWidthStrArr.forEach((str, index) => {
            if (dish.count <= 0) {
              return;
            }
            if (i===0 && index === 0) {
              this.oneLine(str, `x${dish.count}`);
            } else {
              this.line(str);
            }
          });
        }
      }
      if (specificationInNewLine) {
        dish.specifications?.forEach((str, index) => {
          if (str) {
            const strArr = str.split('\n')
            strArr.forEach((specString)=>{
              this.line('  ※ '+specString+' ※  ');
            })
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
   * 根据打印宽度分割字符串
   *
   * @param  {string}   str  需要被分割的字符串
   * @param  {number}   maxLength  分割长度
   * @returns {Array} 返回被分割的字符串数组
   */
  protected splitByWidth(str: string='', maxLength: number): string[] {
    let result: string[] = [];
    for (let i = 0; i < str.length; i++) {
      const char = str.slice(0, i);
      const width = this.getStrWidth(char);
      if (width > maxLength) {
        result.push(str.slice(0, i - 1));
        result = result.concat(this.splitByWidth(str.slice(i - 1), maxLength));
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
    let { width } = this.ctx.measureText(str);
    if(this._size===1) {
      width = width /2
    }
    return width;
  }

  /**
   * 打印空行
   *
   * @param {number} num 行数
   * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
   */
  emptyLine(num = 1): EscPosEncoder {
    for (let i = 0; i < num; i++) {
      this.heightPosition += this.lineHeight0;
      this.resize(this.CVS.width, this.heightPosition);
    }
    return this;
  }

  /**
   * 根据打印方向返回打印机位置
   *
   * @param {number} pos 正常打印位置
   * @returns {number}  根据打印方向的打印机位置
   */
  private getPositionByDir(pos:number):number{
    if(this.rtl) {
      return this.CVS.width - pos;
    }else {
      return pos
    }
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
      const spaceNum = (length - this.getStrWidth(str1) - this.getStrWidth(str2)) / this.getStrWidth(' ');
      return str1 + ' '.repeat(spaceNum<0?0:spaceNum) + str2;
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
      const canvas:HTMLCanvasElement = await QRCode.toCanvas(value);
      const originHeight = this.heightPosition;
      this.heightPosition += this.CVS.width;
      this.resize(this.CVS.width, this.heightPosition);
      this.ctx.drawImage(canvas, 0, originHeight, this.CVS.width , this.CVS.width );
      return this;
    }
}
