const { sqrt, atan2, abs } = Math

let x0 = 0
let x1 = 0
let y0 = 0
let y1 = 0

const l = document.createElement('div')

l.classList.add('l')

document.body.append(l)

document.body.addEventListener('mousedown', ev => {
    x0 = ev.pageX
    y0 = ev.pageY

    const mmove = ev => {
        x1 = ev.pageX
        y1 = ev.pageY

        const xLen = x0 - x1
        const yLen = y0 - y1
        const xOffset = xLen < 0 ? x0 : x0 - xLen
        const yOffset = yLen < 0 ? y0 : y0 - yLen

        l.style.left = xOffset
        l.style.top = yOffset
        const isOverflowX = x1 + 1 >= window.innerWidth
        const isOverflowY = y1 + 1 >= window.innerHeight

        l.style.width = isOverflowX
            ? window.innerWidth - (xOffset + 2)
            : abs(xLen)

        l.style.height = isOverflowY
            ? window.innerHeight - (yOffset + 3)
            : abs(yLen)

        l.classList.remove('hide')
    }
    const mup = () => {
        document.body.removeEventListener('mouseup', mup)
        document.body.removeEventListener('mousemove', mmove)
        l.classList.add('hide')
    }

    document.body.addEventListener('mouseup', mup)
    document.body.addEventListener('mouseenter', ev => {
        console.log(ev)
    })
    document.body.addEventListener('mousemove', mmove)
})