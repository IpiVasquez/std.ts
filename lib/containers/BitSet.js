"use strict";
/**
 * @author Hector J. Vasquez <ipi.vasquez@gmail.com>
 *
 * @licence
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// The number of bit in each elements of the array
var PER_ELEM_BITS = 8 * Uint32Array.BYTES_PER_ELEMENT;
// A constant for fill elements with every bit on
var FULL_ELEM = 0xFFFFFFFF;
/**
 * A representation of a BitSet. It works as an array of booleans by handling
 * the bits of the integers. When the quantity of bits is greater than 32, it
 * opens another position in the array.
 */
var BitSet = /** @class */ (function () {
    /**
     * Builds this with a default array size of 1, that means 32 bits.
     * @param size The size for this.
     * @param buffer A buffer previously set if it is required.
     */
    function BitSet(size, buffer) {
        if (size === void 0) { size = 1; }
        // The number of bits on in this
        this._numOn = 0;
        // The size of the bit set
        this._size = 0;
        if (buffer) {
            this.setFromBuffer(buffer, size);
        }
        else {
            this.size = size;
        }
    }
    Object.defineProperty(BitSet.prototype, "buffer", {
        /**
         * Returns the buffer containing the bits on this BitSet.
         * @return An array of integers.
         */
        get: function () {
            return this._buffer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BitSet.prototype, "numOn", {
        /**
         * Returns the number of bits set in the BitSet.
         * @return The number of bits on in this BitSet.
         */
        get: function () {
            return this._numOn;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BitSet.prototype, "size", {
        /**
         * Returns the size of the BitSet.
         * @return The size of this BitSet.
         */
        get: function () {
            return this._size;
        },
        /**
         * Sets the size of this BitSet to a given size.
         * @param size The new size for this BitSet.
         */
        set: function (size) {
            if (size === this._size) {
                return;
            }
            var oldBuf = this._buffer;
            var newBuf = this._buffer = new Uint32Array(nElementsNeeded(size));
            this._size = size;
            if (oldBuf) {
                if (newBuf.length < oldBuf.length) {
                    newBuf.set(oldBuf.subarray(0, newBuf.length));
                    // clear bits above the overhang
                    var numOverhang = size % PER_ELEM_BITS;
                    if (numOverhang > 0) {
                        newBuf[newBuf.length - 1] &= (1 << numOverhang) - 1;
                    }
                    this._numOn = bitsOn(newBuf, size);
                }
                else {
                    // we grew, no need to recompute num true, just copy
                    newBuf.set(oldBuf);
                }
            }
            else {
                this._numOn = 0; // fresh array
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BitSet.prototype, "numOff", {
        /**
         * Returns the number of bits unset in the BitSet.
         * @return The number of bits off in this BitSet.
         */
        get: function () {
            return this.size - this.numOn;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets the bit value at i.
     * @param i The bit to get.
     * @return this[i].
     */
    BitSet.prototype.get = function (i) {
        return (this._buffer[elementIndex(i)] & (1 << bitPlace(i))) !== 0;
    };
    /**
     * Sets the bit at i position to a given value.
     * @param i The bit to be set.
     * @param value The value for the bit.
     */
    BitSet.prototype.set = function (i, value) {
        // If this.size is less than the expected, updates size
        if (value && this.size <= i) {
            this.size = (i + 1);
        }
        var existing = this.get(i);
        if (value === existing) {
            return;
        }
        if (value) {
            this._buffer[elementIndex(i)] |= 1 << bitPlace(i);
        }
        else {
            this._buffer[elementIndex(i)] &= ~(1 << bitPlace(i));
        }
        // Updates number of bits on
        this._numOn += value ? 1 : -1;
    };
    /**
     * Sets all bit in this to a given value.
     * @param value The new value for all bits in this.
     */
    BitSet.prototype.setAll = function (value) {
        var overhang = this._size % PER_ELEM_BITS;
        if (overhang === 0 || !value) {
            fill(this._buffer, value ? FULL_ELEM : 0);
        }
        else {
            fill(this._buffer, FULL_ELEM, this._buffer.length - 1);
            this._buffer[this._buffer.length - 1] = (1 << overhang) - 1;
        }
        // Updates number of bits on
        this._numOn = value ? this._size : 0;
    };
    /**
     * Sets the bits of this BitSet as the bits of a given buffer.
     * @param buffer The buffer to copy in this BitSet.
     * @param size The size of the buffer.
     */
    BitSet.prototype.setFromBuffer = function (buffer, size) {
        this._buffer = new Uint32Array(buffer);
        this._size = size;
        this._numOn = bitsOn(this._buffer, size);
    };
    /**
     * Clones this BitSet.
     * @return A copy of this BitSet.
     */
    BitSet.prototype.clone = function () {
        return new BitSet(this.size, this.buffer);
    };
    /**
     * Returns whether any of the bits is set.
     * @return true if there is any bit on in this, false otherwise.
     */
    BitSet.prototype.any = function () {
        return this.numOn > 0;
    };
    /**
     * Returns whether all of the bits are set.
     * @return true if all the bits are set, false otherwise.
     */
    BitSet.prototype.all = function () {
        return this.numOn === this.size;
    };
    /**
     * Returns whether none of the bits is set.
     * @return true if none of the bits in the BitSet is set, false
     * otherwise.
     */
    BitSet.prototype.none = function () {
        return !this.any();
    };
    return BitSet;
}());
exports.BitSet = BitSet;
/**
 * Gets the respective index in the buffer for the i-th bit.
 * @param i The position of the bit.
 * @return The position of the element holding the bit in the buffer.
 */
function elementIndex(i) {
    return Math.floor(i / PER_ELEM_BITS);
}
/**
 * The place of the bit in its respective element.
 * @param i The position of the bit.
 * @return The bit position in the respective element for this.
 */
function bitPlace(i) {
    return i % PER_ELEM_BITS;
}
/**
 * The number of elements needed for a BitSet of certain size.
 * @param size The number of bits required.
 * @return The number of elements required.
 */
function nElementsNeeded(size) {
    return Math.ceil(size / PER_ELEM_BITS);
}
/**
 * Counts the number of bits on in some buffer of certain size.
 * @param buf The buffer to check the bits on.
 * @param size The size of the buffer.
 * @return The number of bits on in buf.
 */
function bitsOn(buf, size) {
    var nElements = nElementsNeeded(size);
    var numOverhang = size % PER_ELEM_BITS;
    var sum = 0;
    for (var i = 0; i < nElements; i++) {
        if (i === nElements - 1 && numOverhang > 0) {
            sum += popCount(buf[i], numOverhang);
        }
        else {
            sum += popCount(buf[i]);
        }
    }
    return sum;
}
/**
 * Checks the number of bits on inside an integer from a bit position.
 * @param int The integer to check bits.
 * @param startingBit From where to check the bits.
 * @return The number of bits on in anInt.
 */
function popCount(int, startingBit) {
    if (startingBit !== undefined) {
        int &= (1 << startingBit) - 1;
    }
    // Some boring constants
    int -= int >> 1 & 0x55555555;
    int = (int & 0x33333333) + (int >> 2 & 0x33333333);
    int = int + (int >> 4) & 0x0f0f0f0f;
    int += int >> 8;
    int += int >> 16;
    return int & 0x7f;
}
/**
 * Fills all elements in an array given with some value.
 * @param arr The array to fill.
 * @param value The value for every element in the array.
 * @param len The length of the array.
 */
function fill(arr, value, len) {
    if (len === void 0) { len = arr.length; }
    arr.fill(value, 0, len);
}
