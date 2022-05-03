const serialize = (() => {
  const symbolRegistry = new Map()
  let i = 0

  return symbol => {
    if (symbolRegistry.has(symbol)) {
      return symbolRegistry.get(symbol)
    }

    const symbolData = {
      type: 'symbol',
      id: i++,
      key: symbol.toString().replace(/^Symbol\((.*?)\)$/g, '$1')
    }

    symbolRegistry.set(symbol, symbolData)

    return symbolData
  }
})()

const deserialize = (() => {
  const symbolRegistry = new Map()

  return ({ key, id }) => {
    if (!symbolRegistry.has(id)) {
      symbolRegistry.set(id, Symbol(key))
    }

    return symbolRegistry.get(id)
  }
})()

const s = Symbol('test')

console.log(deserialize(serialize(s)) === deserialize(serialize(s)))