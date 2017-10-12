# Landmark
_social media on the blockchain_

Landmark is a social network implemented as a smart-contract for ethereum.
It is completely decentralized, permanent, and uncensorable form of communication for as long as ethereum exists.
When you _mark_, the message is etched into the blockchain forever.

The canonical address is

    0x00000000000000000000000000000

But you can build your own "Landmark" by deploying it to the blockchain.
If you build one, let us know and we'll list it here!

### Development

** ropsten ** (localhost)

https://ethereum.stackexchange.com/questions/23338/deployment-of-a-functioning-contract-testrpc-to-ropsten-with-truffle-geth

For testing ONLY, create an account and save the key to `roth.key`.

+ Public account: `0xb5694153edac5d5f669bc4afb6ce4c0866c53511`
+ Private key: `2a47b2de5e56206632db329d634259fdb2188183de67f7d5aca69992fd18e951`

Request some ether if there isn't any in the account
https://faucet.metamask.io/


    # Create a local wallet
    geth --testnet account import roth.key

    # Sync the ropsten so you have a local node running
    geth --fast --cache=1048 --testnet --rpc --rpcapi "eth,net,web3" --rpccorsdomain '*' --rpcaddr localhost --rpcport 8545 --unlock "0xb5694153edac5d5f669bc4afb6ce4c0866c53511"

    # After sync migrate the contract
    truffle migrate --network ropsten

** testnet ** (localhost)

Start the testrpc with the following seed to keep the accounts in sync

    testrpc --seed 2048

This creates a master test account with the follow public/private keys

     0xb5694153edac5d5f669bc4afb6ce4c0866c53511
     2a47b2de5e56206632db329d634259fdb2188183de67f7d5aca69992fd18e951

Which you can import into MetaMask to test the DApp.

### Roadmap for front end

+ [ ] Change address
+ [ ] Deploy to main chain
