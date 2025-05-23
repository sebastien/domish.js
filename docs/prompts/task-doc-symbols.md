Your task is to the read the given source code create a list of symbols
that are defined, along with a short one-liner explanation of what they
do.

Symbols are defined in the scope of a module (typically the
file source code), the structure of the symbols is typically like so:

- Constant
- Type
- Class,Interface,Structure
   - Attribute
   - Method
- Function

<example>
For instance, given the following code (in JavaScript)

<code>
const tags =  (...tags) => tags.reduce(i…))
const HTML_EMPTY = tags(
        "area",
        …
        "basefont",
)
export class Node {
	static Namespaces = {
		svg: "http://www.w3.org/2000/svg",
		xlink: "http://www.w3.org/1999/xlink",
	};
	static ELEMENT_NODE = 1;
  …
	constructor(name, type) {…}
 	get textContent() {…}
	get isConnected() {…}
	appendChild(node) {…}
}
</code>

would then translate into

<result>
- tags(function): returns a mapping of the given tags, matching all cases.
- Node(class): defines the DOM node class
    - Namespaces(static property): Defines the SVG and XLink namespaces
    - ELEMENT_NODE(static property):  DOM definition
    - textContent(accessor): Returns the node's content as text
    - appendChild(method): Appends the given child to the node
   …
</result>

Note how in the result we:
- Map the structure of the symbols as a hierarchical list
- Suffix the symbol name with the type of symbol in parens
- Keep the description of the symbols short
</example>

Now, here is the source code, can you analyse and produce the expected resulting
symbols as a markdown document.




