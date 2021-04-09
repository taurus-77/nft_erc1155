const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const ERC1155 = artifacts.require('./contracts/MyERC1155Token.sol');

contract('ERC1155', (accounts) => {

    const [operator, tokenHolder, tokenBatchHolder, ...otherAccounts] = accounts;

    const initialURI = 'https://opensea-creatures-api.herokuapp.com/api/creature/{token_id}';


    beforeEach(async () =>{
      this.token = await ERC1155.new(initialURI);
    });


    describe('internal functions', () => {
        const tokenId = new BN(1990);
        const mintAmount = new BN(9001);
        const burnAmount = new BN(3000);

        const tokenBatchIds = [new BN(2000), new BN(2010), new BN(2020)];
        const mintAmounts = [new BN(5000), new BN(10000), new BN(42195)];
        const burnAmounts = [new BN(5000), new BN(9001), new BN(195)];

        const data = '0x12345678';

        it('reverts with a zero destination address', async () => {
            await expectRevert(
                this.token.mint(ZERO_ADDRESS, tokenId, mintAmount, data),
                'ERC1155: mint to the zero address',
            );
        });
        
        context('with minted tokens', () => {
            beforeEach(async () => {
              ({ logs: this.logs } = await this.token.mint(tokenHolder, tokenId, mintAmount, data, { from: operator }));
            });
    
            it('emits a TransferSingle event', () => {
              expectEvent.inLogs(this.logs, 'TransferSingle', {
                operator,
                from: ZERO_ADDRESS,
                to: tokenHolder,
                id: tokenId,
                value: mintAmount,
              });
            });
    
            it('credits the minted amount of tokens', async () => {
              expect(await this.token.balanceOf(tokenHolder, tokenId)).to.be.bignumber.equal(mintAmount);
            });
          });

          describe('_mintBatch', () => {
            it('reverts with a zero destination address', async () => {
              await expectRevert(
                this.token.mintBatch(ZERO_ADDRESS, tokenBatchIds, mintAmounts, data),
                'ERC1155: mint to the zero address',
              );
            });
      
            it('reverts if length of inputs do not match', async () => {
              await expectRevert(
                this.token.mintBatch(tokenBatchHolder, tokenBatchIds, mintAmounts.slice(1), data),
                'ERC1155: ids and amounts length mismatch',
              );
      
              await expectRevert(
                this.token.mintBatch(tokenBatchHolder, tokenBatchIds.slice(1), mintAmounts, data),
                'ERC1155: ids and amounts length mismatch',
              );
            });
      
            context('with minted batch of tokens', () => {
              beforeEach(async () => {
                ({ logs: this.logs } = await this.token.mintBatch(
                  tokenBatchHolder,
                  tokenBatchIds,
                  mintAmounts,
                  data,
                  { from: operator },
                ));
              });
      
              it('emits a TransferBatch event', () => {
                expectEvent.inLogs(this.logs, 'TransferBatch', {
                  operator,
                  from: ZERO_ADDRESS,
                  to: tokenBatchHolder,
                });
              });
      
              it('credits the minted batch of tokens', async () => {
                const holderBatchBalances = await this.token.balanceOfBatch(
                  new Array(tokenBatchIds.length).fill(tokenBatchHolder),
                  tokenBatchIds,
                );
      
                for (let i = 0; i < holderBatchBalances.length; i++) {
                  expect(holderBatchBalances[i]).to.be.bignumber.equal(mintAmounts[i]);
                }
              });
            });
          });


          describe('_burn', () => {
            it('reverts when burning the zero account\'s tokens', async () => {
              await expectRevert(
                this.token.burn(ZERO_ADDRESS, tokenId, mintAmount),
                'ERC1155: burn from the zero address',
              );
            });
      
            it('reverts when burning a non-existent token id', async () => {
              await expectRevert(
                this.token.burn(tokenHolder, tokenId, mintAmount),
                'ERC1155: burn amount exceeds balance',
              );
            });
      
            it('reverts when burning more than available tokens', async () => {
              await this.token.mint(
                tokenHolder,
                tokenId,
                mintAmount,
                data,
                { from: operator },
              );
      
              await expectRevert(
                this.token.burn(tokenHolder, tokenId, mintAmount.addn(1)),
                'ERC1155: burn amount exceeds balance',
              );
            });
      
            context('with minted-then-burnt tokens', () => {
              beforeEach(async () => {
                await this.token.mint(tokenHolder, tokenId, mintAmount, data);
                ({ logs: this.logs } = await this.token.burn(
                  tokenHolder,
                  tokenId,
                  burnAmount,
                  { from: operator },
                ));
              });
      
              it('emits a TransferSingle event', () => {
                expectEvent.inLogs(this.logs, 'TransferSingle', {
                  operator,
                  from: tokenHolder,
                  to: ZERO_ADDRESS,
                  id: tokenId,
                  value: burnAmount,
                });
              });
      
              it('accounts for both minting and burning', async () => {
                expect(await this.token.balanceOf(
                  tokenHolder,
                  tokenId,
                )).to.be.bignumber.equal(mintAmount.sub(burnAmount));
              });
            });
          });
      






          describe('_burnBatch', () => {
            it('reverts when burning the zero account\'s tokens', async () => {
              await expectRevert(
                this.token.burnBatch(ZERO_ADDRESS, tokenBatchIds, burnAmounts),
                'ERC1155: burn from the zero address',
              );
            });
      
            it('reverts if length of inputs do not match', async () => {
              await expectRevert(
                this.token.burnBatch(tokenBatchHolder, tokenBatchIds, burnAmounts.slice(1)),
                'ERC1155: ids and amounts length mismatch',
              );
      
              await expectRevert(
                this.token.burnBatch(tokenBatchHolder, tokenBatchIds.slice(1), burnAmounts),
                'ERC1155: ids and amounts length mismatch',
              );
            });
      
            it('reverts when burning a non-existent token id', async () => {
              await expectRevert(
                this.token.burnBatch(tokenBatchHolder, tokenBatchIds, burnAmounts),
                'ERC1155: burn amount exceeds balance',
              );
            });
      
            context('with minted-then-burnt tokens', () => {
              beforeEach(async () => {
                await this.token.mintBatch(tokenBatchHolder, tokenBatchIds, mintAmounts, data);
                ({ logs: this.logs } = await this.token.burnBatch(
                  tokenBatchHolder,
                  tokenBatchIds,
                  burnAmounts,
                  { from: operator },
                ));
              });
      
              it('emits a TransferBatch event', () => {
                expectEvent.inLogs(this.logs, 'TransferBatch', {
                  operator,
                  from: tokenBatchHolder,
                  to: ZERO_ADDRESS,
                  // ids: tokenBatchIds,
                  // values: burnAmounts,
                });
              });
      
              it('accounts for both minting and burning', async () => {
                const holderBatchBalances = await this.token.balanceOfBatch(
                  new Array(tokenBatchIds.length).fill(tokenBatchHolder),
                  tokenBatchIds,
                );
      
                for (let i = 0; i < holderBatchBalances.length; i++) {
                  expect(holderBatchBalances[i]).to.be.bignumber.equal(mintAmounts[i].sub(burnAmounts[i]));
                }
              });
            });
          });
        });







          describe('ERC1155MetadataURI', () => {
            const firstTokenID = new BN('42');
            const secondTokenID = new BN('1337');
        
            it('emits no URI event in constructor', async () => {
              await expectEvent.notEmitted.inConstruction(this.token, 'URI');
            });
        
            it('sets the initial URI for all token types', async () => {
              expect(await this.token.uri(firstTokenID)).to.be.equal(initialURI);
              expect(await this.token.uri(secondTokenID)).to.be.equal(initialURI);
            });
        
            describe('_setURI', () => {
              const newURI = 'https://token-cdn-domain/{locale}/{id}.json';
        
              it('emits no URI event', async () => {
                const receipt = await this.token.setURI(newURI);
        
                expectEvent.notEmitted(receipt, 'URI');
              });
        
              it('sets the new URI for all token types', async () => {
                await this.token.setURI(newURI);
        
                expect(await this.token.uri(firstTokenID)).to.be.equal(newURI);
                expect(await this.token.uri(secondTokenID)).to.be.equal(newURI);
              });
            });
          });

});