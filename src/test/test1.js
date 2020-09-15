function sleepFn (time) {
  setTimeout(()=>{console.log("1")}, time)
}

function sleepFn1(time) {
  return new Promise((resovle) => setTimeout(resovle, time))
}
sleepFn1(1000).then(()=>console.log(1))

sleepFn();
