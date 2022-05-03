const axios = require('axios')
const UserAgent = require('user-agents')
const { JSDOM } = require('jsdom')

const weatherResolve = {
  100: '晴れ',
  500: '晴れ',
  600: '晴れ',
  200: '曇り',
  300: '雨',
  400: '雪',
  800: '雷'
}

const getWeather = async () => {
  const { data } = await axios.get('https://weathernews.jp/onebox/35.691667/139.750000/q=%E6%9D%B1%E4%BA%AC', {
    headers: {
      'User-Agent': new UserAgent([/Chrome/, {
        deviceCategory: 'desktop',
        platform: 'Win32'
      }]).toString()
    }
  })
  const { window: { document } } = new JSDOM(data)

  const group = document.querySelectorAll('#flick_list > .wTable__group')

  const days = {}

  for (const e of group) {
    const hoursGroup = e.getElementsByClassName('wTable__row')

    const hours = {}

    for (const e of hoursGroup) {
      const h = e.getElementsByClassName('time')[0].textContent
      const i = e.getElementsByClassName('wIcon')[0].src

      hours[h] = {
        weather: weatherResolve[i.match(/\/(\d+)\.[a-z]+$/)[1]],
        temperature: Number(e.getElementsByClassName('t')[0].textContent.match(/\d+/)[0])
      }
    }

    days[e.querySelector('.wTable__day').textContent.match(/\d+/)[0]] = hours
  }

  console.log(days)
}

getWeather()