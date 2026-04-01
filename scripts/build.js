import { transformFileSync } from "@swc/core";
import { writeFileSync } from "node:fs";

const files = ["./App.jsx"];

for (const file of files) {
	const result = transformFileSync(file, {
		jsc: {
			parser: {
				syntax: "ecmascript",
				jsx: true,
			},
			transform: {
				react: {
					runtime: "classic",
					pragma: "createElement",
					pragmaFrag: "Fragment",
				},
			},
			target: "es2015",
		},
		module: {
			type: "es6",
		},
	});

	const outputFile = file.replace(".jsx", ".compiled.js");
	writeFileSync(outputFile, result.code);
	console.log(`✅ ${file} -> ${outputFile}`);
}

console.log("Build complete!");
