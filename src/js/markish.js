// --
// ## Markish
//
// Makes it easier to convert between HTML/XML and Markdown

function strip(text) {
	return text.replace(/\s+/g, ' ').trim();
}

function derive(object, data = {}) {
	return Object.assign(Object.create(object), data)
}

function* imarkdown(node, context = {}) {
	if (!node) {
		// Nothing
	} else if (node instanceof Array) {
		for (const _ of node) { yield* imarkdown(_) }
	} else {
		let suffix = undefined;
		let children = node.childNodes;
		const name = (node.nodeName ?? "").toLowerCase()
		const prefix = Array((context?.indent ?? 0) + 1).join("  ")
		switch (node.nodeType) {
			case node.constructor.ELEMENT_NODE:
				switch (name) {
					case "ul":
						yield "\n"
						context = derive(context, { container: "ul", index: 0, indent: 1 + (context?.indent ?? 0) })
						break
					case "ol":
						context = derive(context, { container: "ol", index: 0, indent: 1 + (context?.indent ?? 0) })
						yield "\n"
						break
					case "li":
						context.index = 1 + (context.index ?? 0)
						context = derive(context, { indent: 1 + (context?.indent ?? 0), index: context.index })
						switch (context.container) {
							case "ol":
								yield `\n${prefix} ${context.index}) `
								break
							default:
								yield `\n${prefix} * `
						}
						break
					case "p":
						yield `\n${prefix}`
						break
					case "a":
						if (node.hasAttribute("href")) {
							yield "["
							suffix = `](${node.getAttribute("href")})`
						}
						break
					case "em":
						yield "*"
						suffix = "*"
						break
					case "strong":
						yield "**"
						suffix = "**"
						break
					case "pre":
						context = derive(context, { strip: false })
						yield "\n```\n"
						suffix = "\n```\n"
						break
					case "title":
						yield "== "
						suffix = "\n\n"
						break
					case "h1":
					case "h2":
					case "h3":
					case "h4":
					case "h5":
					case "h6":
					case "h7":
						yield `\n${prefix}${Array(parseInt(name.at(1)) + 1).join("#")} `
						suffix = "\n"
						break
					case "blockquote":
						{
							const lines = [...node.childNodes].map(_ => [...imarkdown(_)].join("")).join("").split("\n")
							yield "\n"
							for (const line of lines) {
								yield `${prefix}> ${line}\n`
							}
							yield "\n"
							children = null;
						}
						break
					case "table":
						yield "\n"
						suffix = "\n"
						break
					case "th":
						yield "**"
						suffix = "**"
						break
					case "tr":
						yield "\n|| "
						yield [...node.children].map(_ => [...imarkdown(_)].join("")).join(" || ")
						children = null
						yield " ||"
				}
				if (children) {
					for (const child of children) {
						yield* imarkdown(child, context)
					}
				}
				if (suffix) { yield suffix }
				break
			case node.constructor.TEXT_NODE:
				{
					const text = context?.strip === false ? node.data : strip(node.data);
					if (text.length > 0) {
						yield text
					}
				}
				break
		}
	}
}

function markdown(nodes, context = undefined) { return [...imarkdown(nodes, context)] }


export { markdown, imarkdown }
// EOF
