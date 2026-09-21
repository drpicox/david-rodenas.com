import type { Still } from "../../platform/plugin/Feature";
import { NextWordModel } from "./NextWordModel";
import { renderNextWord } from "./renderNextWord";
import { smallCorpus } from "./smallCorpus";
import { wordsOf } from "./wordsOf";

/** The first moment: the small text read, one word of memory, and "the" written. */
export const nextWordStill: Still = () => renderNextWord(new NextWordModel(smallCorpus, 1), wordsOf("the"), 1);
