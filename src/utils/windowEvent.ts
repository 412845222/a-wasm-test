

function windowAddEvent(callback:any) {
  window.addEventListener(
    "message",
    (event) => {
      console.log(event.data);
      callback(event.data)
    },
    false
  );
}

//http://localhost:7456/
// /cocos3D/index.html
function windowPostMsg(data:any){
  try {
    const iframe_dom = document.getElementsByTagName("iframe")[0]
    const iwindow = iframe_dom.contentWindow
    // iwindow!.postMessage(data,"http://localhost:7456/");
    iwindow!.postMessage(data);
  } catch (error) {
    console.log(error)
  }
}

export { windowAddEvent,windowPostMsg };
