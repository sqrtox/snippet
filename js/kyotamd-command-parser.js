const debug = {
  encloseString: input => `\`${input}\``
}

const parseCommandName = (input, start, offset = undefined) => {
  let commandName = ''

  for (let i = start, len = input.length, char = input[i]; i < len; char = input[++i]) {
    if (/^\s$/.test(char)) {
      break
    }

    commandName += char
  }

  return {
    type: 'Identifier',
    start: typeof offset === 'undefined' ? start : offset + start,
    end: typeof offset === 'undefined' ? start + commandName.length : start + commandName.length + offset,
    name: commandName
  }
}

const bracketsPair = {
  '(': ')',
  '{': '}'
}

const parseCommand = (input, start) => {
  const commandName = parseCommandName(input, start)
}

const parseBrackets = (input, start, [bracketsStart, bracketsEnd]) => {
  let result = ''
  let bracketsCount = 1

  for (
    let i = start + 1,
    char = input[i],
    len = input.length;
    i < len;
    char = input[++i]
  ) {
    if (char === bracketsStart) {
      bracketsCount++
    } else if (char === bracketsEnd) {
      if (!--bracketsCount) {
        break
      }
    }

    result += char
  }

  if (bracketsCount) {
    throw new SyntaxError('Unclosed brackets')
  }

  return result
}

const util = require('util')

console.log(util.inspect(parseCommand('add 100 1234 (   add 800 10)', 0, false), false, Infinity, true))