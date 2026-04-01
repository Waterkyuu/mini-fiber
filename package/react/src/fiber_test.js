import { assertEquals, assertExists } from "@std/assert";
import { createElement, createTextElement } from "./fiber.js";

// CreateElement Func
Deno.test("createElement should create basic virtual DOM object", () => {
	const element = createElement("div", { id: "app" }, "Hello");

	assertEquals(element.type, "div");
	assertEquals(element.props.id, "app");
	assertEquals(element.props.children.length, 1);
	assertEquals(element.props.children[0].type, "TEXT_ELEMENT");
	assertEquals(element.props.children[0].props.nodeValue, "Hello");
});

Deno.test("createElement should handle nested child elements", () => {
	const child = createElement("span", null, "world");
	const parent = createElement("div", { class: "container" }, child);

	assertEquals(parent.props.children[0].type, "span");
	assertEquals(
		parent.props.children[0].props.children[0].props.nodeValue,
		"world",
	);
});

Deno.test("createElement should handle multiple children with mixed types", () => {
	const element = createElement(
		"div",
		null,
		"Text1",
		createElement("p", null, "Nested"),
		123,
		null,
	);

	const children = element.props.children;
	assertEquals(children.length, 4);
	assertEquals(children[0].props.nodeValue, "Text1");
	assertEquals(children[1].type, "p");
	assertEquals(children[2].props.nodeValue, "123");
	// null will be treated as object, you may want to filter it at business layer
	assertEquals(children[3], null);
});

Deno.test("createElement should handle null props", () => {
	const element = createElement("span", null, "text");

	assertExists(element.props);
	assertEquals(element.props.children.length, 1);
});

Deno.test("createTextElement should convert numbers to strings", () => {
	const textEl = createTextElement(42);
	assertEquals(textEl.props.nodeValue, "42");
});

// // CreateDom func
// Deno.test("createDom should create real DOM from element", () => {
// 	const mockFiber = {
// 		type: "button",
// 		props: {},
// 		dom: null,
// 	};

// 	const dom = createDom(mockFiber);

// 	assertEquals();
// });
