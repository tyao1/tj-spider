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

var currentSchool = 1;

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
          //sex: 0,
          schoolid: 557,
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
      return;
    }

    let data = JSON.parse(result.data.toString());
    if (!data || data.errno) {
      console.log('[request] Failed to load 2');
      console.log(data);
      return;
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

reqNextNode(1);

// http://api.stuhui.com/openapi/util/util?content=123456&act=SendPmessage&to_userid=2111985%23vblsej&mode=white&clientid=2C38DFF7-A34C-4CA8-B620-8F9993861A2F&os=ios&version=5.1.0&sessionid=1483182153_967d0aed844c4b387915_2731943%23nmpcns
/*
async function sendMsg() {
  const params = {
    //sex: 0,
    schoolid: 557,
    act: 'SendPmessage',
    clientid: '2C38DFF7-A34C-4CA8-B620-8F9993861A2F',
    version: '5.1.0',
    sessionid: '1483182153_967d0aed844c4b387915_2731943#nmpcns',
    os: 'ios',
    mode: 'black',
    content: '测试一下！！！',
    to_userid: '2111985#vblsej',
  };
  let queryString = Object.keys(params).reduce((str, key) => {
    return str += `${key}=${encodeURIComponent(params[key])}&`;
  }, '?');
  queryString = queryString.substring(0, queryString.length - 1);
  console.log(queryString);
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
  console.log(result.data.toString());
  if (!data || data.errno) {
    console.log('[request] Failed to load');
    console.log(result.data.toString());
    return;
  }
  console.log('[request] Success!');
  console.log(data);
}
*/
// sendMsg();
