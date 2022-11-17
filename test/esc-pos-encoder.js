const EscPosEncoder = require('../dist/esc-pos-encoder.js').default;
// import {default as EscPosEncoder} from "'../dist/esc-pos-encoder.js'"

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();


describe('EscPosEncoder', function() {
  const encoder = new EscPosEncoder();

  describe('text(hello)', function() {
    const result = encoder.text('hello').encode();

    it('should be [ 104, 101, 108, 108, 111 ]', function() {
      assert.deepEqual(new Uint8Array([104, 101, 108, 108, 111]), result);
    });
  });

  describe('text(hello).newline()', function() {
    const result = encoder.text('hello').newline().encode();

    it('should be [ 104, 101, 108, 108, 111, 10, 13 ]', function() {
      assert.deepEqual(new Uint8Array([104, 101, 108, 108, 111, 10, 13]), result);
    });
  });

  describe('line(hello)', function() {
    const result = encoder.line('hello').encode();

    it('should be [ 104, 101, 108, 108, 111, 10, 13 ]', function() {
      assert.deepEqual(new Uint8Array([104, 101, 108, 108, 111, 10, 13]), result);
    });
  });

  describe('text(héllo) - é -> ?', function() {
    const result = encoder.text('héllo').encode();

    it('should be [ 104, 63, 108, 108, 111 ]', function() {
      assert.deepEqual(new Uint8Array([104, 63, 108, 108, 111]), result);
    });
  });

  // describe('codepage(cp437).text(héllo) - é -> 130', function() {
  //   const result = encoder.codepage('cp437').text('héllo').encode();

  //   it('should be [ 27, 116, 0, 104, 130, 108, 108, 111 ]', function() {
  //     assert.deepEqual(new Uint8Array([27, 116, 0, 104, 130, 108, 108, 111]), result);
  //   });
  // });

  describe('codepage(cp936).text(简体中文) - simplified chinese', function() {
    const result = encoder.codepage('cp936').text('简体中文').encode();

    it('should be [ 27, 116, 255, 28, 38, 188, 242, 204, 229, 214, 208, 206, 196, 28, 46 ]', function() {
      assert.deepEqual(new Uint8Array([28, 38, 188, 242, 204, 229, 214, 208, 206, 196, 28, 46]), result);
    });
  });

  // describe('codepage(win1252).text(héllo) - é -> 233', function() {
  //   const result = encoder.codepage('win1252').text('héllo').encode();

  //   it('should be [ 27, 116, 71, 104, 233, 108, 108, 111 ]', function() {
  //     assert.deepEqual(new Uint8Array([27, 116, 71, 104, 233, 108, 108, 111]), result);
  //   });
  // });

  describe('codepage(utf8).text(héllo)', function() {
    it('should throw an "Codepage not supported by printer" error', function() {
      expect(function() {
        const result = encoder.codepage('utf8').text('héllo').encode();
      }).to.throw('Codepage not supported by printer');
    });
  });

  describe('codepage(unknown).text(héllo)', function() {
    it('should throw an "Unknown codepage" error', function() {
      expect(function() {
        const result = encoder.codepage('unknown').text('héllo').encode();
      }).to.throw('Unknown codepage');
    });
  });

  describe('bold(true).text(hello).bold(false)', function() {
    const result = encoder.bold(true).text('hello').bold(false).encode();

    it('should be [ 27, 69, 1, ..., 27, 69, 0 ]', function() {
      assert.deepEqual(new Uint8Array([27, 69, 1, 104, 101, 108, 108, 111, 27, 69, 0]), result);
    });
  });

  describe('bold().text(hello).bold()', function() {
    const result = encoder.bold().text('hello').bold().encode();

    it('should be [ 27, 69, 1, ..., 27, 69, 0 ]', function() {
      assert.deepEqual(new Uint8Array([27, 69, 1, 104, 101, 108, 108, 111, 27, 69, 0]), result);
    });
  });

  describe('italic().text(hello).italic()', function() {
    const result = encoder.italic().text('hello').italic().encode();

    it('should be [ 27, 69, 1, ..., 27, 69, 0 ]', function() {
      assert.deepEqual(new Uint8Array([27, 52, 1, 104, 101, 108, 108, 111, 27, 52, 0]), result);
    });
  });

  describe('underline(true).text(hello).underline(false)', function() {
    const result = encoder.underline(true).text('hello').underline(false).encode();

    it('should be [ 27, 45, 1, ..., 27, 45, 0 ]', function() {
      assert.deepEqual(new Uint8Array([27, 45, 1, 104, 101, 108, 108, 111, 27, 45, 0]), result);
    });
  });

  describe('underline().text(hello).underline()', function() {
    const result = encoder.underline().text('hello').underline().encode();

    it('should be [ 27, 45, 1, ..., 27, 45, 0 ]', function() {
      assert.deepEqual(new Uint8Array([27, 45, 1, 104, 101, 108, 108, 111, 27, 45, 0]), result);
    });
  });

  describe('align(left).line(hello)', function() {
    const result = encoder.align('left').line('hello').encode();

    it('should be [ 27, 97, 0, ..., 10, 13 ]', function() {
      assert.deepEqual(new Uint8Array([27, 97, 0, 104, 101, 108, 108, 111, 10, 13]), result);
    });
  });

  describe('align(center).line(hello)', function() {
    const result = encoder.align('center').line('hello').encode();

    it('should be [ 27, 97, 1, ..., 10, 13 ]', function() {
      assert.deepEqual(new Uint8Array([27, 97, 1, 104, 101, 108, 108, 111, 10, 13]), result);
    });
  });

  describe('align(right).line(hello)', function() {
    const result = encoder.align('right').line('hello').encode();

    it('should be [ 27, 97, 2, ..., 10, 13 ]', function() {
      assert.deepEqual(new Uint8Array([27, 97, 2, 104, 101, 108, 108, 111, 10, 13]), result);
    });
  });

  describe('qrcode(https://nielsleenheer.com)', function() {
    const result = encoder.qrcode('https://nielsleenheer.com').encode();

    it('should be [ 10, 29, 40, 107, 4, 0, 49, 65, 50, 0, 29, 40, 107, 3, 0, ... ]', function() {
      assert.deepEqual(new Uint8Array([10, 29, 40, 107, 4, 0, 49, 65, 50, 0, 29, 40, 107, 3, 0, 49, 67, 6, 29, 40, 107, 3, 0, 49, 69, 49, 29, 40, 107, 28, 0, 49, 80, 48, 104, 116, 116, 112, 115, 58, 47, 47, 110, 105, 101, 108, 115, 108, 101, 101, 110, 104, 101, 101, 114, 46, 99, 111, 109, 29, 40, 107, 3, 0, 49, 81, 48]), result);
    });
  });

  describe('qrcode(https://nielsleenheer.com, 1, 8, h)', function() {
    const result = encoder.qrcode('https://nielsleenheer.com', 1, 8, 'h').encode();

    it('should be [ 10, 29, 40, 107, 4, 0, 49, 65, 49, 0, 29, 40, 107, 3, 0, ... ]', function() {
      assert.deepEqual(new Uint8Array([10, 29, 40, 107, 4, 0, 49, 65, 49, 0, 29, 40, 107, 3, 0, 49, 67, 8, 29, 40, 107, 3, 0, 49, 69, 51, 29, 40, 107, 28, 0, 49, 80, 48, 104, 116, 116, 112, 115, 58, 47, 47, 110, 105, 101, 108, 115, 108, 101, 101, 110, 104, 101, 101, 114, 46, 99, 111, 109, 29, 40, 107, 3, 0, 49, 81, 48]), result);
    });
  });

  describe('barcode(3130630574613, ean13, 60)', function() {
    const result = encoder.barcode('3130630574613', 'ean13', 60).encode();

    it('should be [ 29, 104, 60, 29, 119, 3, 29, 107, 2, ... ]', function() {
      assert.deepEqual(new Uint8Array([29, 104, 60, 29, 119, 3, 29, 107, 2, 51, 49, 51, 48, 54, 51, 48, 53, 55, 52, 54, 49, 51, 0]), result);
    });
  });

  describe('cut()', function() {
    const result = encoder.cut().encode();

    it('should be [ 29, 86, 65, 0 ]', function() {
      assert.deepEqual(new Uint8Array([29, 86, 65, 0]), result);
    });
  });

  describe('cutPartial', function() {
    const result = encoder.cutPartial().encode();

    it('should be [ 29, 86, 66, 0 ]', function() {
      assert.deepEqual(new Uint8Array([29, 86, 66, 0]), result);
    });
  });

  describe('raw([ 0x1c, 0x2e ])', function() {
    const result = encoder.raw([0x1c, 0x2e]).encode();

    it('should be [ 28, 46 ]', function() {
      assert.deepEqual(new Uint8Array([28, 46]), result);
    });
  });
});
