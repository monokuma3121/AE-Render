import { ref } from "vue";

export const state = ref(false);

export const tempInfo = ref({});

export let writable = ref(null);

/**
 * 上传、渲染、下载的disabled
 */

export let isRenderDisable = ref(true);
export let isDownloadDisable = ref(true);

export let downloadJobId = ref("");

/**
 * Websocket
 */
let ifContinue = ref(true);
let received = ref(true);
let downloadFileSize = 0;
let receiveBuffer = []; // 存放数据的数组
export let receivedSize = ref(0); // 数据大小
export let temp = {};

export const jobName = ref("");

export var saveFileName = "";
var saveFileSize = 0;
var totalReceivedSize = 0;
let receivedChunksLocal = [];
let receivedChunksLocalSize = 0;

let heartbeatStatus = "waiting";
let retryCount = 0;

export const isSend = ref(true);
export const needSendFiles = ref([]);
export const needSendFont = ref([]);

//渲染进度
export let renderProgress = ref([]);
export let downloadProgress = ref([]);
export const progressCount = ref(0);
export let renderId = ref(0);

export let myId = ref(0);
// export let myId2 = ref(0);
//下载
export let jobuid = ref("");

export const workNameId = ref(0);

//工作名是否重名:true的时候不需要做什么，false的时候提示工作名重复
export const isRepeat = ref(true);

//历史工作
export const histroyWorkList = ref([]);

class WebSocketClient {
  constructor(url, id) {
    this.heartbeatStatus = "waiting";
    this.retryCount = 0;
    this.url = url;
    this.id = id;
    this.ws = null;
    this.openHandler = null;
    this.messageHandler = null;

    const startHeartbeat = () => {
      setTimeout(() => {
        // 将状态改为等待应答，并发送心跳包
        this.heartbeatStatus = "waiting";
        this.ws.send(JSON.stringify({ type: "ping", data: "heartbeat" }));
        // 启动定时任务来检测刚才服务器有没有应答
        waitHeartbeat();
      }, 5000);
    };

    const waitHeartbeat = () => {
      setTimeout(() => {
        // 心跳应答正常，启动下一轮心跳检测
        if (this.heartbeatStatus === "received") {
          this.retryCount = 0;
          return startHeartbeat();
        }
        console.log(`尝试通信第${this.retryCount}次失败`);
        // 更新超时次数
        ++this.retryCount;
        // 心跳应答超时，但没有连续超过三次
        if (this.retryCount < 3) {
          console.log(`${this.id}: ws线路异常，正在检测中。`);
          return startHeartbeat();
        }
        // 超时次数超过三次, 尝试重连
        console.log("尝试重新连接");
        this.ws.close();
        this.ws = null;
        this.heartbeatStatus = "waiting";
        this.retryCount = 0;
        this.connect();
      }, 1000);
    };

    this.startHeartbeatFun = () => startHeartbeat();
  }

  connect() {
    if (this.ws) return;
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log(`${this.id}: open`);
      this.startHeartbeatFun();
      this.ws.send(JSON.stringify({ type: "account", account: this.id }));
    };

    this.ws.onmessage = (data) => {
      if (this.messageHandler) this.messageHandler(data);
      else console.log("Received message:", data);
    };

    this.ws.onclose = () => console.log(`${this.id}: Disconnected from WebSocket server`);
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(message);
    else console.log(`${this.id}: WebSocket is not connected`);
  }

  close() {
    if (this.ws) this.ws.close();
  }
  getId() {
    return this.id;
  }
  setId(id) {
    this.id = id;
  }
  setMessageHandler(handler) {
    this.messageHandler = handler;
  }
  setHeartbeatStatus(heartbeatStatus) {
    this.heartbeatStatus = heartbeatStatus;
  }

  setRetryCount(retryCount) {
    this.retryCount = retryCount;
  }
}

const wsURL = "wss://websocket.jutian.online:8081";
export let ws = new WebSocketClient(wsURL, "17854173609");

ws.setMessageHandler(async (e) => {
  if (typeof e.data === "string") {
    let message = JSON.parse(e.data);

    switch (message.type) {
      case "pong":
        if (message.data === "heartbeat") {
          // 复位连续不应答次数

          ws.setHeartbeatStatus("received");
        }
        break;
      case "receivedFile":
        console.log("receivedSize",message.data);
        receivedSize.value = message.data;
        received.value = true;
        break;
      case "fileUpload":
        ifContinue.value = true;
        state.value = message.state;
        isSend.value = false;
   
        if(message.fileName) {
          console.log("fileName:",message.fileName);
          window.electronAPI.uploadFile(message.fileName)
        }

        break;
      case "preparation":

        downloadJobId.value = message.jobuid;
        saveFileName = message.fileName;
        saveFileSize = message.data;
                
        if(downloadJobId.value !== '00') {
          isRenderDisable.value = true;
          isDownloadDisable.value = false;
  
        }





        break;
      case "renderProgress":
        if (message.data > 0) {
          //开始渲染,并一直赋值
          renderId.value = message.jobuid;
          renderProgress.value[renderId.value] = message.data;
          progressCount.value = message.data;
          console.log("progressCount:", message.data);

          if (message.data === 100) {
          }
        }

        break;
      case "fileAndFontCheck":
        console.log(message);
 needSendFiles.value = message.files;
needSendFont.value = message.fonts;

      break;
      case "jobNameCheck":
        isRepeat.value = message.result;

        workNameId.value = message.id;

        break;
      case "historyWork":
        histroyWorkList.value = message.results;

        //error_information

        break;
      case "searchTemplateInfor":
        tempInfo.value = message;
  

        break;
      default:
        // res.innerText += message.data + "\n";
        if (message.data) {
          if (message.data.indexOf("渲染工作") !== -1) {
            if (message.data.indexOf("已创建") !== -1) {
              const regex = /渲染工作(.*)已创建/;
              const match = message.data.match(regex);
              myId.value = match[1]; //获取工作名
              // myId2.value = match[1];

              // showRenderMsg.value[myId2.value] = "正在创建";
            } else if (message.data.indexOf("已开始") !== -1) {
              // showRenderMsg.value[myId2.value] = "渲染中";
            } else if (message.data.indexOf("已完成") !== -1) {
              // showRenderMsg.value[myId2.value] = "渲染完成";
            } else {
              // showRenderMsg.value[0] = "渲染进度";
            }
          }

          if ("jobuid" in message) jobuid.value = message.jobuid;

          if (message.data.startsWith("渲染工作遇到错误")) console.log(message.err);
        }
        break;
    }
  } else {
    if (e.data instanceof Blob) {
      receivedChunksLocal.push(e.data);
      totalReceivedSize += e.data.size;

      //保留两位小数
      //renderId.value = message.jobuid;


      downloadProgress.value[downloadJobId.value] = parseFloat(((totalReceivedSize / saveFileSize) * 100).toFixed(2));

 
      if (saveFileSize === totalReceivedSize) {

        totalReceivedSize = 0;
        const fileBlob = new Blob(receivedChunksLocal);
        const aDownloadLink = document.createElement("a");
        aDownloadLink.href = URL.createObjectURL(fileBlob);
        aDownloadLink.download = saveFileName;

        aDownloadLink.click();
        receivedChunksLocal = [];  

        if(downloadJobId.value !== '00') {
          isDownloadDisable.value = false;
  
        }

    

      }
    }
  }
});










