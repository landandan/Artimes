/**
 * 生成Artimes shell脚本
 * 该脚本生成的为统一模板，自动过滤周六周日
 * @type
 */
const moment = require('moment')
const _ = require('lodash')
const fs = require('fs')

const appId = 'SXAPP' // 项目
const startDate = '' // 起始日期 例 2017-07-05
const endDate = '' // 截止日期 例 2017-10-01
const des = '寿险APP开发' // 描述
const start = '08:30' // 上班时间
const end = '17:30' // 下班时间
const ticketId = '' // 需求号: 例 I13-151201-7
const Cookie = '' // cookie 需登录网站获取 例 8DBA06CA87781260C2023475912DF745
const username = '' // 用户名 例 zhuyucai
const urole = '' // 不知道 建议登录网站获取下 例 %E5%85%B6%E4%BB%96%2C
const url = 'http://58.246.39.26:10036' // 根据实际地址更改

const startToEnd = moment(endDate).diff(moment(startDate), 'days')
const curlStr = _.range(startToEnd).map((i) => {
  const current = moment(startDate).add(i, 'day')
  const dayOfweek = current.days()
  const week = current.startOf('isoweek').format('YYYY-MM-DD')
  const workDate = current.format('YYYY-MM-DD')

  const _hours = moment.duration(end).subtract(start).asHours()
  const hours = Math.round(_hours * 10)/10 - 1
  if(dayOfweek < 6){
    return [`curl '${url}/Artimes/app/addorEdit' `,
      `-H 'Cookie: JSESSIONID=${Cookie}; password=; rempwd=; username=${username}; urole=${urole}' `,
      `-H 'Origin: ${url}' -H 'Accept-Encoding: gzip, deflate' -H 'Accept-Language: zh-CN,zh;q=0.8,en;q=0.6' `,
      `-H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36' `,
      `-H 'Content-Type: application/json; charset=UTF-8' -H 'Accept: application/json, text/javascript, */*; q=0.01' `,
      `-H '${url}/Artimes/app/index' -H 'X-Requested-With: XMLHttpRequest' `,
      `-H 'Connection: keep-alive' --data-binary `,
      `$'[{"app_id":"${appId}","ticket_id":"${ticketId}","plan":true,"daily":true,"type":"Others",`,
      `"time":"${hours}","desc":"${des}","dayOfweek":${dayOfweek},"week":"${week}","timesheetId":"n0",`,
      `"startTime":"${start}","endTime":"${end}","workDate":"${workDate}T00:00:00.000Z"}]' --compressed`].join('')
  }
}).join('\n')

fs.writeFile('./same.sh', curlStr, function(err){
  if(err) console.log('写文件Same操作失败');
  else console.log('写文件Same操作成功');
});