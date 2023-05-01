import EscPosEncoder, { PrinterWidthEnum } from './esc-pos-encoder';
declare enum AlignEnum {
    'left' = "left",
    'center' = "center",
    'right' = "right"
}
/**
 * Create a byte stream based on commands for ESC/POS printers
 */
export default class EscPosImgEncoder extends EscPosEncoder {
    private CVS;
    private ctx;
    private alignValue;
    private fontValue;
    private width58;
    private width80;
    private lineHeight;
    private lineHeight0;
    private lineHeight2;
    private heightPosition;
    private cutAtFinal;
    private fontFoot;
    private fontFamily;
    private lineHeightInterval;
    private rtl;
    /**
     * Create a new EscPosEncoder
     */
    constructor({ fontFamily, canvas, rtl }: {
        fontFamily?: string;
        canvas: HTMLCanvasElement;
        rtl?: boolean;
    });
    /**
     * Reset the state of the EscPosEncoder
     *
     */
    protected _reset(): void;
    /**
     * Change the code page
     *
     * @param  {string}   value  The codepage that we set the printer to
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    codepage(value: string): EscPosEncoder;
    /**
     * Change text size
     *
     * @param  {number}          value   small or normal
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    size(value: number): EscPosEncoder;
    /**
     * 设置打印机宽度
     *
     * @param  {PrinterWidthEnum}   type  需要被分割的字符串
     * @returns {EscPosEncoder} 返回this
     */
    setPinterType(type: PrinterWidthEnum): EscPosEncoder;
    /**
     * Change text alignment
     *
     * @param  {string}          value   left, center or right
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    align(value: AlignEnum | string): EscPosEncoder;
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
     * Print text
     *
     * @param  {string}   value  Text that needs to be printed
     * @param  {number}   wrap   Wrap text after this many positions
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    text(value: string, wrap?: number): EscPosEncoder;
    /**
   * fill text
   *
   * @param  {string}   value  Text that needs to be printed
   * @param  {number}   wrap   Wrap text after this many positions
   * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
   *
   */
    private _fillText;
    /**
   * handle text direction for ltr and rtl mix print
   *
   * @param  {string}   text  Text that needs to be printed
   * @returns {string}          return fixed string
   *
   */
    private _handleDerection;
    private _getTextDirection;
    /**
     * Print a newline
     *
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    newline(): EscPosEncoder;
    /**
     * 动态修改画布大小
     *
     * @param {number} w  宽
     * @param {number} h  高
     */
    resize(w: any, h: any): void;
    /**
     * Encode all previous commands
     *
     * @returns {Uint8Array}         Return the encoded bytes
     *
     */
    encode(): Uint8Array;
    /**
     * Bold text
     *
     * @param  {boolean}          value  true to turn on bold, false to turn off, or 2 for double underline
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    bold(value: boolean): EscPosEncoder;
    /**
     * 放大行间距
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
     * 打印一行字符
     *
     * @param {string} char 打印成行的字符
     * @param {string} message 提示信息
     * @param {boolean} middle 提示信息显示在行间
     * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
     */
    printLine(char: string, message?: string, middle?: boolean): EscPosEncoder;
    /**
     * Cut paper partial
     *
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    cutPartial(): EscPosEncoder;
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
     * 打印空行
     *
     * @param {number} num 行数
     * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
     */
    emptyLine(num?: number): EscPosEncoder;
    /**
     * 根据打印方向返回打印机位置
     *
     * @param {number} pos 正常打印位置
     * @returns {number}  根据打印方向的打印机位置
     */
    private getPositionByDir;
    /**
     * 拼接两个字符串到固定长度，自动中间加空格
     *
     * @param {string} str1   字符串1
     * @param {string} str2   字符串2
     * @param length
     * @returns {string}   返回处理后的价格字符串
     */
    protected fixLength(str1: string, str2: string, length: number): string;
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
}
export {};
