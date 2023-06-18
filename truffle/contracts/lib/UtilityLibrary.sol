// SPDX-License-Identifier: MIT
pragma solidity ^0.4.26;

library UtilityLibrary {
    function abs(int _input) internal pure returns (int) {
        if (_input < 0) {
            return _input * -1;
        }

        return _input;
    }
}
