const unique = (() => {
  let id = 0

  return () => id++
})()

const objMap = new Map()

const serializeBigInt = x => {
}