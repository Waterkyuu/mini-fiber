// Global variable
let wipRoot = null;
let nextUnitWork = null;
let currenRoot = null;
let deletions = [];

/**
 *  jsx -> node
 *  const element = createElement('div', {id: "wrapper"}, "Hello")
 *  const element = {
 *   type: "div",
 *   props: {
 *     id: "wrapper",
 *     children: [
 *       {
 *         type: "TEXT_ELEMENT",
 *         props: {
 *           nodeValue: "Hello",
 *           children: []
 *         }
 *       }
 *     ]
 *   }
 * };
 */
function createElement(type, props, ...children) {
	return {
		type,
		props: {
			...props,
			children: children.map((child) =>
				typeof child === "object" ? child : createTextElement(child)
			),
		},
	};
}

function createTextElement(text) {
	return {
		type: "TEXT_ELEMENT",
		props: {
			nodeValue: text,
			children: [],
		},
	};
}

/**
 *  const fiber = {
 *   type: "div",
 *   props: { ... },
 *   parent: parentFiber,
 *   dom: null,
 *   sibling: null,
 *   child: null
 *  }
 */
function createFiber(element, parent) {
	return {
		type: element.type,
		props: element.props,
		dom: null,
		parent: parent,
		child: null,
		sibling: null,
		alternate: null,
		effectTag: null,
	};
}

function createDom(fiber) {
	const dom = fiber.type === "TEXT_ELEMENT"
		? document.createTextNode("")
		: document.createElement(fiber.type);

	updateDom(dom, {}, fiber.props);
	return dom;
}

// Update attributes
function updateDom(dom, prevProps, nextProps) {
	Object.keys(prevProps)
		.filter((k) => k !== "children")
		.forEach((name) => {
			if (!(name in nextProps)) {
				dom[name] = "";
			}
		});

	Object.keys(nextProps)
		.filter((k) => k !== "children")
		.forEach((name) => {
			dom[name] = nextProps[name];
		});
}

function workLoop(deadline) {
	let shouldYield = false;

	while (!shouldYield && nextUnitWork && deadline) {
		nextUnitWork = performUnitWork(nextUnitWork);
		// If there is not enough time, simply pause and give way to the main thread
		shouldYield = deadline.timeRemaining() < 1;
	}

	if (wipRoot && !nextUnitWork) {
		commitRoot(wipRoot);
	}

	requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitWork(fiber) {
	// Why do we need to create a Dom
	if (!fiber.dom) {
		fiber.dom = createDom(fiber);
	}

	const childrenElements = fiber.props.children || [];

	// Diff
	reconcileChild(fiber, childrenElements);

	// The reason why fiber can be interrupt
	if (fiber.child) return fiber.child;

	let nextFiber = fiber;

	while (nextFiber) {
		if (nextFiber.sibling) return nextFiber.sibling;
		nextFiber = nextFiber.parent;
	}
}

function reconcileChild(wipFiber, childrenElements) {
	let index = 0;
	let oldChildFiber = wipFiber.alternate?.child;
	let prevSibling = null;

	while (index < childrenElements.length || oldChildFiber) {
		const currentChildElement = childrenElements[index];
		let newFiber = null;

		const sameType = oldChildFiber &&
			currentChildElement &&
			currentChildElement.type === oldChildFiber.type;

		// Old:
		// <div className="old-class" id="container">Hello</div>
		// New:
		// <div className="new-class" id="container">Hello World</div>
		if (sameType) {
			newFiber = {
				type: oldChildFiber.type,
				props: currentChildElement.props,
				dom: oldChildFiber.dom, // Reuse the DOM without creating
				parent: wipFiber,
				alternate: oldChildFiber,
				effectTag: "UPDATE",
			};
		}

		// Create new fiber
		if (currentChildElement && !sameType) {
			newFiber = createFiber(currentChildElement, wipFiber);
			newFiber.effectTag = "PLACEMENT";
		}

		// Delete old fiber
		if (oldChildFiber && !sameType) {
			oldChildFiber.effectTag = "DELETION";
			deletions.push(oldChildFiber);
		}

		// Update old child fiber ——> replace old silbing fiber
		// Note: Element structure is diffrent from fiber structure
		if (oldChildFiber) {
			oldChildFiber = oldChildFiber.sibling;
		}

		if (index === 0) {
			wipFiber.child = newFiber;
		} else if (prevSibling) {
			prevSibling.sibling = newFiber;
		}

		prevSibling = newFiber;
		index++;
	}
}

function commitRoot() {
	deletions.forEach((oldFiber) => commitWork(oldFiber));
	commitWork(wipRoot.child);
	currenRoot = wipRoot;
	wipRoot = null;
}

function commitWork(fiber) {
	if (!fiber) return;

	// Keep searching upwards until you find a parent node that is truly attached to the DOM
	// Fiber tree ≠ Dom Tree
	let domParentFiber = fiber.parent;
	/**
	 * Example:
	 * 	function App() {
			return <div>Hello</div>
		}
		App (FunctionComponent)  No DOM
			↓
		div (HostComponent)      Real DOM
		But !!!
		div.parent === App
	 */

	/**
	 * Example:
	 * <div>
	 * 		<Header>
	 * 			<div>
	 * 				Hello
	 * 			</div>
	 * 		<Header>
	 * </div>
	 */

	while (!domParentFiber.dom) {
		domParentFiber = domParentFiber.parent;
	}

	const domParent = domParentFiber.dom;

	if (fiber.effectTag === "PLACEMENT") {
		domParent.appendChild(fiber.dom);
	} else if (fiber.effectTag === "UPDATE") {
		updateDom(fiber.dom, fiber.alternate.props, fiber.props);
	} else if (fiber.effectTag === "DELETION") {
		// commitDeletion(fiber, domParent);
		domParent.removeChild(fiber.dom);
		return;
	}

	// When commiting work, it cannot be interrupted, which is the opposite of rendering!
	commitWork(fiber.child);
	commitWork(fiber.sibling);
}

function render(element, container) {
	wipRoot = {
		dom: container,
		props: {
			children: [
				element,
			],
		},
		alternate: currenRoot,
	};

	deletions = [];

	nextUnitWork = wipRoot;
}

export { createElement, render };
