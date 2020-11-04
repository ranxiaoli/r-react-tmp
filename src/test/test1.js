function sleepFn (time) {
  setTimeout(()=>{console.log("1")}, time)
}

function sleepFn1(time) {
  return new Promise((resovle) => setTimeout(resovle, time))
}
sleepFn1(1000).then(()=>console.log(1))

sleepFn();


const resverse = function (num) {
  const numStr = num+"";
  const arrStr = numStr.split("");
  let str = "";
  const getStr = function (arrStr) {
    const len = arrStr.length;
    if(len === 0) {
      return;
    }
    str += arrStr[len-1];
    arrStr.pop();
    getStr(arrStr);
   
  }
  getStr(arrStr)
  return str;
}

console.log(resverse(456789))
