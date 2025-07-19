// This is a Bard-assisted port of my Python's XMLish module. It's a simple HTML/XML
// parser that can be used in both SAX/DOM style.

import { Document } from "./domish.js";

class Fragment {
	/** Represents a text fragment. */

	static *IterMatches(pattern, text) {
		let offset = 0;
		if (text) {
			const n = text.length;
			let match;
			while ((match = pattern.exec(text))) {
				// Yield a fragment for unmatched text before the match
				if (offset !== match.index) {
					yield new MatchFragment(
						null,
						new Fragment(text, offset, match.index)
					);
				}

				// Yield a fragment for the matched text
				yield new MatchFragment(
					match,
					new Fragment(
						text,
						match.index,
						match.index + match[0].length
					)
				);

				offset = Math.max(offset + 1, match.index + match[0].length);
			}

			// Yield a fragment for any remaining unmatched text
			if (offset < n) {
				yield new MatchFragment(null, new Fragment(text, offset, n));
			}
		}
	}

	constructor(source, start, end) {
		this.source = source;
		this.start = start;
		this.end = end;
	}

	slice(start = 0, end = null) {
		const i = start >= 0 ? this.start + start : this.end + start;
		const j = end && end >= 0 ? this.start + end : this.end + (end || 0);
		return new Fragment(this.source, Math.min(i, j), Math.max(i, j));
	}

	get text() {
		// Implement unescape() function or use a suitable library
		return unescape(this.rawtext);
	}

	get rawtext() {
		return this.source.substring(this.start, this.end);
	}

	get length() {
		return this.end - this.start;
	}

	toString() {
		return `<Fragment ${this.start}:${this.end}=${this.text}>`;
	}
}

// Define the MatchFragment class
class MatchFragment {
	constructor(match, fragment) {
		this.match = match;
		this.fragment = fragment;
	}
}

// Define the Marker class
class Marker {
	constructor(type, fragment, name = null, attributes = null) {
		this.type = type;
		this.fragment = fragment;
		this.name = name;
		this.attributes = attributes || {}; // Ensure attributes is a dictionary
	}

	get text() {
		return this.fragment.text;
	}
}

// Define the MarkerType enum
const MarkerType = Object.freeze({
	Content: "Content",
	Start: "Start",
	End: "End",
	Inline: "Inline",
});

const RE_ENTITY = /&(?:#(?<code>\d+)|(?<name>[a-z]+));/gi;
const ENTITIES = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: '"',
	apos: "'",
};

function* iexpandEntities(text) {
	if (!text || text.length < 3) {
		return text;
	}
	let match = null;
	let o = 0;
	while ((match = RE_ENTITY.exec(text)) !== null) {
		const start = match.index;
		const end = start + match[0].length;
		const { code, name } = match.groups;
		if (start > o) {
			yield text.substring(o, start);
		}
		if (name) {
			yield ENTITIES[name.toLowerCase()] || match[0];
		} else {
			const c = Number(code);
			// Invalid code point → leave entity as-is
			yield !Number.isFinite(c) || c < 0x0 || c > 0x10ffff
				? match[0]
				: String.fromCodePoint(c);
		}
		o = end;
	}
	if (o + 1 < text.length) {
		yield text.substring(o);
	}
}

function expandEntities(text) {
	return [...iexpandEntities(text)].join("");
}

const RE_TAG = new RegExp(
	[
		"(?<DOCTYPE>\\<\\!DOCTYPE\\s+(?<doctype>[^\\>]+)\\>\r?\n)|",
		"(?<COMMENT>\\<\\!--(?<comment>([\r\n]|.)*?)--\\>)|",
		"(?<CDATA><\\!\\[CDATA\\[(?<cdata>([\r\n]|.)*?)\\]\\]\\>)|",
		"\\<(?<closing>/)?(?<qualname>(((?<ns>\\w+[\\d\\w_-]*):)?(?<name>[\\d\\w_\\-]+)))(?<attrs>\\s+[^\\>]*)?\\s*\\>",
	].join(""),
	"mg"
);

const RE_ATTR_SEP = /[=\s]/;

export const parseAttributes = (text, attributes = {}) => {
	// FIXME: We should not do trim or substring, we should
	// just parse the string as is.
	const m = text.match(RE_ATTR_SEP);

	if (!m) {
		const spaceIndex = text.indexOf(" ");

		if (spaceIndex === -1) {
			const name = text.trim();
			if (name) {
				attributes[name] = null;
			}
		} else {
			const name = text.substring(0, spaceIndex).trim();
			if (name) {
				attributes[name] = null;
			}
			parseAttributes(text.substring(spaceIndex + 1), attributes);
		}
	} else if (m[0] === "=") {
		const name = text.substring(0, m.index).trim();
		if (m.index + m[0].length >= text.length) {
			attributes[name] = "";
			return attributes;
		}

		const chr = text[m.index + 1];
		const end =
			chr === "'"
				? text.indexOf("'", m.index + 2)
				: chr === '"'
				? text.indexOf('"', m.index + 2)
				: text.indexOf(" ", m.index);

		const value =
			end === -1
				? text.substring(m.index + 1).trim()
				: text.substring(m.index + 1, end + 1);

		if ((value && value[0] === "'") || value[0] === '"') {
			attributes[name] = value.substring(1, value.length - 1);
		} else {
			attributes[name] = value.trim();
		}

		parseAttributes(text.substring(end + 1).trim(), attributes);
	} else {
		attributes[text.substring(0, m.index).trim()] = null;
		parseAttributes(
			text.substring(m.index + m[0].length).trim(),
			attributes
		);
	}

	return attributes;
};

function* iterMarkers(text) {
	let name = undefined;
	// Use the Fragment.IterMatches function defined earlier
	for (const { match, fragment } of Fragment.IterMatches(RE_TAG, text)) {
		if (!match) {
			// TODO: Implement entity conversion
			yield new Marker(MarkerType.Content, fragment);
		} else if (match.groups.CDATA) {
			// Handle CDATA sections
			yield new Marker(MarkerType.Start, fragment.slice(0, 9), "!CDATA");
			yield new Marker(MarkerType.Content, fragment.slice(9, -3));
			yield new Marker(MarkerType.End, fragment.slice(-3), "!CDATA");
		} else if (match.groups.DOCTYPE) {
			// Handle DOCTYPE declarations
			yield new Marker(
				MarkerType.Start,
				fragment.slice(0, 10),
				"!DOCTYPE"
			);
			yield new Marker(MarkerType.Content, fragment.slice(10, -2));
			yield new Marker(MarkerType.End, fragment.slice(-2), "!DOCTYPE");
		} else if (match.groups.COMMENT) {
			// Handle comments
			yield new Marker(MarkerType.Start, fragment.slice(0, 4), "--");
			yield new Marker(MarkerType.Content, fragment.slice(4, -3));
			yield new Marker(MarkerType.End, fragment.slice(-3), "--");
		} else if ((name = match.groups.qualname)) {
			// Handle regular tags
			const attr = parseAttributes(match.groups.attrs || "");
			let is_inline = false;
			if (attr && "/" in attr) {
				delete attr["/"];
				is_inline = true;
			}
			const t = match.groups.closing
				? MarkerType.End
				: is_inline
				? MarkerType.Inline
				: MarkerType.Start;
			yield new Marker(t, fragment, name, attr);
		}
	}
}

const Operator = {
	createNode: (marker) => ({ marker, children: [] }),
	appendChild: (node, child) => {
		node.children.push(child);
		return node;
	},
	setNodeEnd: () => {},
};

// --
// HTML Parser courtesy of Bard

function findParent(node, name) {
	let cur = node?.parentElement;
	name = name.toLowerCase();
	while (cur && (cur?.nodeName ?? "").toLowerCase() !== name) {
		cur = cur?.parentElement;
	}
	return cur;
}
export class DOMOperator {
	constructor(fix = true) {
		this.document = new Document();
		this.fix = fix;
	}
	appendChild(node, child) {
		// --
		// This is where we can collect fixes for HTML nodes.
		if (this.fix) {
			// In old HTML, <DD> and <DT> may not have closing tags, so we
			// fix it there.
			switch (child?.nodeName) {
				case "DD":
				case "dd":
				case "DT":
				case "dt":
					node = findParent(node, "dl") ?? node;
					break;
			}
		}
		node.appendChild(child);
		return node;
	}
	setNodeEnd() {}
	createNode(marker) {
		switch (marker.type) {
			case "Content":
				return this.document.createTextNode(
					expandEntities(marker.text)
				);
			case "Start":
			case "Inline":
				switch (marker.name) {
					case "!CDATA":
						return this.document.createTextNode(
							expandEntities(marker.text)
						);
					case "--":
						return this.document.createComment(
							expandEntities(marker.text)
						);
					case "!DOCTYPE":
						// TODO: Support this
						break;
					default: {
						const node = this.document.createElement(marker.name);
						for (const attr in marker.attributes) {
							node.setAttribute(
								attr,
								expandEntities(marker.attributes[attr])
							);
						}
						return node;
					}
				}
				return null;
			default:
				return null;
		}
	}

	// FIXME: Is this event used?
	createComment(data) {
		return this.document.createComment(data);
	}

	createTextNode(data) {
		return this.document.createTextNode(data);
	}
}

// Define the Builder class, using a generic type placeholder for flexibility
class Builder {
	constructor(operator = Operator) {
		this.operator = operator;
	}

	isEmpty(marker) {
		return false; // Placeholder, may need implementation based on Marker usage
	}

	run(stream) {
		const roots = [];
		const stack = [];
		let current = null;

		for (const marker of stream) {
			if (marker.type === MarkerType.End) {
				// We look for the closing tag
				let i = stack.length - 1;
				while (i >= 0 && stack[i].marker.name !== marker.name) {
					i--;
				}
				if (i !== -1) {
					this.operator.setNodeEnd(stack[i].node, marker);
					stack.length = i;
					current = stack.length
						? stack[stack.length - 1].node
						: null;
				} // FIXME: We haven't found a matching tag
			} else {
				const node = this.operator.createNode(marker);
				if (node === null) {
					// TODO: This happens for !DOCTYPE, we should support this.
				} else if (current) {
					this.operator.appendChild(current, node);
				} else {
					roots.push(node);
				}

				if (!this.isEmpty(marker) && marker.type === MarkerType.Start) {
					current = node;
					stack.push({ marker, node });
				}
			}
		}
		return roots;
	}
}

export class DOMParser {
	constructor() {
		this.builder = new Builder(new DOMOperator());
	}
	parseFromString(text, type) {
		const doc = new Document();
		for (const node of this.builder.run(iterMarkers(text))) {
			doc.body.appendChild(node);
		}
		return doc;
	}
}

function parseHTML(text, operator = new DOMOperator()) {
	return new Builder(operator).run(iterMarkers(text));
}

export default { DOMParser };
export { parseHTML };
// EOF
