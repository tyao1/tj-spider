import request from 'urllib';
import mongoose from 'mongoose';
import ensureComplete from './ensureComplete';
import User from './userModelHeibai';

// connect to the database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1/tjdata');

const headers = {
  'Cookie': 'bw_sessionid=1483182153_967d0aed844c4b387915_2731943#nmpcns',
  'Host': 'api.stuhui.com',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.93 Safari/537.' + Math.floor(Math.random() * 100),
};

// http://api.stuhui.com/openapi/util/util?content=123456&act=SendPmessage&to_userid=2111985%23vblsej&mode=white&clientid=2C38DFF7-A34C-4CA8-B620-8F9993861A2F&os=ios&version=5.1.0&sessionid=1483182153_967d0aed844c4b387915_2731943%23nmpcns

var currentSchool = 561;

async function reqNextNode(page) {
  const thisReq = request
    .request('http://api.stuhui.com/openapi/bbs/school', {
      method: 'GET',
      headers,
      data: {
        //sex: 0,
        schoolid: currentSchool,
        act: 'GetMySchoolUserList',
        clientid: '2C38DFF7-A34C-4CA8-B620-8F9993861A2F',
        version: '5.1.0',
        sessionid: '1483182153_967d0aed844c4b387915_2731943#nmpcns',
        page,
        os: 'ios',
      },
    });
  const result = await ensureComplete(thisReq);
  if (!result) {
    console.log('[request] No result');
    return;
  }

  let data = JSON.parse(result.data.toString());
  if (!data || data.errno) {
    console.log('[request] Failed to load');
    console.log(data);
    return;
  }
  console.log('[request] Success!', currentSchool + ':' + page);
  data = data.data;
  for (const rawUser of data.userinfo) {
    const {userid} = rawUser;
    let user;
    const findUser = await User.findOne({user_id: userid}).exec();
    if (findUser) user = findUser;
    else {
      user = new User();
    }
    // fetch user detail
    const thisReq = request
      .request('http://api.stuhui.com/openapi/bbs/topic', {
        method: 'GET',
        headers,
        data: {
          // sex: 0,
          // schoolid: 557,
          act: 'GetPersonInfo',
          targetid: userid,
          clientid: '2C38DFF7-A34C-4CA8-B620-8F9993861A2F',
          version: '5.1.0',
          sessionid: '1483182153_967d0aed844c4b387915_2731943#nmpcns',
          os: 'ios',
        },
      });
    const result = await ensureComplete(thisReq);
    if (!result) {
      console.log('[request] No result 2');
      continue;
    }

    let data = JSON.parse(result.data.toString());
    if (!data || data.errno) {
      console.log('[request] Failed to load 2');
      console.log(data);
      continue;
    }
    data = data.data;
    Object.keys(data).forEach(key => {
      user[key] = data[key];
    });
    await user.save();
    console.log(user.user_name);
  }
  if (data.islast === 'N') {
    reqNextNode(page + 1);
  } else {
    currentSchool++;
    reqNextNode(1);
  }
}

// reqNextNode(83);
// 3 1155
// http://api.stuhui.com/openapi/util/util?content=123456&act=SendPmessage&to_userid=2111985%23vblsej&mode=white&clientid=2C38DFF7-A34C-4CA8-B620-8F9993861A2F&os=ios&version=5.1.0&sessionid=1483182153_967d0aed844c4b387915_2731943%23nmpcns
const ads = [
  '同学你好！不知道你有没有看过这篇我们的微信推送：《感谢同济，让我们曾在最美好的年华遇到最有趣的灵魂》',
  'http://yun.tongji.edu.cn/Nk',
  '我是蜂房团队的一员，我们起早贪黑，搞了一个大四，终于我们的校园应用可以拿出来见人了！',
  '这是我们的心血作品，现在我们邀请你来尝试！同心云里可以看到我们的网页版，我们在同心云刚上线时就在同心云里了呢！',
  '废话不多说，老司机快上车吧！同学们都在蜂房上等待你加入呢！ 另外APP有网页版没有的超有趣社交功能，而且比网页版好用1万倍！',
  '可以从这里下载的：',
  'http://yun.tongji.edu.cn/Nl',
  '有什么问题或者意见建议，都欢迎和我说啊～ 欢迎拉上同学们一起来尝试啊！～',
  '[:色羊]',
];

async function sendMsg(id, ad) {
  const params = {
    //sex: 0,
    // schoolid: 557,
    act: 'SendPmessage',
    clientid: '2C38DFF7-A34C-4CA8-B620-8F9993861A2F',
    version: '5.1.0',
    sessionid: '1483182153_967d0aed844c4b387915_2731943#nmpcns',
    os: 'ios',
    mode: 'black',
    content: ad,
    to_userid: id,
  };
  let queryString = Object.keys(params).reduce((str, key) => {
    return str += `${key}=${encodeURIComponent(params[key])}&`;
  }, '?');
  queryString = queryString.substring(0, queryString.length - 1);
  const thisReq = request
    .request('http://api.stuhui.com/openapi/util/util' + queryString, {
      method: 'POST',
      headers,
    });
  const result = await ensureComplete(thisReq);
  if (!result) {
    console.log('[request] No result');
    return;
  }

  let data = JSON.parse(result.data.toString());
  if (!data || data.errno) {
    console.log('[request] Failed to load');
    console.log(data);
    return;
  }
}

// sendMsg();
var skip = 6;
async function advertise() {
  const users = await User.find({school: '同济大学'}, {user_id: true});
  for (const user of users) {
    const id = user.user_id;
    for (const ad of ads) {
      if (--skip) continue;
      await sendMsg(id, ad);
    }
    console.log('[Sent]');
  }
}

advertise();
