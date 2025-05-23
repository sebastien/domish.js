import {
	task,
	input,
	doc,
	map,
	replace,
	wildcard,
	read,
	write,
	splitext,
	env,
} from "@littlemake/lib.ts";
import { llm } from "@littlemake/ext/llm.ts";

const src = input(env.SOURCES_PATH ?? "src");
const sources = wildcard(`${src}/**/*.*`);
const model = input(env.MODEL ?? "gemini-2.5pro");

const symbols = task(
	model,
	async function symbols(text: string, module: string): string {
		return await llm(text, { model });
	}
);

const docs = map(
	sources,
	async (src) =>
		await write(
			replace("src/", "doc/", src),
			await task(symbols)(await read(src), splitext(basename(src))[0])
		)
);

export default {
	sources: doc(sources, "All the sources used as inputs"),
	docs: doc(docs, "List of symbols of each document"),
};

// EOF
