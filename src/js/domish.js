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
const RE_QUERY = /([.#]?)([\w\d_\-]+)/g;
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
          if (
            !(node.classList.contains(value))
          ) {
            return false;
          }
          break;
        case "#":
          if (
            !(
              node.getAttribute("id") !== value
            )
          ) {
            return false;
          }
          break;
        default:
          throw new Error(`Unsupport type: ${type} in ${selector}`);
          break;
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

  // --
  // ### Common accessors
  //
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
      parent.insertBefore(node, next);
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

  //   NOTE: Left as note implemented yet
  //   contains() {}
  //   getRootNode() {}
  //   hasChildNodes() {}
  //   isDefaultNamespace() {}
  //   isEqualNode() {}
  //   isSameNode() {}
  //   lookupPrefix() {}
  //   lookupNamespaceURI() {}
  //   normalize() {}
  //   compareDocumentPosition() {}

  // --
  // ### Serialization

  toXMLLines() {
    let res = [];
    switch (this.nodeType) {
      case Node.DOCUMENT_NODE:
        res.push("<?xml version='1.0' charset='utf-8' ?>\n");
        res = this.childNodes.reduce((r, v) => r.concat(v.toXMLLines()), res);
        break;
      case Node.ELEMENT_NODE:
        const name = this.namespace
          ? `${this.namespace}:${this.nodeName}`
          : `${this.nodeName}`;
        res.push(`<${name}`);
        // TODO: Fix attribute serialisation
        for (let k in this.attributes) {
          let v = this.attributes[k];
          // We need to merge the style as well
          if (k === "style") {
            v = (v ? [v] : []).concat(
              Object.entries(this.style).map(([k, v]) =>
                `${toCSSPropertyName(k)}: ${v}`
              ),
            ).join(";");
            v = v && v.length > 0 ? v : undefined;
          }
          if (v !== undefined) {
            res.push(v === null ? ` ${k}` : ` ${k}="${v}"`);
          }
        }
        for (let ns in this.attributesNS) {
          for (let k in this.attributesNS[ns]) {
            const v = this.attributesNS[ns][k];
            if (v !== undefined) {
              res.push(v === null ? ` ${k}` : ` ${k}="${v}"`);
            }
          }
        }
        if (this.childNodes.length == 0) {
          res.push(" />");
        } else {
          res.push(">");
          res = this.childNodes.reduce((r, v) => r.concat(v.toXMLLines()), res);
          res.push(`</${name}>`);
        }
        break;
      case Node.TEXT_NODE:
        // FIXME: This is not the right way to do it
        res.push(
          this.data
            .replaceAll("&", "&amp;")
            .replaceAll(">", "&gt;")
            .replaceAll("<", "&lt;"),
        );
        break;
      case Node.COMMENT_NODE:
        res.push(`<!-- ${this.data.replaceAll(">", "&gt;")} -->`);
        break;
    }
    return res;
  }
  toXML() {
    return this.toXMLLines().join("");
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
    return this.parentNode ? this.parentNode.childNodes[index + offset] : null;
  }
}

export class Element extends Node {
  constructor(name, namespace) {
    super(name, Node.ELEMENT_NODE);
    this.namespace = namespace;
    this.style = {};
    this.attributes = { style: undefined };
    this.attributesNS = {};
    this.classList = new TokenList(this, "class");
    this.sheet = name === "style" ? new StyleSheet() : null;
  }

  get id() {
    return this.getAttribute("id");
  }

  removeAttribute(name) {
    if (name === "style") {
      this.style = {};
      this.attributes["style"] = undefined;
    } else {
      delete this.attributes[name];
    }
  }

  setAttribute(name, value) {
    // FIXME: Handling of style attribute
    this.attributes[name] = `${value}`;
  }

  gasAttribute(name) {
    return this.attributes[name];
  }

  hasAttribute(name) {
    return this.attributes[name] !== undefined;
  }

  setAttributeNS(ns, name, value) {
    const attr = this.attributes[ns] = this.attributes[ns] || {};
    attr[name] = value;
  }

  getAttribute(name) {
    return this.attributes[name];
  }
  getAttributeNS(ns, name) {
    return (this.attributes[ns] || {})[name];
  }

  cloneNode(deep) {
    const res = super.cloneNode(deep);
    Object.assign(res.attributes, this.attributes);
    Object.assign(res.style, this.style);
    for (let ns in this.attributesNS) {
      const attr = res.attributesNS[ns] = {};
      for (let k in this.attributes) {
        attr[k] = this.attributesNS[ns][k];
      }
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
    this._set(this._get().split(" ").filter((_) => _ == value).join(" "));
  }
  toggle(value) {
    return contains(value) ? remove(value) && false : add(value) || true;
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

// EOF
