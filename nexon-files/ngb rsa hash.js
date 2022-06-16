var biRadixBase = 2;
var biRadixBits = 16;
var bitsPerDigit = biRadixBits;
var biRadix = 1 << 16;
var biHalfRadix = biRadix >>> 1;
var biRadixSquared = biRadix * biRadix;
var maxDigitVal = biRadix - 1;
var maxInteger = 9999999999999998;

var maxDigits;
var ZERO_ARRAY;
var bigZero, bigOne;

function setMaxDigits(value) {
  maxDigits = value;
  ZERO_ARRAY = new Array(maxDigits);
  for (var iza = 0; iza < ZERO_ARRAY.length; iza++) ZERO_ARRAY[iza] = 0;
  bigZero = new BigInt();
  bigOne = new BigInt();
  bigOne.digits[0] = 1;
}

setMaxDigits(20);

var dpl10 = 15;
var lr10 = biFromNumber(1000000000000000);

function BigInt(flag) {
  if (typeof flag == "boolean" && flag == true) {
    this.digits = null;
  } else {
    this.digits = ZERO_ARRAY.slice(0);
  }
  this.isNeg = false;
}

function biFromDecimal(s) {
  var isNeg = s.charAt(0) == "-";
  var i = isNeg ? 1 : 0;
  var result;
  while (i < s.length && s.charAt(i) == "0") ++i;
  if (i == s.length) {
    result = new BigInt();
  } else {
    var digitCount = s.length - i;
    var fgl = digitCount % dpl10;
    if (fgl == 0) fgl = dpl10;
    result = biFromNumber(Number(s.substr(i, fgl)));
    i += fgl;
    while (i < s.length) {
      result = biAdd(
        biMultiply(result, lr10),
        biFromNumber(Number(s.substr(i, dpl10)))
      );
      i += dpl10;
    }
    result.isNeg = isNeg;
  }
  return result;
}

function biCopy(bi) {
  var result = new BigInt(true);
  result.digits = bi.digits.slice(0);
  result.isNeg = bi.isNeg;
  return result;
}

function biFromNumber(i) {
  var result = new BigInt();
  result.isNeg = i < 0;
  i = Math.abs(i);
  var j = 0;
  while (i > 0) {
    result.digits[j++] = i & maxDigitVal;
    i = Math.floor(i / biRadix);
  }
  return result;
}

function reverseStr(s) {
  var result = "";
  for (var i = s.length - 1; i > -1; --i) {
    result += s.charAt(i);
  }
  return result;
}

var hexatrigesimalToChar = new Array(
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z"
);

function biToString(x, radix) {
  var b = new BigInt();
  b.digits[0] = radix;
  var qr = biDivideModulo(x, b);
  var result = hexatrigesimalToChar[qr[1].digits[0]];
  while (biCompare(qr[0], bigZero) == 1) {
    qr = biDivideModulo(qr[0], b);
    digit = qr[1].digits[0];
    result += hexatrigesimalToChar[qr[1].digits[0]];
  }
  return (x.isNeg ? "-" : "") + reverseStr(result);
}

function biToDecimal(x) {
  var b = new BigInt();
  b.digits[0] = 10;
  var qr = biDivideModulo(x, b);
  var result = String(qr[1].digits[0]);
  while (biCompare(qr[0], bigZero) == 1) {
    qr = biDivideModulo(qr[0], b);
    result += String(qr[1].digits[0]);
  }
  return (x.isNeg ? "-" : "") + reverseStr(result);
}

var hexToChar = new Array(
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f"
);

function digitToHex(n) {
  var mask = 0xf;
  var result = "";
  for (i = 0; i < 4; ++i) {
    result += hexToChar[n & mask];
    n >>>= 4;
  }
  return reverseStr(result);
}

function biToHex(x) {
  var result = "";
  var n = biHighIndex(x);
  for (var i = biHighIndex(x); i > -1; --i) {
    result += digitToHex(x.digits[i]);
  }
  return result;
}

function charToHex(c) {
  var ZERO = 48;
  var NINE = ZERO + 9;
  var littleA = 97;
  var littleZ = littleA + 25;
  var bigA = 65;
  var bigZ = 65 + 25;
  var result;

  if (c >= ZERO && c <= NINE) {
    result = c - ZERO;
  } else if (c >= bigA && c <= bigZ) {
    result = 10 + c - bigA;
  } else if (c >= littleA && c <= littleZ) {
    result = 10 + c - littleA;
  } else {
    result = 0;
  }
  return result;
}

function hexToDigit(s) {
  var result = 0;
  var sl = Math.min(s.length, 4);
  for (var i = 0; i < sl; ++i) {
    result <<= 4;
    result |= charToHex(s.charCodeAt(i));
  }
  return result;
}

function biFromHex(s) {
  var result = new BigInt();
  var sl = s.length;
  for (var i = sl, j = 0; i > 0; i -= 4, ++j) {
    result.digits[j] = hexToDigit(s.substr(Math.max(i - 4, 0), Math.min(i, 4)));
  }
  return result;
}

function biFromString(s, radix) {
  var isNeg = s.charAt(0) == "-";
  var istop = isNeg ? 1 : 0;
  var result = new BigInt();
  var place = new BigInt();
  place.digits[0] = 1;
  for (var i = s.length - 1; i >= istop; i--) {
    var c = s.charCodeAt(i);
    var digit = charToHex(c);
    var biDigit = biMultiplyDigit(place, digit);
    result = biAdd(result, biDigit);
    place = biMultiplyDigit(place, radix);
  }
  result.isNeg = isNeg;
  return result;
}

function biDump(b) {
  return (b.isNeg ? "-" : "") + b.digits.join(" ");
}

function biAdd(x, y) {
  var result;

  if (x.isNeg != y.isNeg) {
    y.isNeg = !y.isNeg;
    result = biSubtract(x, y);
    y.isNeg = !y.isNeg;
  } else {
    result = new BigInt();
    var c = 0;
    var n;
    for (var i = 0; i < x.digits.length; ++i) {
      n = x.digits[i] + y.digits[i] + c;
      result.digits[i] = n % biRadix;
      c = Number(n >= biRadix);
    }
    result.isNeg = x.isNeg;
  }
  return result;
}

function biSubtract(x, y) {
  var result;
  if (x.isNeg != y.isNeg) {
    y.isNeg = !y.isNeg;
    result = biAdd(x, y);
    y.isNeg = !y.isNeg;
  } else {
    result = new BigInt();
    var n, c;
    c = 0;
    for (var i = 0; i < x.digits.length; ++i) {
      n = x.digits[i] - y.digits[i] + c;
      result.digits[i] = n % biRadix;
      if (result.digits[i] < 0) result.digits[i] += biRadix;
      c = 0 - Number(n < 0);
    }
    if (c == -1) {
      c = 0;
      for (var i = 0; i < x.digits.length; ++i) {
        n = 0 - result.digits[i] + c;
        result.digits[i] = n % biRadix;
        if (result.digits[i] < 0) result.digits[i] += biRadix;
        c = 0 - Number(n < 0);
      }
      result.isNeg = !x.isNeg;
    } else {
      result.isNeg = x.isNeg;
    }
  }
  return result;
}

function biHighIndex(x) {
  var result = x.digits.length - 1;
  while (result > 0 && x.digits[result] == 0) --result;
  return result;
}

function biNumBits(x) {
  var n = biHighIndex(x);
  var d = x.digits[n];
  var m = (n + 1) * bitsPerDigit;
  var result;
  for (result = m; result > m - bitsPerDigit; --result) {
    if ((d & 0x8000) != 0) break;
    d <<= 1;
  }
  return result;
}

function biMultiply(x, y) {
  var result = new BigInt();
  var c;
  var n = biHighIndex(x);
  var t = biHighIndex(y);
  var u, uv, k;

  for (var i = 0; i <= t; ++i) {
    c = 0;
    k = i;
    for (j = 0; j <= n; ++j, ++k) {
      uv = result.digits[k] + x.digits[j] * y.digits[i] + c;
      result.digits[k] = uv & maxDigitVal;
      c = uv >>> biRadixBits;
    }
    result.digits[i + n + 1] = c;
  }
  result.isNeg = x.isNeg != y.isNeg;
  return result;
}

function biMultiplyDigit(x, y) {
  var n, c, uv;

  var result = new BigInt();
  n = biHighIndex(x);
  c = 0;
  for (var j = 0; j <= n; ++j) {
    uv = result.digits[j] + x.digits[j] * y + c;
    result.digits[j] = uv & maxDigitVal;
    c = uv >>> biRadixBits;
  }
  result.digits[1 + n] = c;
  return result;
}

function arrayCopy(src, srcStart, dest, destStart, n) {
  var m = Math.min(srcStart + n, src.length);
  for (var i = srcStart, j = destStart; i < m; ++i, ++j) {
    dest[j] = src[i];
  }
}

var highBitMasks = new Array(
  0x0000,
  0x8000,
  0xc000,
  0xe000,
  0xf000,
  0xf800,
  0xfc00,
  0xfe00,
  0xff00,
  0xff80,
  0xffc0,
  0xffe0,
  0xfff0,
  0xfff8,
  0xfffc,
  0xfffe,
  0xffff
);

function biShiftLeft(x, n) {
  var digitCount = Math.floor(n / bitsPerDigit);
  var result = new BigInt();
  arrayCopy(
    x.digits,
    0,
    result.digits,
    digitCount,
    result.digits.length - digitCount
  );
  var bits = n % bitsPerDigit;
  var rightBits = bitsPerDigit - bits;
  for (var i = result.digits.length - 1, i1 = i - 1; i > 0; --i, --i1) {
    result.digits[i] =
      ((result.digits[i] << bits) & maxDigitVal) |
      ((result.digits[i1] & highBitMasks[bits]) >>> rightBits);
  }
  result.digits[0] = (result.digits[i] << bits) & maxDigitVal;
  result.isNeg = x.isNeg;
  return result;
}

var lowBitMasks = new Array(
  0x0000,
  0x0001,
  0x0003,
  0x0007,
  0x000f,
  0x001f,
  0x003f,
  0x007f,
  0x00ff,
  0x01ff,
  0x03ff,
  0x07ff,
  0x0fff,
  0x1fff,
  0x3fff,
  0x7fff,
  0xffff
);

function biShiftRight(x, n) {
  var digitCount = Math.floor(n / bitsPerDigit);
  var result = new BigInt();
  arrayCopy(
    x.digits,
    digitCount,
    result.digits,
    0,
    x.digits.length - digitCount
  );
  var bits = n % bitsPerDigit;
  var leftBits = bitsPerDigit - bits;
  for (var i = 0, i1 = i + 1; i < result.digits.length - 1; ++i, ++i1) {
    result.digits[i] =
      (result.digits[i] >>> bits) |
      ((result.digits[i1] & lowBitMasks[bits]) << leftBits);
  }
  result.digits[result.digits.length - 1] >>>= bits;
  result.isNeg = x.isNeg;
  return result;
}

function biMultiplyByRadixPower(x, n) {
  var result = new BigInt();
  arrayCopy(x.digits, 0, result.digits, n, result.digits.length - n);
  return result;
}

function biDivideByRadixPower(x, n) {
  var result = new BigInt();
  arrayCopy(x.digits, n, result.digits, 0, result.digits.length - n);
  return result;
}

function biModuloByRadixPower(x, n) {
  var result = new BigInt();
  arrayCopy(x.digits, 0, result.digits, 0, n);
  return result;
}

function biCompare(x, y) {
  if (x.isNeg != y.isNeg) {
    return 1 - 2 * Number(x.isNeg);
  }
  for (var i = x.digits.length - 1; i >= 0; --i) {
    if (x.digits[i] != y.digits[i]) {
      if (x.isNeg) {
        return 1 - 2 * Number(x.digits[i] > y.digits[i]);
      } else {
        return 1 - 2 * Number(x.digits[i] < y.digits[i]);
      }
    }
  }
  return 0;
}

function biDivideModulo(x, y) {
  var nb = biNumBits(x);
  var tb = biNumBits(y);
  var origYIsNeg = y.isNeg;
  var q, r;
  if (nb < tb) {
    if (x.isNeg) {
      q = biCopy(bigOne);
      q.isNeg = !y.isNeg;
      x.isNeg = false;
      y.isNeg = false;
      r = biSubtract(y, x);
      x.isNeg = true;
      y.isNeg = origYIsNeg;
    } else {
      q = new BigInt();
      r = biCopy(x);
    }
    return new Array(q, r);
  }

  q = new BigInt();
  r = x;

  var t = Math.ceil(tb / bitsPerDigit) - 1;
  var lambda = 0;
  while (y.digits[t] < biHalfRadix) {
    y = biShiftLeft(y, 1);
    ++lambda;
    ++tb;
    t = Math.ceil(tb / bitsPerDigit) - 1;
  }
  r = biShiftLeft(r, lambda);
  nb += lambda;
  var n = Math.ceil(nb / bitsPerDigit) - 1;

  var b = biMultiplyByRadixPower(y, n - t);
  while (biCompare(r, b) != -1) {
    ++q.digits[n - t];
    r = biSubtract(r, b);
  }
  for (var i = n; i > t; --i) {
    var ri = i >= r.digits.length ? 0 : r.digits[i];
    var ri1 = i - 1 >= r.digits.length ? 0 : r.digits[i - 1];
    var ri2 = i - 2 >= r.digits.length ? 0 : r.digits[i - 2];
    var yt = t >= y.digits.length ? 0 : y.digits[t];
    var yt1 = t - 1 >= y.digits.length ? 0 : y.digits[t - 1];
    if (ri == yt) {
      q.digits[i - t - 1] = maxDigitVal;
    } else {
      q.digits[i - t - 1] = Math.floor((ri * biRadix + ri1) / yt);
    }

    var c1 = q.digits[i - t - 1] * (yt * biRadix + yt1);
    var c2 = ri * biRadixSquared + (ri1 * biRadix + ri2);
    while (c1 > c2) {
      --q.digits[i - t - 1];
      c1 = q.digits[i - t - 1] * ((yt * biRadix) | yt1);
      c2 = ri * biRadix * biRadix + (ri1 * biRadix + ri2);
    }

    b = biMultiplyByRadixPower(y, i - t - 1);
    r = biSubtract(r, biMultiplyDigit(b, q.digits[i - t - 1]));
    if (r.isNeg) {
      r = biAdd(r, b);
      --q.digits[i - t - 1];
    }
  }
  r = biShiftRight(r, lambda);
  q.isNeg = x.isNeg != origYIsNeg;
  if (x.isNeg) {
    if (origYIsNeg) {
      q = biAdd(q, bigOne);
    } else {
      q = biSubtract(q, bigOne);
    }
    y = biShiftRight(y, lambda);
    r = biSubtract(y, r);
  }
  if (r.digits[0] == 0 && biHighIndex(r) == 0) r.isNeg = false;

  return new Array(q, r);
}

function biDivide(x, y) {
  return biDivideModulo(x, y)[0];
}

function biModulo(x, y) {
  return biDivideModulo(x, y)[1];
}

function biMultiplyMod(x, y, m) {
  return biModulo(biMultiply(x, y), m);
}

function biPow(x, y) {
  var result = bigOne;
  var a = x;
  while (true) {
    if ((y & 1) != 0) result = biMultiply(result, a);
    y >>= 1;
    if (y == 0) break;
    a = biMultiply(a, a);
  }
  return result;
}

function biPowMod(x, y, m) {
  var result = bigOne;
  var a = x;
  var k = y;
  while (true) {
    if ((k.digits[0] & 1) != 0) result = biMultiplyMod(result, a, m);
    k = biShiftRight(k, 1);
    if (k.digits[0] == 0 && biHighIndex(k) == 0) break;
    a = biMultiplyMod(a, a, m);
  }
  return result;
}

function BarrettMu(m) {
  this.modulus = biCopy(m);
  this.k = biHighIndex(this.modulus) + 1;
  var b2k = new BigInt();
  b2k.digits[2 * this.k] = 1;
  this.mu = biDivide(b2k, this.modulus);
  this.bkplus1 = new BigInt();
  this.bkplus1.digits[this.k + 1] = 1;
  this.modulo = BarrettMu_modulo;
  this.multiplyMod = BarrettMu_multiplyMod;
  this.powMod = BarrettMu_powMod;
}

function BarrettMu_modulo(x) {
  var q1 = biDivideByRadixPower(x, this.k - 1);
  var q2 = biMultiply(q1, this.mu);
  var q3 = biDivideByRadixPower(q2, this.k + 1);
  var r1 = biModuloByRadixPower(x, this.k + 1);
  var r2term = biMultiply(q3, this.modulus);
  var r2 = biModuloByRadixPower(r2term, this.k + 1);
  var r = biSubtract(r1, r2);
  if (r.isNeg) {
    r = biAdd(r, this.bkplus1);
  }
  var rgtem = biCompare(r, this.modulus) >= 0;
  while (rgtem) {
    r = biSubtract(r, this.modulus);
    rgtem = biCompare(r, this.modulus) >= 0;
  }
  return r;
}

function BarrettMu_multiplyMod(x, y) {
  var xy = biMultiply(x, y);
  return this.modulo(xy);
}

function BarrettMu_powMod(x, y) {
  var result = new BigInt();
  result.digits[0] = 1;
  var a = x;
  var k = y;
  while (true) {
    if ((k.digits[0] & 1) != 0) result = this.multiplyMod(result, a);
    k = biShiftRight(k, 1);
    if (k.digits[0] == 0 && biHighIndex(k) == 0) break;
    a = this.multiplyMod(a, a);
  }
  return result;
}

function string_to_array(str) {
  var len = str.length;
  var res = new Array(len);
  for (var i = 0; i < len; i++) res[i] = str.charCodeAt(i);
  return res;
}

function array_to_hex_string(ary) {
  var res = "";
  for (var i = 0; i < ary.length; i++)
    res += SHA256_hexchars[ary[i] >> 4] + SHA256_hexchars[ary[i] & 0x0f];
  return res;
}

function hex_string_to_array(str) {
  var conv = "";
  for (var i = 0; i < str.length; i = i + 2)
    conv += String.fromCharCode(hexToDigit(str.charAt(i) + str.charAt(i + 1)));
  return string_to_array(conv);
}

SHA256_hexchars = new Array(
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f"
);

SHA256_K = new Array(
  0x428a2f98,
  0x71374491,
  0xb5c0fbcf,
  0xe9b5dba5,
  0x3956c25b,
  0x59f111f1,
  0x923f82a4,
  0xab1c5ed5,
  0xd807aa98,
  0x12835b01,
  0x243185be,
  0x550c7dc3,
  0x72be5d74,
  0x80deb1fe,
  0x9bdc06a7,
  0xc19bf174,
  0xe49b69c1,
  0xefbe4786,
  0x0fc19dc6,
  0x240ca1cc,
  0x2de92c6f,
  0x4a7484aa,
  0x5cb0a9dc,
  0x76f988da,
  0x983e5152,
  0xa831c66d,
  0xb00327c8,
  0xbf597fc7,
  0xc6e00bf3,
  0xd5a79147,
  0x06ca6351,
  0x14292967,
  0x27b70a85,
  0x2e1b2138,
  0x4d2c6dfc,
  0x53380d13,
  0x650a7354,
  0x766a0abb,
  0x81c2c92e,
  0x92722c85,
  0xa2bfe8a1,
  0xa81a664b,
  0xc24b8b70,
  0xc76c51a3,
  0xd192e819,
  0xd6990624,
  0xf40e3585,
  0x106aa070,
  0x19a4c116,
  0x1e376c08,
  0x2748774c,
  0x34b0bcb5,
  0x391c0cb3,
  0x4ed8aa4a,
  0x5b9cca4f,
  0x682e6ff3,
  0x748f82ee,
  0x78a5636f,
  0x84c87814,
  0x8cc70208,
  0x90befffa,
  0xa4506ceb,
  0xbef9a3f7,
  0xc67178f2
);

function SHA256_sigma0(x) {
  return ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
}

function SHA256_sigma1(x) {
  return ((x >>> 17) | (x << 15)) ^ ((x >>> 19) | (x << 13)) ^ (x >>> 10);
}

function SHA256_Sigma0(x) {
  return (
    ((x >>> 2) | (x << 30)) ^
    ((x >>> 13) | (x << 19)) ^
    ((x >>> 22) | (x << 10))
  );
}

function SHA256_Sigma1(x) {
  return (
    ((x >>> 6) | (x << 26)) ^ ((x >>> 11) | (x << 21)) ^ ((x >>> 25) | (x << 7))
  );
}

function SHA256_Ch(x, y, z) {
  return z ^ (x & (y ^ z));
}

function SHA256_Maj(x, y, z) {
  return (x & y) ^ (z & (x ^ y));
}

function SHA256_Hash_Word_Block(H, W) {
  for (var i = 16; i < 64; i++)
    W[i] =
      (SHA256_sigma1(W[i - 2]) +
        W[i - 7] +
        SHA256_sigma0(W[i - 15]) +
        W[i - 16]) &
      0xffffffff;
  var state = new Array().concat(H);
  for (var i = 0; i < 64; i++) {
    var T1 =
      state[7] +
      SHA256_Sigma1(state[4]) +
      SHA256_Ch(state[4], state[5], state[6]) +
      SHA256_K[i] +
      W[i];
    var T2 = SHA256_Sigma0(state[0]) + SHA256_Maj(state[0], state[1], state[2]);
    state.pop();
    state.unshift((T1 + T2) & 0xffffffff);
    state[4] = (state[4] + T1) & 0xffffffff;
  }
  for (var i = 0; i < 8; i++) H[i] = (H[i] + state[i]) & 0xffffffff;
}

function SHA256_Hash_Byte_Block(H, w) {
  var W = new Array(16);
  for (var i = 0; i < 16; i++)
    W[i] =
      (w[4 * i + 0] << 24) |
      (w[4 * i + 1] << 16) |
      (w[4 * i + 2] << 8) |
      w[4 * i + 3];
  SHA256_Hash_Word_Block(H, W);
}

var NgbRSA = new (function __NgbRSA() {
  this.RSAKeyPair = function (encryptionExponent, decryptionExponent, modulus) {
    this.e = biFromHex(encryptionExponent);
    this.d = biFromHex(decryptionExponent);
    this.m = biFromHex(modulus);

    this.digitSize = 2 * biHighIndex(this.m) + 2;
    this.chunkSize = this.digitSize - 11;

    this.radix = 16;
    this.barrett = new BarrettMu(this.m);
  };

  this.twoDigit = function (n) {
    return (n < 10 ? "0" : "") + String(n);
  };

  this.encryptedString = function (key, s) {
    if (key.chunkSize > key.digitSize - 11) {
      return "Error";
    }

    var a = new Array();
    var sl = s.length;

    var i = 0;
    while (i < sl) {
      a[i] = s.charCodeAt(i);
      i++;
    }

    var al = a.length;
    var result = "";
    var j, k, block;
    for (i = 0; i < al; i += key.chunkSize) {
      block = new BigInt();
      j = 0;
      var x;
      var msgLength =
        i + key.chunkSize > al ? al % key.chunkSize : key.chunkSize;

      var b = new Array();
      for (x = 0; x < msgLength; x++) {
        b[x] = a[i + msgLength - 1 - x];
      }
      b[msgLength] = 0;
      var paddedSize = Math.max(8, key.digitSize - 3 - msgLength);

      for (x = 0; x < paddedSize; x++) {
        b[msgLength + 1 + x] = Math.floor(Math.random() * 254) + 1;
      }
      b[key.digitSize - 2] = 2;
      b[key.digitSize - 1] = 0;

      for (k = 0; k < key.digitSize; ++j) {
        block.digits[j] = b[k++];
        block.digits[j] += b[k++] << 8;
      }

      var crypt = key.barrett.powMod(block, key.e);
      var text =
        key.radix == 16 ? biToHex(crypt) : biToString(crypt, key.radix);
      result += text + " ";
    }

    return result.substring(0, result.length - 1);
  };

  this.decryptedString = function (key, s) {
    var blocks = s.split(" ");
    var result = "";
    var i, j, block;
    for (i = 0; i < blocks.length; ++i) {
      var bi;
      if (key.radix == 16) {
        bi = biFromHex(blocks[i]);
      } else {
        bi = biFromString(blocks[i], key.radix);
      }
      block = key.barrett.powMod(bi, key.d);
      for (j = 0; j <= biHighIndex(block); ++j) {
        result += String.fromCharCode(
          block.digits[j] & 255,
          block.digits[j] >> 8
        );
      }
    }

    if (result.charCodeAt(result.length - 1) == 0) {
      result = result.substring(0, result.length - 1);
    }

    return result;
  };

  this.utf8base64encode = function (str) {
    var base64EncodeChars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var base64DecodeChars = new Array(
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      62,
      -1,
      -1,
      -1,
      63,
      52,
      53,
      54,
      55,
      56,
      57,
      58,
      59,
      60,
      61,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      -1,
      -1,
      -1,
      -1,
      -1
    );
    var out, conv, i, len;
    var c, c1, c2, c3;

    str = str.replace(/\r\n/g, "\n");
    conv = "";

    for (i = 0; i < str.length; i++) {
      c = str.charCodeAt(i);

      if (c < 128) {
        conv += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        conv += String.fromCharCode((c >> 6) | 192);
        conv += String.fromCharCode((c & 63) | 128);
      } else {
        conv += String.fromCharCode((c >> 12) | 224);
        conv += String.fromCharCode(((c >> 6) & 63) | 128);
        conv += String.fromCharCode((c & 63) | 128);
      }
    }

    len = conv.length;
    i = 0;
    out = "";
    while (i < len) {
      c1 = conv.charCodeAt(i++) & 0xff;
      if (i == len) {
        out += base64EncodeChars.charAt(c1 >> 2);
        out += base64EncodeChars.charAt((c1 & 0x3) << 4);
        out += "==";
        break;
      }
      c2 = conv.charCodeAt(i++);
      if (i == len) {
        out += base64EncodeChars.charAt(c1 >> 2);
        out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
        out += base64EncodeChars.charAt((c2 & 0xf) << 2);
        out += "=";
        break;
      }
      c3 = conv.charCodeAt(i++);
      out += base64EncodeChars.charAt(c1 >> 2);
      out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
      out += base64EncodeChars.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >> 6));
      out += base64EncodeChars.charAt(c3 & 0x3f);
    }

    return out;
  };
})();

var NgbHash = new (function __NgbHash() {
  this.SHA256_init = function () {
    SHA256_H = new Array(
      0x6a09e667,
      0xbb67ae85,
      0x3c6ef372,
      0xa54ff53a,
      0x510e527f,
      0x9b05688c,
      0x1f83d9ab,
      0x5be0cd19
    );
    SHA256_buf = new Array();
    SHA256_len = 0;
  };

  this.SHA256_write = function (msg) {
    if (typeof msg == "string")
      SHA256_buf = SHA256_buf.concat(string_to_array(msg));
    else SHA256_buf = SHA256_buf.concat(msg);

    for (var i = 0; i + 64 <= SHA256_buf.length; i += 64)
      SHA256_Hash_Byte_Block(SHA256_H, SHA256_buf.slice(i, i + 64));
    SHA256_buf = SHA256_buf.slice(i);
    SHA256_len += msg.length;
  };

  this.SHA256_finalize = function () {
    SHA256_buf[SHA256_buf.length] = 0x80;

    if (SHA256_buf.length > 64 - 8) {
      for (var i = SHA256_buf.length; i < 64; i++) SHA256_buf[i] = 0;

      SHA256_Hash_Byte_Block(SHA256_H, SHA256_buf);
      SHA256_buf.length = 0;
    }

    for (var i = SHA256_buf.length; i < 64 - 5; i++) SHA256_buf[i] = 0;

    SHA256_buf[59] = (SHA256_len >>> 29) & 0xff;
    SHA256_buf[60] = (SHA256_len >>> 21) & 0xff;
    SHA256_buf[61] = (SHA256_len >>> 13) & 0xff;
    SHA256_buf[62] = (SHA256_len >>> 5) & 0xff;
    SHA256_buf[63] = (SHA256_len << 3) & 0xff;
    SHA256_Hash_Byte_Block(SHA256_H, SHA256_buf);

    var res = new Array(32);
    for (var i = 0; i < 8; i++) {
      res[4 * i + 0] = SHA256_H[i] >>> 24;
      res[4 * i + 1] = (SHA256_H[i] >> 16) & 0xff;
      res[4 * i + 2] = (SHA256_H[i] >> 8) & 0xff;
      res[4 * i + 3] = SHA256_H[i] & 0xff;
    }

    delete SHA256_H;
    delete SHA256_buf;
    delete SHA256_len;

    return res;
  };

  this.SHA256_hash = function (msg) {
    var res;
    NgbHash.SHA256_init();
    NgbHash.SHA256_write(msg);
    res = NgbHash.SHA256_finalize();
    return array_to_hex_string(res);
  };

  this.HMAC_SHA256_init = function (key) {
    if (typeof key == "string") HMAC_SHA256_key = string_to_array(key);
    else HMAC_SHA256_key = new Array().concat(key);

    if (HMAC_SHA256_key.length > 64) {
      SHA256_init();
      SHA256_write(HMAC_SHA256_key);
      HMAC_SHA256_key = SHA256_finalize();
    }

    for (var i = HMAC_SHA256_key.length; i < 64; i++) HMAC_SHA256_key[i] = 0;
    for (var i = 0; i < 64; i++) HMAC_SHA256_key[i] ^= 0x36;

    NgbHash.SHA256_init();
    NgbHash.SHA256_write(HMAC_SHA256_key);
  };

  this.HMAC_SHA256_init2 = function (key) {
    if (typeof key == "string") HMAC_SHA256_key = hex_string_to_array(key);
    else HMAC_SHA256_key = new Array().concat(key);

    if (HMAC_SHA256_key.length > 64) {
      SHA256_init();
      SHA256_write(HMAC_SHA256_key);
      HMAC_SHA256_key = SHA256_finalize();
    }

    for (var i = HMAC_SHA256_key.length; i < 64; i++) HMAC_SHA256_key[i] = 0;
    for (var i = 0; i < 64; i++) HMAC_SHA256_key[i] ^= 0x36;

    NgbHash.SHA256_init();
    NgbHash.SHA256_write(HMAC_SHA256_key);
  };

  this.HMAC_SHA256_write = function (msg) {
    NgbHash.SHA256_write(msg);
  };

  this.HMAC_SHA256_finalize = function () {
    var md = NgbHash.SHA256_finalize();

    for (var i = 0; i < 64; i++) HMAC_SHA256_key[i] ^= 0x36 ^ 0x5c;

    NgbHash.SHA256_init();
    NgbHash.SHA256_write(HMAC_SHA256_key);
    NgbHash.SHA256_write(md);

    for (var i = 0; i < 64; i++) HMAC_SHA256_key[i] = 0;

    delete HMAC_SHA256_key;
    return NgbHash.SHA256_finalize();
  };

  this.HMAC_SHA256_MAC = function (key, msg) {
    var res;
    NgbHash.HMAC_SHA256_init(key);
    NgbHash.HMAC_SHA256_write(msg);
    res = NgbHash.HMAC_SHA256_finalize();
    return array_to_hex_string(res).toUpperCase();
  };

  this.HMAC_SHA256_MAC2 = function (key, msg) {
    var res;
    NgbHash.HMAC_SHA256_init2(key);
    NgbHash.HMAC_SHA256_write(msg);
    res = NgbHash.HMAC_SHA256_finalize();
    return array_to_hex_string(res).toUpperCase();
  };
})();
