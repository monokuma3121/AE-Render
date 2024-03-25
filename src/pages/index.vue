<script setup>
import { Tickets, Clock } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
const router = useRouter();
import route from "@/router";

import { ref, shallowRef, watch, onMounted, onUnmounted } from "vue";

import Work from "./work/index.vue";
import History from "./history/index.vue";

import { inject } from "vue";

import { mainStore } from "@/store";
import { storeToRefs } from "pinia";
const store = mainStore();
let { isCover, electronInfo, showDesktop } = storeToRefs(store);

const ws = inject("ws");

const current = shallowRef(Work);

sessionStorage.getItem("account");

const toWork = () => {
  current.value = Work;
  router.push("/");
};
const toHistory = () => {
  ws.send(JSON.stringify({ type: "historyWork", work: "search" }));
  current.value = History;
  router.push("/history");
};

/**
 * 根据地址栏切换tab样式
 */
let myIndex = ref("");

if (router.currentRoute._rawValue.fullPath === "/") {
  myIndex.value = "1";
  current.value = Work;
} else if (router.currentRoute._rawValue.fullPath === "/history") {
  myIndex.value = "2";

  current.value = History;
}

const currentUrl = ref(router.currentRoute.value.fullPath);

const handleUrlChange = (to, from) => {
  currentUrl.value = to.fullPath;
  if (currentUrl.value === "/") {
    myIndex.value = "1";
  } else if (currentUrl.value === "/history") {
    myIndex.value = "2";
  }
};

onMounted(() => {
  // 监听路由变化
  router.afterEach(handleUrlChange);
});

onUnmounted(() => {
  // 在组件销毁时取消监听
  router.afterEach(null);
});

//退出登录
const logout = () => {
  sessionStorage.removeItem("account");
  store.msgAlert("退出成功", "success");
  router.push("/login");
  //刷新浏览器
  window.location.reload();
};

const showCover = () => {
  // if (currentUrl.value === "/") {
  //   isCover.value = true;
  // } else {
  //   store.msgAlert("请在工作页面打开教程", "warning");
  // }

  ws.send(JSON.stringify({ type: "document" }));
};

showDesktop.value = false;
if (window.electronAPI) {
  //桌面端
  showDesktop.value = true;
  // const filePath = await window.electronAPI.getLocalFilePath();
} else {
  //网页端

  showDesktop.value = false;
}

// const exePath = ref(null)
const aePath = ref(null);

// const sendExePath = async() => {

//  exePath.value = await window.electronAPI.getLocalFilePath();
//  if(exePath.value) {

//   // window.electronAPI.invokeElectronMethod('你好啊');
//  }

// }

//获取AE安装路径 一键搜集
const sendAePath = async () => {

  electronInfo.value.allOK = false;
  aePath.value = await window.electronAPI.getLocalFilePath();
  if (aePath.value) {
    store.msgAlert("获取成功", "success");

    // 一键搜集后返回的信息
    //const result = await collectFiles(myPath);
    //mainWindow.webContents.send('floder-info', JSON.stringify(result));

  } else {
    store.msgAlert("获取失败", "warning");
  }
};

if (window.electronAPI) {
  window.electronAPI.getFloderInfo((event, value) => {
      const info = JSON.parse(value);
      // 整理信息，填充默认值
      electronInfo.value.compName = info["comp name"];
      electronInfo.value.frameRate = info.frameRate;
      electronInfo.value.width = info.width;
      electronInfo.value.height = info.height;
      electronInfo.value.startTime = info["Time Span Start"];
      electronInfo.value.endTime = info["Time Span End"];
      electronInfo.value.startFrame = info.startFrame;
      electronInfo.value.endFrame = info.endFrame;

      electronInfo.value.folderInfor = info["folderInfor"];

      if (info.font === "") {
      } else {
        // 去掉字符串中的单引号和末尾的逗号
        info.font = info.font.replace(/,\s*$/, "");
        // 使用 split 方法将字符串分割成数组
        electronInfo.value.font = info.font.split(",");
      }

      electronInfo.value.allOK = true;
    });
}


</script>

<template>
  <div>
    <el-menu :default-active="myIndex" class="el-menu-vertical-demo" mode="horizontal">
      <el-menu-item index="1" @click="toWork">
        <el-icon size="25px"><Tickets /></el-icon>
        <template #title>工作页面</template>
      </el-menu-item>

      <el-menu-item index="2" @click="toHistory">
        <el-icon size="25px"><Clock /></el-icon>
        <template #title>历史工作</template>
      </el-menu-item>

      <div class="logout">
        <el-button @click="console.log(123)" v-if="!showDesktop">&nbsp;下载桌面端&nbsp;</el-button>
        <!-- <el-button @click="sendExePath" v-if="!showDesktop">&nbsp;获取本应用安装路径&nbsp;</el-button> -->
        <el-button @click="sendAePath" v-if="showDesktop">&nbsp;一键搜集&nbsp;</el-button>
        <el-button @click="showCover">&nbsp;教程&nbsp;</el-button>
        <button @click="logout">退出登录</button>
      </div>
    </el-menu>

    <div class="common-layout container">
      <el-container>
        <el-main>
          <KeepAlive>
            <component :is="current" @on-click="toWork"></component>
          </KeepAlive>
        </el-main>
      </el-container>
    </div>
  </div>
</template>

<style>
@media screen and (max-width: 1536px) {
  /* 在屏幕宽度小于等于1536px时应用的样式规则 */
  .el-menu-vertical-demo {
    margin-bottom: 5px !important;
  }
}

.el-container {
}
.header {
  display: flex;
  justify-content: space-around;
  margin-top: 3vh;
}

.font {
  font-size: 20px;
  font-weight: bold;
}

.el-menu-vertical-demo {
  position: relative;
  margin-bottom: 15px;
}

.logout {
  position: absolute;
  right: 0;
  top: 0;
}

/* From www.lingdaima.com */
.logout button {
  position: relative;
  display: inline-block;
  margin: 10px;
  margin-right: 20px;
  padding: 6px 3px;
  text-align: center;
  font-size: 15px;
  letter-spacing: 1px;
  text-decoration: none;
  color: #409eff;
  background: transparent;
  cursor: pointer;
  transition: ease-out 0.5s;
  border: 1px solid #409eff;
  border-radius: 10px;
  box-shadow: inset 0 0 0 0 #ecf5ff;
}

.logout button:hover {
  color: white;
  box-shadow: inset 0 -100px 0 0 #409eff;
}

.logout button:active {
  transform: scale(0.9);
}
</style>
import { watch } from "less";
