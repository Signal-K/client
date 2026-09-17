(Insert Jekyll/hydejack (or eleventy) docs here)

Some notes:
In `stake/contracts/PlanetHelper.sol`, we import two relatively large contracts from `@thirdweb-dev/contracts`:
```sol
import "@thirdweb-dev/contracts/drop/DROPERC1155.sol";
import "@thirdweb-dev/contracts/token/TokenERC20.sol";
```

It might be worth looking at the original contracts being imported and customising them IF performance and/or gas fees are impacted as a result of importing these.