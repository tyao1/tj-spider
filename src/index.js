import request from 'urllib';
import mongoose from 'mongoose';
import ensureComplete from './ensureComplete';
import User from './userModel';

// connect to the database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1/tjdata');

const headers = {
  'Cookie': 'JSESSIONID=rtreegpsvxtli2xxz1wdnhge; pgv_pvi=5057683456; Hm_lvt_d5a76608e07e4903e91fe94d34b3cc0d=1439565122; featureTips_fwdToGroup20131101=1; amlbcookie=02; iPlanetDirectoryPro=AQIC5wM2LY4SfczzqMb6yaJGvaO%2BO45ykL6uyE%2BhF%2FI1aGk%3D%40AAJTSQACMDI%3D%23; at=a1bdbdff-0808-41cc-a3d5-7d736371fa95; cu=2aa99335-a55e-11e5-a1cc-00505681721d; rm=MmFhOTkzMzUtYTU1ZS0xMWU1LWExY2MtMDA1MDU2ODE3MjFkOjdlZDYzMDc0ZTYyZGE3ZjNhNzJiMjMxNDhiNjRmNTQz; sync_networkid=104; sync_userid=2aa99335-a55e-11e5-a1cc-00505681721d; cd=yun.tongji.edu.cn; cn=104',
  'Host': 'yun.tongji.edu.cn',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.93 Safari/537.' + Math.floor(Math.random() * 100),
};

var count = 0;


const ads = [
  '同学你好！不知道你有没有看过这篇我们的微信推送：',
  '《感谢同济，让我们曾在最美好的年华遇到最有趣的灵魂》http://yun.tongji.edu.cn/Nk',
  '我是蜂房团队的一员，我们起早贪黑，搞了一个大四，终于我们的校园应用可以拿出来见人了！',
  '这是我们的心血作品，现在我们邀请你来尝试！同心云里可以看到我们的网页版，我们在同心云刚上线时就在同心云里了呢！',
  '废话不多说，老司机快上车吧！同学们都在蜂房上等待你加入呢！ 另外APP有网页版没有的超有趣社交功能，而且比网页版好用1万倍！',
  '可以从这里下载的：http://yun.tongji.edu.cn/Nl 有什么问题或者意见建议，都欢迎和我说啊～ 欢迎拉上同学们一起来尝试啊！～',
];

async function sendAdsTo(id) {
  for (var ad of ads) {
    const thisReq = request
      .request('http://yun.tongji.edu.cn/im/web/sendMessage.do', {
        method: 'POST',
        headers,
        data: {
          toUserId: id,
          msgType: 2,
          content: ad,
          param:'{"notifyType":1,"notifyTo":[]}',
        },
      });
    const result = await ensureComplete(thisReq);
    await new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  }

  const thisReq2 = request
    .request('http://yun.tongji.edu.cn/im/web/sendMessage.do', {
      method: 'POST',
      headers,
      data: {
        toUserId: id,
        msgType: 8,
        content: '冰天雪地转体365度抱大腿，求尝试我们的蜂房APP~',
        param: '{"emojiType":"original","ext":"png","file_id":"53faaa9624ac5a01da030fc2","mTime":1472467262017,"name":"xiaoluo_maimeng"}',
      },
    });
  const result2 = await ensureComplete(thisReq2);
  console.log('[SENT]');
}

async function reqNextNode(orgId, parentSectionNames) {
  const sectionNames = [...parentSectionNames];
  const thisReq = request
    .request('http://yun.tongji.edu.cn/im/web/treeOrg.do', {
      method: 'POST',
      headers,
      data: {
        eid: 104,
        orgId: orgId,
        begin: 0,
        count: 10000,
      },
    });
  const result = await ensureComplete(thisReq);
  if (!result) {
    console.log('[request] No result');
    return;
  }

  let data = JSON.parse(result.data.toString());
  if (!data || !data.success) {
    console.log('[request] Failed to load');
    return;
  }
  data = data.data;
  // aggregate secition names
  const sectionName = data.name;
  sectionNames.push(sectionName);

  // console.log('[request] Success!');

  if (data.person && data.person.length) {
    // DFS - save the persons
    for (let i = 0; i < data.person.length; i++) {
      const userData = data.person[i];
      let user;
      const findUser = await User.findOne({id: userData.id}).exec();
      if (findUser) {
        // user = findUser;
      } else {
        user = new User(userData);
        if (userData.orgLongName.indexOf('教职工') === -1) {
          await sendAdsTo(userData.id);
        }
        await user.save();
      }
      /*
      Object.keys(userData).forEach(key => {
        user[key] = userData[key];
      });
      user.sections = sectionNames.slice();
      await user.save();
      console.log('[Saved] ' + (++count)  + userData.name + userData.phone, sectionNames);
      */
    }
  }

  if (data.children && data.children.length) {
    for (let i = 0; i < data.children.length; i++) {
      // check next node
      await reqNextNode(data.children[i].id, sectionNames);
    }
  }
}

console.log('Will Fetch');

reqNextNode('97fb1077-ad78-4019-8255-153bdd8269ac', []);
