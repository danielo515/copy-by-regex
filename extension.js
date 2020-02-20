// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const zip = require('ramda/src/zip');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

function fullLineRange(textEditor, selection) {
	return textEditor.document.lineAt(selection.start.line).range
}
const getSelectedOrFullLIneText = (textEditor, selection) => {
	return textEditor.document.getText( selection.isEmpty 
			? fullLineRange(textEditor, selection)
			: new vscode.Range(selection.start, selection.end)
			);
}
let latestRegex = '\\w+';
let latestInput = '';
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "copy-by-regex" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerTextEditorCommand('extension.regexCopy', async function (textEditor) {
		const selection = textEditor.selection;
		const regexStr = await vscode.window.showInputBox({ placeHolder: 'Input the regex or enter for ' + latestRegex }) || latestRegex
		latestRegex = regexStr
		console.log({ regexStr })
		const text = getSelectedOrFullLIneText(textEditor, selection)
		const matches = text.match(new RegExp(regexStr, 'g')) || [];
		latestInput = matches.toString();
		console.log({ matches })
		vscode.window.showInformationMessage('Copied the following => ' + matches.join(' | '))
	});

	const substituteMatches = (text, [match, substitution]) => text.replace(match, substitution);

	vscode.commands.registerTextEditorCommand('extension.regexPaste', async function (textEditor, edit) {
		const selection = textEditor.selection;
		const regexStr = await vscode.window.showInputBox({ placeHolder: 'Input the regex or enter for: ' + latestRegex }) || latestRegex
		latestRegex = regexStr
		const inputStr = await vscode.window.showInputBox({ placeHolder: 'Input substitute, leave empty for: ' + latestInput }) || latestInput
		
		const text = getSelectedOrFullLIneText(textEditor, selection)

		const matches = text.match(new RegExp(regexStr, 'g')) || [];
		console.log({ matches })
		const allValues = zip(matches, inputStr.split(','))
		const newText = allValues.reduce(substituteMatches, text)
		textEditor.edit(eb => eb.replace(selection, newText))
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
