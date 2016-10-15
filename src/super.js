import request from 'urllib';
import ensureComplete from './ensureComplete';
/*
#-*-coding:utf-8-*-
import urllib2
from cookielib import CookieJar
import re
import time
import math
#login
loginUrl = 'http://120.55.151.61/V2/StudentSkip/loginCheckV4.action'
headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_0_1 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Mobile/14A403 -SuperFriday_7.6.2',
    'Host': '120.55.151.61:80',
    'Connection': 'close',
    'Accept-Encoding': 'gzip',
    'Content-Length': '321',
    }
loginData = 'password=399bc6799f6f2f6dab4dfe3fc83df956&account=14a27e8839efc3a5315b6cb9119d113a&registrationId=&mac=&ifa=7633C9A7-3DAC-47DD-8D0D-7361B149F50E&ifv=FEA510F8-34DD-48DF-AC4D-3262B16947D9&versionNumber=7.6.2&platform=2&channel=AppStore&phoneVersion=10.0.1&phoneModel=iPhone%206%20Plus%20%28A1522%2FA1524%29&phoneBrand=Apple'
cookieJar = CookieJar()
opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(cookieJar))
req = urllib2.Request(loginUrl, loginData, headers)
loginResult = opener.open(req).read().decode('UTF-8')
print loginResult

while 1 :
	userUrl = 'http://120.55.151.61:80/V2/Contacts/guessYouLikeUserV2.action'
	userheaders = {
		'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
		'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_0_1 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Mobile/14A403 -SuperFriday_7.6.2',
		'Host': '120.55.151.61:80',
		'Connection': 'close',
		'Accept-Encoding': 'gzip',
		'Content-Length': '147',
		}
	rollDATA = 'timestamp=0&versionNumber=7.6.2&platform=2&channel=AppStore&phoneVersion=10.0.1&phoneModel=iPhone%206%20Plus%20%28A1522%2FA1524%29&phoneBrand=Apple'
	userreq = urllib2.Request(userUrl, rollDATA, userheaders)
	userResult = opener.open(userreq).read().decode('UTF-8')
	IDpattern = re.compile('"studentIdInt":(.*?),',re.S)
	Genderpattern = re.compile('"genderInt":(.*?),',re.S)
	Jugepattern = re.compile('"source":(.*?),',re.S)
	IDitems = re.findall(IDpattern,userResult)
	Genderitems = re.findall(Genderpattern,userResult)
	Jugeitems = re.findall(Jugepattern,userResult)
	print userResult

	i = 0
	for IDitem in IDitems:
		addUrl = 'http://120.55.151.61:80/V2/Contacts/addContacts.action'
		addheaders = {
		'Host': '120.55.151.61:80',
		'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
		'Cookie': 'JSESSIONID=28F193635A6B537B9E563151D8D533DC-memcached1',
		'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_0_1 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Mobile/14A403 -SuperFriday_7.6.2',
		'Content-Length': '156',
		'Accept-Encoding': 'gzip',
		'Connection': 'close',
			}
		addDATA = 'friendIdInt=' + IDitem + '&versionNumber=7.6.2&platform=2&channel=AppStore&phoneVersion=10.0.1&phoneModel=iPhone%206%20Plus%20%28A1522%2FA1524%29&phoneBrand=Apple'
		#print addDATA
		#print Jugeitems[i]
		if Genderitems[i] == '0':
			addreq = urllib2.Request(addUrl, addDATA, addheaders)
			addResult = opener.open(addreq).read().decode('UTF-8')
			print "addContacts ID = " + IDitem + "success!"
			time.sleep(10)
		i += 1



#boy
#13918790617
#yty62645658

#girl
#18342318889
#yty2^4^6%8%

*/

const headers = {
  'Host': '120.55.151.61:80',
  'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
  'Cookie': 'JSESSIONID=6AC635851292C70409008E1082CB4104-memcached1',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.93 Safari/537.' + Math.floor(Math.random() * 100),
};

// http://api.stuhui.com/openapi/util/util?content=123456&act=SendPmessage&to_userid=2111985%23vblsej&mode=white&clientid=2C38DFF7-A34C-4CA8-B620-8F9993861A2F&os=ios&version=5.1.0&sessionid=1483182153_967d0aed844c4b387915_2731943%23nmpcns

let counter = 0;
async function reqNextNode(page) {
  const thisReq = request
    .request('http://120.55.151.61:80/V2/Contacts/guessYouLikeUserV2.action', {
      method: 'POST',
      headers,
      data: {
        page,
      }
    });
  const result = await ensureComplete(thisReq);
  if (!result) {
    console.log('[request] No result');
    return;
  }

  let data = JSON.parse(result.data.toString());
  if (data.data && data.data.guessLikeUserBOs) {
    for (const user of data.data.guessLikeUserBOs) {
      if (user.genderInt === 0) { // 0 - 女生 1 - 男生
        await addFriend(user.studentIdInt);
      } else {
        console.log('性别不符合，跳过');
      }
    }
  }
  if (data.data.hasMoreBool) {
    reqNextNode(++page);
  } else {
    console.log('没有了, 等待30秒');
    await new Promise(function(resolve, reject) {
      setTimeout(() => resolve(), 30 * 1000);
    });
    reqNextNode(0);
  }
}

reqNextNode(0);

async function addFriend(id) {
  const thisReq = request
    .request('http://120.55.151.61:80/V2/Contacts/addContacts.action', {
      method: 'POST',
      headers,
      data: {
        friendIdInt: id
      }
    });
  const result = await ensureComplete(thisReq);
  if (!result) {
    console.log('[request] No result');
    return;
  }

  let data = JSON.parse(result.data.toString());
  data = data.data;
  if (data.contactsBO) {
    console.log(++counter, data.contactsBO.nickNameStr, data.contactsBO.genderInt);
  } else {
    console.log('迷的问题', data);
  }
}

// addFriend(8812392);
