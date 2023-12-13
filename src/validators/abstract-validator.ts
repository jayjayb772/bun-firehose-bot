import {BskyAgent} from "@atproto/api";
import {RepoOp} from "@atproto/api/dist/client/types/com/atproto/sync/subscribeRepos";
import {PostDetails} from "../utils/types.ts";

export abstract class AbstractValidator {

    constructor() {
    }

    getTextFromPost(op: RepoOp){
        return op.payload.text;
    }

    abstract shouldTrigger(op: RepoOp): boolean

}

/**
 * A validator in which you pass a single function that takes in the post
 * text, and returns a boolean
 */
export class SimpleFunctionValidator extends AbstractValidator {

    constructor(private triggerValidator) {
        super()
    }

    shouldTrigger(op: RepoOp): boolean {
        return this.triggerValidator(op)
    }

}

/**
 * A validator in which you pass in multiple other validators
 *  and if any of them should trigger, it will return true
 */
export class OrValidator extends AbstractValidator{
    constructor(private validators: Array<AbstractValidator>) {
        super();
    }

    shouldTrigger(op: RepoOp): boolean {
        let willTrigger = false;
        this.validators.forEach((validator) => {
            if(validator.shouldTrigger(op)){
                willTrigger = true;
            }
        })
        return willTrigger;
    }
}