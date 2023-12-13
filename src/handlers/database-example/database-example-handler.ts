import {PostHandler} from "../abstract-handler.ts";
import {InputStartsWithValidator} from "../../validators/string-validators.ts";
import {LogPostDetailsAction} from "../../actions/logging-actions.ts";
import {InsertPostInToDatabase} from "../../database/database-handler-actions.ts";

export let DatabaseExampleHandler = new PostHandler(
    [new InputStartsWithValidator('SaveMe!', true)],
    [new LogPostDetailsAction(), new InsertPostInToDatabase()],
    true
)
