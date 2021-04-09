// SPDX-License-Identifier: MIT


pragma solidity >=0.4.22 <0.9.0;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';

contract MyERC1155Token is ERC1155 {

    constructor (string memory uri) ERC1155(uri) {}

    function setURI(string memory newuri) public {
        _setURI(newuri);
    }

    function mint(address to, uint256 id, uint256 value, bytes memory data) public {
        _mint(to, id, value, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory values, bytes memory data) public {
        _mintBatch(to, ids, values, data);
    }

    function burn(address owner, uint256 id, uint256 value) public {
        _burn(owner, id, value);
    }

    function burnBatch(address owner, uint256[] memory ids, uint256[] memory values) public {
        _burnBatch(owner, ids, values);
    }


}