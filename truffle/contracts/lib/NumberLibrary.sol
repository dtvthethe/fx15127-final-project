// SPDX-License-Identifier: MIT
pragma solidity ^0.4.26;

library NumberLibrary {
    /**
     * Convert _input to positive number.
     *
     * @param _input The input value.
     *
     * @return int
     */
    function abs(int _input) internal pure returns (int) {
        if (_input < 0) {
            return _input * -1;
        }

        return _input;
    }

    /**
     * Convert a number to decimal
     *
     * @param _input The input value
     *
     * @return int
     */
    function compress(int _input) internal pure returns (int) {
        return _input * (10**18);
    }

    /**
     * Convert a decimal to number
     *
     * @param _input The input value
     *
     * @return int
     */
    function extract(int _input) internal pure returns (int) {
        return _input / (10**18);
    }
}
