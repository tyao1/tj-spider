export default async function ensureComplete(request) {
  let timeout = 200; // 间隔200ms
  let result = {};
  let notFirst = true;
  let tryCount = 0;
  while (result.status !== 200) {
    // 三秒后重试
    tryCount++;
    if (tryCount > 5) {
      console.log('[Fatal] Failed too many times');
      return null;
    }
    // if (result.data)  console.log(result.data.toString());
    if (notFirst) notFirst = false;
    else console.log( '等待' + timeout + 's');
    try {
      result = await new Promise((resolve) => setTimeout(() => {
        timeout = timeout * 2;
        resolve();
      }, timeout)).then(() => request);
    } catch (ex) {
      console.log(ex);
      timeout = timeout * 2;
    }


  }
  return result;
}
