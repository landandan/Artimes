/**
 * 生成Artimes shell脚本
 * 该脚本生成的为统一模板，自动过滤周六周日
 * @type
 */
const _ = require('lodash')
const moment = require('moment')
const superagent = require('superagent')

// 已下均为必填项
const appId = 'SXAPP' // 项目
const startDate = '' // 起始日期 例 2017-07-05
const endDate = '' // 截止日期 例 2017-10-01
const des = '寿险APP开发' // 描述
const start = '08:30' // 上班时间
const end = '17:30' // 下班时间
const host = '58.246.39.26:15936' // 根据实际地址更改
const origin = 'http://' + host
let loginData = {
  rempwd: false,
  username: '', // 用户名 例 zhuyucai
  password: '', // 登录密码
}

const url = {
  login: origin + '/Artimes/app/login',
  index: origin + '/Artimes/app/index',
  addorEdit: origin + '/Artimes/app/addorEdit',
  getValueForName: origin + '/Artimes/app/getValueForName',
  getApplicationAndTickets: origin + '/Artimes/app/getApplicationAndTickets',
}

let base_headers = {
  'Host': host,
  'Origin': origin,
  'Connection': 'keep-alive',
  'X-Requested-With': 'XMLHttpRequest',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36',
  'Accept-Encoding': 'gzip, deflate',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Accept': 'application/json, text/javascript, */*; q=0.01',
}

const excludeTickets = ["Learn", "meeting", "plan", "PM", "UI"] // SXAPP 排除的列表

function getDate(workDate) {
  const current = moment(workDate)
  const dayOfweek = current.days()
  const week = current.startOf('isoweek').format('YYYY-MM-DD')

  const _hours = moment.duration(end).subtract(start).asHours()
  const hours = Math.round(_hours * 10) / 10 - 1
  return {
    dayOfweek,
    week,
    hours,
  }
}

function getApplicationAndTickets(cookie) {
  return new Promise(function (resolve, reject) {
    //传入cookie
    superagent.post(url.getApplicationAndTickets)
      .set(base_headers)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set("Cookie", cookie)
      .end(function (err, res) {
        let tickets = _.filter((res.body[appId] || []), (v) => !_.includes(excludeTickets, v))
        resolve(tickets)
      });
  });
}

//访问登录接口获取cookie
function getLoginCookie() {
  return new Promise(function (resolve, reject) {
    superagent.post(url.login)
      .set(base_headers)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send(loginData).redirects(0).end(function (err, response) {
      //获取cookie
      const cookie = response.headers["set-cookie"];
      resolve(cookie)
    });
  });
}

function addorEdit(cookie, tickets, workDate) {
  return new Promise(function (resolve, reject) {
    const { dayOfweek, week, hours } = getDate(workDate)
    const nextDay = moment(workDate).add(1, 'day').format('YYYY-MM-DD')
    if ( dayOfweek < 6 ) {
      const ticketId = tickets[Math.floor(Math.random() * (tickets.length - 1))].trim()
      superagent.post(url.addorEdit)
        .set(base_headers)
        .set('Content-Type', 'application/json; charset=UTF-8')
        .set("Cookie", cookie)
        .set('Referer', url.index)
        .send(JSON.stringify([{
          "app_id": appId,
          "ticket_id": ticketId,
          "plan": true,
          "daily": true,
          "type": "Others",
          "time": hours.toString(),
          "desc": des,
          "dayOfweek": dayOfweek,
          "week": week,
          "timesheetId": "n0",
          "startTime": start,
          "endTime": end,
          "workDate": workDate + "T00:00:00.000Z"
        }]))
        .end(function (err, res) {
          if ( res.status == 200 ) {
            resolve(res)
            console.log(workDate + ' 成功！')
            if ( workDate !== endDate ) {
              addorEdit(cookie, tickets, nextDay)
            } else {
              console.log('添加完毕，请登录网站查看！')
            }
          } else {
            reject(res)
            console.log(workDate + ' 失败！')
          }
        });
    } else {
      addorEdit(cookie, tickets, nextDay)
    }
  })
}

getLoginCookie().then((cookie) => {
  getApplicationAndTickets(cookie).then((tickets) =>
    addorEdit(cookie, tickets, startDate))
})