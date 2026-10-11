// Project: DOMIsh
// Author:  Sebastien Pierre
// License: Revised BSD License
// Created: 2026-10-12
// Module: bench
// Micro-benchmarks for the DOMIsh core operations. Each case builds a fixed
// 598-node document (341 elements, 256 text nodes, attributes, classes, inline
// styles, ids), warms up, then reports the fastest of 25 rounds.
//
// Run with:
// ```bash
// bun src/js/bench/bench.js
// ```
// ----------------------------------------------------------------------------

import { Document, NodeFilter } from "../domish/domish.js";

// ----------------------------------------------------------------------------
//
// HELPERS
//
// ----------------------------------------------------------------------------

// Function: buildDocument
// Builds a document of `depth` levels with `breadth` children per level. Every
// element carries an id, classes, a data attribute and an inline style; leaves
// hold text nodes with characters that need escaping.
//
// Returns:
// Document - the document holding the generated tree in its body.
const buildDocument = (depth = 4, breadth = 4) => {
	const doc = new Document();
	let id = 0;
	const build = (level) => {
		const el = doc.createElement(`d${level}`);
		el.setAttribute("id", `n${id++}`);
		el.setAttribute("class", "a b c");
		el.setAttribute("data-x", "1");
		el.style.backgroundColor = "blue";
		if (level > 0) {
			for (let i = 0; i < breadth; i++) {
				el.appendChild(build(level - 1));
			}
		} else {
			el.appendChild(doc.createTextNode("hello <world> & more"));
		}
		return el;
	};
	doc.body.appendChild(build(depth));
	return doc;
};

// Function: runCase
// Runs `operation` against a freshly built document and returns its fastest
// time per iteration in milliseconds. The minimum is used instead of the
// median because it is robust against scheduler/GC noise on shared machines.
//
// Parameters:
// - operation: (doc) => any - the work to time
// - iterations: number - iterations per round
//
// Returns:
// number - minimum milliseconds per iteration
const runCase = (operation, iterations) => {
	const doc = buildDocument();
	for (let i = 0; i < 5; i++) {
		operation(doc);
	}
	const rounds = [];
	for (let round = 0; round < 25; round++) {
		const start = performance.now();
		for (let i = 0; i < iterations; i++) {
			operation(doc);
		}
		rounds.push((performance.now() - start) / iterations);
	}
	return Math.min(...rounds);
};

// ----------------------------------------------------------------------------
//
// CASES
//
// ----------------------------------------------------------------------------

const collectAll = (doc) => {
	const nodes = [];
	doc.body.iterWalk((node) => {
		nodes.push(node);
		return;
	});
	return nodes;
};

const CASES = [
	["toHTML (598 nodes)", (doc) => doc.body.toHTML(), 5],
	["toXML (598 nodes)", (doc) => doc.body.toXML(), 5],
	["toXMLLines", (doc) => doc.body.toXMLLines({ html: true }), 5],
	["innerHTML", (doc) => doc.body.innerHTML, 5],
	["textContent", (doc) => doc.body.textContent, 20],
	["toText", (doc) => doc.body.toText(), 20],
	[
		"iterWalk",
		(doc) => {
			let count = 0;
			doc.body.iterWalk(() => {
				count++;
			});
			return count;
		},
		20,
	],
	["querySelectorAll('.a')", (doc) => doc.body.querySelectorAll(".a"), 10],
	["querySelector('d0')", (doc) => doc.body.querySelector("d0"), 10],
	[
		"matches('.a') x all nodes",
		(doc) => {
			for (const n of collectAll(doc)) n.matches(".a");
		},
		3,
	],
	["getElementById (hit)", (doc) => doc.getElementById("n300"), 100],
	["getElementById (miss)", (doc) => doc.getElementById("missing"), 100],
	[
		"TreeWalker full walk",
		(doc) => {
			const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
			let count = 0;
			while (walker.nextNode()) {
				count++;
			}
			return count;
		},
		5,
	],
	["cloneNode(true)", (doc) => doc.body.cloneNode(true), 5],
	["createElement", (doc) => doc.createElement("span"), 100],
	[
		"createElement + setAttribute",
		(doc) => {
			const e = doc.createElement("span");
			e.setAttribute("k", "v");
		},
		100,
	],
	[
		"getAttribute",
		(doc) => {
			const e = doc.body.firstChild;
			e.getAttribute("data-x");
		},
		100,
	],
	[
		"setAttribute overwrite",
		(doc) => {
			doc.body.firstChild.setAttribute("data-x", "2");
		},
		100,
	],
	[
		"appendChild (reparent)",
		(doc) => {
			const e = doc.createElement("x");
			doc.body.appendChild(e);
		},
		100,
	],
];

// ----------------------------------------------------------------------------
//
// MAIN
//
// ----------------------------------------------------------------------------

const format = (ms) => {
	if (ms < 0.001) return `${(ms * 1e6).toFixed(0)} ns`;
	if (ms < 1) return `${(ms * 1e3).toFixed(1)} µs`;
	return `${ms.toFixed(3)} ms`;
};

console.log("DOMIsh benchmark (fastest of 25 rounds)\n");
console.log(`${"case".padEnd(32)}${"fastest".padStart(12)}${"ops/sec".padStart(14)}`);
console.log("-".repeat(58));
for (const [name, operation, iterations] of CASES) {
	const ms = runCase(operation, iterations);
	console.log(`${name.padEnd(32)}${format(ms).padStart(12)}${(1000 / ms).toFixed(0).padStart(14)}`);
}

// EOF
