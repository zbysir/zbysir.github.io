// Write by GPT4
// 帮我使用 js 代码实现一个方法，可以将带有缩进的文字转为 json
// json 格式为：{id: "Golang", children: [{id:"框架", children: []}]}
function textToJson(text) {
  const lines = text.split('\n');
  const root = {id: 'root', children: []};
  let currentNode = root;
  let currentIndentation = 0;

  for (let line of lines) {
    const indentation = line.search(/\S/);
    line = line.trim();

    if (line.length === 0) continue;

    const node = {id: line, children: []};

    if (indentation === currentIndentation) {
      currentNode.children.push(node);
    } else if (indentation > currentIndentation) {
      currentNode = currentNode.children[currentNode.children.length - 1];
      currentNode.children.push(node);
    } else {
      while (indentation < currentIndentation) {
        currentNode = getParent(root, currentNode.id);
        currentIndentation -= 4;
      }
      currentNode.children.push(node);
    }

    currentIndentation = indentation;
  }

  return root.children;
}

function getParent(node, id) {
  var result;
  if (node.children.length > 0) {
    for (var i = 0; i < node.children.length; i++) {
      if (node.children[i].id === id) {
        return node;
      } else {
        result = getParent(node.children[i], id);
        if (result != null) {
          return result;
        }
      }
    }
  }
  return result;
}

const text = `
Golang
    框架
Vue
    原理
`;

console.log(JSON.stringify(textToJson(text), null, 4));