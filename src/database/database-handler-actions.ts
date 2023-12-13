import {BskyAgent} from "@atproto/api";
import {RepoOp} from "@atproto/api/dist/client/types/com/atproto/sync/subscribeRepos";
import {PostDetails} from "../utils/types.ts";
import {AbstractTriggerAction} from "../actions/abstract-trigger-action.ts";
import {convertTextToDate} from "../utils/text-utils.ts";
import {ReplyWithInputAction} from "../actions/reply-actions.ts";
import { format } from "date-fns";
import {Post} from "./database-connection.ts";

export class InsertPostInToDatabase extends AbstractTriggerAction{

    async handle(agent: BskyAgent, op: RepoOp, postDetails: PostDetails): Promise<any> {
        // Save post to database
        await Post.create({
            cid: postDetails.cid,
            uri: postDetails.uri,
            postDetails: postDetails
        })
        // reply to post based on reminder timing
    }
}