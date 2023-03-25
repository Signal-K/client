brownie run scripts/deploy_contracts.py
Brownie v1.19.3 - Python development framework for Ethereum

/opt/homebrew/lib/python3.10/site-packages/brownie/project/main.py:743: BrownieEnvironmentWarning: Loaded project has a root folder of '/Users/buyer/Documents/Lens/client' which is different from the current working directory
  warnings.warn(
ClientProject is the active project.

Launching 'ganache-cli --chain.vmErrorsOnRPCResponse true --server.port 8545 --miner.blockGasLimit 12000000 --wallet.totalAccounts 10 --hardfork istanbul --wallet.mnemonic brownie'...

Running '/Users/buyer/Documents/Lens/client/scripts/deploy_contracts.py::main'...
Transaction sent: 0xe192cef0aaa52d14d5435f5a1f9968eac65fbb79902a3d407ae54c80a1405680
  Gas price: 0.0 gwei   Gas limit: 12000000   Nonce: 0
  GovernanceToken.constructor confirmed   Block: 1   Gas used: 1925133 (16.04%)
  GovernanceToken deployed at: 0x3194cBDC3dbcd3E11a07892e7bA5c3394048Cc87

Transaction sent: 0x88ae12c648dff09f33b763a940b88268086dd1c93cd72ef2793f4b5343b02f83
  Gas price: 0.0 gwei   Gas limit: 12000000   Nonce: 1
  GovernanceToken.delegate confirmed   Block: 2   Gas used: 90025 (0.75%)

Number of CheckPoints: 1
Transaction sent: 0x3a901c35319b59447fc1132f0bfc2be0e2b14e5637c0507cf2ea57c6a4937801
  Gas price: 0.0 gwei   Gas limit: 12000000   Nonce: 2
  TimeLock.constructor confirmed   Block: 3   Gas used: 1874819 (15.62%)
  TimeLock deployed at: 0xE7eD6747FaC5360f88a2EFC03E00d25789F69291

Governance TimeLock: 0xE7eD6747FaC5360f88a2EFC03E00d25789F69291
Transaction sent: 0x522e84f31da6d2fddf77b30436da707a796d723e7d337ccde4b1dbb2f72d1081
  Gas price: 0.0 gwei   Gas limit: 12000000   Nonce: 3
  AnomalyGovernor.constructor confirmed   Block: 4   Gas used: 3495655 (29.13%)
  AnomalyGovernor deployed at: 0x6951b5Bd815043E3F842c1b026b0Fa888Cc2DD85

Transaction sent: 0x927ffd2f8d676e160e4b9ceb73e8eccfba6c0925597465243551cb506bea91c8
  Gas price: 0.0 gwei   Gas limit: 12000000   Nonce: 4
  TimeLock.grantRole confirmed   Block: 5   Gas used: 48309 (0.40%)

Transaction sent: 0xfa1463d4fba62332e60576019cbc319d110238d3c13d6daadaedc1fd950bda3f
  Gas price: 0.0 gwei   Gas limit: 12000000   Nonce: 5
  TimeLock.grantRole confirmed   Block: 6   Gas used: 48069 (0.40%)

Transaction sent: 0xf3e6475854f27440cc74294ebd7c7eb96a12cb9a17e4f9d1a03df5689c347f30
  Gas price: 0.0 gwei   Gas limit: 12000000   Nonce: 6
  TimeLock.grantRole confirmed   Block: 7   Gas used: 25372 (0.21%)

Transaction sent: 0xe2f19f67eb35789d7ccb006339859d52f48f5c4324fc38d532d9876095ed229a
  Gas price: 0.0 gwei   Gas limit: 12000000   Nonce: 7
  Box.constructor confirmed   Block: 8   Gas used: 228144 (1.90%)
  Box deployed at: 0xcCB53c9429d32594F404d01fbe9E65ED1DCda8D9

Transaction sent: 0xba42563cfb61250a7f8405e2322699b5c85de249f241f876def451c6e3a9ea04
  Gas price: 0.0 gwei   Gas limit: 12000000   Nonce: 8
  Box.transferOwnership confirmed   Block: 9   Gas used: 30084 (0.25%)

  Box.transferOwnership confirmed   Block: 9   Gas used: 30084 (0.25%)

Terminating local RPC client..