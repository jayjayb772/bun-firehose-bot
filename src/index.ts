import {AppBskyFeedPost} from "@atproto/api";
import {
    ComAtprotoSyncSubscribeRepos,
    subscribeRepos,
    SubscribeReposMessage,
    XrpcEventStreamClient,
} from 'atproto-firehose'
import {RepoOp} from "@atproto/api/dist/client/types/com/atproto/sync/subscribeRepos";
import {HandlerController} from "./handlers/abstract-handler.ts";
import {WellActuallyHandler} from "./handlers/well-actually/well-actually-handler.ts";
import {SixtyNineHandler} from "./handlers/sixty-nine/sixty-nine-handler.ts";
import {BeeMovieScriptHandler} from "./handlers/bee-movie/bee-movie-script-handler.ts";
import {Post, sequelize} from "./database/database-connection.ts";
import {DatabaseExampleHandler} from "./handlers/database-example/database-example-handler.ts";
import {AgentDetails} from "./utils/types.ts";
import {authenticateAgent, createAgent} from "./utils/agent-utils.ts";
import {TestHandler} from "./handlers/test-handler/test-handler.ts";


let replyBotAgentDetails: AgentDetails = {
    name: "reply-bot",
    did: undefined,
    handle: <string>Bun.env.REPLY_BOT_BSKY_HANDLE,
    password: <string>Bun.env.REPLY_BOT_BSKY_PASSWORD,
    sessionData: undefined,
    agent: undefined
}

let devBotAgentDetails: AgentDetails = {
    name: "remind-bot",
    did: undefined,
    handle: <string>Bun.env.DEV_BOT_BSKY_HANDLE,
    password: <string>Bun.env.DEV_BOT_BSKY_PASSWORD,
    sessionData: undefined,
    agent: undefined
}

let postOnlyHandlerController: HandlerController;
let replyOnlyHandlerController: HandlerController;
let allPostsHandlerController: HandlerController;

let testingHandlerController: HandlerController;

let lastMessage = Date.now()

/**
 * Bluesky agent for taking actions (posting) on bluesky
 */
replyBotAgentDetails = createAgent(replyBotAgentDetails);

/**
 * Agent for reminders
 */
devBotAgentDetails = createAgent(devBotAgentDetails)


async function initialize() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }

    replyBotAgentDetails = await authenticateAgent(replyBotAgentDetails)
    if (!replyBotAgentDetails.agent) {
        throw new Error(`Could not get agent from ${replyBotAgentDetails.name}`)
    } else {
        postOnlyHandlerController = new HandlerController(replyBotAgentDetails.agent, [])

        replyOnlyHandlerController = new HandlerController(replyBotAgentDetails.agent, [
            WellActuallyHandler
        ])

        allPostsHandlerController = new HandlerController(replyBotAgentDetails.agent, [
            SixtyNineHandler,
            BeeMovieScriptHandler
        ])
    }

    // Here is where we're initializing the handler functions

    devBotAgentDetails = await authenticateAgent(devBotAgentDetails)
    if (!devBotAgentDetails.agent) {
        throw new Error(`Could not get agent from ${devBotAgentDetails.name}`)
    } else {
        testingHandlerController = new HandlerController(devBotAgentDetails.agent, [
            TestHandler,
            DatabaseExampleHandler
        ])
    }

    await Post.sync({alter: true})

    console.log("Initialized!")
}

try {
    await initialize();
} catch (e) {
    setTimeout(async function () {
        await initialize()
    }, 30000)
}


/**
 * The client and listener for the firehose
 */
let firehoseClient = subscribeRepos(`wss://bsky.network`, {decodeRepoOps: true})

setFirehoseListener(firehoseClient)

function setFirehoseListener(firehoseClient: XrpcEventStreamClient) {

    firehoseClient.on('message', (m: SubscribeReposMessage) => {
        if (ComAtprotoSyncSubscribeRepos.isCommit(m)) {
            m.ops.forEach((op: RepoOp) => {
                // console.log(op)
                let payload = op.payload;
                // @ts-ignore
                switch (payload?.$type) {
                    case 'app.bsky.feed.post':
                        if (AppBskyFeedPost.isRecord(payload)) {
                            let repo = m.repo;
                            if (payload.reply) {
                                replyOnlyHandlerController.handle(op, repo)
                            } else {
                                postOnlyHandlerController.handle(op, repo)
                            }
                            allPostsHandlerController.handle(op, repo)

                            testingHandlerController.handle(op, repo)
                        }
                }
            })
        }
    })
}

let interval = 1000
let MAX_TIME_BETWEEN = 100
setInterval(async function () {
    console.log("Checking if firehose is connected")
    let currentTime = Date.now();
    let diff = currentTime - lastMessage;
    console.log(`Time since last received message: ${diff}`)
    if (diff > MAX_TIME_BETWEEN) {
        console.log('Restarting subscription')
        firehoseClient.removeAllListeners();
        firehoseClient = subscribeRepos(`wss://bsky.network`, {decodeRepoOps: true})
        setFirehoseListener(firehoseClient)
    }

}, 60 * interval)
