// migrations/2_deploy.js
// SPDX-License-Identifier: MIT
const MyERC1155Token = artifacts.require("MyERC1155Token.sol");

module.exports = function(deployer) {
  deployer.deploy(MyERC1155Token, 'https://opensea-creatures-api.herokuapp.com/api/creature/{token_id}');
};

