// Project: DOMIsh
// Author:  Sebastien Pierre
// License: Revised BSD License
// Created: 2022-04-21
// Module: domish
// A pure TypeScript implementation of the DOM for server-side environments.
// Provides core DOM classes including Node, Element, Document, and supporting
// utilities like TreeWalker, TokenList, and StyleSheet. Implements standard
// DOM operations for element creation, traversal, manipulation, and serialization.
//
// Example:
// ```typescript
// const doc = new Document();
// const div = doc.createElement("div");
// div.setAttribute("class", "container");
// doc.body.appendChild(div);
// console.log(doc.toHTML());
// ```
// ----------------------------------------------------------------------------
//
// QUERY SUPPORT
//
// ----------------------------------------------------------------------------
// ============================================================================
// SUBSECTION: Selectors and Matching
// ============================================================================
// Class: Query
// Parses CSS selectors and matches them against DOM nodes. Supports element
// selectors, class selectors (.class), ID selectors (#id), and attribute
// selectors ([attr]). Instances are parsed once and shared through `Query.of`.
//
// Attributes:
// - text: string - the raw selector string
// - selectors: Selector[] - parsed selector components
	// Method: match
	// Returns `true` if `node` matches all selectors in this query.
						// TODO: Support operator
// ----------------------------------------------------------------------------
//
// NODE
//
// ----------------------------------------------------------------------------
// ============================================================================
// SUBSECTION: Node Class
// ============================================================================
// Class: Node
// The base class for all DOM nodes. Defines standard node operations including
// traversal, manipulation, serialization, and event handling. All other node
// types extend this class.
//
// Static Properties:
// - ELEMENT_NODE: number = 1
// - ATTRIBUTE_NODE: number = 2
// - TEXT_NODE: number = 3
// - CDATA_SECTION_NODE: number = 4
// - PROCESSING_INSTRUCTION_NODE: number = 7
// - COMMENT_NODE: number = 8
// - DOCUMENT_NODE: number = 9
// - DOCUMENT_TYPE_NODE: number = 10
// - DOCUMENT_FRAGMENT_NODE: number = 11
// - Namespaces: object - SVG and XLink namespace URIs
//
// Instance Properties:
// - nodeName: string - tag name or node type identifier
// - nodeType: number - one of the static node type constants
// - childNodes: Node[] - array of child nodes
// - parentNode: Node | null - parent node or null if detached
// - data: string - text data for text/comment nodes
// - _eventListeners: Map<string, Set<EventListener>> | undefined - internal
//   event storage, allocated lazily on the first `addEventListener` call
	// Method: iterWalk
	// Traverses the node tree in pre-order, calling `callback` for each node.
	// Stop iteration by returning `false` from the callback.
	// Property: outerHTML
	// Returns the HTML serialization of this node including its descendants.
	// Property: innerHTML
	// Returns the HTML serialization of this node's children only.
	// Property: innerText
	// Returns the text content of this node and its descendants.
	// Method: querySelector
	// Returns the first descendant node matching `query`, or undefined if none found.
	// Method: querySelectorAll
	// Returns all descendant nodes matching `query` as an array.
						// We need to return boolean | undefined here to satisfy the type
						// Although iterWalk in our implementation only checks for `false`
						// to stop iteration, the type definition expects a specific return type.
						// Returning undefined is safe as it's not false.
	// ============================================================================
	// SUBSECTION: Common Accessors
	// ============================================================================
	// Property: children
	// Returns an array of element children (excludes text and comment nodes).
	// Property: firstChild
	// Returns the first child node, or null if there are no children.
	// Property: lastChild
	// Returns the last child node, or null if there are no children.
	// Property: nextSibling
	// Returns the next sibling node in the parent's children array.
	// Property: previousSibling
	// Returns the previous sibling node in the parent's children array.
	// Property: nodeValue
	// Returns the text content for text nodes, undefined for other node types.
	// Property: ownerDocument
	// Returns the Document this node belongs to, or undefined.
	// Property: parentElement
	// Returns the parent node as an Element, or null if not attached.
	// Property: textContent
	// Returns the concatenated text content of this node and all descendants.
	// ============================================================================
	// SUBSECTION: Less Common Accessors
	// ============================================================================
	// Property: isConnected
	// Returns true if this node is attached to a document, false otherwise.
	// ============================================================================
	// SUBSECTION: Common Methods
	// ============================================================================
	// Method: appendChild
	// Appends `node` as the last child of this node. If `node` already has a
	// parent, it is first removed from that parent.
	// Method: after
	// Inserts `nodes` after this node in the parent's children.
	// Method: before
	// Inserts `nodes` before this node in the parent's children.
	// Method: cloneNode
	// Returns a copy of this node. If `deep` is true, recursively clones all
	// descendants and copies event listeners.
	// Method: removeChild
	// Removes `child` from this node's children and returns this node.
	// Method: replaceChild
	// Replaces `oldChild` with `newChild` in this node's children.
	// Method: insertBefore
	// Inserts `newNode` before `referenceNode` in this node's children. If
	// `referenceNode` is null, appends to the end.
		// Find the reference index AFTER removing the node, since
		// removeChild may have shifted indices in this same parent.
	// ============================================================================
	// SUBSECTION: Event Methods
	// ============================================================================
	// Method: addEventListener
	// Registers `listener` to be called when events of `type` are dispatched.
	// Method: removeEventListener
	// Removes `listener` from the set of listeners for events of `type`.
	// Method: dispatchEvent
	// Dispatches `event` to this node and all ancestors (bubbling). Returns `true`
	// if the event was not prevented.
		// Build the event path (bubbling phase only, no capture)
		// Build path from target up to root
		// Set event path
		// Set target
		// Dispatch at target and bubble up
			// Don't bubble if event doesn't bubble
	// ============================================================================
	// SUBSECTION: Less Common Methods
	// ============================================================================
	// Method: getRootNode
	// Returns the root node of the tree (the topmost ancestor of this node).
	// Method: hasChildNodes
	// Returns true if this node has one or more children.
	// ============================================================================
	// SUBSECTION: Serialization
	// ============================================================================
	// Serialization is implemented by the `_writeText`/`_writeXML` methods,
	// which append chunks to a plain array that the caller joins once. The
	// `iterText` and `iterXMLLines` generators remain available for streaming
	// consumers; `toText`, `toXMLLines`, `toXML` and `toHTML` are thin
	// wrappers over the array builders.
	// Method: _writeText
	// Appends the text serialization of this node and its descendants to the
	// `out` array. Handles <br> elements as newlines and escapes HTML entities
	// in text nodes.
	// Method: _writeXML
	// Appends the XML/HTML serialization of this node and its descendants to
	// the `out` array, following `options` (html, comments, doctype).
	// Method: iterText
	// Generator that yields text content from this node and its descendants.
	// Handles <br> elements as newlines and escapes HTML entities in text nodes.
	// Method: toText
	// Returns all text content from this node and its descendants as a single string.
	// Method: toXMLLines
	// Returns an array of XML serialization lines for this node.
	// Method: iterXMLLines
	// Generator that yields XML serialization lines for this node and its descendants.
					// Handle style attribute
					// Handle style attribute with inline styles
								// Map common namespace URIs to their prefixes
				// FIXME: This is not the right way to do it
	// --
	// ### Helpers
	// Property: _index
	// Returns the index of this node in its parent's children array, or -1.
	// Method: _create
	// Creates a new blank Node instance for cloning. Override in subclasses.
	// Method: _detach
	// Removes this node from its parent if attached. Returns this node.
	// Method: _attach
	// Attaches this node to `parentNode`, detaching from current parent first.
	// Method: _getSiblingAt
	// Returns the sibling at `index + offset` in the parent's children.
	// Method: _firstMatch
	// Returns the first descendant (self included) matching a parsed query,
	// stopping at the first hit. Used by `querySelector`.
// ----------------------------------------------------------------------------
//
// ATTRIBUTES
//
// ----------------------------------------------------------------------------
// ============================================================================
// SUBSECTION: Attribute Node
// ============================================================================
// Function: getDataSet
// Helper for dataset proxy. Returns data-* attribute value by property name.
	// TODO: We may need to do de-camel-case
// Class: AttributeNode
// Represents an element attribute with name, value, and optional namespace.
//
// Properties:
// - name: string - attribute name
// - namespace: string | null - namespace URI or null
// - ownerElement: Element | null - element this attribute belongs to
// - _value: string | undefined - internal value storage
	// Property: value
	// Returns the attribute value. Looks up from ownerElement if attached.
				// For namespaced attributes, set directly in the map to avoid recursion
				// For regular attributes, set directly in the map to avoid recursion
// ----------------------------------------------------------------------------
//
// ELEMENTS
//
// ----------------------------------------------------------------------------
// ============================================================================
// SUBSECTION: Element Class
// ============================================================================
// Class: Element
// Represents an HTML or XML element with attributes, styles, and children.
// Extends Node with element-specific functionality like attribute management,
// classList, and CSS style manipulation.
//
// Properties:
// - namespace: string | null - element namespace URI or null for HTML
// - style: { [key: string]: string } - inline CSS styles as key-value pairs
// - _attributes: Map<string, AttributeNode> - regular attributes storage
// - _attributesNS: Map<string, Map<string, AttributeNode>> - namespaced attributes
// - classList: TokenList - class attribute manipulation interface
// - sheet: StyleSheet | null - stylesheet for <style> elements, null otherwise
// - dataset: Proxy - data-* attribute access, created lazily on first use
// - _document: Document | undefined - owning document, set by `Document._register`
//
// Example:
// ```typescript
// const el = doc.createElement("div");
// el.setAttribute("class", "container");
// el.classList.add("active");
// el.style.backgroundColor = "blue";
// ```
	// Property: id
	// Returns the value of the id attribute, or null if not set.
	// Property: attributes
	// Returns an array of all AttributeNode instances on this element.
	// Method: removeAttribute
	// Removes the attribute with `name` from this element, including from any namespace.
	// Method: removeAttributeNS
	// Removes the namespaced attribute with `name` from `namespace`.
	// Method: setAttribute
	// Sets the attribute `name` to `value` on this element.
	// Method: setAttributeNode
	// Adds an AttributeNode directly to this element.
	// Method: getAttributeNode
	// Returns the AttributeNode for `name`, or null if not set.
	// Method: setAttributeNS
	// Sets the namespaced attribute `name` in `ns` to `value`.
	// Method: hasAttribute
	// Returns true if this element has an attribute named `name`.
	// Method: hasAttributeNS
	// Returns true if this element has attribute `name` in `namespace`.
	// Method: getAttribute
	// Returns the value of attribute `name`, or null if not set.
	// Method: getAttributeNS
	// Returns the value of namespaced attribute `name` in `ns`, or null.
	// Method: getAttributeNodeNS
	// Returns the AttributeNode for namespaced attribute `name` in `ns`, or null.
	// Method: cloneNode
	// Returns a copy of this element with all attributes. If `deep` is true,
	// also clones all descendants.
	// Method: toJSON
	// Returns a JSON representation including element name, children, and all attributes.
	// ============================================================================
	// SUBSECTION: Interaction Methods
	// ============================================================================
	// Method: click
	// Dispatches a click event on this element. Returns true if not prevented.
	// `options.x` and `options.y` set client coordinates, `options.button` sets button (0=left).
	// Method: dblclick
	// Dispatches a double-click event on this element.
	// Method: contextMenu
	// Dispatches a context menu (right-click) event on this element.
	// Method: focus
	// Dispatches a focus event on this element.
	// Method: blur
	// Dispatches a blur event on this element.
	// Method: keyDown
	// Dispatches a keydown event with `key` and optional modifier flags.
	// Method: keyUp
	// Dispatches a keyup event with `key` and optional modifier flags.
	// Method: input
	// Sets the value attribute for input/textarea elements and dispatches
	// an input event with `value` as the data.
	// Method: change
	// Sets the value attribute and dispatches a change event on input/select elements.
	// Method: submit
	// Dispatches a submit event on form elements.
// ============================================================================
// SUBSECTION: Template Element
// ============================================================================
// Class: TemplateElement
// Represents a <template> element with a DocumentFragment content.
// Children are appended to the content fragment, not the element itself.
//
// Properties:
// - content: DocumentFragment - the document fragment holding template content
// ----------------------------------------------------------------------------
//
// TEXT AND COMMENT NODES
//
// ----------------------------------------------------------------------------
// ============================================================================
// SUBSECTION: Text Node
// ============================================================================
// Class: TextNode
// Represents a text node containing character data.
//
// Properties:
// - data: string - the text content of this node
	// Property: nodeValue
	// Returns the text data of this node.
// ============================================================================
// SUBSECTION: Comment Node
// ============================================================================
// Class: Comment
// Represents an HTML/XML comment node.
//
// Properties:
// - data: string - the comment text content
	// Property: nodeValue
	// Returns the comment text.
// ============================================================================
// SUBSECTION: Document Fragment
// ============================================================================
// Class: DocumentFragment
// Represents a lightweight container for nodes. Can be used to append multiple
// nodes at once without a wrapper element.
// ----------------------------------------------------------------------------
//
// DOCUMENT
//
// ----------------------------------------------------------------------------
// ============================================================================
// SUBSECTION: Document Class
// ============================================================================
// Class: Document
// The root of the DOM tree. Factory for creating elements and text nodes.
// Maintains a body element and a registry of elements with IDs.
//
// Properties:
// - body: Element - the document body element
// - _idIndex: Map<string, Set<Element>> - id to elements index, maintained by
//   the Element attribute methods; each Set keeps elements in id assignment
//   order so the oldest holder wins for duplicate ids
//
// Example:
// ```typescript
// const doc = new Document();
// const div = doc.createElement("div");
// doc.body.appendChild(div);
// ```
		// Non standard: optionally append initial nodes
	// Method: getElementById
	// Returns the element with `id`, or null if not found. Uses the id index
	// (see `_idIndex`) instead of scanning created elements.
	// Method: querySelectorAll
	// Overrides Node.querySelectorAll to also search through `document.body`
	// which may not be in the document's child node list (matching browser
	// behaviour where `document.querySelector` always searches the full tree).
	// Method: querySelector
	// Overrides Node.querySelector to apply the same `document.body` fallback.
		// Fallback: search through body if not already in childNodes.
	// Method: createTreeWalker
	// Creates a TreeWalker for traversing the DOM starting at `node`.
	// Method: createTextNode
	// Creates a new TextNode with `value`.
	// Method: createAttribute
	// Creates a new AttributeNode with `name` (not attached to any element).
	// Method: createComment
	// Creates a new Comment node with `value`.
	// Method: createDocumentFragment
	// Creates a new empty DocumentFragment.
	// Method: createElement
	// Creates a new Element with `name`. Returns TemplateElement for "template".
	// Automatically registers the element for getElementById lookups.
	// Method: createElementNS
	// Creates a new Element with `name` in `namespace`.
	// Method: _register
	// Internal method that records `element`'s owning document so that its
	// `id` attribute can be kept in the `_idIndex` lookup map.
// ----------------------------------------------------------------------------
//
// TREE WALKER
//
// ----------------------------------------------------------------------------
// ============================================================================
// SUBSECTION: Node Filter
// ============================================================================
// Constant: NodeFilter
// Bitmask constants for filtering node types in TreeWalker.
// ============================================================================
// SUBSECTION: Tree Walker
// ============================================================================
// Class: TreeWalker
// Iterates through a DOM tree, filtering nodes by type. Uses depth-first
// traversal and can optionally apply a custom predicate filter.
//
// Properties:
// - root: Node - the starting node for the walk
// - currentNode: Node - current position in the iteration
// - nodeFilter: number - bitmask of NodeFilter constants
// - predicate: (node: Node) => boolean - optional custom filter function
// - _stack: [Node, number][] - descent stack of [parent, nextChildIndex]
//   pairs backing the traversal; rebuilt when `currentNode` is assigned
//   externally
	// Method: nextNode
	// Advances to the next node matching the filter and returns it, or null.
// ----------------------------------------------------------------------------
//
// TOKEN LIST
//
// ----------------------------------------------------------------------------
// ============================================================================
// SUBSECTION: Token List
// ============================================================================
// Class: TokenList
// Manages a space-separated token attribute (like classList). Provides methods
// to add, remove, toggle, and check for token membership.
//
// Properties:
// - element: Element - the element whose attribute this list manages
// - attribute: string - the attribute name (default: "class")
//
// Example:
// ```typescript
// el.classList.add("active");
// el.classList.remove("hidden");
// if (el.classList.contains("visible")) { ... }
// ```
	// Method: add
	// Adds `value` to the token list if not already present.
	// Method: contains
	// Returns true if `value` is in the token list.
	// Method: remove
	// Removes `value` from the token list if present.
	// Method: toggle
	// Adds `value` if not present, removes it if present. Returns true if added.
// ----------------------------------------------------------------------------
//
// STYLESHEET
//
// ----------------------------------------------------------------------------
// ============================================================================
// SUBSECTION: StyleSheet
// ============================================================================
// Class: StyleSheet
// Manages a list of CSS rules for <style> elements. Provides methods to
// insert and delete rules by index.
//
// Properties:
// - cssRules: string[] - array of CSS rule strings
	// Method: deleteRule
	// Removes the CSS rule at `index`.
	// Method: insertRule
	// Inserts `rule` at `index` (default 0). Returns this for chaining.
// ============================================================================
// SUBSECTION: CSS Property Name Conversion
// ============================================================================
// Function: toCSSPropertyName
// Converts camelCase property names to kebab-case CSS property names.
// ----------------------------------------------------------------------------
//
// REFERENCES
//
// ----------------------------------------------------------------------------
// - DOM API Reference at [DevDocs](https://devdocs.io/dom/node)
// - DOM.js by Andreas Gal: https://github.com/andreasgal/dom.js
// - Deno DOM by b-fuze: https://github.com/b-fuze/deno-dom
// Alias HTMLElement to Element for compatibility
// Function: install
// Installs DOM globals (document, DOM classes) into `target` (default: globalThis).
// Creates a fresh Document on each call so that repeated installs (e.g. in test
// `beforeEach` hooks) start with a clean DOM tree.
// Returns the modified target object.
// EOF

import {
  createFocusEvent,
  createInputEvent,
  createKeyboardEvent,
  createMouseEvent,
  Event as EventClass,
  SubmitEvent
} from "./events";
const tags = (...tags) => tags.reduce((r, v) => {
  r.set(v, true);
  r.set(v.toLowerCase(), true);
  r.set(v.toUpperCase(), true);
  return r;
}, new Map);
const HTML_EMPTY = tags("area", "base", "basefont", "br", "col", "frame", "hr", "img", "input", "isindex", "link", "meta", "param");
const HTML_NOEMPTY = tags("slot");
// Escapes `&`, `>` and `<` in one pass over the text (see Serialization)
const escapeXML = (text) => text.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;");
// Shared options for HTML serialization (read-only, see _writeXML)
const HTML_OPTIONS = { html: true };
const RE_QUERY = /((?<type>[.#]?)(?<name>[\w\d_-]+))|(\[(?<attributes>[^\]]+)\])/g;
const RE_QUERY_ATTR = /^(?<name>\w+)((?<operator>[~|^$*]?=)("(?<value_0>[^"]+)"|'(?<value_1>[^']+)'|(?<value_2>[^\]]+)))?$/;
// Parsed queries, keyed by selector text. Parsing runs two regexes per
// selector token, which dominates `matches`/`querySelectorAll` when they are
// called in a loop with a constant selector. Bounded to avoid unbounded
// growth when selectors are built dynamically: the cache is simply cleared.
const QUERY_CACHE = new Map;
const QUERY_CACHE_MAX = 512;

class Query {
  text;
  selectors;
  // Function: Query.of
  // Returns the cached `Query` for `query`, parsing it on first use.
  //
  // Parameters:
  // - query: string - the selector text
  //
  // Returns:
  // Query - the shared parsed query (do not mutate)
  static of(query) {
    let parsed = QUERY_CACHE.get(query);
    if (parsed === undefined) {
      if (QUERY_CACHE.size >= QUERY_CACHE_MAX) {
        QUERY_CACHE.clear();
      }
      parsed = new Query(query);
      QUERY_CACHE.set(query, parsed);
    }
    return parsed;
  }
  constructor(query) {
    this.text = query;
    const matches = [...query.matchAll(RE_QUERY)];
    this.selectors = matches ? matches.map((match) => {
      const g = match.groups;
      const attrs = g?.attributes ? g.attributes.match(RE_QUERY_ATTR)?.groups : null;
      const name = match.groups?.name || "";
      return {
        type: match.groups?.attributes ? "@" : match.groups?.type || "",
        name: name,
        // Precomputed so tag matching does not re-lowercase per tested node
        lowerName: name.toLowerCase(),
        attributes: attrs ? {
          ...attrs,
          value: attrs.value_0 || attrs.value_1 || attrs.value_2
        } : null
      };
    }) : [];
  }
  match(node) {
    for (let i = 0;i < this.selectors.length; i++) {
      const selector = this.selectors[i];
      if (!selector)
        continue;
      const { type, name, lowerName, attributes } = selector;
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return false;
      }
      switch (type) {
        case "":
          if (node.nodeName !== name && node.nodeName.toLowerCase() !== lowerName) {
            return false;
          }
          break;
        case ".":
          if (!node.classList.contains(name)) {
            return false;
          }
          break;
        case "#":
          if (node.getAttribute("id") !== name) {
            return false;
          }
          break;
        case "@":
          if (attributes) {
            if (!node.hasAttribute(attributes.name)) {
              return false;
            }
          }
          return true;
        default:
          throw new Error(`Unsupported type: ${type} in ${JSON.stringify(this.selectors[i])}`);
      }
    }
    return true;
  }
}

class Node {
  static Namespaces = {
    svg: "http://www.w3.org/2000/svg",
    xlink: "http://www.w3.org/1999/xlink"
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
  nodeName;
  nodeType;
  childNodes;
  parentNode;
  data;
  _eventListeners;
  constructor(name, type) {
    this.nodeName = name;
    this.nodeType = type;
    this.childNodes = [];
    this.parentNode = null;
    this.data = "";
    // Lazily created by `addEventListener` (see Event Methods)
    this._eventListeners = undefined;
  }
  iterWalk(callback) {
    // Iterative pre-order traversal: no closure or call frame per child
    const stack = [this];
    while (stack.length > 0) {
      const node = stack.pop();
      if (callback(node) === false) {
        continue;
      }
      const children = node.childNodes;
      for (let i = children.length - 1;i >= 0;i--) {
        stack.push(children[i]);
      }
    }
  }
  get outerHTML() {
    const out = [];
    this._writeXML(out, HTML_OPTIONS);
    return out.join("");
  }
  get innerHTML() {
    const out = [];
    for (const child of this.childNodes) {
      child._writeXML(out, HTML_OPTIONS);
    }
    return out.join("");
  }
  get innerText() {
    return this.toText();
  }
  querySelector(query) {
    if (!query) {
      return undefined;
    }
    const tokens = query.split(/\s+/);
    let lastIndex = -1;
    for (let i = 0;i < tokens.length; i++) {
      if (tokens[i]) {
        lastIndex = i;
      }
    }
    if (lastIndex < 0) {
      // No selector token: querySelectorAll returns the scope itself
      return this;
    }
    let scope = [this];
    for (let i = 0;i < tokens.length; i++) {
      const qs = tokens[i];
      if (!qs) {
        continue;
      }
      const q = Query.of(qs);
      if (i === lastIndex) {
        // Last token: stop at the first match instead of collecting them all
        for (const n of scope) {
          const found = n._firstMatch(q);
          if (found !== undefined) {
            return found;
          }
        }
        return undefined;
      }
      const matched = [];
      for (const n of scope) {
        n.iterWalk((_) => {
          if (q.match(_))
            matched.push(_);
          return;
        });
      }
      scope = matched;
      if (scope.length === 0) {
        return undefined;
      }
    }
    return undefined;
  }
  querySelectorAll(query) {
    let scope = [this];
    for (const qs of query.split(/\s+/)) {
      if (qs) {
        const q = Query.of(qs);
        const matched = [];
        for (const n of scope) {
          n.iterWalk((_) => {
            if (q.match(_))
              matched.push(_);
            return;
          });
        }
        scope = matched;
      }
      if (scope.length === 0) {
        return scope;
      }
    }
    return query ? scope : [];
  }
  matches(query) {
    return Query.of(query).match(this);
  }
  get children() {
    return this.childNodes.filter((_) => _.nodeType === Node.ELEMENT_NODE);
  }
  get firstChild() {
    return this.childNodes[0] ?? null;
  }
  get lastChild() {
    const n = this.childNodes.length;
    return n > 0 ? this.childNodes[n - 1] ?? null : null;
  }
  get nextSibling() {
    return this._getSiblingAt(this._index, 1);
  }
  get previousSibling() {
    return this._getSiblingAt(this._index, -1);
  }
  get nodeValue() {
    return;
  }
  get ownerDocument() {
    return;
  }
  get parentElement() {
    return this.parentNode;
  }
  get textContent() {
    const parts = [];
    this._collectText(parts);
    return parts.join("");
  }
  get isConnected() {
    return;
  }
  appendChild(node) {
    if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      const children = [...node.childNodes];
      for (const n of children) {
        this.appendChild(n);
      }
    } else {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
        node.parentNode = null;
      }
      this.childNodes.push(node);
      node.parentNode = this;
    }
    return this;
  }
  after(...nodes) {
    const parent = this.parentNode;
    const next = this.nextSibling;
    for (const node of nodes) {
      if (next) {
        if (parent)
          parent.insertBefore(node, next);
      } else {
        if (parent)
          parent.appendChild(node);
      }
    }
    return this;
  }
  before(...nodes) {
    const parent = this.parentNode;
    for (const node of nodes) {
      if (parent)
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
    n._eventListeners = undefined;
    if (this._eventListeners) {
      const cloned = new Map;
      for (const [type, listeners] of this._eventListeners.entries()) {
        cloned.set(type, new Set(listeners));
      }
      n._eventListeners = cloned;
    }
    n.childNodes = deep ? this.childNodes.map((_) => {
      const r = _.cloneNode(deep);
      r.parentNode = n;
      return r;
    }) : [];
    return n;
  }
  removeChild(child) {
    const i = this.childNodes.indexOf(child);
    if (i >= 0) {
      const c = this.childNodes[i];
      if (c) {
        this.childNodes.splice(i, 1);
        c.parentNode = null;
      }
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
    if (referenceNode === null) {
      return this.appendChild(newNode);
    }
    if (newNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      const fragment = newNode;
      const children = [...fragment.childNodes];
      for (const child of children) {
        this.insertBefore(child, referenceNode);
      }
      return newNode;
    }
    if (newNode.parentNode) {
      newNode.parentNode.removeChild(newNode);
    }
    const i = this.childNodes.indexOf(referenceNode);
    if (i < 0) {
      throw new Error("NotFoundError: The reference node is not a child of this node");
    }
    this.childNodes.splice(i, 0, newNode);
    newNode.parentNode = this;
    return newNode;
  }
  addEventListener(type, listener) {
    let listeners = this._eventListeners;
    if (listeners === undefined) {
      listeners = new Map;
      this._eventListeners = listeners;
    }
    let set = listeners.get(type);
    if (set === undefined) {
      set = new Set;
      listeners.set(type, set);
    }
    set.add(listener);
  }
  removeEventListener(type, listener) {
    const listeners = this._eventListeners;
    if (listeners) {
      const set = listeners.get(type);
      if (set) {
        set.delete(listener);
        if (set.size === 0) {
          listeners.delete(type);
        }
      }
    }
  }
  dispatchEvent(event) {
    const path = [];
    let current = this;
    while (current) {
      path.push(current);
      current = current.parentNode;
    }
    event._setPath(path);
    event._setTarget(this);
    for (let i = 0;i < path.length; i++) {
      const node = path[i];
      if (i === 0) {
        event._setEventPhase(2);
      } else {
        event._setEventPhase(3);
      }
      event._setCurrentTarget(node);
      const listeners = node._eventListeners?.get(event.type);
      if (listeners) {
        for (const listener of listeners) {
          if (event._isImmediatePropagationStopped) {
            break;
          }
          if (typeof listener === "function") {
            listener.call(node, event);
          } else {
            listener.handleEvent(event);
          }
        }
      }
      if (event._isPropagationStopped) {
        break;
      }
      if (i === 0 && !event.bubbles) {
        break;
      }
    }
    return !event.defaultPrevented;
  }
  getRootNode() {
    let node = this;
    while (node.parentNode) {
      node = node.parentNode;
    }
    return node;
  }
  hasChildNodes() {
    return this.childNodes.length > 0;
  }
  _writeText(out) {
    switch (this.nodeType) {
      case Node.DOCUMENT_NODE:
      case Node.DOCUMENT_FRAGMENT_NODE:
      case Node.ELEMENT_NODE:
        if (this.nodeName && this.nodeName.toLowerCase() === "br") {
          out.push(`
`);
          return;
        }
        for (const n of this.childNodes) {
          n._writeText(out);
        }
        break;
      case Node.TEXT_NODE:
        out.push(escapeXML(this.data));
        break;
    }
  }
  *iterText(_options) {
    const out = [];
    this._writeText(out);
    yield* out;
  }
  toText(_options) {
    const out = [];
    this._writeText(out);
    return out.join("");
  }
  _writeXML(out, options) {
    const has_comments = !(options && options.comments === false);
    const has_doctype = !(options && options.doctype === false);
    switch (this.nodeType) {
      case Node.DOCUMENT_NODE:
        if (has_doctype) {
          out.push(`<?xml version='1.0' charset='utf-8' ?>
`);
        }
        for (const n of this.childNodes) {
          n._writeXML(out, options);
        }
        break;
      case Node.DOCUMENT_FRAGMENT_NODE:
        for (const n of this.childNodes) {
          n._writeXML(out, options);
        }
        break;
      case Node.ELEMENT_NODE:
        {
          const element = this;
          const name = element.namespace ? `${element.namespace}:${this.nodeName}` : this.nodeName;
          const empty = !options || !options.html ? undefined : HTML_NOEMPTY.has(name) ? false : HTML_EMPTY.has(name) ? true : undefined;
          out.push(`<${name}`);
          let styleAttr = null;
          for (const [k, v] of element._attributes.entries()) {
            if (k === "style") {
              styleAttr = v;
            } else if (v) {
              // `_value` read directly, like getAttribute (see above)
              const value = v._value || "";
              out.push(` ${k}="${value}"`);
            }
          }
          const styleKeys = Object.keys(element.style);
          if (styleAttr || styleKeys.length > 0) {
            let styleValue = styleAttr ? styleAttr._value || "" : "";
            if (styleKeys.length > 0) {
              // String concatenation: style objects hold a handful of keys,
              // so an array + join per element is pure overhead
              let inlineStyles = "";
              for (const key of styleKeys) {
                inlineStyles += (inlineStyles ? ";" : "") + toCSSPropertyName(key) + ": " + element.style[key];
              }
              if (inlineStyles) {
                styleValue = styleValue ? `${styleValue};${inlineStyles}` : inlineStyles;
              }
            }
            if (styleValue) {
              out.push(` style="${styleValue}"`);
            }
          }
          for (const [ns, attrs] of element._attributesNS.entries()) {
            for (const [k, v] of attrs.entries()) {
              if (v) {
                const value = v._value || "";
                const prefix = ns === "http://www.w3.org/1999/xlink" ? "xlink" : ns === "http://www.w3.org/2000/svg" ? "svg" : ns === "http://www.w3.org/XML/1998/namespace" ? "xml" : null;
                const attrName = prefix ? `${prefix}:${k}` : k;
                out.push(` ${attrName}="${value}"`);
              }
            }
          }
          if (options?.html && empty === true) {
            out.push(" >");
          } else if (this.childNodes.length === 0 && empty !== false) {
            out.push(" />");
          } else {
            out.push(">");
            for (const n of this.childNodes) {
              n._writeXML(out, options);
            }
            out.push(`</${name}>`);
          }
        }
        break;
      case Node.TEXT_NODE:
        out.push(escapeXML(this.data));
        break;
      case Node.COMMENT_NODE:
        if (has_comments) {
          out.push(`<!--${this.data ? this.data.replace(/>/g, "&gt;") : ""}-->`);
        }
        break;
    }
  }
  toXMLLines(options) {
    const out = [];
    this._writeXML(out, options);
    return out;
  }
  *iterXMLLines(options) {
    const out = [];
    this._writeXML(out, options);
    yield* out;
  }
  toXML(options = {}) {
    const out = [];
    this._writeXML(out, options);
    return out.join("");
  }
  toHTML(options = {}) {
    const out = [];
    this._writeXML(out, { ...options, html: true });
    return out.join("");
  }
  toJSON() {
    return {
      name: this.nodeName,
      children: this.childNodes.map((_) => _.toJSON())
    };
  }
  // Method: _collectText
  // Appends the text content of this node's leaves to `out`, so that
  // `textContent` joins a single array instead of one array per node.
  _collectText(out) {
    const children = this.childNodes;
    if (children.length === 0) {
      out.push(this.data);
      return;
    }
    for (let i = 0;i < children.length; i++) {
      children[i]._collectText(out);
    }
  }
  get _index() {
    return this.parentNode ? this.parentNode.childNodes.indexOf(this) : -1;
  }
  _create() {
    return new Node("", 0);
  }
  _detach() {
    if (this.parentNode)
      this.parentNode.removeChild(this);
    return this;
  }
  _attach(parentNode) {
    if (parentNode !== this.parentNode) {
      this._detach();
      this.parentNode = parentNode;
    }
    return this;
  }
  _getSiblingAt(index, offset = 0) {
    return this.parentNode?.childNodes[index + offset] || null;
  }
  // Method: _firstMatch
  // Returns the first descendant of this node (this node included) matching
  // the parsed `query`, or undefined. Walks in pre-order but stops as soon as
  // a match is found, which is what `querySelector` needs.
  //
  // Parameters:
  // - query: Query - an already parsed selector (see Query.of)
  //
  // Returns:
  // Node | undefined - the first matching node, if any
  _firstMatch(query) {
    const stack = [this];
    while (stack.length > 0) {
      const node = stack.pop();
      if (query.match(node)) {
        return node;
      }
      const children = node.childNodes;
      for (let i = children.length - 1;i >= 0;i--) {
        stack.push(children[i]);
      }
    }
    return undefined;
  }
}
function getDataSet(target, property) {
  if (typeof property === "string") {
    const attr = target._attributes.get(`data-${property}`);
    return attr ? attr.value : undefined;
  }
  return target[property];
}
// Shared handler for the dataset proxy, created once (see Element.dataset)
const DATASET_HANDLER = { get: getDataSet };

class AttributeNode extends Node {
  name;
  namespace;
  ownerElement;
  _value;
  constructor(name, namespace, ownerElement) {
    super(name, Node.ATTRIBUTE_NODE);
    this.name = name;
    this.namespace = namespace;
    this.ownerElement = ownerElement;
    this._value = undefined;
  }
  get value() {
    if (this.ownerElement) {
      if (this.namespace) {
        const nsMap = this.ownerElement._attributesNS.get(this.namespace);
        const attr = nsMap ? nsMap.get(this.name) : null;
        return attr ? attr._value || "" : "";
      } else {
        const attr = this.ownerElement._attributes.get(this.name);
        return attr ? attr._value || "" : "";
      }
    }
    return this._value || "";
  }
  set value(value) {
    const owner = this.ownerElement;
    // Keep the owning document's id index in sync (see Document._idIndex)
    const isId = owner !== null && owner !== undefined && this.name === "id" && !this.namespace;
    let previousId = null;
    if (isId) {
      const current = owner._attributes.get("id");
      previousId = current !== undefined ? current._value || "" : null;
    }
    this._value = value;
    if (owner) {
      if (this.namespace) {
        if (!owner._attributesNS.has(this.namespace)) {
          owner._attributesNS.set(this.namespace, new Map);
        }
        owner._attributesNS.get(this.namespace)?.set(this.name, this);
      } else {
        owner._attributes.set(this.name, this);
      }
    }
    if (isId) {
      owner._indexId(previousId, value || "");
    }
  }
  get nodeValue() {
    return this.value;
  }
  setNodeValue(value) {
    this.value = value;
  }
}

class Element extends Node {
  namespace;
  style;
  _attributes;
  _attributesNS;
  classList;
  sheet;
  _dataset;
  _document;
  constructor(name, namespace = null) {
    super(name, Node.ELEMENT_NODE);
    this.namespace = namespace;
    this.style = {};
    this._attributes = new Map;
    this._attributesNS = new Map;
    this.classList = new TokenList(this, "class");
    this.sheet = name === "style" ? new StyleSheet : null;
    this._dataset = undefined;
    this._document = undefined;
  }
  // Property: dataset
  // Returns a data-* attribute proxy for this element. The proxy is created
  // lazily on first access, as most elements never expose their data-*.
  //
  // Returns:
  // Proxy - a proxy reading `data-*` attributes through `getDataSet`
  get dataset() {
    if (this._dataset === undefined) {
      this._dataset = new Proxy(this, DATASET_HANDLER);
    }
    return this._dataset;
  }
  get id() {
    return this.getAttribute("id");
  }
  // Function: _idKeyOf
  // Returns the id index key for `attrNode`, normalized like the `id` getter
  // (`value || ""`), or null when there is no attribute.
  _idKeyOf(attrNode) {
    return attrNode ? attrNode._value || "" : null;
  }
  // Function: _indexId
  // Records an `id` change in the owning document's id index. Does nothing
  // when the element was not created by a Document.
  //
  // Parameters:
  // - previousId: string | null - the id it was indexed under, if any
  // - currentId: string | null - the id to index it under, if any
  _indexId(previousId, currentId) {
    const document = this._document;
    if (document !== undefined) {
      document._updateIdIndex(this, previousId, currentId);
    }
  }
  get attributes() {
    const regularAttrs = Array.from(this._attributes.values());
    const namespacedAttrs = [];
    for (const nsMap of this._attributesNS.values()) {
      namespacedAttrs.push(...Array.from(nsMap.values()));
    }
    return [...regularAttrs, ...namespacedAttrs];
  }
  removeAttribute(name) {
    if (name === "style") {
      this.style = {};
    }
    if (name === "id") {
      this._indexId(this._idKeyOf(this._attributes.get("id")), null);
    }
    this._attributes.delete(name);
    for (const [namespace, nsMap] of this._attributesNS.entries()) {
      nsMap.delete(name);
      if (nsMap.size === 0) {
        this._attributesNS.delete(namespace);
      }
    }
  }
  removeAttributeNS(namespace, name) {
    if (this._attributesNS.has(namespace)) {
      this._attributesNS.get(namespace)?.delete(name);
    }
  }
  setAttribute(name, value) {
    // Reuse the existing attribute node when overwriting: an AttributeNode
    // is a full Node and costs ~0.4 µs to allocate
    const attrNode = this._attributes.get(name) || new AttributeNode(name, null, this);
    attrNode.value = value;
    this._attributes.set(name, attrNode);
  }
  setAttributeNode(node) {
    const isId = node.name === "id" && !node.namespace;
    const previousId = isId ? this._idKeyOf(this._attributes.get("id")) : null;
    node.ownerElement = this;
    if (node.namespace) {
      if (!this._attributesNS.has(node.namespace)) {
        this._attributesNS.set(node.namespace, new Map);
      }
      this._attributesNS.get(node.namespace)?.set(node.name, node);
    } else {
      this._attributes.set(node.name, node);
    }
    if (isId) {
      this._indexId(previousId, this._idKeyOf(node));
    }
  }
  getAttributeNode(name) {
    return this._attributes.get(name) || null;
  }
  setAttributeNS(ns, name, value) {
    let attrs = this._attributesNS.get(ns);
    if (attrs === undefined) {
      attrs = new Map;
      this._attributesNS.set(ns, attrs);
    }
    // Reuse the existing attribute node when overwriting (see setAttribute)
    const attrNode = attrs.get(name) || new AttributeNode(name, ns, this);
    attrNode.value = value;
    attrs.set(name, attrNode);
  }
  hasAttribute(name) {
    return this._attributes.has(name);
  }
  hasAttributeNS(namespace, name) {
    return this._attributesNS.get(namespace)?.has(name) || false;
  }
  getAttribute(name) {
    // Read `_value` directly: the node came from this element's own map, so
    // the AttributeNode.value getter would just look the same entry up again
    const attr = this._attributes.get(name);
    return attr ? attr._value || "" : null;
  }
  getAttributeNS(ns, name) {
    const nsMap = this._attributesNS.get(ns);
    if (nsMap) {
      const attr = nsMap.get(name);
      return attr ? attr._value || "" : null;
    }
    return null;
  }
  getAttributeNodeNS(ns, name) {
    const nsMap = this._attributesNS.get(ns);
    return nsMap ? nsMap.get(name) || null : null;
  }
  removeAttributeNode(attributeNode) {
    if (attributeNode.ownerElement !== this) {
      throw new Error("NotFoundError: The attribute node is not owned by this element");
    }
    if (attributeNode.namespace) {
      const nsMap = this._attributesNS.get(attributeNode.namespace);
      if (nsMap?.has(attributeNode.name)) {
        nsMap.delete(attributeNode.name);
        if (nsMap.size === 0) {
          this._attributesNS.delete(attributeNode.namespace);
        }
      }
    } else {
      if (attributeNode.name === "id") {
        this._indexId(this._idKeyOf(this._attributes.get("id")), null);
      }
      this._attributes.delete(attributeNode.name);
    }
    attributeNode.ownerElement = null;
    return attributeNode;
  }
  addAttributeNode(attributeNode) {
    if (attributeNode.ownerElement && attributeNode.ownerElement !== this) {
      throw new Error("InUseAttributeError: The attribute node is already in use by another element");
    }
    const existingNode = attributeNode.namespace ? this.getAttributeNodeNS(attributeNode.namespace, attributeNode.name) : this.getAttributeNode(attributeNode.name);
    const isId = attributeNode.name === "id" && !attributeNode.namespace;
    const previousId = isId ? this._idKeyOf(this._attributes.get("id")) : null;
    attributeNode.ownerElement = this;
    if (attributeNode.namespace) {
      if (!this._attributesNS.has(attributeNode.namespace)) {
        this._attributesNS.set(attributeNode.namespace, new Map);
      }
      this._attributesNS.get(attributeNode.namespace)?.set(attributeNode.name, attributeNode);
    } else {
      this._attributes.set(attributeNode.name, attributeNode);
    }
    if (isId) {
      this._indexId(previousId, this._idKeyOf(attributeNode));
    }
    return existingNode;
  }
  cloneNode(deep) {
    const res = super.cloneNode(deep);
    for (const [k, v] of this._attributes.entries()) {
      if (v) {
        const clonedAttr = new AttributeNode(k, null, res);
        clonedAttr.value = v.value;
        res._attributes.set(k, clonedAttr);
      }
    }
    for (const [ns, attrs] of this._attributesNS.entries()) {
      const clonedNsMap = new Map;
      for (const [k, v] of attrs.entries()) {
        if (v) {
          const clonedAttr = new AttributeNode(k, ns, res);
          clonedAttr.value = v.value;
          clonedNsMap.set(k, clonedAttr);
        }
      }
      res._attributesNS.set(ns, clonedNsMap);
    }
    // Copy the inline style object and stylesheet rules: they live outside
    // the attribute map, so the generic clone above would drop them
    res.style = { ...this.style };
    if (this.sheet && res.sheet) {
      res.sheet.cssRules = [...this.sheet.cssRules];
    }
    return res;
  }
  _create() {
    return new Element(this.nodeName, this.namespace);
  }
  toJSON() {
    const res = super.toJSON();
    const attr = {};
    for (const [k, v] of this._attributes.entries()) {
      if (v && v.value !== undefined) {
        attr[k] = v.value;
      }
    }
    for (const [ns, attrs] of this._attributesNS.entries()) {
      for (const [k, v] of attrs.entries()) {
        if (v && v.value !== undefined) {
          attr[ns ? `${ns}:${k}` : k] = v.value;
        }
      }
    }
    res.attributes = attr;
    return res;
  }
  click(options) {
    const event = createMouseEvent("click", {
      clientX: options?.x ?? 0,
      clientY: options?.y ?? 0,
      button: options?.button ?? 0
    });
    return this.dispatchEvent(event);
  }
  dblclick(options) {
    const event = createMouseEvent("dblclick", {
      clientX: options?.x ?? 0,
      clientY: options?.y ?? 0
    });
    return this.dispatchEvent(event);
  }
  contextMenu(options) {
    const event = createMouseEvent("contextmenu", {
      clientX: options?.x ?? 0,
      clientY: options?.y ?? 0,
      button: 2
    });
    return this.dispatchEvent(event);
  }
  focus() {
    const event = createFocusEvent("focus");
    return this.dispatchEvent(event);
  }
  blur() {
    const event = createFocusEvent("blur");
    return this.dispatchEvent(event);
  }
  keyDown(key, options) {
    const event = createKeyboardEvent("keydown", {
      key,
      ctrlKey: options?.ctrlKey,
      shiftKey: options?.shiftKey,
      altKey: options?.altKey,
      metaKey: options?.metaKey
    });
    return this.dispatchEvent(event);
  }
  keyUp(key, options) {
    const event = createKeyboardEvent("keyup", {
      key,
      ctrlKey: options?.ctrlKey,
      shiftKey: options?.shiftKey,
      altKey: options?.altKey,
      metaKey: options?.metaKey
    });
    return this.dispatchEvent(event);
  }
  input(value) {
    if (this.nodeName.toLowerCase() === "input" || this.nodeName.toLowerCase() === "textarea") {
      this.setAttribute("value", value);
    }
    const event = createInputEvent("input", { data: value });
    return this.dispatchEvent(event);
  }
  change(value) {
    if (this.nodeName.toLowerCase() === "input" || this.nodeName.toLowerCase() === "textarea" || this.nodeName.toLowerCase() === "select") {
      this.setAttribute("value", value);
    }
    const event = new EventClass("change", { bubbles: true });
    return this.dispatchEvent(event);
  }
  submit() {
    const event = new SubmitEvent("submit", {
      bubbles: true,
      cancelable: true
    });
    return this.dispatchEvent(event);
  }
}

class TemplateElement extends Element {
  content;
  constructor(name, namespace = null) {
    super(name, namespace);
    this.content = new DocumentFragment;
  }
  appendChild(node) {
    this.content.appendChild(node);
    return this;
  }
}

class TextNode extends Node {
  constructor(data) {
    super("#text", Node.TEXT_NODE);
    this.data = data;
  }
  _create() {
    return new TextNode(this.data);
  }
  get nodeValue() {
    return this.data;
  }
  toJSON() {
    return this.data;
  }
}

class Comment extends Node {
  constructor(data) {
    super("#comment", Node.COMMENT_NODE);
    this.data = data;
  }
  _create() {
    return new Comment(this.data);
  }
  get nodeValue() {
    return this.data;
  }
  toJSON() {
    return;
  }
}

class DocumentFragment extends Node {
  constructor() {
    super("document-fragment", Node.DOCUMENT_FRAGMENT_NODE);
  }
}

class Document extends Node {
  body;
  _idIndex;
  constructor(nodes) {
    super("#document", Node.DOCUMENT_NODE);
    this.body = new Element("body");
    this._idIndex = new Map;
    if (nodes) {
      for (const node of nodes) {
        if (node)
          this.appendChild(node);
      }
    }
  }
  getElementById(id) {
    const elements = this._idIndex.get(id);
    if (elements === undefined) {
      return null;
    }
    for (const element of elements) {
      return element;
    }
    return null;
  }
  querySelectorAll(query) {
    const results = super.querySelectorAll(query);
    if (results.length > 0) {
      return results;
    }
    if (this.body && !this.childNodes.includes(this.body)) {
      return this.body.querySelectorAll(query);
    }
    return results;
  }
  // Method: querySelector
  // Overrides Node.querySelector to apply the same `document.body` fallback
  // as querySelectorAll: when the document's child node list has no match,
  // the body tree is searched too (see querySelectorAll).
  //
  // Parameters:
  // - query: string - the selector to look for
  //
  // Returns:
  // Node | undefined - the first matching node, if any
  querySelector(query) {
    const result = super.querySelector(query);
    if (result !== undefined) {
      return result;
    }
    if (this.body && !this.childNodes.includes(this.body)) {
      return this.body.querySelector(query);
    }
    return undefined;
  }
  createTreeWalker(node, nodeFilter) {
    return new TreeWalker(node, nodeFilter);
  }
  createTextNode(value) {
    return new TextNode(value);
  }
  createAttribute(name) {
    return new AttributeNode(name, null, null);
  }
  createComment(value) {
    return new Comment(value);
  }
  createDocumentFragment() {
    return new DocumentFragment;
  }
  createElement(name) {
    let element;
    switch (name) {
      case "template":
      case "TEMPLATE":
        element = new TemplateElement(name);
        break;
      default:
        element = new Element(name);
    }
    return this._register(element);
  }
  createElementNS(namespace, name) {
    return this._register(new Element(name, namespace));
  }
  _register(element) {
    element._document = this;
    return element;
  }
  // Method: _updateIdIndex
  // Moves `element` from `previousId` to `currentId` in the id index. A null
  // id means "no entry" on that side. Called by `Element._indexId`.
  //
  // Parameters:
  // - element: Element - the element whose id changed
  // - previousId: string | null - the id it was indexed under, if any
  // - currentId: string | null - the id to index it under, if any
  _updateIdIndex(element, previousId, currentId) {
    if (previousId === currentId) {
      return;
    }
    if (previousId !== null) {
      const previous = this._idIndex.get(previousId);
      if (previous !== undefined) {
        previous.delete(element);
        if (previous.size === 0) {
          this._idIndex.delete(previousId);
        }
      }
    }
    if (currentId !== null) {
      let current = this._idIndex.get(currentId);
      if (current === undefined) {
        current = new Set;
        this._idIndex.set(currentId, current);
      }
      current.add(element);
    }
  }
  _create() {
    return new Document;
  }
}
const NodeFilter = {
  SHOW_ALL: 4294967295,
  SHOW_ATTRIBUTE: 2,
  SHOW_CDATA_SECTION: 8,
  SHOW_COMMENT: 128,
  SHOW_DOCUMENT: 256,
  SHOW_DOCUMENT_FRAGMENT: 1024,
  SHOW_DOCUMENT_TYPE: 512,
  SHOW_ELEMENT: 1,
  SHOW_ENTITY_REFERENCE: 16,
  SHOW_ENTITY: 32,
  SHOW_PROCESSING: 64,
  SHOW_NOTATION: 2048,
  SHOW_TEXT: 4
};

class TreeWalker {
  root;
  currentNode;
  nodeFilter;
  predicate;
  _stack;
  _position;
  constructor(root, nodeFilter, predicate) {
    this.root = root;
    this.currentNode = root;
    this.nodeFilter = nodeFilter;
    this.predicate = predicate;
    // Descent stack of [parent, nextChildIndex] pairs: the pre-order
    // successor is then an O(1) amortized lookup instead of an O(n)
    // nextSibling indexOf scan per step
    this._stack = [];
    this._position = root;
  }
  // Method: _syncStack
  // Rebuilds the descent stack after `currentNode` was assigned externally.
  // Collects the ancestor chain of `currentNode` (one indexOf per level) and
  // pushes, for each ancestor, the index of the next child to visit once the
  // current node's subtree is done.
  _syncStack() {
    const stack = [];
    const chain = [];
    let node = this.currentNode;
    while (node?.parentNode) {
      chain.push(node);
      node = node.parentNode;
    }
    for (let i = chain.length - 1;i >= 0;i--) {
      const child = chain[i];
      const parent = child.parentNode;
      const index = parent.childNodes.indexOf(child);
      if (index < 0) {
        break;
      }
      stack.push([parent, index + 1]);
    }
    this._stack = stack;
    this._position = this.currentNode;
  }
  // Method: _advance
  // Returns the pre-order successor of `node` given the current stack, or
  // null when the walk is exhausted. Descends into `node`'s first child when
  // it has one, otherwise resumes at the nearest ancestor's pending child.
  //
  // Parameters:
  // - node: Node | null - the node whose successor is requested
  //
  // Returns:
  // Node | null - the next node in document order
  _advance(node) {
    if (node) {
      const children = node.childNodes;
      if (children.length > 0) {
        this._stack.push([node, 1]);
        return children[0];
      }
    }
    const stack = this._stack;
    while (stack.length > 0) {
      const entry = stack[stack.length - 1];
      const parent = entry[0];
      const index = entry[1];
      if (index < parent.childNodes.length) {
        entry[1] = index + 1;
        return parent.childNodes[index];
      }
      stack.pop();
    }
    return null;
  }
  _acceptNode(node) {
    switch (node.nodeType) {
      case Node.ELEMENT_NODE:
        return !!(this.nodeFilter & NodeFilter.SHOW_ELEMENT);
      case Node.ATTRIBUTE_NODE:
        return !!(this.nodeFilter & NodeFilter.SHOW_ATTRIBUTE);
      case Node.CDATA_SECTION_NODE:
        return !!(this.nodeFilter & NodeFilter.SHOW_CDATA_SECTION);
      case Node.PROCESSING_INSTRUCTION_NODE:
        return !!(this.nodeFilter & NodeFilter.SHOW_PROCESSING);
      case Node.DOCUMENT_NODE:
        return !!(this.nodeFilter & NodeFilter.SHOW_DOCUMENT);
      case Node.DOCUMENT_TYPE_NODE:
        return !!(this.nodeFilter & NodeFilter.SHOW_DOCUMENT_TYPE);
      case Node.DOCUMENT_FRAGMENT_NODE:
        return !!(this.nodeFilter & NodeFilter.SHOW_DOCUMENT_FRAGMENT);
      case Node.TEXT_NODE:
        return !!(this.nodeFilter & NodeFilter.SHOW_TEXT);
      case Node.COMMENT_NODE:
        return !!(this.nodeFilter & NodeFilter.SHOW_COMMENT);
      default:
        return false;
    }
  }
  nextNode() {
    if (this.currentNode !== this._position) {
      // currentNode was assigned externally: rebuild the descent stack
      this._syncStack();
    }
    let next = this._advance(this.currentNode);
    while (next !== null && !this._acceptNode(next)) {
      next = this._advance(next);
    }
    this.currentNode = next;
    this._position = next;
    return next;
  }
}

class TokenList {
  element;
  attribute;
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
    this._set(this._get().split(" ").filter((_) => _ !== value).join(" "));
  }
  toggle(value) {
    if (this.contains(value)) {
      this.remove(value);
      return false;
    } else {
      this.add(value);
      return true;
    }
  }
  _get() {
    return this.element.getAttribute(this.attribute) || "";
  }
  _set(value) {
    this.element.setAttribute(this.attribute, value);
  }
}

class StyleSheet {
  cssRules;
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
// Parsed camelCase to kebab-case conversions, keyed by property name. Style
// serialization converts the same handful of keys for every styled element,
// so a bounded cache (cleared when full) makes the conversion ~free.
const CSS_NAME_CACHE = new Map;
const CSS_NAME_CACHE_MAX = 512;
const toCSSPropertyName = (name) => {
  let kebab = CSS_NAME_CACHE.get(name);
  if (kebab === undefined) {
    if (CSS_NAME_CACHE.size >= CSS_NAME_CACHE_MAX) {
      CSS_NAME_CACHE.clear();
    }
    kebab = name.replace(/[A-Z]/g, "-$&").toLowerCase();
    if (kebab[0] === "-") {
      kebab = kebab.slice(1);
    }
    CSS_NAME_CACHE.set(name, kebab);
  }
  return kebab;
};
const NodeList = Array;
const StyleSheetList = Array;
let document = new Document;
const HTMLElement = Element;
const DOM = {
  Node,
  Element,
  HTMLElement,
  Document,
  NodeList,
  NodeFilter,
  StyleSheetList,
  document,
  Event: EventClass
};
function install(target = globalThis) {
  if (globalThis.window) {
    return target;
  }
  document = new Document;
  DOM.document = document;
  return Object.assign(target, DOM);
}

export {
  HTML_EMPTY,
  Node,
  AttributeNode,
  Element,
  TemplateElement,
  TextNode,
  Comment,
  DocumentFragment,
  Document,
  NodeFilter,
  TreeWalker,
  TokenList,
  StyleSheet,
  NodeList,
  StyleSheetList,
  document,
  HTMLElement,
  install
};
export default DOM;
