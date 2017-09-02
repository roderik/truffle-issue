const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory');
const Campaign = artifacts.require('Campaign');
const MultiSigWallet = artifacts.require('MultiSigWallet');
const MyToken = artifacts.require('MyToken');

const timetravel = s => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync(
      {
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [s],
        id: new Date().getTime(),
      },
      function(err) {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};

contract('Campaign', function(accounts) {
  let factory;
  let token;
  let wallet;
  let sale;

  const startTime = 1505750400; // 09/18/2017 @ 4:00pm (UTC) = 5:00pm (CET)
  const endTime = 1508169600; // 10/16/2017 @ 4:00pm (UTC) = 5:00pm (CET)

  beforeEach(async () => {
    factory = await MiniMeTokenFactory.new();
    wallet = await MultiSigWallet.new(
      [
        accounts[7], // account_index: 7
        accounts[8], // account_index: 8
        accounts[9], // account_index: 9
      ],
      2
    );
    token = await MyToken.new(factory.address);
    sale = await Campaign.new(
      startTime,
      endTime,
      28125000000000000000000,
      wallet.address,
      token.address
    );
  });

  it('should return correct balances after generation', async function() {
    await token.generateTokens(accounts[1], 100);
    const totalSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), 100);
  });

  it('should work when trying to send ether during the sale', async function() {
    // await token.changeController(sale.address);
    const { timestamp } = web3.eth.getBlock('latest');
    const travelTime = startTime - timestamp + 60; // 60 seconds after the start of the sale
    await timetravel(travelTime);
    web3.eth.sendTransaction({
      from: accounts[0],
      to: sale.address,
      value: web3.toWei(1, 'ether'),
    });
    const totalSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), 1200);
    const totalCollected = await sale.totalCollected;
    assert.equal(totalCollected.toNumber(), 1200);
    const balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.toNumber(), 1200);
  });
});
