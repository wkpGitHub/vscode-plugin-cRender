// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs-extra')
const path = require('path')
const CreatePageQuick = require('./src/createPageQuick/index.js')
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "demo1" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
  // vscode.commands.executeCommand('demo1.helloWorld')
  let createPageInstance = {}
  const createPageQuick = vscode.commands.registerCommand('createPageQuick', function () {
    if (createPageInstance.webviewPanel) {
      createPageInstance.webviewPanel.dispose()
    }
    createPageInstance = new CreatePageQuick(context)
  })

  let consoleLogger = vscode.commands.registerCommand('consoleLogger', function () {
    // The code you place here will be executed every time your command is executed
  
    // 步骤分解
    // 1. 获取选中文本信息
    // 2. 获取选中文本位置
    // 3. 获取console分隔符配置
    // 4. 添加console代码
  
    const activeTextEditor = vscode.window.activeTextEditor;
    const activeDocument = activeTextEditor.document;
  
    // 1. 获取所有选中行信息
    const selection = activeTextEditor.selection;
    // sample for selection: {"start":{"line":2,"character":0},"end":{"line":2,"character":7},"active":{"line":2,"character":7},"anchor":{"line":2,"character":0}}
    const { start, end } = selection;
  
    // 当前行文本内容
    const curLineText = activeDocument.lineAt(start.line).text;
  
    // 当前行非空文本起始位置
    const curLineStartCharacter = curLineText.search(/\S/i);
  
    // 当前行为空文本
    const curBlankText = curLineText.substring(0, curLineStartCharacter);
  
    // 当前选中文本内容
    const curText = curLineText.substring(start.character, end.character);
  
    // console插入位置
    const insertPositon = new vscode.Position(start.line + 1, 0);
  
    // 获取配置
    const config = vscode.workspace.getConfiguration('配置的 configuration 属性名称');
    const identifier = config.get('identifier');
  
    // 调用编辑接口
    activeTextEditor.edit((TextEditorEdit) => {
      TextEditorEdit.insert(insertPositon, `${curBlankText}console.log('${curText}', ${curText})\n`);
    });
  });


  function insertField(activeTextEditor, activeDocument) {
    const selection = activeTextEditor.selection;
    const { end } = selection;
    // 当前行文本内容
    const curLineText = activeDocument.lineAt(end.line).text;
    if (curLineText.endsWith('searchConfig')) {
      activeTextEditor.edit((TextEditorEdit) => {
        const range = new vscode.Range(new vscode.Position(end.line, 0), new vscode.Position(end.line, end.character))
        TextEditorEdit.replace(range, ` const searchConfig = defineSearchConfig({
    configList: [
      { type: 'radio', isButton: true, defaultValue: '', prop: 'enabled', options: [{label: '全部', value: ''}, ...enabledOpts] },
      { label: '名称', prop: 'name', width: 200 },
    ]
  })`);
      });
    } 
    if (curLineText.endsWith('formConfig')) {
      activeTextEditor.edit((TextEditorEdit) => {
        const range = new vscode.Range(new vscode.Position(end.line, 0), new vscode.Position(end.line, end.character))
        TextEditorEdit.replace(range, ` const formConfig = defineFormConfig({
    configList: [
      { label: '名称', prop: 'name', required: true },
      { label: '类型', prop: 'type', type: 'select', options: () => storeState.selectOptMap.msg_auth_msg_type },
      { label: '状态', prop: 'enabled', type: 'radio', defaultValue: true, required: true, options: enabledOpts },
      { label: '备注', prop: 'memo', inputType: 'textarea', rows: 4 },
    ],
    labelWidth: 90
  })`);
      });
    }
    if (curLineText.endsWith('tableConfig')) {
      activeTextEditor.edit((TextEditorEdit) => {
        const range = new vscode.Range(new vscode.Position(end.line, 0), new vscode.Position(end.line, end.character))
        TextEditorEdit.replace(range, ` const tableConfig = defineTableConfig({
    rowName: 'name',
    columns: [
      { type: 'index' },
      { label: '名称', prop: 'name' },
      { label: '类型', prop: 'msgType', type: 'select', options: () => storeState.selectOptMap.msg_auth_msg_type },
      { label: '状态', prop: 'enabled', type: 'status', options: enabledOpts, width: 60 },
      { label: '备注', prop: 'memo', minWidth: 200, showOverflowTooltip: true},
      { label: '创建人', prop: 'creator'},
      { label: '创建时间', prop: 'gmtCreate', width: 160 },
      { label: '修改人', prop: 'modifier', hidden: true },
      { label: '修改时间', prop: 'gmtModified', width: 160, hidden: true },
    ],
    handlerSlot({row, editRow, deleteRow}) {
      return <>
        <el-button link type="primary" onClick={() => showEdit(editRow, row)}>编辑</el-button>
        <el-button link type="danger" onClick={() => deleteRow({row})}>删除</el-button>
      </>
    }
  })`);
      });
    }
  }

  let insertCode = vscode.commands.registerCommand('insertCode', function () {
    // The code you place here will be executed every time your command is executed
  
    // 步骤分解
    // 1. 获取选中文本信息
    // 2. 获取选中文本位置
    // 3. 获取console分隔符配置
    // 4. 添加console代码
  
    const activeTextEditor = vscode.window.activeTextEditor;
    const activeDocument = activeTextEditor.document;
    const codeText = activeDocument.getText()
    const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(10, 100))
    if (['@simple', '@simple-list', '@simple-page'].includes(codeText)) {
      const configCode = fs.readFileSync(path.join(__dirname, './layout_tmp/simple-list.vue'), 'utf-8')
      activeTextEditor.edit((TextEditorEdit) => {
        TextEditorEdit.replace(range, configCode);
      });
    } else if (['@page', '@list'].includes(codeText)) {
      const configCode = fs.readFileSync(path.join(__dirname, './layout_tmp/list.vue'), 'utf-8')
      activeTextEditor.edit((TextEditorEdit) => {
        TextEditorEdit.replace(range, configCode);
      });
    } else if (codeText === '@dialog') {
      const configCode = fs.readFileSync(path.join(__dirname, './layout_tmp/dialog.jsx'), 'utf-8')
      activeTextEditor.edit((TextEditorEdit) => {
        TextEditorEdit.replace(range, configCode);
      });
    } else if (codeText === '@handle') {
      const configCode = fs.readFileSync(path.join(__dirname, './layout_tmp/handle.jsx'), 'utf-8')
      activeTextEditor.edit((TextEditorEdit) => {
        TextEditorEdit.replace(range, configCode);
      });
    } else if (codeText === '@info') {
      const configCode = fs.readFileSync(path.join(__dirname, './layout_tmp/info.jsx'), 'utf-8')
      activeTextEditor.edit((TextEditorEdit) => {
        TextEditorEdit.replace(range, configCode);
      });
    } else if (codeText === '@api') {
      const configCode = fs.readFileSync(path.join(__dirname, './layout_tmp/api.js'), 'utf-8')
      activeTextEditor.edit((TextEditorEdit) => {
        TextEditorEdit.replace(range, configCode);
      });
    } else {
      insertField(activeTextEditor, activeDocument)
    }
  })
  let createFiles = vscode.commands.registerCommand('createFiles', async function (fileUrl, file) {
    console.log(file[0], __dirname, path.resolve('./curd_tmp'))
    fs.copy(path.join(__dirname, './curd_tmp'), file[0].path.substr(1)).then(() => console.log('success!')).catch(err => console.error(err))
    // vscode.workspace.
  });

	context.subscriptions.push(consoleLogger);
	// context.subscriptions.push(createFiles);
	context.subscriptions.push(insertCode);
	context.subscriptions.push(createPageQuick);

}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
