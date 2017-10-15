# [Landmark](https://thoppe.github.io/Landmark/)
_social media on the blockchain_

Landmark is a social network implemented as a smart-contract for ethereum.
It is completely decentralized, permanent, and uncensorable form of communication for as long as ethereum exists.
When you _mark_, the message is etched into the blockchain forever.

The canonical address is

    0x00000000000000000000000000000

The current test address on the ropsten network is

    0x90a9b125b6e4b22eCB139819778Dc01D1339ef5C

But you can build your own "Landmark" by deploying it to the blockchain.
If you build one, let us know and we'll list it here!

### Development

##### *ropsten*

First you'll need to create a toy account to play with. You can create your own or use this [premade one](https://ropsten.etherscan.io/address/0xb5694153edac5d5f669bc4afb6ce4c0866c53511):

    0xb5694153edac5d5f669bc4afb6ce4c0866c53511
    2a47b2de5e56206632db329d634259fdb2188183de67f7d5aca69992fd18e951

https://github.com/transmute-industries/ropsten-example

Request some ether if there isn't any in the account by using the [faucet](https://faucet.metamask.io/).

    # Use parity to sync the ropsten network
    parity --chain ropsten


##### *testrpc* (localhost)

Start the testrpc with the following seed to keep the accounts in sync

    testrpc --seed 2048

This creates a master test account with the follow public/private keys

     0xb5694153edac5d5f669bc4afb6ce4c0866c53511
     2a47b2de5e56206632db329d634259fdb2188183de67f7d5aca69992fd18e951

Which you can import into MetaMask to test the DApp.