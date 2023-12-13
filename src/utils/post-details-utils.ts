import {PostDetails} from "./types.ts";

export function getPosterDID(postDetails: PostDetails){
    return (postDetails.uri.match(/did:[^\/]*/) || [])[0];
}

export function getPosterDIDFromUri(uri: string){
    return (uri.match(/did:[^\/]*/) || [])[0];
}