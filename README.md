# Landmark

Landmark is a social network implemented as a smart-contract for ethereum.
It is completely decentralized, permanent, and uncensorable form of communication for as long as ethereum exists.
When you _mark_, the message is etched into the blockchain forever.
You'll need a web3 interface (like [Metamask](https://metamask.io/)) to post to the site live, but you can still view without the extension.
Notable Landmarks can be found below, but you can create your own by deploying the [contract](contracts/Landmark.sol). If you do, let me know and I'll list it here.

## Notable Landmarks

### [`0xD38e005a28fae8D8c4238444BC08E7Da83902310`](https://thoppe.github.io/Landmark/index.html?address=0xD38e005a28fae8D8c4238444BC08E7Da83902310)

The canonical address for Landmark. This is ground-zero for the Landmark experiment. If you've got some ether, you can carve your eternal message into the blockchain for everyone to see!

### [`0x1B11aC23fbB37B1F943c2b36a566fc77f64BB8a9`](https://thoppe.github.io/Landmark/index.html?address=0x1B11aC23fbB37B1F943c2b36a566fc77f64BB8a9&noMeta=true)

A memorial Landmark built for victims of the [2017 Las Vegas shooting](https://www.nytimes.com/2017/10/02/us/vegas-victims-names.html). This Landmark has been closed for further marks.

## Development

##### *ropsten*

You'll need to create a toy account to play with. You can create your own or use this [premade one](https://ropsten.etherscan.io/address/0xb5694153edac5d5f669bc4afb6ce4c0866c53511):

    0xb5694153edac5d5f669bc4afb6ce4c0866c53511
    2a47b2de5e56206632db329d634259fdb2188183de67f7d5aca69992fd18e951

https://github.com/transmute-industries/ropsten-example

Request some ether if there isn't any in the account by using the [faucet](https://faucet.metamask.io/).

    # Use parity to sync the ropsten network
    parity --chain ropsten

A test address already on the ropsten network is

[`0xA334472B88830Dac9BD4d800e4366e9Ce584631a`](https://ropsten.etherscan.io/address/0xa334472b88830dac9bd4d800e4366e9ce584631a)


##### *testrpc* (localhost)

Start the testrpc with the following seed to keep the accounts in sync

    testrpc --seed 2048

This creates a master test account with the follow public/private keys

     0xb5694153edac5d5f669bc4afb6ce4c0866c53511
     2a47b2de5e56206632db329d634259fdb2188183de67f7d5aca69992fd18e951

Which you can import into MetaMask to test the DApp.
`truffle deploy` will push the contract out to the address:

     0x90a9b125b6e4b22ecb139819778dc01d1339ef5c