const vscode = require('vscode');
const fs = require('fs-extra')
const path = require('path')
const babelParser = require('@babel/parser')
const babelTypes = require('@babel/types')
const babelGenerator = require('@babel/generator')
const babelTraverse = require('@babel/traverse')

function noop() {
  return {
    visitor: {
      // 示例：避免在变量声明时添加或移除换行符
      VariableDeclaration(path) {
        const declarations = path.get('declarations');
        for (let i = 0; i < declarations.length; i++) {
          const declar = declarations[i];
          declar.insertAfter(babelTypes.noop()); // 使用noop保持原样
        }
      },
    },
  };
}

module.exports = class CreatePageQuick {
  constructor(context) {
    const { ViewColumn, window, workspace } = vscode
    const columnToShowIn = window.activeTextEditor
      ? window.activeTextEditor.viewColumn
      : ViewColumn.Active;
    this.context = context;
    this.webviewPanel = window.createWebviewPanel('CreatePageQuick', '快速生成页面', columnToShowIn, {
      retainContextWhenHidden: true,
      enableScripts: true
    })
    const htmlPath = path.join(
      context.extensionPath, './src/createPageQuick/html/index.html'
    )
    let _html = fs.readFileSync(htmlPath, 'utf-8')
    _html = _html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
      const resourcePath = path.join(context.extensionPath, './src/createPageQuick/html/index.html');
      const dirPath = path.dirname(resourcePath);
      const absLocalPath = path.resolve(dirPath, $2);
      const urlPath = vscode.Uri.file(absLocalPath)
      const webviewUri = this.webviewPanel.webview.asWebviewUri(urlPath);
      const replaceHref = $1 + webviewUri.toString() + '"';
      return replaceHref;
    });
    this.webviewPanel.webview.html = _html
    this.webviewPanel.onDidDispose(() => {
      this.webviewPanel = undefined;
    });
    this.webviewPanel.webview.onDidReceiveMessage(e => {
      if (e.type === 'createPageQuick') {
        const { menuName, moduleName, routeDirName = 'routes', subMenu, pageName, fileName, servicePath } = JSON.parse(e.data)
        const routerFileName = path.join(workspace.rootPath, 'src/router', routeDirName, moduleName)
        // this.addRoute(routerFileName, { moduleName, menuName, subMenu, fileName, pageName })

        const serviceFileName = path.join(workspace.rootPath, 'src/request/apis', moduleName)
        const serviceName = servicePath.replace(/\/(.?)/g, (m, $1) => $1.toUpperCase()) + 'Service'
        this.addService(serviceFileName, {moduleName, servicePath, serviceName})

        this.addView({serviceName, moduleName, fileName})
      }
    });
  }

  addRoute(routerFileName, { moduleName, menuName, subMenu, fileName, pageName }) {
    const filePath = `${routerFileName}.js`
    const existed = fs.existsSync(filePath)
    let fileContent = ''
    if (existed) {
      fileContent = fs.readFileSync(filePath, 'utf-8')
      const parseContent = fs.readFileSync(filePath, 'utf-8');
      const scriptAST = babelParser.parse(parseContent, {
        sourceType: 'module',
        plugins: ['jsx']
      });

      const vistor = {
        ObjectExpression: {
          enter(path) {
            const { node } = path
            subMenu = subMenu || menuName
            const thisObject = node.properties.find(item => item.value.value === subMenu)
            if (thisObject) {
              const childrenObject = node.properties.find(item => item.value.type === 'ArrayExpression' && Array.isArray(item.value.elements))
              const {start, end} = childrenObject.loc
              const routeStr = `export default {
                path: '/${fileName}',
                name: '${pageName}',
                component: () => import(/* webpackChunkName: "${moduleName}" */ "@/views/${moduleName}/${fileName}"),
              }`
              const routeAst = babelParser.parse(routeStr, { sourceType: 'module' });
              const _node = routeAst.program.body[0].declaration
              _node.loc.start = {
                line: end.line,
                column: start.column + 2
              }
              _node.loc.end = {
                line: end.line + 4,
                column: start.column + 3
              }
              _node.properties.forEach((item,index) => {
                item.loc.start={
                  line: end.line + 1 + index,
                  column: start.column + 4
                }
                item.loc.end={
                  line: end.line + 1 + index,
                  column: start.column + 5
                }
              })
              childrenObject.value.elements.push(_node)
              end.line+=5
              node.loc.end.line+=5
            }
          }
        }
      }

      babelTraverse.default(scriptAST, vistor)
      fileContent = babelGenerator.default(scriptAST, {retainLines: true}).code
    } else {
      if (subMenu) {
        fileContent = `export default {
  name: '${menuName}',
  children: [
    {
      name: '${subMenu}',
      children: [
        {
          path: '/${fileName}',
          name: '${pageName}',
          component: () => import(/* webpackChunkName: "${moduleName}" */ "@/views/${moduleName}/${fileName}"),
        }
      ]
    }
  ]
}`
      } else {
        fileContent = `export default {
  name: ${menuName},
  simple: true,
  children: [
    {
      path: '/${fileName}',
      name: '快件入库',
      component: () => import(/* webpackChunkName: "${moduleName}" */ "@/views/${moduleName}/${fileName}"),
    }
  ]
}`
      }
    }
    fs.writeFileSync(filePath, fileContent)
  }

  addService(serviceFileName, {moduleName, servicePath, serviceName}) {
    const filePath = `${serviceFileName}.js`
    const existed = fs.existsSync(filePath)
    let fileContent = ''
    if (existed) {
      fileContent = fs.readFileSync(filePath, 'utf-8')
      const apiAst = babelParser.parse(fileContent, { sourceType: 'module' });
      const newServeStr = `export const ${serviceName} = new CreateService({baseURL, service: '${servicePath}'})`
      const newServeAst = babelParser.parse(newServeStr, { sourceType: 'module' });
      babelTraverse.default(apiAst, {
        Program: {
          enter(path) {
            const {node} = path
            const _node = newServeAst.program.body[0]
            _node.loc.start.line = node.loc.end.line
            _node.loc.end.line = node.loc.end.line
            node.body.push(_node)
          }
        }
      })
      fileContent = babelGenerator.default(apiAst, {retainLines: true, jsonCompatibleStrings: true}).code
    } else {
      fileContent = `import req, {CreateService} from '@/request'
const baseURL = '/${moduleName}'

export const ${serviceName} = new CreateService({baseURL, service: '${servicePath}'})
`     
      const apiPath = path.join(vscode.workspace.rootPath, 'src/request/index.js')
      const apiStr = fs.readFileSync(apiPath, 'utf-8')
      const apiAst = babelParser.parse(apiStr, { sourceType: 'module' });
      const newServeStr = `export * from './apis/${moduleName}'`
      const newServeAst = babelParser.parse(newServeStr, { sourceType: 'module' });
      babelTraverse.default(apiAst, {
        Program: {
          enter(path) {
            const {node} = path
            node.body.push(newServeAst.program.body[0])
          }
        }
      })
      const {code} = babelGenerator.default(apiAst)
      fs.writeFileSync(apiPath, code)
    }
    fs.writeFileSync(filePath, fileContent)
  }

  addView({serviceName, moduleName, fileName}) {
    const filePath = path.join(__dirname, '../../layout_tmp/list.vue')
    let fileContent = fs.readFileSync(filePath, 'utf-8')
    fileContent = fileContent.replaceAll('msgBusinessParam', serviceName)
    const writePath = path.join(vscode.workspace.rootPath, `src/views/${moduleName}/${fileName}/index.vue`)
    fs.createFileSync(writePath)
    fs.writeFileSync(writePath, fileContent)
  }
}