import {BEE_MOVIE_SKEETS} from "./bee-movie-skeets.ts";
import {PostHandler} from "../abstract-handler.ts";
import {InputEqualsValidator} from "../../validators/string-validators.ts";
import {ReplyRepetitivelyFromStringArray} from "../../actions/reply-actions.ts";
import {LogPostDetailsAction} from "../../actions/logging-actions.ts";

export let BeeMovieScriptHandler = new PostHandler(
    [new InputEqualsValidator('!showmethebee')],
    [new LogPostDetailsAction(), new ReplyRepetitivelyFromStringArray(BEE_MOVIE_SKEETS)],
    false
)