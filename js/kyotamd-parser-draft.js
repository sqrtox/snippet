//@ts-check

/**
 * @param {string} input
 * @param {number} start
 */
const parseCallee = (input, start, offset = 0) => {
  let commandName = ''
  const inputLength = input.length

  for (let i = start; i < inputLength; i++) {
    const char = input[i]

    if (/^\s$/.test(char)) {
      break
    }

    commandName += char
  }

  return /** @type {const} */ ({
    type: 'Identifier',
    start: start + offset,
    end: start + commandName.length + offset,
    name: commandName
  })
}

const skipWhitespace = (input, start) => {
  let pos = start

  if (/^\s$/.test(input[start])) {
    const inputLength = input.length

    while (pos < inputLength) {
      if (/^\S$/.test(input[pos])) {
        break
      }

      pos++
    }
  }

  return pos
}

const parseNumber = (input, start, offset = 0) => {
  let token = ''
  const inputLength = input.length
  let isFloat = false

  for (let i = start; i < inputLength; i++) {
    const char = input[i]

    if (char === '.') {
      if (!token.length || token[token.length - 1] === '.') {
        throw new SyntaxError('Unexpected token')
      }

      isFloat = true
    } else if (/^\s$/.test(char)) {
      break
    } else if (/^\D$/.test(char)) {
      throw new SyntaxError('Invalid or unexpected token')
    }

    token += char
  }

  if (token[token.length - 1] === '.') {
    throw new SyntaxError('Unexpected token')
  }

  return {
    type: 'Literal',
    start: start + offset,
    end: start + token.length + offset,
    raw: token,
    implicit: false,
    value: isFloat ? parseFloat(token) : parseInt(token)
  }
}

const parseString = (input, start, offset = 0) => {
  let raw = '"'
  let value = ''
  const inputLength = input.length

  for (let i = start + 1; i < inputLength; i++) {
    const char = input[i]

    raw += char

    if (char === '\\') {
      const nextChar = input[++i]

      raw += nextChar

      switch (nextChar) {
        case 'n': {
          value += '\n'

          break
        }

        default: {
          value += nextChar

          break
        }
      }

      continue
    }

    if (char === '"') {
      break
    }

    value += char
  }

  return {
    type: 'Literal',
    start: start + offset,
    raw,
    value,
    end: start + raw.length + offset,
    implicit: false
  }
}

const parseBrackets = (input, start, bracketsStart, bracketsEnd) => {
  let command = ''
  let bracketsCount = 1
  const inputLength = input.length

  for (let i = skipWhitespace(input, start + 1); i < inputLength; i++) {

    const char = input[i]

    if (char === bracketsStart) {
      bracketsCount++
    } else if (char === bracketsEnd) {
      if (!--bracketsCount) {
        break
      }
    }

    command += char
  }

  return {
    command,
    skipped: skipWhitespace(input, start + 1) - (start + 1)
  }
}

const bracketsPair = {
  '(': ')',
  '{': '}'
}

const parseCommand = (input, start, lazy = false, offset = 0, statement = true) => {
  const callee = parseCallee(input, start, offset)
  const inputLength = input.length
  let pos = callee.end - offset
  const args = []

  for (; pos < inputLength; pos++) {
    pos = skipWhitespace(input, pos)

    const char = input[pos]
    const bracketsEnd = bracketsPair[char]

    if (bracketsEnd) {
      const parsed = (
        parseBrackets(input, pos, char, bracketsEnd)
      )
      const cmd = parseCommand(parsed.command, 0, char === '{', pos + 1 + parsed.skipped, false)

      pos += parsed.command.length + 2 + parsed.skipped

      args.push(cmd)

      continue
    }

    if (char === '"') {
      const literal = parseString(input, pos, offset)

      args.push(literal)
      pos = literal.end - offset

      continue
    }

    if (/^\d$/.test(char)) {
      const literal = parseNumber(input, pos, offset)

      args.push(literal)
      pos = literal.end - offset

      continue
    }

    const tokenStart = pos
    let token = ''

    while (pos < inputLength) {
      const char = input[pos]

      if (/^\s$/.test(char)) {
        break
      }

      token += char
      pos++
    }

    const makeLiteral = (value, raw, implicit = false) => ({
      type: 'Literal',
      start: tokenStart + offset,
      end: tokenStart + raw.length + offset,
      value,
      implicit,
      raw
    })

    if (token === 'true' || token === 'false') {
      args.push(makeLiteral(token === 'true', token))

      continue
    }

    if (token === 'null') {
      args.push(null, token)

      continue
    }

    args.push(makeLiteral(token, token, true))
  }

  return {
    type: statement ? 'CommandStatement' : 'CommandExpression',
    lazy,
    start: start + offset,
    end: start + (pos - 1) + offset,
    callee,
    arguments: args
  }
}

const parse = input => {
  const inputLength = input.length
  const body = []

  for (let i = 0; i < inputLength; i++) {
    const char = input[i]

    if (/^\s$/.test(char)) {
      continue
    }

    const commandStart = i
    let command = ''

    while (i < inputLength) {
      const char = input[i]

      if (char === '\n') {
        break
      }

      i++
      command += char
    }

    body.push(parseCommand(command, 0, false, commandStart))
  }

  return {
    type: 'Program',
    start: 0,
    end: inputLength,
    body
  }
}

/*const varMap = {}
const labelMap = {}

const commands = {
  'set': (_node, key, value) => {
    varMap[key] = value

    return value
  },
  'get': (_node, key) => {
    return varMap[key]
  },
  'add': (_node, a, b) => a + b,
  '#': () => { },
  ':': (node, key) => {
    labelMap[key] = node
  },
  'if': async (_node, condFn, cmdFn) => {
    const cond = typeof condFn === 'function' ? await condFn() : condFn

    if (cond && typeof cmdFn === 'function') {
      await cmdFn()
    }

    return cond
  },
  'print': (_node, v) => {
    console.log(v)
  },
  'str': (_node, v) => String(v),
  'geq': (_node, a, b) => a >= b,
  'goto': () => { }
}

const run = async node => {
  if (node.value.type === 'Literal') {
    return node.value.value
  }

  if (node.value.lazy) {
    return (() => {
      node.value.lazy = false
      run(node) ?? null
    })
  }

  const args = []

  for (const arg of node.value.arguments) {
    args.push(await run(arg) ?? null)
  }

  const f = commands[node.value.callee.name]

  if (!f) {
    throw new ReferenceError(`${node.value.callee.name} is not defined`)
  }

  return f(node, ...args)
}

const toList = array => {
  const len = array.length
  const firstNode = {
    prev: null,
    value: array[0],
    next: null
  }
  let node = firstNode

  for (let i = 1; i < len; i++) {
    node.next = {
      prev: node,
      value: array[i],
      next: null
    }

    node = node.next
  }

  return firstNode
}

const exec = async code => {
  const parsed = parse(code)
  let result = null
  const nodeList = toList(parsed.body)
  let node = nodeList

  while (node.next) {
    result = await run(node)

    node = node.next
  }

  return result
}*/

/*const vars = {}
const labels = {}
const gotoEof = Symbol()
const actions = {
  '#': () => null,
  'geq': (_ctx, a, b) => {
    return a >= b
  },
  'print': (_ctx, v) => console.log(v),
  'str': (_ctx, v) => String(v),
  'if': async (_ctx, condArg, cmdArg) => {
    const cond = typeof condArg === 'function' ? await condArg() : condArg

    if (cond && typeof cmdArg === 'function') {
      await cmdArg()
    }

    return cond
  },
  'set': (_ctx, key, op, value) => {
    if (op !== '=') {
      actions.get(null, key)
    }

    switch (op) {
      case '=': {
        vars[key] = value

        break
      }

      case '+': {
        vars[key] += value

        break
      }

      case '-': {
        vars[key] -= value

        break
      }

      case '*': {
        vars[key] *= value

        break
      }

      case '/': {
        vars[key] /= value

        break
      }

      case '%': {
        vars[key] %= value

        break
      }

      case '**': {
        vars[key] **= value

        break
      }

      default: {
        throw new SyntaxError('Unknown assignment order')

        break
      }
    }

    return vars[key]
  },
  'get': (_ctx, key) => {
    const value = vars[key]

    if (typeof value === 'undefined') {
      throw new ReferenceError(`${key} is not defined`)
    }

    return value
  },
  ':': (ctx, label) => {
    labels[label] = ctx.listNode

    return null
  },
  'goto': (ctx, label) => {
    if (label === 'eof') {
      throw gotoEof
    }

    ctx.setNode(labels[label])

    return null
  }
}*/

const toList = values => {
  let firstListNode
  let listNode

  for (const [i, value] of values.entries()) {
    if (!i) {
      firstListNode = listNode = {
        value,
        next: {
          next: null,
          value: null
        }
      }

      continue
    }

    listNode.next = {
      value,
      next: {
        next: null,
        value: null
      }
    }
    listNode = listNode.next
  }

  return firstListNode
}

/*const run = async (setNode, listNode, lazy = false) => {
  const astNode = listNode.value

  if (astNode.type === 'Literal') {
    return astNode.value
  }

  if (astNode.lazy && !lazy) {
    return () => run(setNode, listNode, true)
  }

  const calleeName = astNode.callee.name
  const action = actions[calleeName]

  if (!action) {
    throw new ReferenceError(`${calleeName} is not a command`)
  }

  const args = []
  let argListNode = toList(astNode.arguments).firstListNode

  while (argListNode.next) {
    args.push(await run(setNode, argListNode))
    argListNode = argListNode.next
  }

  return await action({ setNode, listNode }, ...args)
}

const exec = async code => {
  const astNode = parse(`${code}\n# eof`)
  let { firstListNode: listNode, lastListNode } = toList(astNode.body)
  let result = null
  const setNode = node => {
    listNode = node
  }

  //labels.eof = lastListNode

  while (listNode.next) {
    try {
      result = await run(setNode, listNode)
    } catch (e) {
      if (e === gotoEof) {
        result = null
        break
      } else {
        throw e
      }
    }
    listNode = listNode.next
  }

  return result
}*/

const { createHash } = require('crypto')

const hash = str => (
  createHash('md5').update(str).digest('hex')
)

const compileGoto = astNode => {
  const v = createHash('md5').update(astNode.arguments[0].value).digest('hex')

  return String.raw`continue label__user__${v};`
}

const compileSet = astNode => {
  return `vars.${hash(astNode.arguments[0].value)} = null;`
}

const compileLabel = listNode => {
  const v = hash(listNode.value.arguments[0].value)
  const c = []
  let node = listNode
  while (node.next) {
    const ast = node.value

    if (node !== listNode && ast.callee?.name === ':') {
      c.push(compileLabel(node))

      break
    }

    if (ast.callee?.name === 'goto') {
      c.push(`continue label__user__${v};`)
    } else if (ast.callee?.name === 'set') {
      c.push(compileSet(ast))
    }

    node = node.next
  }

  return String.raw`
  label__user__${v}: while (true) {
    ${c.join('\n')}
    break label__user__${v};
  }
  `
}

/*const compileLabel = astNode => {
  const v = createHash('md5').update(astNode.arguments[0].value).digest('hex')

  return () => String.raw`
  var label_done__user__${v} = false;
  label__user__${v}: while (true) {
      if (label_done__user__${v}) {
          break;
      }
      label_done__user__${v} = true;
  }
  `
}*/

const compile = code => {
  const astNode = parse(code)
  let listNode = toList(astNode.body)
  const compiled = []

  while (listNode.next) {
    if (listNode.value.callee?.name === 'goto') {
      compiled.push(compileGoto(listNode.value))
    }

    listNode = listNode.next
  }

  console.log(compiled.join('\n'))

  let result = String.raw`
  "use strict";
  var label_done__builtin__eof = false;
  label__builtin__eof: while (true) {
      if (label_done__builtin__eof) {
          break;
      }
      label_done__builtin__eof = true;
  }
  `

  return result
}

const CODE = String.raw`
set count = 0

: loop
  if {geq (get count) 10} {goto eof}
  print (get count)
  set count + 1
  goto loop
`


Promise.resolve(compileLabel(toList(parse(`: loop\nset count = 1\ngoto loop\n: loop_nest`).body))).then(result => {
  console.log(result)
})

/*exec(CODE).then(result => {
  console.log(varMap)
  console.log(result)
})*/