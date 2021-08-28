// If user is inactive - removed from the state, last position is not saved

const logger = Moralis.Cloud.getLogger();
var state = {}
var lastMoved = {}

function updateState(userId, direction){
    logger.info("updateState ", userId, "direction ", direction);

    // TODO - add server-side logic to restrict movements, add pickup items etc

    if(direction == "up"){
        state[userId].y-=5;
    }
    else if(direction == "down"){
        state[userId].y+=5;
    }
    else if(direction == "left"){
        state[userId].x-=5;
    }
    else if(direction == "right"){
        state[userId].x+=5;
    }
}

async function bootServer(){
    const gameState = await stateDBReference()
    if(gameState.get("state"))
        state = gameState.get("state")
}

async function stateDBReference(){
    // Find or create new GameState row
    const GameState = Moralis.Object.extend("GameState");
    const query = new Moralis.Query(GameState);
    query.equalTo("stateType", "globalGameState");
    var gameState = await query.first();
    if(!gameState){
        gameState = new GameState();
        gameState.set("stateType","globalGameState")
    }

    return gameState;
}

async function persistState(){ // Save game state to the db
    var gameState = await stateDBReference();

    // Upload the state
    gameState.set("state",state)
    await gameState.save(null,{useMasterKey:true})
}

Moralis.Cloud.define("move", async (request) => {
    logger.info("Move called!");
    logger.info(JSON.stringify(request));

    const userId = request.user.get("username");

    // Create and write to DB new version of the state
    const direction = request.params.direction;
    updateState(userId,direction);
    await persistState();
});

Moralis.Cloud.define("ping", async (request) => {
    // Either add the user to current game state or update with last ping
    const userId = request.user.get("username");
    const ethAddress = request.user.get("authData").moralisEth.id;

    if(!state[userId])
    {
        state[userId] = {x:0,y:0,lastPing:Date.now(), displayAddress: ethAddress}
    }
    else{
        state[userId].lastPing = Date.now()
    }

    if(!state[userId].svg){
        // Get aavegochi owned
        const EthNFTOWners = Moralis.Object.extend("EthNFTOwners");
        const query = new Moralis.Query(EthNFTOWners);
        query.equalTo("owner_of", ethAddress);
        query.equalTo("token_address", "") // Up to 10:37
    }
})