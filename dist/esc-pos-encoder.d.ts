export declare enum PrinterWidthEnum {
    '_58' = 58,
    '_80' = 80
}
/**
 * Create a byte stream based on commands for ESC/POS printers
 */
export default class EscPosEncoder {
    protected _buffer: any;
    private _codepage;
    private _state;
    protected _size: number;
    private _58printerParam;
    private _80printerParam;
    private _printerParam;
    /**
     * 返回每行的单字节长度
     *
     * @returns {number} 每行的单字节长度
     */
    protected get singleCharLengthPerLine(): number;
    /**
     * Create a new EscPosEncoder
     *
     */
    constructor();
    /**
     * Reset the state of the EscPosEncoder
     *
     */
    protected _reset(): void;
    /**
     * Encode a string with the current code page
     *
     * @param  {string}   value  String to encode
     * @returns {Buffer}          Encoded string as a ArrayBuffer
     *
     */
    private _encode;
    /**
     * Add commands to the buffer
     *
     * @param  {Array}   value  And array of numbers, arrays, buffers or Uint8Arrays to add to the buffer
     *
     */
    protected _queue(value: any): void;
    /**
     * 获取单个字符的字节数，也就是打印占宽
     *
     * @param  {string}   char  需要被分割的字符串
     * @returns {number} 返回字节数（占宽）
     */
    private getCharLength;
    /**
     * 根据打印宽度分割字符串
     *
     * @param  {string}   str  需要被分割的字符串
     * @param  {number}   maxLength  分割长度
     * @returns {Array} 返回被分割的字符串数组
     */
    protected splitByWidth(str: string, maxLength: number): string[];
    /**
     * 计算字符串的字节长度，也就是打印的宽度
     *
     * @param  {string}   str  需要计算的字符串
     * @returns {number} 返回被分割的字符串数组
     */
    protected getStrWidth(str: string): number;
    /**
     * Initialize the printer
     *
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    initialize(): EscPosEncoder;
    /**
     * 设置打印机宽度
     *
     * @param  {PrinterWidthEnum}   type  需要被分割的字符串
     * @returns {EscPosEncoder} 返回this
     */
    setPinterType(type: PrinterWidthEnum): EscPosEncoder;
    /**
     * 打印一行字符
     *
     * @param {string} char 打印成行的字符
     * @param {string} message 提示信息
     * @param {boolean} middle 提示信息显示在行间
     * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
     */
    printLine(char: string, message?: string, middle?: boolean): EscPosEncoder;
    /**
     * 打印空行
     *
     * @param {number} num 行数
     * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
     */
    emptyLine(num?: number): EscPosEncoder;
    /**
     * 前台打印菜品，包含菜品名称，数量，价格
     *
     * @param {Array} dishes 菜品信息数组
     * @param {number} size 字体大小,默认1
     * @param {boolean} bigPrice 小币种价格，默认false
     * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
     */
    printFrontDeskDishs({ dishes, size, bigPrice, largeLineHeight, lineBetweenDishes, specificationInNewLine, showUnitPrice }: {
        dishes: {
            name: string;
            count: number;
            price: number;
            specifications: string[];
        }[];
        size: number;
        bigPrice: boolean;
        largeLineHeight: boolean;
        lineBetweenDishes: boolean;
        specificationInNewLine: boolean;
        showUnitPrice: boolean;
    }): EscPosEncoder;
    /**
     * 后厨打印菜品，包含菜品名称，数量，不包含价格
     *
     * @param {Array} dishes 菜品信息数组
     * @param {number} size 字体大小,默认2
     * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
     */
    printChefDishs({ dishes, size, largeLineHeight, lineBetweenDishes, specificationInNewLine, countFront }: {
        dishes: {
            name: string;
            count: number;
            specifications: string[];
        }[];
        size: number;
        largeLineHeight: boolean;
        lineBetweenDishes: boolean;
        specificationInNewLine: boolean;
        countFront: boolean;
    }): EscPosEncoder;
    /**
     * Change the code page
     *
     * @param  {string}   value  The codepage that we set the printer to
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    codepage(value: string): EscPosEncoder;
    /**
     * Print text
     *
     * @param  {string}   value  Text that needs to be printed
     * @param  {number}   wrap   Wrap text after this many positions
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    text(value: string, wrap?: number): EscPosEncoder;
    /**
     * Print a newline
     *
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    newline(): EscPosEncoder;
    /**
     * Print text, followed by a newline
     *
     * @param  {string}   value  Text that needs to be printed
     * @param  {number}   wrap   Wrap text after this many positions
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    line(value: string, wrap?: number): EscPosEncoder;
    /**
     * 打印两个字符分别在纸的左右两侧
     *
     * @param  {string}   str1  左侧的字符串
     * @param  {string}   str2  右侧的字符串
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    oneLine(str1: string, str2: string): EscPosEncoder;
    /**
     * Underline text
     *
     * @param  {boolean|number}   value  true to turn on underline, false to turn off, or 2 for double underline
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    underline(value: boolean | number): EscPosEncoder;
    /**
     * Italic text
     *
     * @param  {boolean}          value  true to turn on italic, false to turn off
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    italic(value: boolean): EscPosEncoder;
    /**
     * Bold text
     *
     * @param  {boolean}          value  true to turn on bold, false to turn off, or 2 for double underline
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    bold(value: boolean): EscPosEncoder;
    /**
     * 设置行间距
     *
     * @param  {boolean}          bigFont  是否大号字体
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    enlargeLineHeight(bigFont: boolean): EscPosEncoder;
    /**
     * 回到默认行间距
     *
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    defaultLineHeight(): EscPosEncoder;
    /**
     * Change text size
     *
     * @param  {number}          value   small or normal
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    size(value: number): EscPosEncoder;
    /**
     * Change text alignment
     *
     * @param  {string}          value   left, center or right
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    align(value: string): EscPosEncoder;
    /**
     * Barcode
     *
     * @param  {string}           value  the value of the barcode
     * @param  {string}           symbology  the type of the barcode
     * @param  {number}           height  height of the barcode
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    barcode(value: string, symbology: string, height: number): EscPosEncoder;
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
    qrcode(value: string, model: number, size: number, errorlevel: string): EscPosEncoder;
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
    qrcodeImg(value: string, model?: number, size?: number, errorlevel?: string): Promise<EscPosEncoder>;
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
    image(element: any, width: any, height: any, algorithm: any, threshold?: any): EscPosEncoder;
    /**
     * Cut paper
     *
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    cut(): EscPosEncoder;
    /**
     * 打开钱箱
     *
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    openCashBox(): EscPosEncoder;
    /**
     * Cut paper partial
     *
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    cutPartial(): EscPosEncoder;
    /**
     * Add raw printer commands
     *
     * @param  {Array}           data   raw bytes to be included
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    raw(data: Array<number>): EscPosEncoder;
    /**
     * Encode all previous commands
     *
     * @returns {Uint8Array}         Return the encoded bytes
     *
     */
    encode(): Uint8Array;
    /**
     * 格式化小额币种价格
     *
     * @param  {number}   price   原始价格
     * @returns {string}   返回处理后的价格字符串，10000.54 =》 10,000
     *
     */
    bigPriceFormat(price: number): string;
    /**
     * 拼接两个字符串到固定长度，自动中间加空格
     *
     * @param {string} str1   字符串1
     * @param {string} str2   字符串2
     * @param length
     * @returns {string}   返回处理后的价格字符串
     */
    protected fixLength(str1: string, str2: string, length: number): string;
}
