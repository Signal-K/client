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