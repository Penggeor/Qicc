// ==UserScript==
// @name         QCC Crawler
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      0.1.0
// @description  try to take over the world!
// @author       You
// @match        https://www.qcc.com/*
// ==/UserScript==

//引入Vue
let script = document.createElement('script')
script.setAttribute('type', 'text/javascript')
// script.src = 'https://cdn.jsdelivr.net/npm/vue@next'
script.src= 'https://unpkg.com/vue'
document.documentElement.appendChild(script)
//引入element-plus的CSS样式文件
let link = document.createElement('link')
link.setAttribute('rel', 'stylesheet')
link.href = 'https://unpkg.com/element-plus/dist/index.css'
document.documentElement.appendChild(link)
//引入element-plus的JS文件
let elscript = document.createElement('script')
elscript.setAttribute('type', 'text/javascript')
elscript.src = 'https://unpkg.com/element-plus'
document.documentElement.appendChild(elscript)

// 常量
const localStorageBaseKey = 'qcc-crawler'
const localStorageCacheKey = localStorageBaseKey + '-cache'
const localStorageSearchCompanyKey = localStorageBaseKey + '-search-company'

window.onload = () => {
  const getPersistanceJSON = (key) => {
    const _cache = localStorage.getItem(key)
    return JSON.parse(_cache)
  }
  const setPersistanceJSON = (key, value) => {
    return localStorage.setItem(key, JSON.stringify(value, null, 2))
  }
  const setPersistanceCompanyInfo = (companyInfo) => {
    setPersistanceJSON(`company:${companyInfo.currentCompany}`, companyInfo)
  }
  const jumpToCompany = (company) => {
    location.href = 'https://www.qcc.com/web/search?key=' + company
  }
  const _fetchCurrentCompany = (currentCompany) => {
    // 第一步，获取 class="maininfo" 的元素
    console.log('第一步，获取 class="maininfo" 的元素')
    const mainInfoDiv = document.querySelector('.maininfo')

    // 第二步，获取 class="title copy-value" 的元素
    console.log('第二步，获取 class="title copy-value" 的元素')
    const titleDiv = mainInfoDiv.querySelector('.title.copy-value')

    // console.log('第三步，拿到孙元素 <em> 的 innerText')
    // const searchMatchFirstCompany = titleDiv.querySelector('em').innerText
    // console.log('搜索第一条公司名称为：' + searchMatchFirstCompany)
    // 第三步，拿到孙元素的所有内容 <span data-v-73deb734=""><em>深圳市</em>菉华<em>科技有限责任公司</em></span>
    console.log(
      '第三步，拿到孙元素的所有内容 <span data-v-73deb734=""><em>深圳市</em>菉华<em>科技有限责任公司</em></span>'
    )
    const searchMatchFirstCompany = titleDiv.querySelector('span').innerText
    console.log('搜索第一条公司名称为：' + searchMatchFirstCompany)

    // 第一步：获取 class="search-cell" 下的 table 标签的第一个 tr
    console.log('第一步：获取 class="search-cell" 下的 table 标签的第一个 tr')
    const firstTr = document.querySelector('.search-cell table tr:first-child')
    console.log(firstTr)

    // 第二步，获取 class="relate-info" 的元素
    console.log('第二步，获取 class="relate-info" 的元素')
    const relateInfoDiv = firstTr.querySelector('.relate-info')
    console.log(relateInfoDiv)

    // 法人
    let legalPersonValue
    // 联系电话
    let phoneValue
    let emailValue
    let addressValue

    try {
      // 首先，在relateInfo ，首先找到下面的所有 span，然后其中一个 innerText 包含“法定代表人”的标签
      console.log(
        '找法人：在relateInfo ，首先找到下面的所有 span，然后其中一个 innerText 包含“法定代表人”的标签'
      )
      const legalPersonSpan = Array.from(
        relateInfoDiv.querySelectorAll('span')
      ).find((item) => item.innerText.includes('法定代表人'))
      console.log(legalPersonSpan)

      // 其次，提取法定代表人的值，legalPersonSpan 结构是这样的：<span data-v-49b21598="" class="f">法定代表人：<span data-v-49b21598="" class="val"><span data-v-49b21598=""><a href="https://www.qcc.com/pl/pr6aca2d52b140c7cda40f984ff9f6ae.html" target="_blank">张晓欢</a></span></span></span>
      console.log('找法人：提取法定代表人的值')
      legalPersonValue = legalPersonSpan.querySelector('.val a').innerText
      console.log(legalPersonValue)
    } catch (error) {
      console.log(error)
    }

    // 联系电话
    try {
      // 首先，在 relateInfo，首先找到下面的所有 span，然后其中一个 innerText 包含“电话”的标签
      console.log(
        '找电话：在relateInfo ，首先找到下面的所有 span，然后其中一个 innerText 包含“电话”的标签'
      )
      const phoneSpan = Array.from(relateInfoDiv.querySelectorAll('span')).find(
        (item) => item.innerText.includes('电话')
      )

      // 其次，提取电话的值，phoneSpan 结构是这样的：<span data-v-49b21598="" class="f">电话：<span data-v-49b21598="" class="val"><span data-v-078a50f2="" data-v-49b21598="" class="phone-status"><i data-v-078a50f2="" aria-label="icon: icon-icon_zuoji" class="phone-status-icon zuoji anticon anticon-icon-icon_zuoji aicon aicon-zuoji"><svg width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" class=""><use data-v-078a50f2="" xlink:href="#icon-icon_zuoji"></use></svg></i></span> <span data-v-49b21598="">13530180069</span></span><a data-v-49b21598="" class="ntag-v2">更多 <span data-v-49b21598="" class="count">4</span></a></span>
      console.log('找电话：提取电话的值')
      phoneValue = phoneSpan.querySelector('.val span:last-child').innerText
      console.log(phoneValue)
    } catch (error) {
      console.error(error)
    }

    // 邮箱
    try {
      // 首先，在 relateInfo，首先找到下面的所有 span，然后其中一个 innerText 包含“邮箱”的标签
      console.log(
        '找邮箱：在relateInfo ，首先找到下面的所有 span，然后其中一个 innerText 包含“邮箱”的标签'
      )
      const emailSpan = Array.from(relateInfoDiv.querySelectorAll('span')).find(
        (item) => item.innerText.includes('邮箱')
      )

      // 其次，提取邮箱的值，emailSpan 结构是这样的：<span data-v-49b21598="" class="f">邮箱：<a data-v-49b21598="" href="mailto:1006499736@qq.com" class="val">1006499736@qq.com</a><a data-v-49b21598="" class="ntag-v2 ntag-v2-primary">更多 <span data-v-49b21598="" class="count">2</span></a></span>
      console.log('找邮箱：提取邮箱的值')
      emailValue = emailSpan.querySelector('.val').innerText
      console.log(emailValue)
    } catch (error) {
      console.error(error)
    }

    // 地址
    try {
      // 首先，在 relateInfo，首先找到下面的所有 span，然后其中一个 innerText 包含“地址”的标签
      console.log(
        '找地址：在relateInfo ，首先找到下面的所有 span，然后其中一个 innerText 包含“地址”的标签'
      )
      const addressSpan = Array.from(
        relateInfoDiv.querySelectorAll('span')
      ).find((item) => item.innerText.includes('地址'))

      // 其次，提取地址的值，addressSpan 结构是这样的：<span data-v-49b21598="" class="f">地址：<span data-v-49b21598="" class="val"><span data-v-49b21598="" class="app-copy-box copy-hover-item" style="display: inline;"><span data-v-49b21598="" class="app-over-pop-text"><span><span data-v-49b21598="" class="max-address copy-value address-map">深圳市福田区福保街道福保社区福田保税区市花路3号花样年.福年广场B栋202-203</span></span></span> <span class="app-copy copy-button-item"><div class="base_copy"><!----> <span>复制</span></div></span></span></span></span><span data-v-49b21598="" class="f">地址：<span data-v-49b21598="" class="val"><span data-v-49b21598="">深圳市南山区南海大道1001号深圳湾科技生态园1栋A座</span></span></span>
      console.log('找地址：提取地址的值，addressSpan 的结构比较深')
      addressValue = addressSpan.querySelector('.max-address').innerText
      console.log(addressValue)
    } catch (error) {
      console.error(error)
    }

    return {
      currentCompany,
      searchMatchFirstCompany,
      legalPersonValue,
      phoneValue,
      emailValue,
      addressValue,
    }
  }
  const fetchCurrentCompany = (currentCompany, nextCompany) => {
    // 获取当前 key 参数并将其解密成对应的中文，比如 https://www.qcc.com/web/search?key=%E6%B7%B1%E5%9C%B3%E9%9B%86%E7%A7%80%E5%88%9B%E6%84%8F%E7%A7%91%E6%8A%80%E6%9C%89%E9%99%90%E5%85%AC%E5%8F%B8
    // 将 key 参数解密成 “深圳集秀创意科技有限公司”
    const key = decodeURI(location.href.split('=')[1])
    console.log('URL 上的公司名为：' + key)

    try {
      const companyInfo = _fetchCurrentCompany(currentCompany)
      console.log('当前公司信息：', companyInfo)
      setPersistanceCompanyInfo(companyInfo)
    } finally {
      // 跳转到下一个公司
      if (nextCompany) {
        setPersistanceJSON(localStorageCacheKey, {
          status: Status.Downloading,
          nextCompany,
        })
        setTimeout(() => {
          jumpToCompany(nextCompany)
        }, Math.random() * 2000)
      } else {
        setPersistanceJSON(localStorageCacheKey, {
          status: Status.Finished,
        })
        console.log('已经到最后一个公司了')
        mergeAllCompanyData()
        formatData()
      }
    }
  }
  const mergeAllCompanyData = () => {
    // 从 localStorage 中获取所有公司的数据，以 company: 开头的 key
    const keys = Object.keys(localStorage).filter((item) =>
      item.startsWith('company:')
    )
    console.log('所有公司的 key：', keys)
    const values = keys.map((key) => getPersistanceJSON(key))
    console.log('所有公司的 value：', values)
    const csv = values
      .map((item) => {
        return [
          item.currentCompany,
          item.searchMatchFirstCompany,
          item.legalPersonValue,
          item.phoneValue,
          item.emailValue,
          item.addressValue,
        ].join(',')
      })
      .join('\n')
    // 第一列加上列名
    const csvWithColumnName =
      '当前公司,搜索匹配第一条公司,法人,联系电话,邮箱,地址\n' + csv

    // 下载下来
    const a = document.createElement('a')
    // a.download = 'company.csv'
    // 名字为第一个公司名 + 最后一个公司名
    a.download = values[0].currentCompany + '-' + values[values.length - 1].currentCompany + '.csv'
    a.href = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(csvWithColumnName)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // 清理 localStorage
    keys.map((key) => localStorage.removeItem(key))
    localStorage.removeItem(localStorageCacheKey)
  }
  const formatData = () => {
    console.log('开始格式化数据')
    console.log('清理 localStorage cache')
    localStorage.removeItem(localStorageCacheKey)
    console.log('清理 localStorage search company')
    const keys = Object.keys(localStorage).filter((item) =>
      item.startsWith('company:')
    )
    keys.map((key) => localStorage.removeItem(key))
    console.log('清理 localStorage search company')
    localStorage.removeItem(localStorageSearchCompanyKey)
  }

  const Status = {
    Pending: 'Pending',
    Downloading: 'Downloading',
    Finished: 'Finished',
  }

  let text = `<div id="app">
  <el-text class="mx-1">输入公司名，按行分割</el-text>
  <el-input
    v-model="textarea"
    :rows="4"
    type="textarea"
    placeholder="输入公司名，按行分割"
    resize
  ></el-input>
  <el-button @click="click">{{ status === "Downloading"? "下载中" : "开始下载" }}</el-button>
  <el-button @click="formatData">一键清空所有数据【出错时使用】</el-button>
</div>
<style>
  #app {
    position: absolute;
    z-index: 9999;
    top: 1rem;
    left: 1rem;
    background: white;
    width: 40vw;
    padding: 1rem;
    border-radius: 1rem;
    border: 1px solid #ccc;
  }
</style>
`
  var el = document.createElement('div')
  el.innerHTML = text
  document.body.append(el)

  const App = {
    data() {
      const cache = getPersistanceJSON(localStorageCacheKey)
      console.log('缓存标志', JSON.stringify(cache, null, 2))

      let searchCompanyList
      let currentCompany
      let nextCompany
      console.log(cache?.status && cache.status === Status.Downloading)
      if (cache?.status && cache.status === Status.Downloading) {
        searchCompanyList = getPersistanceJSON(localStorageSearchCompanyKey)
        console.log(
          '待搜索公司列表',
          JSON.stringify(searchCompanyList, null, 2)
        )
        currentCompany = cache?.nextCompany
        console.log('当前公司', currentCompany)
        const currentCompanyIndex = searchCompanyList?.findIndex(
          (item) => item === currentCompany
        )
        nextCompany = searchCompanyList[currentCompanyIndex + 1]
        console.log('下一个公司', nextCompany)

        fetchCurrentCompany(currentCompany, nextCompany)
      }

      return {
        status: cache?.status ?? Status.Pending, // 'Pending' | 'Downloading' | 'Finished'
        textarea: '',
        currentCompany: currentCompany ?? '',
        nextCompany: nextCompany ?? '',
      }
    },
    methods: {
      click() {
        if (this.textarea === '') {
          alert('请输入公司名')
          return
        }

        this.downloadCompany(this.textarea)
      },
      downloadCompany(companyString) {
        const company = companyString.split('\n')
        console.log('公司列表：', JSON.stringify(company, null, 2))
        setPersistanceJSON(localStorageSearchCompanyKey, company)
        const cache = {
          status: Status.Downloading,
          nextCompany: company[0],
        }
        setPersistanceJSON(localStorageCacheKey, cache)
        jumpToCompany(cache.nextCompany)
      },
    },
  }
  const app = Vue.createApp(App)
  app.use(ElementPlus)
  app.mount('#app')
}
