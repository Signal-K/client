export const HELPER_ADDRESS = '0xcf05AB21cAa609c81D6DfF435F0F8808A05EA264'; // custom contract
// 0xcf05AB21cAa609c81D6DfF435F0F8808A05EA264 is deployed from the correct wallet, but has a problem - it points to the Planets contract as the multitools contract (i.e. the planets are both the required nft and the nft that is being staked. This could be implemented in future...but for now we need to fix this. So I've redeployed it on a new address (see above line) with the correct pointer). See https://skinetics.notion.site/Planet-Mining-multitool-8310fa1cd188440688bbcc19692b3b67. Derived from https://thirdweb.com/0xCdc5929e1158F7f0B320e3B942528E6998D8b25c/PlanetHelper/1.0.1?via=/goerli/0xcf05AB21cAa609c81D6DfF435F0F8808A05EA264
export const MULTITOOLS_ADDRESS = '0xF846D262EeBAFbfA79017b43aBb0251F740a0619';
export const PLANETS_ADDRESS = '0xdf35Bb26d9AAD05EeC5183c6288f13c0136A7b43'; // edition drop (erc1155)
export const MINERALS_ADDRESS = '0xE938775F4ee4913470905885c9744C7FAD482991';

// Note that this is on the Goerli test net