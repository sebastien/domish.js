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

const RE_TAG = new RegExp(
	[
		"(?<DOCTYPE>\\<\\!DOCTYPE\\s+(?<doctype>[^\\>]+)\\>\r?\n)|",
		"(?<COMMENT>\\<\\!--(?<comment>([\r\n]|.)*?)--\\>)|",
		"(?<CDATA><\\!\\[CDATA\\[(?<cdata>([\r\n]|.)*?)\\]\\]\\>)|",
		"\\<(?<closing>/)?(?<qualname>(((?<ns>\\w+[\\d\\w_-]*):)?(?<name>[\\d\\w_\\-]+)))(?<attrs>\\s+[^\\>]*)?\\s*\\>",
	].join(""),
	"mg"
);

export const parseAttributes = (text, attributes = {}) => {
	const eqIndex = text.indexOf("=");

	if (eqIndex === -1) {
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
	} else {
		if (eqIndex + 1 === text.length) {
			return attributes;
		}

		const sep = text[eqIndex + 1];
		const end =
			sep === "'"
				? text.indexOf("'", eqIndex + 2)
				: sep === '"'
				? text.indexOf('"', eqIndex + 2)
				: text.indexOf(" ", eqIndex);

		const name = text.substring(0, eqIndex).trim();
		const value =
			end === -1
				? text.substring(eqIndex + 1).trim()
				: text.substring(eqIndex + 1, end + 1);

		if ((value && value[0] === "'") || value[0] === '"') {
			attributes[name] = value.substring(1, value.length - 1);
		} else {
			attributes[name] = value.trim();
		}

		parseAttributes(text.substring(end + 1).trim(), attributes);
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

export class DOMOperator {
	constructor() {
		this.document = new Document();
	}
	appendChild(node, child) {
		node.appendChild(child);
		return node;
	}
	setNodeEnd() {}
	createNode(marker) {
		switch (marker.type) {
			case "Content":
				return this.document.createTextNode(marker.text);
			case "Start":
			case "Inline":
				switch (marker.name) {
					case "!CDATA":
						return this.document.createTextNode(marker.text);
					case "--":
						return this.document.createComment(marker.text);
					case "!DOCTYPE":
						break;
					default: {
						const node = this.document.createElement(marker.name);
						for (const attr in marker.attributes) {
							node.setAttribute(attr, marker.attributes[attr]);
						}
						return node;
					}
				}
				return null;
			default:
				return null;
		}
	}

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
				const i = stack.findIndex((m) => m.marker.name === marker.name);
				if (i !== -1) {
					this.operator.setNodeEnd(stack[i].node, marker);
					stack.length = i;
					current = stack.length
						? stack[stack.length - 1].node
						: null;
				} // Handle unmatching close tags as needed
			} else {
				const node = this.operator.createNode(marker);
				if (current) {
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

export const parseHTML = (text, operator = new DOMOperator()) =>
	new Builder(operator).run(iterMarkers(text));
// EOF
