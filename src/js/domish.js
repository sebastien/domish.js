// --
// ## DOMish
//
// This is a quick-and-dirty pure JavaScript implementation of the DOM
// to be used in server-side environments that don't have the DOM API.
//
// It is by no means intending to implement the full standard, but should
// be compliant enough so that it can be used in most use cases. If it has
// shortcomings, it should be relatively simple to implement the missing
// bits of functionality.

//
// ### Query Support
const RE_QUERY = /([.#]?)([\w\d_-]+)/g;
class Query {
	constructor(query) {
		// TODO: We should support space to do level -2 matches
		// TODO: We should fail if the selector is not supported
		this.text = query;
		this.selectors = [...query.matchAll(RE_QUERY)].map((_) => ({
			type: _[1],
			value: _[2],
		}));
	}
	match(node) {
		for (let i = 0; i < this.selectors.length; i++) {
			const { type, value } = this.selectors[i];
			if (node.nodeType !== Node.ELEMENT_NODE) {
				return false;
			}
			switch (type) {
				case "":
					if (
						node.nodeName !== value &&
						node.nodeName.toLowerCase() !== value.toLowerCase()
					) {
						return false;
					}
					break;
				case ".":
					if (!node.classList.contains(value)) {
						return false;
					}
					break;
				case "#":
					if (!(node.getAttribute("id") !== value)) {
						return false;
					}
					break;
				default:
					throw new Error(
						`Unsupport type: ${type} in ${this.selectors[i]}`
					);
			}
		}
		return true;
	}
}
// --
// ## The Node class
//
// This is the main class that defines most of the key operations.
export class Node {
	static Namespaces = {
		svg: "http://www.w3.org/2000/svg",
		xlink: "http://www.w3.org/1999/xlink",
	};
	static ELEMENT_NODE = 1;
	static ATTRIBUTE_NODE = 2;
	static TEXT_NODE = 3;
	static CDATA_SECTION_NODE = 4;
	static PROCESSING_INSTRUCTION_NODE = 7;
	static COMMENT_NODE = 8;
	static DOCUMENT_NODE = 9;
	static DOCUMENT_TYPE_NODE = 10;
	static DOCUMENT_FRAGMENT_NODE = 11;
	constructor(name, type) {
		this.nodeName = name;
		this.nodeType = type;
		this.childNodes = [];
		this.parentNode = null;
		this.data = "";
	}

	iterWalk(callback) {
		if (callback(this) !== false) {
			this.childNodes.forEach((_) => _.iterWalk(callback));
		}
	}

	querySelectorAll(query) {
		const res = [];
		const q = new Query(query);
		this.iterWalk((node) => {
			if (q.match(node)) res.push(node);
		});
		return res;
	}

	matches(query) {
		return new Query(query).match(this);
	}

	// --
	// ### Common accessors

	get children() {
		return this.childNodes.filter((_) => _.nodeType === Node.ELEMENT_NODE);
	}

	get firstChild() {
		return this.childNodes[0];
	}

	get lastChild() {
		const n = this.childNodes.length;
		return n > 0 ? this.childNodes[n - 1] : null;
	}
	get nextSibling() {
		return this._getSiblingAt(this._index, 1);
	}

	get previousSibling() {
		return this._getSiblingAt(this._index, -1);
	}

	get nodeValue() {}
	get ownerDocument() {}
	get parentElement() {
		return this.parentNode;
	}
	get textContent() {
		return this.childNodes.length
			? this.childNodes.map((_) => _.textContent).join("")
			: this.data;
	}

	// --
	// ### Less common accessors
	get isConnected() {}

	// --
	// ### Common methods
	appendChild(node) {
		this.childNodes.push(node);
		node.parentNode = this;
		return this;
	}

	after(...nodes) {
		const parent = this.parentNode;
		const next = this.nextSibling;
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];
			if (next) {
				parent.insertBefore(node, next);
			} else {
				parent.appendChild(node);
			}
		}
		return this;
	}

	before(...nodes) {
		const parent = this.parentNode;
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];
			parent.insertBefore(node, this);
		}
		return this;
	}

	cloneNode(deep = false) {
		const n = this._create();
		n.nodeName = this.nodeName;
		n.nodeType = this.nodeType;
		n.data = this.data;
		n.parentNode = null;
		n.childNodes = deep
			? this.childNodes.map((_) => {
					const r = _.cloneNode(deep);
					r.parentNode = n;
					return r;
			  })
			: [];
		return n;
	}

	removeChild(child) {
		const i = this.childNodes.indexOf(child);
		if (i >= 0) {
			const child = this.childNodes[i];
			this.childNodes.splice(i, 1);
			child.parentNode = null;
		}
		return this;
	}

	replaceChild(newChild, oldChild) {
		const i = this.childNodes.indexOf(oldChild);
		if (i >= 0) {
			oldChild.parentNode = null;
			newChild._detach();
			newChild.parentNode = this;
			this.childNodes[i] = newChild;
		}
		return this;
	}

	insertBefore(newNode, referenceNode) {
		const i = this.childNodes.indexOf(referenceNode);
		if (i >= 0) {
			this.childNodes.splice(i, 0, newNode._attach(this));
		}
		return this;
	}

	// --
	// ### Less common methods

	getRootNode() {
		let node = this;
		while (node.parentNode) {
			node = node.parentNode;
		}
		return node;
	}

	hasChildNodes() {
		return this.childNodes.length;
	}

	//   NOTE: Left as not implemented yet
	//   contains() {}
	//   isDefaultNamespace() {}
	//   isEqualNode() {}
	//   isSameNode() {}
	//   lookupPrefix() {}
	//   lookupNamespaceURI() {}
	//   normalize() {}
	//   compareDocumentPosition() {}

	// --
	// ### Serialization

	toXMLLines(options) {
		let res = [];
		const has_comments =
			options && options.comments === false ? false : true;
		const has_doctype = options && options.docytpe === false ? false : true;
		switch (this.nodeType) {
			case Node.DOCUMENT_NODE:
				has_doctype &&
					res.push("<?xml version='1.0' charset='utf-8' ?>\n");
				res = this.childNodes.reduce(
					(r, v) => r.concat(v.toXMLLines(options)),
					res
				);
				break;
			case Node.ELEMENT_NODE:
				{
					const name = this.namespace
						? `${this.namespace}:${this.nodeName}`
						: `${this.nodeName}`;
					res.push(`<${name}`);
					// TODO: Fix attribute serialisation
					for (let k in this.attributes) {
						let v = this.attributes.get(k);
						// We need to merge the style as well
						if (k === "style") {
							v = (v ? [v] : [])
								.concat(
									Object.entries(this.style).map(
										([k, v]) =>
											`${toCSSPropertyName(k)}: ${v}`
									)
								)
								.join(";");
							v = v && v.length > 0 ? v : undefined;
						}
						if (v !== undefined) {
							res.push(v === null ? ` ${k}` : ` ${k}="${v}"`);
						}
					}
					for (let ns in this.attributesNS) {
						for (let k in this.attributesNS.get(ns)) {
							const v = this.attributesNS.get(ns).get(k);
							if (v !== undefined) {
								res.push(v === null ? ` ${k}` : ` ${k}="${v}"`);
							}
						}
					}
					if (this.childNodes.length == 0) {
						res.push(" />");
					} else {
						res.push(">");
						res = this.childNodes.reduce(
							(r, v) => r.concat(v.toXMLLines(options)),
							res
						);
						res.push(`</${name}>`);
					}
				}
				break;
			case Node.TEXT_NODE:
				// FIXME: This is not the right way to do it
				res.push(
					this.data
						.replaceAll("&", "&amp;")
						.replaceAll(">", "&gt;")
						.replaceAll("<", "&lt;")
				);
				break;
			case Node.COMMENT_NODE:
				has_comments &&
					res.push(`<!-- ${this.data.replaceAll(">", "&gt;")} -->`);
				break;
		}
		return res;
	}
	toXML(options = {}) {
		return this.toXMLLines(options).join("");
	}
	// --
	// ### Helpers

	get _index() {
		return this.parentNode ? this.parentNode.childNodes.indexOf(this) : -1;
	}

	_create() {
		return new Node();
	}

	_detach() {
		if (this.parentNode) this.parentNode.removeChild(this);
		return this;
	}

	_attach(parentNode) {
		if (parentNode !== this.parentNode) {
			this._detach();
			this.parentNode = this;
		}
		return this;
	}

	_getSiblingAt(index, offset = 0) {
		return this.parentNode
			? this.parentNode.childNodes[index + offset]
			: null;
	}
}

class DataSetProxy {
	static get(target, property) {
		// TODO: We may need to do de-camel-case
		return target.attributes.get(`data-${property}`);
	}
}

export class Element extends Node {
	constructor(name, namespace) {
		super(name, Node.ELEMENT_NODE);
		this.namespace = namespace;
		this.style = {};
		this.attributes = new Map();
		this.attributes.set("style", undefined);
		this.attributesNS = new Map();
		this.classList = new TokenList(this, "class");
		this.sheet = name === "style" ? new StyleSheet() : null;
		this.dataset = new Proxy(this, DataSetProxy);
	}

	get id() {
		return this.getAttribute("id");
	}

	// FIXME: This is not entirely faithful, but helps with the "template"
	// element
	get content() {
		return this;
	}

	removeAttribute(name) {
		if (name === "style") {
			this.style = {};
			this.attributes.set("style", undefined);
		} else {
			this.attributes.remove(name);
		}
	}

	setAttribute(name, value) {
		// FIXME: Handling of style attribute
		this.attributes.set(name, `${value}`);
	}

	gasAttribute(name) {
		return this.attributes.get(name);
	}

	hasAttribute(name) {
		return this.attributes.has(name);
	}

	setAttributeNS(ns, name, value) {
		const attr = (this.attributesNS[ns] =
			this.attributesNS[ns] || new Map());
		attr.set(name, value);
	}

	getAttribute(name) {
		return this.attributes.get(name);
	}

	getAttributeNS(ns, name) {
		return this.attributesNS.has(ns)
			? this.attributesNS.get(ns).get(name)
			: undefined;
	}

	cloneNode(deep) {
		const res = super.cloneNode(deep);
		for (const [k, v] of this.attributes.entries()) {
			res.attributes.set(k, v);
		}
		for (const [k, v] of this.attributesNS.entries()) {
			res.attributesNS.set(k, new Map(v));
		}
		return res;
	}

	_create() {
		return new Element(this.name, this.namespace);
	}
}
export class TextNode extends Node {
	constructor(data) {
		super("#text", Node.TEXT_NODE);
		this.data = data;
	}
	_create() {
		return new TextNode(this.data);
	}
}

export class Comment extends Node {
	constructor(data) {
		super("#comment", Node.COMMENT_NODE);
		this.data = data;
	}
	_create() {
		return new Comment(this.data);
	}
}

export class Document extends Node {
	constructor() {
		super("#document", Node.DOCUMENT_NODE);
		this.body = new Element("body");
		this._elements = new Array();
	}

	getElementById(id) {
		for (let i in this._elements) {
			const n = this._elements[i];
			if (n.id === id) {
				return n;
			}
		}
		return null;
	}

	createTreeWalker(node, nodeFilter) {
		return new TreeWalker(node, nodeFilter);
	}
	createTextNode(value) {
		return new TextNode(value);
	}

	createComment(value) {
		return new Comment(value);
	}

	createElement(name) {
		return this._register(new Element(name));
	}

	createElementNS(namespace, name) {
		return this._register(new Element(name, namespace));
	}
	_register(element) {
		this._elements.push(element);
		return element;
	}
	_create() {
		return new Document();
	}
}

export class NodeFilter {
	static SHOW_ALL = 4294967295;
	static SHOW_ATTRIBUTE = 2;
	static SHOW_CDATA_SECTION = 8;
	static SHOW_COMMENT = 128;
	static SHOW_DOCUMENT = 256;
	static SHOW_DOCUMENT_FRAGMENT = 1024;
	static SHOW_DOCUMENT_TYPE = 512;
	static SHOW_ELEMENT = 1;
	static SHOW_ENTITY_REFERENCE = 16;
	static SHOW_ENTITY = 32;
	static SHOW_PROCESSING = 64;
	static SHOW_NOTATION = 2048;
	static SHOW_TEXT = 4;
}

export class TreeWalker {
	constructor(root, nodeFilter, predicate) {
		this.root = root;
		this.currentNode = root;
		this.nodeFilter = nodeFilter;
		this.predicate = predicate;
		// TODO: Support attributes
	}
	_nextNode(node) {
		if (!node) {
			return null;
		} else if (node.childNodes) {
			return node.childNodes[0];
		} else if (node.nextSibling) {
			return node.nextSibling;
		} else {
			let node = this.currentNode.parentNode;
			while (node.parentNode) {
				node = node.parentNode;
				if (node.nextSibling) {
					return node.nextSibling;
				}
			}
			return null;
		}
	}
	_acceptNode(node) {
		switch (node.nodeType) {
			case Node.ELEMENT_NODE:
				return this.nodeFilter & NodeFilter.SHOW_ELEMENT;
			case Node.ATTRIBUTE_NODE:
				return this.nodeFilter & NodeFilter.SHOW_ATTRIBUTE;
			case Node.CDATA_SECTION_NODE:
				return this.nodeFilter & NodeFilter.SHOW_CDATA_SECTION;
			case Node.PROCESSING_INSTRUCTION_NODE:
				return this.nodeFilter & NodeFilter.SHOW_PROCESSING;
			case Node.DOCUMENT_NODE:
				return this.nodeFilter & NodeFilter.SHOW_DOCUMENT;
			case Node.DOCUMENT_TYPE_NODE:
				return this.nodeFilter & NodeFilter.SHOW_DOCUMENT_TYPE;
			case Node.DOCUMENT_FRAGMENT_NODE:
				return this.nodeFilter & NodeFilter.SHOW_DOCUMENT_FRAGMENT;
			case Node.TEXT_NODE:
				return this.nodeFilter & NodeFilter.SHOW_TEXT;
			case Node.COMMENT_NODE:
				return this.nodeFilter & NodeFilter.SHOW_COMMENT;
			default:
				return false;
		}
	}
	nextNode() {
		let next = this._nextNode(this.currentNode);
		while (next && !this._acceptNode(next)) {
			next = this._nextNode(next);
		}
		this.currentNode = next;
		return next;
	}
}
// --
// ## Token List
//
// This is used to work with `classList`, for instance.
//
export class TokenList {
	constructor(element, attribute = "class") {
		this.element = element;
		this.attribute = attribute;
	}

	add(value) {
		if (!this.contains(value)) {
			const v = this._get();
			this._set(v ? `${v} ${value}` : value);
		}
	}
	contains(value) {
		return this._get().split(" ").indexOf(value) >= 0;
	}
	remove(value) {
		this._set(
			this._get()
				.split(" ")
				.filter((_) => _ == value)
				.join(" ")
		);
	}
	toggle(value) {
		return this.contains(value)
			? this.remove(value) && false
			: this.add(value) || true;
	}
	_get() {
		return this.element.getAttribute(this.attribute) || "";
	}
	_set(value) {
		this.element.setAttribute(this.attribute, value);
	}
}

export class StyleSheet {
	constructor() {
		this.cssRules = [];
	}
	deleteRule(index) {
		this.cssRules.splice(index, 1);
		return this;
	}
	insertRule(rule, index = 0) {
		this.cssRules.splice(index, 0, rule);
		return this;
	}
}

const toCSSPropertyName = (name) => {
	const property = /[A-Za-z][a-z]*/g;
	const res = [];
	let match = null;
	while ((match = property.exec(name)) !== null) {
		res.push(match[0].toLowerCase());
	}
	return res.join("-");
};

// --
// ## References
//
// - DOM API Reference at [DevDocs](https://devdocs.io/dom/node).
// - DOM.js, by Andreas Gal on [Github](https://github.com/andreasgal/dom.js),
//   which aims to be an IDL-compliant DOM implementation. We don't really
//   want to go there.
// - Deno DOM, by b-fuze on [Github](https://github.com/b-fuze/deno-dom), which
//   is a Deno-specific, Rust-based implementation
//

export const NodeList = Array;
export const StyleSheetList = Array;
export const document = new Document();

const DOM = {
	Node,
	Element,
	Document,
	NodeList,
	NodeFilter,
	StyleSheetList,
	document,
};

export default DOM;

// EOF
