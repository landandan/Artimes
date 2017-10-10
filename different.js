
const moment = require('moment')
const fs = require('fs')

const appId = 'SXAPP' // 项目
const ticketId = 'I13-151201-7' // 需求号
const Cookie = '' // cookie 需登录网站获取
const username = '' // 用户名
const urole = '' // 不知道 建议登录网站获取下
const url = 'http://58.246.39.26:10036'

const data = [{
  desc:"新版寿险APP开发",
  date: "2017.10.10",
  start: "08:30",
  end: "22:30",
}]

let overtimeDate = ''

const differentStr = data.map((input) => {
  const dayOfweek = moment(input.date, 'YYYY.MM.DD').days()
  const week = moment(input.date, 'YYYY.MM.DD').startOf('isoweek').format('YYYY-MM-DD')
  const workDate = moment(input.date, 'YYYY.MM.DD').format('YYYY-MM-DD')

  const _hours = moment.duration(input.end).subtract(input.start).asHours()
  let hours = Math.round(_hours * 10)/10 - 1
  let isOverTime = false
  let endTime = input.end
  if(hours > 8 && moment.duration('08:30').subtract(input.start).asHours() >= 0 &&
    !moment(input.date, 'YYYY.MM.DD').isSame(overtimeDate)){
    console.log('needOverTime')
    hours = 8
    overtimeDate = input.date
    isOverTime = true
    endTime = moment(input.start, 'HH:mm').add(9, 'h').format('HH:mm')
  }
  let curlStr = [`curl '${url}/Artimes/app/addorEdit' `,
    `-H 'Cookie: JSESSIONID=${Cookie}; password=; rempwd=; username=${username}; urole=${urole}' `,
    `-H 'Origin: ${url}' -H 'Accept-Encoding: gzip, deflate' -H 'Accept-Language: zh-CN,zh;q=0.8,en;q=0.6' `,
    `-H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36' `,
    `-H 'Content-Type: application/json; charset=UTF-8' -H 'Accept: application/json, text/javascript, */*; q=0.01' `,
    `-H '${url}/Artimes/app/index' -H 'X-Requested-With: XMLHttpRequest' `,
    `-H 'Connection: keep-alive' --data-binary `,
    `$'[{"app_id":"${appId}","ticket_id":"${ticketId}","plan":true,"daily":true,"type":"Others",`,
    `"time":"${hours}","desc":"${input.desc}","dayOfweek":${dayOfweek},"week":"${week}","timesheetId":"n0",`,
    `"startTime":"${input.start}","endTime":"${endTime}","workDate":"${workDate}T00:00:00.000Z"}]' --compressed`].join('')
  if(isOverTime){
    const overTimeLength = Math.round(_hours * 10)/10 - 10
    const startTime = moment(input.start, 'HH:mm').add(10, 'h').format('HH:mm')
    curlStr += [`\ncurl '${url}/Artimes/app/addorEdit' `,
      `-H 'Cookie: JSESSIONID=${Cookie}; password=; rempwd=; username=${username}; urole=${urole}' `,
      `-H 'Origin: ${url}' -H 'Accept-Encoding: gzip, deflate' -H 'Accept-Language: zh-CN,zh;q=0.8,en;q=0.6' `,
      `-H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36' `,
      `-H 'Content-Type: application/json; charset=UTF-8' -H 'Accept: application/json, text/javascript, */*; q=0.01' `,
      `-H '${url}/Artimes/app/index' -H 'X-Requested-With: XMLHttpRequest' `,
      `-H 'Connection: keep-alive' --data-binary `,
      `$'[{"app_id":"${appId}","ticket_id":"${ticketId}","plan":true,"daily":false,"type":"Others",`,
      `"time":"${overTimeLength}","desc":"${input.desc}","dayOfweek":${dayOfweek},"week":"${week}","timesheetId":"n1",`,
      `"startTime":"${startTime}","endTime":"${input.end}","workDate":"${workDate}T00:00:00.000Z"}]' --compressed`].join('')
  }
  return curlStr
}).join('\n')

fs.writeFile('./different.sh', differentStr, function(err){
  if(err) console.log('写文件Different操作失败');
  else console.log('写文件Different操作成功');
});