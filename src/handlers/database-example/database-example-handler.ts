import {PostHandler} from "../abstract-handler.ts";
import {InputIsCommandValidator, InputStartsWithValidator} from "../../validators/string-validators.ts";
import {LogPostDetailsAction} from "../../actions/logging-actions.ts";
import {InsertPostInToDatabase} from "../../database/database-handler-actions.ts";

export let DatabaseExampleHandler = new PostHandler(
    [new InputIsCommandValidator('SaveMe')],
    [new LogPostDetailsAction(), new InsertPostInToDatabase()],
    true
)
