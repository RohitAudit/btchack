# Raga Finance
Raga finance enables cross chain yield generation. The yield generated through raga can be acccessed on any L1 and L2
For this hackathon, we build the solution for 
1. [Rooch network]("https://rooch.network/")  
2. [fractal]("https://www.fractalbitcoin.io/")

Users can bridge eth/usdc from ethereum and get the native BRC20 token on fractal and Coin on rooch network and these assets are backed by assets on ethereum. The value of asset goes up with time as the vaults earn rewards.

## Project Components
### Ethereum Vaults Smart Contract
- Deposit Contract: This is the ethereum vault
- Messaging contract: This contract is responsible for sending messages
- Strategy Manager: This contract handles all the strategies on Ethereum
### Golang bot 
The golang bot is responsible for relaying the transactions to different chains depending on the network selcted by the user. For future we'll use decntralised bridge for pasing message
### WebApp 
Users can use webapp to interact with raga finance and bridge the asset across chains


Tech stacks used:
1. rooch cli and move contracts
2. fractal brc20 standard

Future enhancement: Making sdk for users to interact with brc20 and rooch and also improving on the UI


Depployed Addresse on holesky:
**DepositL1**:0x19Dd8fc5f87AAD2503f5eB1780de1b24CC0AAECd
**StrategyManager**:0x7aCf0aBe42DA4D48A58D7013A394Fb0b26407E32
**MessagingL1**:0x9a5Aeb2C94359b6546e5956c2eF67F66C66a5D07

Rooch chain:
**raga_finance** = "0x921e640162d360a1a66d2319adc9d5eb6d11f8f9f4a57fb1bac01188ab369b65"
**std** = "0x1"
**moveos_std** = "0x2"
**rooch_framework** = "0x3"
**coin**: 0x921e640162d360a1a66d2319adc9d5eb6d11f8f9f4a57fb1bac01188ab369b65::native_eth_coin

fractal: 
**minter address**: bc1qc2vug7086yc8d8um6jlxrtapza6wtpufqly83s 
**brc ticker**: [nativeETH](https://fractal-testnet.unisat.io/brc20/nativeETH)

