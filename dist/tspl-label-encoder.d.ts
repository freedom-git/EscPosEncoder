/**
 * Create a byte stream based on commands for ESC/POS printers
 */
export default class TsplLabelEncoder {
    protected _buffer: any;
    private _codepage;
    private CVS;
    private ctx;
    /**
     * Create a new TsplLabelEncoder
     *
     */
    constructor();
    /**
     * Reset the state of the TsplLabelEncoder
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
    splitByWidth(str: string, maxLength: number): string[];
    /**
     * 计算字符串的字节长度，也就是打印的宽度
     *
     * @param  {string}   str  需要计算的字符串
     * @returns {number} 返回被分割的字符串数组
     */
    protected getStrWidth(str: string): number;
    /**
     * 初始化
     *
     * @param  {number}   width  标签宽度 单位mm
     * @param  {number}   height   标签高度 单位mm
     * @param  {number}   isRotate   是否旋转标签
     * @returns {TsplLabelEncoder}          Return the TsplLabelEncoder, for easy chaining commands
     *
     */
    init(width: number, height: number, isRotate?: boolean): TsplLabelEncoder;
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
    text(value: string, x: number, y: number, size: number): TsplLabelEncoder;
    /**
     * Print text command
     *
     * @param  {string}   value  Text that needs to be printed
     * @returns {TsplLabelEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    command(value: string): TsplLabelEncoder;
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
    image(element: HTMLCanvasElement, width: number, height: number): TsplLabelEncoder;
    /**
     * Add raw printer commands
     *
     * @param  {Array}           data   raw bytes to be included
     * @returns {TsplLabelEncoder}          Return the TsplLabelEncoder, for easy chaining commands
     *
     */
    raw(data: Array<number>): TsplLabelEncoder;
    /**
     * Encode all previous commands
     *
     * @returns {Uint8Array}         Return the encoded bytes
     *
     */
    labelEncode(): Uint8Array;
    /**
     * Encode all previous commands
     *
     * @returns {Uint8Array}         Return the encoded bytes
     *
     */
    encode(): Uint8Array;
}
