const { scrypt, createCipheriv, createDecipheriv, randomBytes } = require('crypto')

const encrypt = (key, data) => {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)

  return Buffer.concat([
    cipher.update(data),
    cipher.final(),
    iv,
    cipher.getAuthTag()
  ])
}

const decrypt = (key, ciphertext) => {
  const data = ciphertext.subarray(0, -28)
  const iv = ciphertext.subarray(-28, -16)
  const authTag = ciphertext.subarray(-16)
  const decipher = createDecipheriv('aes-256-gcm', key, iv)

  decipher.setAuthTag(authTag)

  return Buffer.concat([
    decipher.update(data),
    decipher.final()
  ])
}

scrypt('aaav', randomBytes(16), 32, (err, derivedKey) => {
  const ciphertext = encrypt(derivedKey, Buffer.from('Hello, World!', 'utf8'))

  console.log(decrypt(derivedKey, ciphertext).toString('utf8'))
})