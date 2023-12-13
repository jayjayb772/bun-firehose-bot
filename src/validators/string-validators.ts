import {AbstractValidator} from "./abstract-validator.ts";
import {flattenTextUpdated} from "../utils/text-utils.ts";
import {RepoOp} from "@atproto/api/dist/client/types/com/atproto/sync/subscribeRepos";


export class InputIsCommandValidator extends AbstractValidator{
    constructor(private triggerKey: string) {
        super();
    }
    shouldTrigger(op: RepoOp): boolean {
        let input = this.getTextFromPost(op)
        return input.startsWith(`!${this.triggerKey}`) || input.startsWith(`${this.triggerKey}!`)
    }

}
export class InputStartsWithValidator extends AbstractValidator{
    constructor(private triggerKey: string, private strict: boolean = false) {
        super();
    }
    shouldTrigger(op: RepoOp): boolean {
        let input = this.getTextFromPost(op)
        if(this.strict){
            return input.startsWith(this.triggerKey)
        }
        const flatText = flattenTextUpdated(this.triggerKey, input)
        return flatText.startsWith(this.triggerKey)
    }

}

export class InputContainsValidator extends AbstractValidator{
    constructor(private triggerKey: string) {
        super();
    }
    shouldTrigger(op: RepoOp): boolean {
        let input = this.getTextFromPost(op)

        const flatText = flattenTextUpdated(this.triggerKey, input)
        return flatText.includes(this.triggerKey);
    }
}

export class InputEqualsValidator extends AbstractValidator{
    constructor(private triggerKey: string) {
        super();
    }
    shouldTrigger(op: RepoOp): boolean {
        let input = this.getTextFromPost(op)

        return input === this.triggerKey;
    }
}