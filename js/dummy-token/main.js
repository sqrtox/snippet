'use strict'
{
  const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const NUMBER = '0123456789'
  const SIGN = '-_'
  const MFA_TOKEN_BODY = ALPHABET + NUMBER + SIGN
  const TOKEN_BODY_LAST = ALPHABET + NUMBER + SIGN

  const dateMinInput = /** @type {HTMLInputElement} */ (document.getElementById('date-min-input'))
  const dateMaxInput = /** @type {HTMLInputElement} */ (document.getElementById('date-max-input'))
  const now = new Date()
  dateMaxInput.value = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate()}`

  const getRandomIntInclusive = (min, max) => {
    const a = Math.ceil(min)
    const b = Math.floor(max)

    return Math.floor(Math.random() * (b - a + 1) + a)
  }
  const getRandomDate = () => new Date(getRandomIntInclusive(new Date(dateMaxInput.value).getTime(), new Date(dateMinInput.value).getTime()))
  const handleDateInputChange = ({ target }) => {
    const minDate = new Date(dateMinInput.value)
    const maxDate = new Date(dateMaxInput.value)

    if (maxDate < minDate) {
      if (target === dateMinInput) {
        dateMaxInput.value = dateMinInput.value
      } else {
        dateMinInput.value = dateMaxInput.value
      }
    }
  }

  dateMinInput.addEventListener('change', handleDateInputChange)
  dateMaxInput.addEventListener('change', handleDateInputChange)

  const createToken = () => {
    const createdAt = getRandomDate()
    const tokenBodyFirst = btoa(BigInt(createdAt.getTime() - 1420070400000) << 22n).replaceAll('=', '')
    const tokenBodyMiddleDataView = new DataView(new ArrayBuffer(4))

    tokenBodyMiddleDataView.setUint32(0, createdAt.getTime())

    const tokenBodyMiddle = base64js.fromByteArray(new Uint8Array(tokenBodyMiddleDataView.buffer)).replaceAll('+', '-').replaceAll('=', '').replaceAll('/', '_')
    let tokenBodyLast = ''

    while (tokenBodyLast.length < 27) {
      tokenBodyLast += TOKEN_BODY_LAST[Math.floor(Math.random() * TOKEN_BODY_LAST.length)]
    }

    return `${tokenBodyFirst}.${tokenBodyMiddle}.${tokenBodyLast}`
  }
  const createMfaToken = () => {
    let mfaTokenBody = ''

    while (mfaTokenBody.length < 84) {
      mfaTokenBody += MFA_TOKEN_BODY[Math.floor(Math.random() * MFA_TOKEN_BODY.length)]
    }

    return `mfa.${mfaTokenBody}`
  }

  const countInput = /** @type {HTMLInputElement} */ (document.getElementById('count-input'))
  const typeSelect = /** @type {HTMLInputElement} */ (document.getElementById('type-select'))
  const result = /** @type {HTMLTextAreaElement} */ (document.getElementById('result'))
  const createButton = /** @type {HTMLButtonElement} */ (document.getElementById('create-button'))
  const copyButton = /** @type {HTMLButtonElement} */ (document.getElementById('copy-button'))
  const handleResultInput = () => {
    result.rows = result.value.split('\n').length || 1
  }

  result.addEventListener('input', handleResultInput)
  handleResultInput()

  createButton.addEventListener('click', function () {
    var x = Number(countInput.value)

    if (!isFinite(x) || isNaN(x)) {
      return
    }

    result.value = ''

    var tokens = []

    while (tokens.length < x) {
      if (typeSelect.value === 'mfa') {
        tokens.push(createMfaToken())
      } else {
        tokens.push(createToken())
      }
    }

    result.rows = tokens.length || 1
    result.value = tokens.join('\n')
  })
  copyButton.addEventListener('click', () => {
    result.select()
    document.execCommand('copy')
  })
}