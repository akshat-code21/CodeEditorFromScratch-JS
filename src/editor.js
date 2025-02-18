import {highlight} from "./SyntaxHighlighting.js";
import {getCaretPosition, setCaret} from "./Caret.js";
import {Completion, SuggestionEngineInit} from "./Completion.js";
import {suggestionContainer} from "./DOMElements.js";
import {OnePunchhhhhhhhhhhhh} from "./VeryImportantFileDoNotTouchPleaseContainsSecretToUniverse.js";
import {g, placeholderCode} from "./Globals.js";
import {debounce} from "./Utility.js";

export function getCodeFromEditor(editor) {
	let code = "";
	for (const node of editor.children) {
		if (node.nodeName === 'DIV' || node.nodeName === 'BR') {
			code += node.innerText + '\n';
		}
	}
	return code;
}

export function getRecentKeywordRange() {
	const sel = window.getSelection();
	const range = sel.getRangeAt(0);
	const textNode = range.startContainer;
	const textContent = textNode.textContent;

	// Find the start and end of the word using regex
	const wordStart = textContent.slice(0, range.startOffset).search(/\b\w+$/);
	const wordEnd = textContent.slice(range.startOffset).search(/\W/);
	const start = wordStart === -1 ? 0 : wordStart;
	const end = wordEnd === -1 ? textContent.length : range.startOffset + wordEnd;

	// Create a new range for the full word
	const toReplaceKeywordRange = document.createRange();
	toReplaceKeywordRange.setStart(textNode, start);
	toReplaceKeywordRange.setEnd(textNode, end);

	return toReplaceKeywordRange;
}

export function getRecentKeyword() {
	const recentKeyword = getRecentKeywordRange().toString();
	return recentKeyword;
}

export function saveCodeToStorage(code) {
	localStorage.setItem(g.EDITOR_LOCALSTORAGE_KEY, code);
}

function handleTabs(editor) {
	editor.addEventListener("keydown", (e) => {
		if (e.key === "Tab") {
			if (suggestionContainer.dataset.active === "true") {
				// Do not do anything if suggestionContainer is displayed i.e. let browser perform its original behavior
			}
			else {
				const pos = getCaretPosition(editor) + 4;
				const range = window.getSelection().getRangeAt(0);
				range.deleteContents();
				range.insertNode(document.createTextNode("    "));
				highlight(editor);
				setCaret(pos, editor);
				e.preventDefault();
			}
		}
		else if (e.ctrlKey && e.key === "O") {
			e.preventDefault();
			OnePunchhhhhhhhhhhhh(editor);
		}
	});
}

function handleKeyPresses(editor) {
	highlight(editor);

	const debouncedSave = debounce(() => {
		const code = getCodeFromEditor(editor);
		saveCodeToStorage(code);
	}, g.saveDebounceInterval);

	editor.addEventListener("keyup", (e) => {
		e.preventDefault();
		if (e.key === "Escape") {
			if (suggestionContainer.dataset.active === "True") {
				suggestionContainer.innerHTML = "";
				suggestionContainer.dataset.active = "false";
			}
		}
		else if (e.keyCode >= 32) {    // This hardcoded value is the lower bound of ascii code of printable characters
			const pos = getCaretPosition(editor);
			highlight(editor);
			setCaret(pos, editor);
			debounce(() => Completion(editor), g.completionDebounceInterval)();
			debouncedSave();
		}
	});

	editor.addEventListener("keydown", (e) => {
		if (e.key === "Backspace") {
			debouncedSave();
			if (window.getSelection().getRangeAt(0).startOffset === 0) {
				highlight(editor);
				debounce(() => Completion(editor), g.completionDebounceInterval)();
			}
		}
	});
}

export function insertCodeIntoEditor(editor, code) {
	const placeholderCodeLines = code.split('\n');
	for (const line of placeholderCodeLines) {
		editor.innerHTML += "<div>" + line.replace('<', '&lt').replace('>', '&gt').replace('\t', '    ') + "</div>";
	}
}

export function CreateEditor(editor, defaultCode = placeholderCode) {
	const savedCode = localStorage.getItem(g.EDITOR_LOCALSTORAGE_KEY);
	const codeToUse = savedCode || defaultCode;

	editor.innerText = "";
	insertCodeIntoEditor(editor, codeToUse);

	SuggestionEngineInit();
	handleTabs(editor);
	handleKeyPresses(editor);
}
