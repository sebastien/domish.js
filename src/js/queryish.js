const RE_SELECTOR = new RegExp(
	"(?<id>#)?((?<ns>[a-z]):)?(?<name>[A-Za-z][A-Za-z0-9-]*(\\*)?)?(.(?<class>[A-Za-z][A-Za-z0-9-]*))?(\\[(?<attrs>[^\\]]+)\\])?",
	"g",
);

const match = (value, condition, and=false) => {
	for (const p of condition) {
		if (p instanceof Array) {
			return match(value, p, !and)
		}
	}

}
class Selector {
	constructor(id, name, classes, attrs) {
		this.id = id;
		this.name = name;
		this.classes = classes;
		this.attrs = attrs;
	}
}

const parseSelector = (text) => {
	let match = null;
	const res = [];
	while ((match = RE_SELECTOR.exec(text)) && match[0].length) {
		console.log("XXX", match);
		res.push(match);
	}
	return res;
};

console.log(parseSelector("template.template[@out:*]"));
