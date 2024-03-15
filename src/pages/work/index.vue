<script setup>
import { ref, reactive, watch, computed, onMounted } from "vue";
import { ElButton } from "element-plus";
import { Delete, Edit, Setting, Check, Close } from "@element-plus/icons-vue";
import md5 from "js-md5";
import SparkMD5 from "spark-md5";
import pako from "pako"; // 引入压缩库
import { inject } from "vue";
import { mainStore } from "@/store";
import { storeToRefs } from "pinia";
const store = mainStore();

let { isLook, isCover, renderState, downloadId, electronInfo } = storeToRefs(store);

const ref1 = ref();
const ref2 = ref();
const ref3 = ref();
const ref4 = ref();
const ref5 = ref();
const ref6 = ref();
const ref7 = ref();
const ref8 = ref();

const setOutputDialog = ref(false);
const setRenderDialog = ref(false);
const customDialogVisible = ref(false);
const switchFlag = ref(false);

const isOff = ref(true);

const outputForm = reactive({
  format: null,
  postRenderAction: "None",
  includeProjectLink: true,
  includeSourceXMPMetadata: false,
  videoOutput: true,
  channels: "RGB",
  depth: "Millions of Colors",
  color: "Premultiplied (Matted)",
  starting: 0,
  ending: 0,
  useCompFrameNumber: true,
  resize: false,
  lockAspectRatio: true,
  resizeQuality: "High",
  resizeTo: "Custom",
  resizeToWidth: "0",
  resizeToHeight: "0",
  crop: false,
  useRegionOfInterest: false,
  cropTop: 0,
  cropLeft: 0,
  cropBottom: 0,
  cropRight: 0,
  outputAudio: "Auto",
  audioSampleRate: "48,000 kHz",
  audioBitDepth: "16 Bit",
  audioChannels: "Stereo",
});

const renderForm = reactive({
  quality: "Best",
  proxyUse: "Use No Proxies",
  resolution: "Full",
  effects: "Current Settings",
  soloSwitches: "Current Settings",
  diskCache: "Read Only",
  guideLayers: "All Off",
  colorDepth: "Current Settings",
  frameBlending: "On for Checked Layers",
  fieldRender: "Off",
  pulldown: "Off",
  motionBlur: "On for Checked Layers",
  timeSpan: "Work Area Only",
  frameRate: "Use comp's frame rate", //这里改的话要改好多地方
  frameRateInput: "",
});

const outputSettingsTemp = ref({});
const renderSettingsTemp = ref({});

// outputSettingsTemp.push(`${函数(abc): ${abc}}`)
function becomeBig(str) {
  // 使用正则表达式匹配单词，并将首字母转为大写
  var titleCaseStr = str.replace(/([A-Z])/g, " $1");

  // 将字符串的首字母转为大写
  titleCaseStr = titleCaseStr.charAt(0).toUpperCase() + titleCaseStr.slice(1);

  return titleCaseStr;
}

function checkAndRemoveKey(Key, newVal) {
  let targetKey = becomeBig(Key);

  if (Key === "resizeTo") {
    if (outputForm.resizeToWidth === "0" || outputForm.resizeToHeight === "0") {
    } else {
      targetKey = "Resize to";
      if (Object.keys(outputSettingsTemp.value).includes(targetKey)) {
        // 如果重复，则删除该属性
        delete outputSettingsTemp.value[targetKey];
      }
      if (outputForm.resizeTo === "Custom") {
        outputSettingsTemp.value[targetKey] = `${outputForm.resizeToWidth},${outputForm.resizeToHeight}`;
      } else {
        outputSettingsTemp.value[targetKey] = `${outputForm.resizeTo}`;
      }
      return;
    }
  }

  // 检查对象的键是否重复
  if (Object.keys(outputSettingsTemp.value).includes(targetKey)) {
    // 如果重复，则删除该属性
    delete outputSettingsTemp.value[targetKey];
    outputSettingsTemp.value[targetKey] = `${newVal}`;
  } else {
    // 如果不重复，则打印“124”
    outputSettingsTemp.value[targetKey] = `${newVal}`;
  }
}

function renderCheckAndRemoveKey(Key, newVal) {
  let targetKey = becomeBig(Key);

  // 检查对象的键是否重复
  if (Object.keys(renderSettingsTemp.value).includes(targetKey)) {
    // 如果重复，则删除该属性
    delete renderSettingsTemp.value[targetKey];
    if (Key === "pulldown") {
      targetKey = "3:2 Pulldown";
    }
    renderSettingsTemp.value[targetKey] = `${newVal}`;
  } else {
    if (Key === "pulldown") {
      targetKey = "3:2 Pulldown";
    }
    renderSettingsTemp.value[targetKey] = `${newVal}`;
  }
}

const putRenderTemp = () => {
  customDialogVisible.value = false;

  if (startTime.value === "" && endTime.value === "" && duration.value === "") {
  } else {
    if (Object.keys(renderSettingsTemp.value).includes("Time Span Start")) {
      delete renderSettingsTemp.value["Time Span Start"];
      renderSettingsTemp.value["Time Span Start"] = `${timeStringToSeconds(startTime.value)}`;
    } else {
      renderSettingsTemp.value["Time Span Start"] = `${timeStringToSeconds(startTime.value)}`;
    }

    if (Object.keys(renderSettingsTemp.value).includes("Time Span End")) {
      delete renderSettingsTemp.value["Time Span End"];
      renderSettingsTemp.value["Time Span End"] = `${timeStringToSeconds(endTime.value)}`;
    } else {
      renderSettingsTemp.value["Time Span End"] = `${timeStringToSeconds(endTime.value)}`;
    }

    if (Object.keys(renderSettingsTemp.value).includes("Time Span Duration")) {
      delete renderSettingsTemp.value["Time Span Duration"];
      renderSettingsTemp.value["Time Span Duration"] = `${timeStringToSeconds(duration.value)}`;
    } else {
      renderSettingsTemp.value["Time Span Duration"] = `${timeStringToSeconds(duration.value)}`;
    }
  }
};

function objectToString(obj) {
  let result = "";
  for (let key in obj) {
    result += `${key}:${obj[key]};`;
  }
  // 去除最后一个分号
  result = result.slice(0, -1);
  return result;
}

const isNoStartingVal = () => {

  if (outputForm.starting === "") {
    outputForm.starting = 0;
  }
};
const isNoEndingVal = () => {
  
  if (outputForm.ending === "") {
    outputForm.ending = 0;
  }
};
const isNoWidthVal = () => {
 
  if (outputForm.resizeToWidth === "") {
    outputForm.resizeToWidth = "0";
  }
};
const isNoHeightVal = () => {

  if (outputForm.resizeToHeight === "") {
    outputForm.resizeToHeight = "0";
  }
};
const isNoTopVal = () => {

  if (outputForm.cropTop === "") {
    outputForm.cropTop = 0;
  }
};
const isNoLeftVal = () => {
 
  if (outputForm.cropLeft === "") {
    outputForm.cropLeft = 0;
  }
};
const isNoBottomVal = () => {
 
  if (outputForm.cropBottom === "") {
    outputForm.cropBottom = 0;
  }
};
const isNoRightVal = () => {

  if (outputForm.cropRight === "") {
    outputForm.cropRight = 0;
  }
};
const isNoStartTimeVal = () => {

  if (startTime.value === "") {
    startTime.value = "0:0:0:0";
  }
};
const isNoEndTimeVal = () => {
 
  if (endTime.value === "") {
    endTime.value = "0:0:0:0";
  }
};
const isNoDurationTimeVal = () => {

  if (duration.value === "") {
    duration.value = "0:0:0:0";
  }
};

const isRsesizeDisable = ref(true);
const isCropDisable = ref(true);

//监听输出设置
watch(
  setOutputDialog,

  () => {
    if (setOutputDialog.value === true) {
      //hhhh
      watch(
        () => outputForm.includeProjectLink,
        (newVal, oldVal) => {
          checkAndRemoveKey("includeProjectLink", newVal);
    
        }
      );

      watch(
        () => outputForm.videoOutput,
        (newVal, oldVal) => {
          checkAndRemoveKey("videoOutput", newVal);
        }
      );

      watch(
        () => outputForm.channels,
        (newVal, oldVal) => {
          checkAndRemoveKey("channels", newVal);
        }
      );

      watch(
        () => outputForm.depth,
        (newVal, oldVal) => {
          checkAndRemoveKey("depth", newVal);
        }
      );

      watch(
        () => outputForm.color,
        (newVal, oldVal) => {
          checkAndRemoveKey("color", newVal);
        }
      );

      watch(
        () => outputForm.starting,
        (newVal, oldVal) => {
          if (newVal === 0) {
          } else {
            checkAndRemoveKey("starting", newVal);
          }
        }
      );

      watch(
        () => outputForm.useCompFrameNumber,
        (newVal, oldVal) => {
          checkAndRemoveKey("useCompFrameNumber", newVal);
        }
      );

      watch(
        () => outputForm.resize,
        (newVal, oldVal) => {
          checkAndRemoveKey("resize", newVal);
        }
      );

      watch(
        () => outputForm.lockAspectRatio,
        (newVal, oldVal) => {
          checkAndRemoveKey("lockAspectRatio", newVal);
        }
      );

      watch(
        () => outputForm.resizeQuality,
        (newVal, oldVal) => {
          checkAndRemoveKey("resizeQuality", newVal);
        }
      );

      watch(
        () => outputForm.resizeTo,
        (newVal, oldVal) => {
          checkAndRemoveKey("resizeTo", newVal);
        }
      );

      watch(
        () => outputForm.resizeToWidth,
        (newVal, oldVal) => {
          checkAndRemoveKey("resizeTo", newVal);
        }
      );

      watch(
        () => outputForm.resizeToHeight,
        (newVal, oldVal) => {
          checkAndRemoveKey("resizeTo", newVal);
        }
      );

      watch(
        () => outputForm.crop,
        (newVal, oldVal) => {
          checkAndRemoveKey("crop", newVal);
        }
      );

      watch(
        () => outputForm.useRegionOfInterest,
        (newVal, oldVal) => {
          checkAndRemoveKey("useRegionOfInterest", newVal);
        }
      );

      watch(
        () => outputForm.cropTop,
        (newVal, oldVal) => {
          if (newVal === 0) {
          } else {
            checkAndRemoveKey("cropTop", newVal);
          }
        }
      );

      watch(
        () => outputForm.cropLeft,
        (newVal, oldVal) => {
          if (newVal === 0) {
          } else {
            checkAndRemoveKey("cropLeft", newVal);
          }
        }
      );

      watch(
        () => outputForm.cropBottom,
        (newVal, oldVal) => {
          if (newVal === 0) {
          } else {
            checkAndRemoveKey("cropBottom", newVal);
          }
        }
      );

      watch(
        () => outputForm.cropRight,
        (newVal, oldVal) => {
          if (newVal === 0) {
          } else {
            checkAndRemoveKey("cropRight", newVal);
          }
        }
      );

      watch(
        () => outputForm.outputAudio,
        (newVal, oldVal) => {
          checkAndRemoveKey("outputAudio", newVal);
        }
      );

      watch(
        () => outputForm.audioSampleRate,
        (newVal, oldVal) => {
          checkAndRemoveKey("audioSampleRate", newVal);
        }
      );

      watch(
        () => outputForm.audioBitDepth,
        (newVal, oldVal) => {
          checkAndRemoveKey("audioBitDepth", newVal);
        }
      );

      watch(
        () => outputForm.audioChannels,
        (newVal, oldVal) => {
          checkAndRemoveKey("audioChannels", newVal);
        }
      );
    }
  },
  {
    deep: true,
  }
);

//监听渲染设置
watch(
  setRenderDialog,

  () => {
    if (setRenderDialog.value === true) {
      watch(
        () => renderForm.quality,
        (newVal, oldVal) => {
          renderCheckAndRemoveKey("quality", newVal);
         
        }
      );

      watch(
        () => renderForm.proxyUse,
        (newVal, oldVal) => {
          renderCheckAndRemoveKey("proxyUse", newVal);
        }
      );

      watch(
        () => renderForm.resolution,
        (newVal, oldVal) => {
          renderCheckAndRemoveKey("resolution", newVal);
        }
      );

      watch(
        () => renderForm.effects,
        (newVal, oldVal) => {
          renderCheckAndRemoveKey("effects", newVal);
        }
      );

      watch(
        () => renderForm.soloSwitches,
        (newVal, oldVal) => {
          renderCheckAndRemoveKey("soloSwitches", newVal);
        }
      );

      watch(
        () => renderForm.diskCache,
        (newVal, oldVal) => {
          renderCheckAndRemoveKey("diskCache", newVal);
        }
      );

      watch(
        () => renderForm.guideLayers,
        (newVal, oldVal) => {
          renderCheckAndRemoveKey("guideLayers", newVal);
        }
      );

      watch(
        () => renderForm.colorDepth,
        (newVal, oldVal) => {
          renderCheckAndRemoveKey("colorDepth", newVal);
        }
      );

      watch(
        () => renderForm.frameBlending,
        (newVal, oldVal) => {
          renderCheckAndRemoveKey("frameBlending", newVal);
        }
      );

      watch(
        () => renderForm.fieldRender,
        (newVal, oldVal) => {
          renderCheckAndRemoveKey("fieldRender", newVal);
        }
      );

      watch(
        () => renderForm.pulldown,
        (newVal, oldVal) => {
          renderCheckAndRemoveKey("pulldown", newVal);
        }
      );

      watch(
        () => renderForm.motionBlur,
        (newVal, oldVal) => {
          renderCheckAndRemoveKey("motionBlur", newVal);
        }
      );

      watch(
        () => renderForm.timeSpan,
        (newVal, oldVal) => {
          renderCheckAndRemoveKey("timeSpan", newVal);
        }
      );

      watch(
        () => renderForm.frameRate,
        (newVal, oldVal) => {
          let targetKey = becomeBig("frameRate");

          // 检查对象的键是否重复
          if (Object.keys(renderSettingsTemp.value).includes(targetKey)) {
            // 如果重复，则删除该属性
            delete renderSettingsTemp.value[targetKey];
            if (renderForm.frameRate === "Use comp's frame rate") {
              renderSettingsTemp.value[targetKey] = "Use comp's frame rate";
            } else {
              renderSettingsTemp.value[targetKey] = `${inputFrameRate.value}`;
            }
          } else {
            //没有重复
            if (renderForm.frameRate === "Use comp's frame rate") {
              renderSettingsTemp.value[targetKey] = "Use comp's frame rate";
            } else {
              renderSettingsTemp.value[targetKey] = `${inputFrameRate.value}`;
            }
          }
        }
      );

      watch(
        inputFrameRate,
        (newVal, oldVal) => {
          let targetKey = becomeBig("frameRate");

          // 检查对象的键是否重复
          if (Object.keys(renderSettingsTemp.value).includes(targetKey)) {
            // 如果重复，则删除该属性
            delete renderSettingsTemp.value[targetKey];
            if (renderForm.frameRate === "Use comp's frame rate") {
              renderSettingsTemp.value[targetKey] = "Use comp's frame rate";
            } else {
              renderSettingsTemp.value[targetKey] = `${inputFrameRate.value}`;
            }
          } else {
            if (renderForm.frameRate === "Use comp's frame rate") {
              renderSettingsTemp.value[targetKey] = "Use comp's frame rate";
            } else {
              renderSettingsTemp.value[targetKey] = `${inputFrameRate.value}`;
            }
          }
        },
        {
          deep: true,
        }
      );
    }
  },
  {
    deep: true,
  }
);

const inputFrameRate = ref("");

const resizeOptions = [
  {
    value: "Custom",
    label: "Custom",
  },
  {
    value: "HD · 1920x1080 · 24 fps",
  },
  {
    value: "HD · 1920x1080 · 25 fps",
  },
  {
    value: "HD · 1920x1080 · 29.97 fps",
  },
  {
    value: "UHD (4K) · 3840x2160 · 23.976 fps",
  },
  {
    value: "UHD (4K) · 3840x2160 · 25 fps",
  },
  {
    value: "UHD (4K) · 3840x2160 · 29.97 fps",
  },
  {
    value: "UHD (8K) · 7680x4320 · 23.976 fps",
  },
  {
    value: "Social Media Landscape · 1280x720 · 30 fps",
  },
  {
    value: "Social Media Landscape HD · 1920x1080 · 30 fps",
  },
  {
    value: "Social Media Portrait · 720x1280 · 30 fps",
  },
  {
    value: "Social Media Portrait HD · 1080x1920 · 30 fps",
  },
  {
    value: "Social Media Square · 1080x1080 · 30 fps",
  },
  {
    value: "HDV/HDTV · 1280x720 · 25 fps",
  },
  {
    value: "HDV/HDTV · 1280x720 · 29.97 fps",
  },
  {
    value: "HDV · 1440x1080 (1,33) · 25 fps",
  },
  {
    value: "HDV · 1440x1080 (1,33) · 29.97 fps",
  },
  {
    value: "DVCPRO HD · 1280x1080 (1,5) · 29.97 fps",
  },
  {
    value: "DVCPRO HD · 1440x1080 (1,33) · 25 fps",
  },
  {
    value: "DVCPRO HD · 960x720 (1,33) · 23.976 fps",
  },
  {
    value: "DVCPRO HD · 960x720 (1,33) · 25 fps",
  },
  {
    value: "DVCPRO HD · 960x720 (1,33) · 29.97 fps",
  },
  {
    value: "Cineon Full · 3656x2664 · 24 fps",
  },
  {
    value: "Cineon Half · 1828x1332 · 24 fps",
  },
  {
    value: "Film (2K) · 2048x1556 · 24 fps",
  },
  {
    value: "Film (4K) · 4096x3112 · 24 fps",
  },
];

const resizeTableData = [
  {
    name: "Resize to:",
    width: "1920",
    height: "1080",
  },
];

const md5CodeArr = ref([]);

let writable = inject("writable");

/**
 * 全局
 */

let ws = inject("ws");

const renderProgress = inject("renderProgress");
const renderId = inject("renderId");
let myId = inject("myId");
// let myId2 = inject("myId2");
const isRenderDisable = inject("isRenderDisable");
const isDownloadDisable = inject("isDownloadDisable");
const jobName = inject("jobName");
const isRepeat = inject("isRepeat");
const workNameId = inject("workNameId");
const state = inject("state");
const isSend = inject("isSend");
const progressCount = inject("progressCount");
const tempInfo = inject("tempInfo");
const downloadProgress = inject("downloadProgress");
const downloadJobId = inject("downloadJobId");
const needSendFiles = inject("needSendFiles");
const needSendFont = inject("needSendFont");

let temp = inject("temp");
let receivedSize = inject("receivedSize");
let jobuid = inject("jobuid");

let saveFileName = inject("saveFileName");

let isSubmitDisable = ref(true);

const showRenderMsg = ref("渲染进度");

/**
 * 文件上传相关：变量
 */

let displayFilesRef = ref([]); //先不要用ref包裹
let assetList = ref([]);

let fileReader = null;
let chunkSize = 16 * 1024;

//md5大文件
const chunkSizes = 1024 * 512;

let showState = ref([]);
let beforeUpload = ref(true);
let afterUpload = ref(false);

const isSelectDisable = ref(false);

const loading = ref(false);

/**
 * 输出名后缀
 */
let hzvv = ref("mp4");
let formatHzvv = ref(null);
let lastInput1 = ref("main");
let currentInput = ref("output");
let lastInput2 = ref("output.mp4");

const selectValue = ref("H.264 - Match Render Settings - 15 Mbps");

const renderSelectValue = ref("Best Settings");

const isWidthDisable = ref(true);
const isHeightDisable = ref(true);

const startTime = ref("0:0:0:0");
const endTime = ref("0:0:0:0");
const duration = ref("0:0:0:0");

const customDialogVisible2 = ref(false);

const changeTime = () => {
  customDialogVisible.value = true;

  if (renderForm.frameRate !== "Use comp's frame rate" && inputFrameRate.value) {
    //启用了并且有值
  } else {
    customDialogVisible2.value = true;

    renderForm.frameRate = inputFrameRate.value;
  }
};

function timeCalculation(timeA, timeB, operation) {
  if (typeof timeA === "number") {
    const result = timeB - timeA;
    return result;
  } else {
    let timeArrayA = timeA.split(":").map(Number);
    let timeArrayB = timeB.split(":").map(Number);

    let millisecondsA = timeArrayA[0] * 3600000 + timeArrayA[1] * 60000 + timeArrayA[2] * 1000 + timeArrayA[3] * (1000 / 24);
    let millisecondsB = timeArrayB[0] * 3600000 + timeArrayB[1] * 60000 + timeArrayB[2] * 1000 + timeArrayB[3] * (1000 / 24);

    let resultMilliseconds = millisecondsB - millisecondsA;

    if (resultMilliseconds < 0) {
      return "Error: Result is negative";
    }

    let resultHours = Math.floor(resultMilliseconds / 3600000);
    resultMilliseconds %= 3600000;
    let resultMinutes = Math.floor(resultMilliseconds / 60000);
    resultMilliseconds %= 60000;
    let resultSeconds = Math.floor(resultMilliseconds / 1000);
    let resultMilliseconds24;

    if (operation === "dur") {
      resultMilliseconds24 = Math.floor((resultMilliseconds % 1000) / (1000 / 24)) + 1;
    } else if (operation === "end") {
      resultMilliseconds24 = Math.floor((resultMilliseconds % 1000) / (1000 / 24)) - 1;
    }

    return `${resultHours}:${resultMinutes}:${resultSeconds}:${resultMilliseconds24}`;
  }
}

function timeStringToSeconds(timeString) {
  var parts = timeString.split(":"); // 将时间字符串按":"分割成数组

  // 将每个部分转换为数值
  var hours = parseFloat(parts[0]);
  var minutes = parseFloat(parts[1]);
  var seconds = parseFloat(parts[2]);
  var milliseconds = parseFloat(parts[3]);

  // 计算总秒数
  var totalSeconds = hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;

  return totalSeconds;
}

const calculateDuration = () => {
  duration.value = timeCalculation(startTime.value, endTime.value, "dur");
};
const calculateEndTime = () => {
  endTime.value = timeCalculation(startTime.value, duration.value, "end");
};

watch(
  outputForm,

  () => {
    if (outputForm.videoOutput === false) {
      //没有勾选videoOutput
      isRsesizeDisable.value = true;
      isCropDisable.value = true;

      isWidthDisable.value = true;
      isHeightDisable.value = true;
    } else {
      //勾选了videoOutput
      if (outputForm.resize === false) {
        //没有勾选resize
        isRsesizeDisable.value = true;

        isWidthDisable.value = true;
        isHeightDisable.value = true;
      } else {
        //勾选了resize
        isRsesizeDisable.value = false;
        if (outputForm.resizeTo === "Custom") {
          isWidthDisable.value = false;
          isHeightDisable.value = false;
        } else {
        
          const parts = outputForm.resizeTo.split(" · ");

          outputForm.resizeToWidth = parts[1].split("x")[0];
          outputForm.resizeToHeight = parts[1].split("x")[1];

          isWidthDisable.value = true;
          isHeightDisable.value = true;
        }
      }

      if (outputForm.crop === false) {
        //没有勾选crop
        isCropDisable.value = true;
      } else {
        isCropDisable.value = false;
      }
    }

    //format相关
    if (outputForm.format === "AIFF") {
      formatHzvv.value = "aif";
    } else if (outputForm.format === "AVI") {
      formatHzvv.value = "avi";
    } else if (outputForm.format === "QuickTime") {
      formatHzvv.value = "mov";
    } else if (outputForm.format === "MP3") {
      formatHzvv.value = "mp3";
    } else if (outputForm.format === "H.264") {
      formatHzvv.value = "mp4";
    } else if (outputForm.format === "DPX/Cineon Sequence") {
      formatHzvv.value = "dpx";
    } else if (outputForm.format === "IFF Sequence") {
      formatHzvv.value = "iff";
    } else if (outputForm.format === "JPEG Sequence") {
      formatHzvv.value = "jpg";
    } else if (outputForm.format === "OpenEXR Sequence") {
      formatHzvv.value = "exr";
    } else if (outputForm.format === "PNG Sequence") {
      formatHzvv.value = "png";
    } else if (outputForm.format === "Photoshop Sequence") {
      formatHzvv.value = "psd";
    } else if (outputForm.format === "Radiance Sequence") {
      formatHzvv.value = "hdr";
    } else if (outputForm.format === "SGI Sequence") {
      formatHzvv.value = "sgi";
    } else if (outputForm.format === "TIFF Sequence") {
      formatHzvv.value = "tif";
    } else if (outputForm.format === "Targa Sequence") {
      formatHzvv.value = "tga";
    } else if (outputForm.format === "WAV") {
      formatHzvv.value = "wav";
    }
  },
  {
    deep: true,
  }
);
watch(
  renderForm,

  () => {
    if (renderForm.fieldRender === "Off") {
      isOff.value = true;
    } else {
      isOff.value = false;
    }
  },
  {
    deep: true,
  }
);

const currentInput2 = ref(".mp4");
const outputModuleValue = ref("H.264 - Match Render Settings - 15 Mbps");
const outputExtValue = ref("mp4");

watch(
  hzvv,

  () => {
    outputExtValue.value = hzvv.value;
    outputModuleValue.value = selectValue.value;

    if (hzvv.value === "psd" || hzvv.value === "tif") {
      currentInput2.value = "_[#####]." + hzvv.value;
    } else {
      currentInput2.value = "." + hzvv.value;
    }

    lastInput2.value = currentInput.value + currentInput2.value;
  },

  {
    deep: true,
  }
);
watch(
  formatHzvv,

  () => {
    outputExtValue.value = formatHzvv.value;
    outputModuleValue.value = outputForm.format;

    if (formatHzvv.value === "aif" || formatHzvv.value === "avi" || formatHzvv.value === "mov" || formatHzvv.value === "mp3" || formatHzvv.value === "mp4" || formatHzvv.value === "wav") {
      currentInput2.value = "." + formatHzvv.value;
    } else {
      currentInput2.value = "_[#####]." + formatHzvv.value;
    }

    lastInput2.value = currentInput.value + currentInput2.value;
  },
  {
    deep: true,
  }
);

watch(
  currentInput,

  () => {
    lastInput2.value = currentInput.value + currentInput2.value;

    console.log("lastInput2.value:", lastInput2.value);
  },
  {
    deep: true,
  }
);

watch(
  isLook,

  () => {
    console.log(renderState.value);

    if (renderState.value === "rendering") {
      showRenderMsg.value = "渲染中...";
      myId.value = renderId.value;
    } else if (renderState.value === "created") {
      showRenderMsg.value = "创建中";
      myId.value = renderId.value;
    } else if (renderState.value === "finished") {
      showRenderMsg.value = "渲染进度";

      myId.value = downloadId.value; //这里不对
    } else {
      showRenderMsg.value = "渲染进度";

      myId.value = 0;
    }
  },
  {
    deep: true,
  }
);

const currentMd5 = ref([]);

watch(
  electronInfo,

  () => {
    if (electronInfo.value.allOK) {
      displayFilesRef.value = [];

      currentMd5.value = [];

      lastInput1.value = electronInfo.value.compName;

      inputFrameRate.value = electronInfo.value.frameRate;
      renderForm.frameRate = electronInfo.value.frameRate;

      outputForm.resizeToWidth = electronInfo.value.width;
      outputForm.resizeToHeight = electronInfo.value.height;

      startTime.value = electronInfo.value.startTime;
      endTime.value = electronInfo.value.endTime;
      calculateDuration();

      outputForm.starting = electronInfo.value.startFrame;
      outputForm.ending = electronInfo.value.endFrame;

      if (electronInfo.value.folderInfor) {
   

        electronInfo.value.folderInfor.forEach((file) => {
          insertFiles([{ name: file.name, size: file.size, md5: file.md5 }]);
          currentMd5.value.push(file.md5);
        });
      }
      loading.value = false;
      ws.send(JSON.stringify({ type: "fileAndFontCheck", files: currentMd5.value, fonts: electronInfo.value.font }));

      console.log(electronInfo.value.allOK);

 

      isSubmitDisable.value = false;
    }
  },
  {
    deep: true,
  }
);

watch(
  [progressCount, myId],
  () => {
    if (myId.value === 0) {
      //表示点击了 新建工作
      showRenderMsg.value = "渲染进度";
      renderProgress.value[0] = 0;
      downloadProgress.value[0] = 0;

      if (tempInfo.value.state !== "finished") {
        isDownloadDisable.value = true;
      }
    } else {
      if (renderState.value !== "finished") {
        if (progressCount.value > 0 && progressCount.value < 100) {
          showRenderMsg.value = "渲染中...";
        } else if (progressCount.value === 100) {
          showRenderMsg.value = "渲染完成";
        }
      }
    }
  },
  { deep: true }
);

const isCreated = ref(false);

watch(
  showRenderMsg,
  () => {
    if (showRenderMsg.value === "创建中") {
    
      isCreated.value = true;
    } else {
      isCreated.value = false;
    }
  },
  {
    deep: true,
  }
);

//监听数组变化，并调用排序函数
watch(
  displayFilesRef,
  () => {
    displayFilesRef.value.sort(compareFiles);
    updateFileList();
  },
  {
    deep: true,
  }
);
watch(
  tempInfo,
  () => {
    //如果tempInfo不为空
    if (!isEmpty(tempInfo.value)) {
      displayFilesRef.value = [];
      jobName.value = tempInfo.value.jobName;
      lastInput2.value = tempInfo.value.fileName;
      jobuid.value = tempInfo.value.jobuid;

      //装填
      tempInfo.value.assets.map((item) => {
        insertFiles([{ name: item.assetName, size: item.fileSize }]);
      });
    }
  },
  {
    deep: true,
  }
);

//检测对象是否为空
const isEmpty = (obj) => Reflect.ownKeys(obj).length === 0 && obj.constructor === Object;

/**
 * 文件上传相关：函数方法
 */
//寻找文件函数：传入要寻找的文件，在displayFilesRef中寻找，找到后返回
const findFile = (aFile) => {
  for (let i = 0; i < displayFilesRef.value.length; ++i) {
    if (aFile.name === displayFilesRef.value[i].name) return true;
  }
  return false;
};

watch(selectValue, () => {
  if (["H.264 - Match Render Settings - 40 Mbps", "H.264 - Match Render Settings - 15 Mbps", "H.264 - Match Render Settings - 5 Mbps"].includes(selectValue.value)) {
    hzvv.value = "mp4";
    outputForm.videoOutput = true;
    outputForm.resize = false;
    outputForm.crop = false;
    outputForm.outputAudio = "Auto";
  } else if (["Alpha Only", "Lossless", "Lossless with Alpha"].includes(selectValue.value)) {
    hzvv.value = "avi";
    outputForm.videoOutput = true;
    outputForm.resize = false;
    outputForm.crop = false;

    outputForm.outputAudio = "Auto";

    if (selectValue.value === "Alpha Only") {
      outputForm.outputAudio = "Off";
    }
  } else if (["High Quality", "High Quality with Alpha"].includes(selectValue.value)) {
    hzvv.value = "mov";
    outputForm.videoOutput = true;
    outputForm.resize = false;
    outputForm.crop = false;

    outputForm.outputAudio = "Auto";
  } else if (selectValue.value === "AIFF 48kHz") {
    hzvv.value = "aif";
    outputForm.videoOutput = false;
    outputForm.resize = false;
    outputForm.crop = false;

    outputForm.outputAudio = "On";
  } else if (["Multi-Machine Sequence", "Photoshop"].includes(selectValue.value)) {
    hzvv.value = "psd";
    outputForm.videoOutput = true;
    outputForm.resize = false;
    outputForm.crop = false;

    outputForm.outputAudio = "Off";
  } else if (selectValue.value === "TIFF Sequence with Alpha") {
    hzvv.value = "tif";
    outputForm.videoOutput = true;
    outputForm.resize = false;
    outputForm.crop = false;

    outputForm.outputAudio = "Off";
  }
});

//比较两个文件名，返回0、1、-1
const compareFiles = (a, b) => {
  const isAep1 = a.name.endsWith(".aep"); //endWith:判断字符串是否以指定的子字符串结尾（区分大小写）true/false
  const isAep2 = b.name.endsWith(".aep");
  //isAep1是'.aep'后缀，isAep2不是'.aep'后缀
  if (isAep1 && !isAep2) {
    return -1;
  }
  //isAep1不是'.aep'后缀，isAep2是'.aep'后缀
  else if (!isAep1 && isAep2) {
    return 1;
  }
  //都是，都不是
  else {
    return a.name.localeCompare(b.name);
  } //localeCompare:比较了\两个字符串 a.name 和 b.name。方法返回一个数字，表示两个字符串之间的关系。如果第一个字符串应该排在第二个字符串的前面，则返回一个正数。如果第一个字符串应该排在第二个字符串的后面，则返回一个负数。如果两个字符串相同，则返回 0
};

//删除文件，在displayFilesRef中删除。默认删除后更新文件列表
const deleteFile = (file, isUpdateFileList = true) => {
  delete md5CodeArr.value[file.name];

  //查找要删除的文件的位置
  const fileIndex = displayFilesRef.value.indexOf(file); //indexOf：返回某个指定的字符串值在字符串中首次出现的位置
  if (fileIndex !== -1) {
    displayFilesRef.value.splice(fileIndex, 1);
    if (isUpdateFileList) updateFileList();
    //如果数组长度为0
    if (displayFilesRef.value.length === 0) isSubmitDisable.value = true;
  }
};

//插入文件（新版中的选择文件）。
const insertFiles = async (aArray, isCheck = true) => {
  isSubmitDisable.value = true;
  if (isEmpty(tempInfo.value)) {
    loading.value = true;
  }

  //检测是否重名；对传入Array进行比较、排序，然后传入到displayFilesRef中
  aArray.forEach(function (file) {
    //forEach():调用数组的每个元素，并将元素传递给回调函数
    if (isCheck && findFile(file)) {
      const result = confirm("存在重复名字的文件: " + file.name + "，是否继续？");
      if (!result) return;
    }
    let low = 0;
    let high = displayFilesRef.value.length;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (compareFiles(displayFilesRef.value[mid], file) < 0) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    if (displayFilesRef)
      //splice：添加/删除 元素 （从何处开始，删几个，要添加的元素）
      displayFilesRef.value.splice(low, 0, file);
  });

  if (isEmpty(tempInfo.value)) {
    //文件MD5值
    let displayFiles = aArray;
    displayFiles.sort(compareFiles);
    // 创建一个Promise数组，用于存储每个文件MD5计算的异步操作
    const md5Promises = displayFiles.map(async (file) => {
      if (file.size < chunkSizes) {
        return generateSmallFileMD5(file);
      } else {
        return generateBigFileMD5(file);
      }
    });
    // 使用Promise.all等待所有MD5计算完成
    await Promise.all(md5Promises).then((md5Values) => {
      md5Values.forEach((md5v, index) => {
        md5CodeArr.value[displayFiles[index].name] = md5v;
      });
      // 在所有MD5计算完成后启用上传图标
      isSubmitDisable.value = false;
      loading.value = false;
      // 禁用渲染图标
      isRenderDisable.value = true;
    });
  }
};

// 点击‘选择文件’按钮
const selectBtn = async () => {
  const filesInputTemp = document.createElement("input");
  filesInputTemp.setAttribute("type", "file");
  filesInputTemp.setAttribute("multiple", "multiple");
  filesInputTemp.style.display = "none";
  filesInputTemp.click();

  // 定义一个函数来处理change事件，并返回一个Promise，当所有MD5计算完成后resolve
  const handleFileChange = (e) => {
    insertFiles(Array.from(e.target.files));
  };

  filesInputTemp.addEventListener("change", handleFileChange);
};

//生成小文件md5
function generateSmallFileMD5(file) {
  return new Promise((resolve, reject) => {
    try {
      const fileReader = new FileReader();
      fileReader.addEventListener("load", (e) => {
        resolve(md5(e.target.result));
      });
      //readAsArrayBuffer() 方法接受一个File对象作为参数，该对象代表要读取的文件。一旦读取完成，将会触发onload事件，并将文件内容作为ArrayBuffer对象存储在result属性中
      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      reject(0);
    }
  });
}

//生成大文件md5
function generateBigFileMD5(file) {
  return new Promise((resolve, reject) => {
    try {
      const fileReader = new FileReader();
      const chunks = Math.ceil(file.size / chunkSizes);
      let currentChunk = 0;
      const spark = new SparkMD5.ArrayBuffer();

      fileReader.onload = (e) => {
        spark.append(e.target.result); // Append array buffer
        currentChunk++;

        if (currentChunk < chunks) {
          loadNext();
        } else {
          resolve(spark.end()); // Compute hash
        }
      };

      fileReader.onerror = () => {
        reject(new Error("读取文件失败"));
      };

      function loadNext() {
        const start = currentChunk * chunkSizes;
        const end = start + chunkSizes >= file.size ? file.size : start + chunkSizes;

        fileReader.readAsArrayBuffer(file.slice(start, end));
      }

      loadNext();
    } catch {
      reject(0);
    }
  });
}

const changeName = (e) => {
  if (jobName.value !== e.target.value) {
    jobName.value = e.target.value;
    ws.send(JSON.stringify({ type: "jobNameCheck", data: e.target.value, id: workNameId.value }));
  }
};

const imgList = ref([]);

const changeImgName = (name, e) => {
  imgList.value[name] = e.target.value;
};
const changeSynName = (e) => {
  if (lastInput1.value !== e.target.value) {
    lastInput1.value = e.target.value;
  }
};
const changeOutName = (e) => {
  if (currentInput.value !== e.target.value) {
    currentInput.value = e.target.value;
  }
};

const test = () => {

};

//点击“替换”按钮
const handleReplace = (row) => {
  if (row.uploading) {
    //表示上传中
  } else {
    const fileInputTemp = document.createElement("input");
    fileInputTemp.setAttribute("type", "file");
    fileInputTemp.style.display = "none";
    fileInputTemp.click();
    fileInputTemp.addEventListener("change", (e) => {
      let newFilesList = Array.from(e.target.files);
      newFilesList.forEach(function (aFile) {
        //查找到同名文件
        if (findFile(aFile)) {
          //弹出确认按钮
          const result = confirm("存在重复名字的文件: " + aFile.name + "，是否继续？");
          if (!result) return;
        }
        //如果点了确认，删除原来的文件，替换新的文件
        deleteFile(row, false);

        insertFiles([aFile], false);
        if (row.sent) {
          //已上传
          ws.send(JSON.stringify({ type: "deleteFile", fileName: row.name, id: workNameId.value }));
        }
      });
    });
  }
};

//点击“删除”按钮（有ws请求）---------后期可能变位置
const handleDelete = (row) => {
  if (row.uploading) {
    //上传中
  } else {
    deleteFile(row);
    //websocket向服务器发送删除命令
    if (row.sent) {
      //已上传
      ws.send(JSON.stringify({ type: "deleteFile", fileName: row.name, id: workNameId.value }));
    }
  }
};

const format = (percentage) => {
  if (percentage === 0) {
    return "待上传";
  } else if (percentage === 100) {
    return "已上传";
  } else {
    return `${percentage}%`;
  }
};
const formatRender = (percentage) => {
  if (percentage === 0) {
    return "开始渲染";
  } else if (percentage === 100) {
    return "已完成";
  } else {
    return `${percentage}%`;
  }
};

//获取文件状态
const getState = (file) => {
  //能拿到名字
};

//定义更新文件列表的函数
function updateFileList() {
  assetList.value = displayFilesRef.value.filter((file) => {
    if (getSuffixName(file.name) !== "aep") {
      return file;
    }
  });

  displayFilesRef.value.forEach(function (file) {
    if (file.uploading) {
      //上传过程
      isSelectDisable.value = true;
    } else {
      isSelectDisable.value = false;
    }

    if (getSuffixName(file.name) === "aep") {
      if (jobName.value === "") {
        jobName.value = getFullName(file.name);
        ws.send(JSON.stringify({ type: "jobNameCheck", data: getFullName(file.name), id: workNameId.value }));
      }
    }
    /**
     * 上传进度条
     */

    if (file.sent || !isEmpty(tempInfo.value)) {
      //若文件发送，则提示：已上传
      showState.value[file.name] = 100;

      afterUpload.value = true;
      if (!isEmpty(tempInfo.value)) {
        // isSubmitDisable.value = true
      }
    } else {
      if (file.uploading) {
        showState.value[file.name] = parseFloat(file.sentPercentage);
      } else {
        showState.value[file.name] = 0;
      }
    }
  });
}

//获取文件名(过长则省略)
const getName = (name) => {
  if (name.length > 10) {
    return name.slice(0, 8) + "···";
  } else {
    return name.substring(0, name.indexOf("."));
  }
};
//获取文件名（全称）
const getFullName = (name) => {
  return name.substring(0, name.indexOf("."));
};

// 定义一个函数来获取文件的后缀名
function getFileExtension(filename) {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

//获取文件类型
const getTypeName = (typeName) => {
  let fileSuffixName = typeName.slice(((typeName.lastIndexOf(".") - 1) >>> 0) + 2);
  if (fileSuffixName === "aep") {
    return "工程";
  } else {
    return "素材";
  }
};

//获取文件后缀
const getSuffixName = (name) => {
  return name?.slice(((name.lastIndexOf(".") - 1) >>> 0) + 2);
};

//获取文件大小。对传入的文件判断大小
const formatFileSize = (size) => {
  if (size === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(size) / Math.log(k));
  return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

//点击“上传文件”按钮
const submitBtn = () => {
  if (electronInfo.value.allOK) {
    newSubmitFiles();
  } else {
    if (displayFilesRef.value[0].name.slice(((displayFilesRef.value[0].name.lastIndexOf(".") - 1) >>> 0) + 2) === "aep") {
      //如果数组的第一个文件的后缀为aep
      if (isRepeat.value && jobName.value !== "") {
        //如果数组的第一个文件的后缀为aep

        submitFiles(0, displayFilesRef.value.length);
      } else {
        alert("工作名重复或为空");
      }
    } else {
      alert("缺少工程文件！");
    }
  }
};

//等待ws上传文件
const submitFiles = async (startIndex, endIndex) => {
  //禁用上传按钮
  isSubmitDisable.value = true;
  //for循环
  for (let idx = startIndex; idx < endIndex; ++idx) {
    const file = displayFilesRef.value[idx];
    //file.sent的值为true时跳出for循环
    if (file.sent) continue;
    let message = {
      type: "fileUpload", //类型
      fileName: file.name, //文件名
      fileSize: file.size, //文件大小
      fileLastModified: file.lastModified, //最后一次修改时间(ms)
      fileChunkSize: chunkSize, //文件片段最大长度值
      md5Msg: md5CodeArr.value[file.name],
    };

    ws.send(JSON.stringify(message));

    while (isSend.value) {
      await sleep(1);
    }
    isSend.value = true;
    if (state.value) {
      file.sent = false;
      file.uploading = true;

      sendData(file, chunkSize);
    } else {
      showState.value[file.name] = 100;
      file.sent = true;
      file.uploading = false;
      continue;
    }

    while (idx < endIndex) {
      if (receivedSize.value === file.size) break;

      await sleep(10);
    }

    receivedSize.value = 0;
  }
  //启用渲染按钮

  isRenderDisable.value = false;
};

//newSubmit
const newSubmitFiles = async () => {
  //禁用上传按钮
  isSubmitDisable.value = true;
  electronInfo.value.allOK = false;

  //for循环
  for (let num = 0; num < displayFilesRef.value.length; ++num) {
    const file = displayFilesRef.value[num];
    if (file.sent) continue;

    if (file.md5 in needSendFiles) {
      console.log("A");
      let message = {
        type: "fileUpload",
        fileName: file.name,
        fileSize: file.size,
        md5Msg: file.md5,
        isFont: false,
      };
      ws.send(JSON.stringify(message));
    } else {
      console.log("B");
      let message = {
        type: "fileUpload",
        fileName: file.name,
        fileSize: file.size,
        md5Msg: file.md5,
        isFont: false,
      };
      ws.send(JSON.stringify(message));
      showState.value[file.name] = 100;
      file.sent = true;
      file.uploading = false;
    }

    // if (receivedSize.value === file.size) {
    //   setTimeout(function () {
    //     newSubmitFiles();
    //   }, 100);
    // }
  }
};

//
const sendData = async (file, chunkSize) => {
  if (file.size === 0) {
    alert("文件" + file.name + " 为空, 请传入一个非空的文件");
    return;
  }
  let offset = 0;
  /**
   * FileReader对象允许Web应用程序异步读取存储在用户计算机上的文件（或原始数据缓冲区）的内容
   */
  fileReader = new FileReader();
  //当读取操作发生错误时调用
  fileReader.addEventListener("error", (error) => console.error("Error reading file:", error));
  //当读取操作被中止时调用
  fileReader.addEventListener("abort", (event) => console.log("File reading aborted:", event));
  //当读取操作成功完成时调用
  fileReader.addEventListener("load", async function (e) {
    ws.send(e.target.result);
    await sleep(1);
    /**
     * 进度条
     */
    offset += e.target.result.byteLength;
    file.sentPercentage = ((offset / file.size) * 100).toFixed(2);

    if (offset < file.size) {
      readSlice(offset);
      ws.setRetryCount(0);

    } else {
      file.sent = true;
      file.uploading = false;
    }
    updateFileList();
  });
  //读取为二进制
  const readSlice = (o) => {
    const slice = file.slice(offset, o + chunkSize);
    //readAsArrayBuffer:将文件读取为二进制编码
    fileReader.readAsArrayBuffer(slice);
  };
  readSlice(0);
};

/**
 * 点击事件
 */
//点击“渲染”按钮
const renderBtn = () => {
  if (isRepeat.value && jobName.value !== "") {
    isSelectDisable.value = true;
    isSubmitDisable.value = true;
    isRenderDisable.value = true;
    temp = setTemplate();
    ws.send(JSON.stringify({ type: "render", userId: "user1", temp: temp, saveFileName: lastInput2.value, jobName: jobName.value, outputModule: outputModuleValue.value }));

    showRenderMsg.value = "创建中";
  } else {
    alert("工作名重复或为空");
  }
};
//点击“下载”按钮
const downloadBtn = async () => {
  isDownloadDisable.value = true;
  ws.send(JSON.stringify({ type: "fileDownload", jobuid: jobuid.value }));

};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

//"新建工作按钮"
const addWork = () => {
  displayFilesRef.value = [];

  isSubmitDisable.value = true;
  isRenderDisable.value = true;
  isDownloadDisable.value = true;
  jobName.value = "";

  isRepeat.value = true;
  isSelectDisable.value = false;

  renderProgress.value[myId.value] = 0;
  downloadProgress.value[myId.value] = 0;
  myId.value = 0;
  // myId2.value = 0
  showRenderMsg.value = "渲染进度";

  workNameId.value = 0;
  tempInfo.value = {};

  selectValue.value = "H.264 - Match Render Settings - 15 Mbps";

  electronInfo.value.allOK = false;
};

//组装Template
const setTemplate = () => {
  const templateJSON = {};
  //为templateJSON模板添加'template'的json
  templateJSON["template"] = {
    src: displayFilesRef.value[0].name, //使用'.aep'后缀的名字
    composition: lastInput1.value,
    outputModule: outputModuleValue.value,
    outputExt: outputExtValue.value, //后缀也要相应的改
    imageSequence: lastInput2.value.includes("#####") ? true : false,
    settingsTemplate: renderSelectValue.value,
    outputSettings: objectToString(outputSettingsTemp.value),
    renderSettings: objectToString(renderSettingsTemp.value),
  };

  //为templateJSON模板添加'actions'的json
  templateJSON["actions"] = {
    postrender: [
      {
        module: "@nexrender/action-encode",
        preset: outputExtValue.value,
        output: lastInput2.value,
      },
    ],
  };
  templateJSON["assets"] = [];

  displayFilesRef.value.forEach((file) => {
    if (!file.name.endsWith(".aep")) {
      let temp = {
        src: file.name,
        type: file.type.split("/")[0],
        layerName: imgList.value[file.name] ? imgList.value[file.name] : file.name,
      };
      templateJSON["assets"].push(temp);
    }
  });

  return templateJSON;
};

const options = [
  {
    value: "AIFF 48kHz",
    label: "AIFF 48kHz",
  },
  {
    value: "Alpha Only",
    label: "Alpha Only",
  },
  {
    value: "H.264 - Match Render Settings - 15 Mbps",
    label: "H.264 - Match Render Settings - 15 Mbps",
  },
  {
    value: "H.264 - Match Render Settings - 40 Mbps",
    label: "H.264 - Match Render Settings - 40 Mbps",
  },
  {
    value: "High Quality",
    label: "High Quality",
  },
  {
    value: "High Quality with Alpha",
    label: "High Quality with Alpha",
  },
  {
    value: "Lossless",
    label: "Lossless",
  },
  {
    value: "Lossless with Alpha",
    label: "Lossless with Alpha",
  },
  // {
  //   value: "Multi-Machine Sequence",
  //   label: "Multi-Machine Sequence",
  // },
  {
    value: "Photoshop",
    label: "Photoshop",
  },
  {
    value: "TIFF Sequence with Alpha",
    label: "TIFF Sequence with Alpha",
  },
];
const renderOptions = [
  {
    value: "Best Settings",
    label: "Best Settings",
  },
  {
    value: "Current Settings",
    label: "Current Settings",
  },
  {
    value: "DV Settings",
    label: "DV Settings",
  },
  {
    value: "Draft Settings",
    label: "Draft Settings",
  },
  // {
  //   value: "Multi-Machine Settings",
  //   label: "Multi-Machine Settings",
  // },
];
</script>

<template>
  <el-space>
    <div class="work">
      <div class="left">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <h3>文件上传</h3>
            </div>
          </template>

          <div class="uploadDiv">
            <el-button ref="ref1" type="primary" plain @click="selectBtn" :disabled="isSelectDisable"> 选择文件 </el-button>
          </div>

          <div class="table">
            <el-table :data="displayFilesRef" style="width: 100%" class="target-table">
              <el-table-column min-width="10%" label="类型">
                <template #default="scope">
                  <div style="display: flex; align-items: center">
                    {{ getTypeName(scope.row.name) }}
                  </div>
                </template>
              </el-table-column>

              <el-table-column min-width="18%" label="文件名">
                <template #default="scope">
                  <div style="display: flex; align-items: center">
                    {{ getName(scope.row.name) + "." + getFileExtension(scope.row.name) }}
                  </div>
                </template>
              </el-table-column>

              <el-table-column min-width="15%" label="体积">
                <template #default="scope">
                  <div style="display: flex; align-items: center">
                    {{ formatFileSize(scope.row.size) }}
                  </div>
                </template>
              </el-table-column>

              <el-table-column min-width="30%" label="状态" header-align="center">
                <template #default="scope">
                  <div style="display: flex; align-items: center">
                    <div class="demo-progress">
                      <el-progress :text-inside="true" :stroke-width="26" :percentage="showState[scope.row.name]" :format="format" />
                    </div>
                  </div>
                </template>
              </el-table-column>

              <el-table-column min-width="27%" label="操作&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" header-align="center">
                <template #default="scope">
                  <el-button type="primary" :icon="Edit" @click="handleReplace(scope.row)" />

                  <el-button type="danger" :icon="Delete" @click="handleDelete(scope.row)" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>

        <div class="left-bottom">
          <el-card class="box-card message">
            <template #header>
              <div class="card-header">
                <h3>渲染进度展示区域</h3>
              </div>
            </template>

            <div class="my-progress">
              <el-progress type="dashboard" :percentage="renderProgress[myId]">
                <template #default="{ percentage }">
                  <span class="percentage-value">{{ percentage }}%</span><br /><br />
                  <span class="percentage-label" style="display: flex; justify-content: center"
                    >{{ showRenderMsg }}&nbsp;
                    <div class="loading" v-if="isCreated"></div
                  ></span>
                </template>
              </el-progress>
            </div>
          </el-card>

          <el-card class="box-card message">
            <template #header>
              <div class="card-header">
                <h3>下载进度展示区域</h3>
              </div>
            </template>
            <div class="my-progress">
              <el-progress type="dashboard" :percentage="downloadProgress[myId]">
                <template #default>
                  <span class="percentage-value">{{ downloadProgress[myId] ?? 0 }}%</span><br /><br />
                  <span class="percentage-label">下载进度</span>
                </template>
              </el-progress>
            </div>
          </el-card>
        </div>
      </div>

      <div class="right">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <h3>设置</h3>
              <!-- <el-button @click="test">测试按钮</el-button> -->
            </div>
          </template>

          <div class="show">
            <!-- 工作名设置 -->

            <el-descriptions class="work-class" title="工作设置" :column="1" border>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item" ref="ref2">工作名</div>
                </template>

                <el-tooltip :visible="!isRepeat" placement="bottom-start" effect="light">
                  <template #content>
                    <span class="workName">工作名重复</span>
                  </template>
                  <input class="my-input" type="text" :value="jobName" @blur="changeName($event)" />
                </el-tooltip>
              </el-descriptions-item>
            </el-descriptions>

            <el-descriptions class="work-class" direction="vertical" :column="2" border>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item" ref="ref3">输出设置</div>
                </template>
                <div class="select my-icon">
                  <el-select v-model="selectValue" placeholder="H.264 - Match Render Settings - 15 Mbps" class="my-select">
                    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                  <el-button :icon="Setting" plain @click="setOutputDialog = true" style="border: none; margin-left: -5px" />
                </div>
              </el-descriptions-item>

              <!-- 渲染设置 -->
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item" ref="ref8">渲染设置</div>
                </template>
                <div class="select my-icon">
                  <el-select v-model="renderSelectValue" placeholder="Best Settings" class="my-select">
                    <el-option v-for="item in renderOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                  <el-button :icon="Setting" plain @click="setRenderDialog = true" style="border: none; margin-left: -5px" />
                </div>
              </el-descriptions-item>
            </el-descriptions>

            <!-- 输出表单设置 -->
            <el-drawer v-model="setOutputDialog" title="参数设置" :with-header="false" size="50%">
              <div class="bordered-div">
                <h1>Main Options</h1>
                <div class="first">
                  <div class="first-left">
                    <el-form label-width="150px" :model="outputForm" class="demo-form-inline">
                      <el-form-item label="Format">
                        <el-select v-model="outputForm.format" placeholder="选择格式">
                          <!-- AIFF、AVI、DPX/Cineon Sequence、H.264、IFF Sequence、JPEG Sequence、MP3、OpenEXR Sequence、PNG Sequence、Photoshop Sequence、QuickTime、Radiance Sequence、SGI Sequence、TIFF Sequence、Targa Sequence、WAV -->
                          <el-option label="AIFF" value="AIFF" />
                          <el-option label="AVI" value="AVI" />
                          <el-option label="DPX/Cineon Sequence" value="DPX/Cineon Sequence" />
                          <el-option label="H.264" value="H.264" />
                          <el-option label="IFF Sequence" value="IFF Sequence" />
                          <el-option label="JPEG Sequence" value="JPEG Sequence" />
                          <el-option label="MP3" value="MP3" />
                          <el-option label="OpenEXR Sequence" value="OpenEXR Sequence" />
                          <el-option label="PNG Sequence" value="PNG Sequence" />
                          <el-option label="Photoshop Sequence" value="Photoshop Sequence" />
                          <el-option label="QuickTime" value="QuickTime" />
                          <el-option label="Radiance Sequence" value="Radiance Sequence" />
                          <el-option label="SGI Sequence" value="SGI Sequence" />
                          <el-option label="TIFF Sequence" value="TIFF Sequence" />
                          <el-option label="Targa Sequence" value="Targa Sequence" />
                          <el-option label="WAV" value="WAV" />
                        </el-select>
                      </el-form-item>

                      <!-- <el-form-item label="Post-Render Action">
                        <el-select v-model="outputForm.postRenderAction" placeholder="None">
      
                          <el-option label="None" value="None" />
                          <el-option label="Import" value="Import" />
                          <el-option label="Import & Replace Usage" value="Import & Replace Usage" />
                          <el-option label="Set Proxy" value="Set Proxy" />
                        </el-select>
                      </el-form-item> -->
                    </el-form>
                  </div>
                  <div class="first-right">
                    <el-checkbox v-model="outputForm.includeProjectLink" style="margin-bottom: 12px">Include Project Link</el-checkbox>
                    <!-- <el-checkbox v-model="outputForm.includeSourceXMPMetadata" label="false">Include Source XMP Metadata</el-checkbox> -->
                  </div>
                </div>

                <div class="second">
                  <!-- 上边框的内容 -->
                  <div class="second-header">
                    <el-checkbox v-model="outputForm.videoOutput" style="">Video Output</el-checkbox>
                  </div>
                  <!-- 边框内的内容: -->
                  <div class="second-one">
                    <div class="second-left">
                      <el-form label-width="110px" :model="outputForm" class="demo-form-inline" :disabled="!outputForm.videoOutput">
                        <el-form-item label="Channels">
                          <el-select v-model="outputForm.channels" placeholder="RGB">
                            <!--  RGB、Alpha、RGB+Alpha-->
                            <el-option label="RGB" value="RGB" />
                            <el-option label="Alpha" value="Alpha" />
                            <el-option label="RGB+Alpha" value="RGB+Alpha" />
                          </el-select>
                        </el-form-item>

                        <el-form-item label="Depth">
                          <el-select v-model="outputForm.depth" placeholder="Millions of Colors">
                            <!-- Millions of Colors、Millions of Colors+、256 Grays、Trillions of Colors、Trillions of Colors+、Floating Point、Floating Point+、Floating Point Gray、256 Colors -->
                            <el-option label="Millions of Colors" value="Millions of Colors" />
                            <el-option label="Millions of Colors+" value="Millions of Colors+" />
                            <el-option label="256 Grays" value="256 Grays" />
                            <el-option label="Trillions of Colors" value="Trillions of Colors" />
                            <el-option label="Trillions of Colors+" value="Trillions of Colors+" />
                            <el-option label="Floating Point" value="Floating Point" />
                            <el-option label="Floating Point+" value="Floating Point+" />
                            <el-option label="Floating Point Gray" value="Floating Point Gray" />
                            <el-option label="256 Colors" value="256 Colors" />
                          </el-select>
                        </el-form-item>

                        <el-form-item label="Color">
                          <el-select v-model="outputForm.color" placeholder="Premultiplied (Matted)">
                            <!-- Straight (Unmatted)、Premultiplied (Matted) -->
                            <el-option label="Straight (Unmatted)" value="Straight (Unmatted)" />
                            <el-option label="Premultiplied (Matted)" value="Premultiplied (Matted)" />
                          </el-select>
                        </el-form-item>
                      </el-form>
                      <el-text v-model="renderForm.starting" class="mx-1" style="margin: 0 50px">Starting # <el-input style="width: 100px" v-model="outputForm.starting" :disabled="!outputForm.videoOutput" @blur="isNoStartingVal()" /></el-text>

                      <el-text v-model="renderForm.ending" class="mx-1" style="margin: 0 50px">Ending # <el-input style="width: 100px" v-model="outputForm.ending" :disabled="!outputForm.videoOutput" @blur="isNoEndingVal()" /></el-text>

                      <el-checkbox v-model="outputForm.useCompFrameNumber" :disabled="!outputForm.videoOutput">Use Comp Frame Number</el-checkbox>
                    </div>

                    <!-- <div class="second-right">
                      <el-button round>Format Options...</el-button>
                      <h3>VBR,Target 15.00 Mbps</h3>
                    </div> -->
                  </div>

                  <div class="second-two">
                    <!-- 上边框的内容 -->
                    <div class="second-header">
                      <el-checkbox v-model="outputForm.resize" style="" :disabled="!outputForm.videoOutput">Resize</el-checkbox>
                    </div>
                    <!-- 边框内的内容: -->
                    <div style="display: flex; flex-direction: column">
                      <div class="resize-top" style="display: flex; justify-content: space-evenly">
                        <el-checkbox v-model="outputForm.lockAspectRatio" style="" :disabled="isRsesizeDisable">Lock Aspect Ratio</el-checkbox>

                        <el-form>
                          <el-form-item label="Resize Quality">
                            <el-select v-model="outputForm.resizeQuality" placeholder="High" style="width: 100px" :disabled="isRsesizeDisable">
                              <el-option label="Low" value="Low" />
                              <el-option label="High" value="High" />
                            </el-select>
                          </el-form-item>
                        </el-form>
                      </div>

                      <div class="resize-bottom">
                        <el-table :data="resizeTableData" style="width: 100%">
                          <el-table-column prop="name" />

                          <el-table-column label="Width" header-align="center" align="center">
                            <template #default="scope"> <el-input v-model="outputForm.resizeToWidth" :disabled="isWidthDisable" @blur="isNoWidthVal" /> </template>
                          </el-table-column>

                          <el-table-column width="50px" align="center">
                            <template #default="scope" style="display: flex; justify-content: center"> x </template>
                          </el-table-column>

                          <el-table-column label="Height" header-align="center" align="center">
                            <template #default="scope"> <el-input v-model="outputForm.resizeToHeight" :disabled="isHeightDisable" @blur="isNoHeightVal" /> </template>
                          </el-table-column>

                          <el-table-column min-width="200px">
                            <template #default="scope">
                              <div style="display: flex; align-items: center">
                                <el-select v-model="outputForm.resizeTo" placeholder="Custom" :disabled="isRsesizeDisable">
                                  <el-option v-for="item in resizeOptions" :key="item.value" :label="item.label" :value="item.value" />
                                </el-select>
                              </div>
                            </template>
                          </el-table-column>
                        </el-table>
                      </div>
                    </div>
                  </div>

                  <div class="second-three">
                    <!-- 上边框的内容 -->
                    <div class="second-header">
                      <el-checkbox v-model="outputForm.crop" style="" :disabled="!outputForm.videoOutput">Crop</el-checkbox>
                    </div>
                    <!-- 边框内的内容: -->
                    <div>
                      <div class="crop-top" style="display: flex; justify-content: center">
                        <el-checkbox v-model="outputForm.useRegionOfInterest" style="" :disabled="isCropDisable">Use Region of Interest</el-checkbox>
                      </div>

                      <div class="crop-bottom" style="margin-top: 20px">
                        <el-table :data="resizeTableData" style="width: 100%">
                          <el-table-column label="Top" header-align="center">
                            <template #default="scope">
                              <div style="display: flex; align-items: center">
                                <el-input v-model="outputForm.cropTop" :disabled="isCropDisable" @blur="isNoTopVal" />
                              </div>
                            </template>
                          </el-table-column>

                          <el-table-column label="Left" header-align="center">
                            <template #default="scope">
                              <div style="display: flex; align-items: center">
                                <el-input v-model="outputForm.cropLeft" :disabled="isCropDisable" @blur="isNoLeftVal" />
                              </div>
                            </template>
                          </el-table-column>

                          <el-table-column label="Bottom" header-align="center">
                            <template #default="scope">
                              <div style="display: flex; align-items: center">
                                <el-input v-model="outputForm.cropBottom" :disabled="isCropDisable" @blur="isNoBottomVal" />
                              </div>
                            </template>
                          </el-table-column>

                          <el-table-column label="Right" header-align="center">
                            <template #default="scope">
                              <div style="display: flex; align-items: center">
                                <el-input v-model="outputForm.cropRight" :disabled="isCropDisable" @blur="isNoRightVal" />
                              </div>
                            </template>
                          </el-table-column>
                        </el-table>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="third">
                  <!-- 上边框的内容 -->
                  <div class="third-header">
                    <el-select v-model="outputForm.outputAudio" placeholder="Output Audio">
                      <!--  On、Off、Auto-->
                      <el-option label="On" value="On" />
                      <el-option label="Off" value="Off" />
                      <el-option label="Auto" value="Auto" />
                    </el-select>
                  </div>
                  <!-- 边框内的内容: -->
                  <div>
                    <p style="margin: 10px 0">Audio will be output only if the composition has audio.</p>
                    <div style="margin-top: 10px">
                      <el-row :gutter="20">
                        <el-col :span="8">
                          <el-select v-model="outputForm.audioSampleRate" placeholder="Audio Sample Rate" :disabled="outputForm.outputAudio === 'Off'">
                            <!--  16,000 kHz、22,050 kHz、24,000 kHz、32,000 kHz、44,100 kHz、48,000 kHz-->
                            <el-option label="16,000 kHz" value="16,000 kHz" />
                            <el-option label="22,050 kHz" value="22,050 kHz" />
                            <el-option label="24,000 kHz" value="24,000 kHz" />
                            <el-option label="32,000 kHz" value="32,000 kHz" />
                            <el-option label="44,100 kHz" value="44,100 kHz" />
                            <el-option label="48,000 kHz" value="48,000 kHz" /> </el-select
                        ></el-col>
                        <el-col :span="8">
                          <el-select v-model="outputForm.audioBitDepth" placeholder="Audio Bit Depth" :disabled="outputForm.outputAudio === 'Off'">
                            <!--  8 Bit、16 Bit、32 Bit-->
                            <el-option label="8 Bit" value="8 Bit" />
                            <el-option label="16 Bit" value="16 Bit" />
                            <el-option label="32 Bit" value="32 Bit" /> </el-select
                        ></el-col>
                        <el-col :span="8">
                          <el-select v-model="outputForm.audioChannels" placeholder="Audio Channels" :disabled="outputForm.outputAudio === 'Off'">
                            <!--   Mono、Stereo-->
                            <el-option label="Mono" value="Mono" />
                            <el-option label="Stereo" value="Stereo" /> </el-select
                        ></el-col>
                      </el-row>
                    </div>
                    <!-- <el-button round style="margin-top: 20px">Format Options...</el-button> -->
                  </div>
                </div>
              </div>
              <div style="display: flex; justify-content: center; margin-top: 20px">
                <el-button plain @click="setOutputDialog = false">Cancel</el-button>
                <el-button type="primary" plain @click="console.log(outputForm.includeProjectLink)">OK</el-button>
              </div>
            </el-drawer>

            <!-- 渲染表单设置 -->
            <div class="renderDrawer">
              <el-drawer v-model="setRenderDialog" title="参数设置" :with-header="false" size="45%">
                <div class="bordered-div1">
                  <el-form :inline="true" :model="renderForm" label-position="right" label-width="110px" class="demo-form-inline">
                    <el-form-item label="Quality">
                      <el-select v-model="renderForm.quality" placeholder="Best">
                        <!-- Best、Draft、WireFrame、Current -->
                        <el-option label="Best" value="Best" />
                        <el-option label="Draft" value="Draft" />
                        <el-option label="WireFrame" value="WireFrame" />
                        <el-option label="Current Settings" value="Current Settings" />
                      </el-select>
                    </el-form-item>

                    <el-form-item label="Proxy Use">
                      <el-select v-model="renderForm.proxyUse" placeholder="Use No Proxies">
                        <!-- Use All Proxies、Use Comp Proxies Only、Use No Proxies、Current Settings -->
                        <el-option label="Use All Proxies" value="Use All Proxies" />
                        <el-option label="Use Comp Proxies Only" value="Use Comp Proxies Only" />
                        <el-option label="Use No Proxies" value="Use No Proxies" />
                        <el-option label="Current Settings" value="Current Settings" />
                      </el-select>
                    </el-form-item>

                    <el-form-item label="Resolution">
                      <el-select v-model="renderForm.resolution" placeholder="Full">
                        <!-- Full、Half、Third、Quarter、Current Settings -->
                        <el-option label="Full" value="Full" />
                        <el-option label="Half" value="Half" />
                        <el-option label="Third" value="Third" />
                        <el-option label="Quarter" value="Quarter" />
                        <el-option label="Current Settings" value="Current Settings" />
                      </el-select>
                    </el-form-item>

                    <el-form-item label="Effects">
                      <el-select v-model="renderForm.effects" placeholder="Current Settings">
                        <!-- All On、All Off、Current Settings -->
                        <el-option label="All On" value="All On" />
                        <el-option label="All Off" value="All Off" />
                        <el-option label="Current Settings" value="Current Settings" />
                      </el-select>
                    </el-form-item>

                    <!-- <el-form-item label="Size">
                      <el-text v-model="renderForm.size" class="mx-1" style="width: 220px">368x640</el-text>
                    </el-form-item> -->

                    <el-form-item label="Solo Switches">
                      <el-select v-model="renderForm.soloSwitches" placeholder="Current Settings">
                        <!-- All Off、Current Settings -->
                        <el-option label="All Off" value="All Off" />
                        <el-option label="Current Settings" value="Current Settings" />
                      </el-select>
                    </el-form-item>

                    <el-form-item label="Disk Cache">
                      <el-select v-model="renderForm.diskCache" placeholder="Read Only">
                        <!-- Read Only、Current Settings -->
                        <el-option label="Read Only" value="Read Only" />
                        <el-option label="Current Settings" value="Current Settings" />
                      </el-select>
                    </el-form-item>

                    <el-form-item label="Guide Layers">
                      <el-select v-model="renderForm.guideLayers" placeholder="All Off">
                        <!-- All Off、Current Settings -->
                        <el-option label="All Off" value="All Off" />
                        <el-option label="Current Settings" value="Current Settings" />
                      </el-select>
                    </el-form-item>

                    <el-form-item label="Color Depth">
                      <el-select v-model="renderForm.colorDepth" placeholder="Current Settings">
                        <!-- 8 bits per channel、16 bits per channel、32 bits per channel、Current Settings -->
                        <el-option label="8 bits per channel" value="8 bits per channel" />
                        <el-option label="16 bits per channel" value="16 bits per channel" />
                        <el-option label="32 bits per channel" value="32 bits per channel" />
                        <el-option label="Current Settings" value="Current Settings" />
                      </el-select>
                    </el-form-item>
                  </el-form>
                </div>
                <br /><br />

                <div class="bordered-div2">
                  <div style="display: flex" class="time-sampling-style">
                    <div class="box-left">
                      <el-form :model="renderForm" label-position="right" label-width="125px" class="demo-form-inline">
                        <el-form-item label="Frame Blending">
                          <el-select v-model="renderForm.frameBlending" placeholder="On for Checked Layers">
                            <!-- On for Checked Layers、Off for All Layers、Current Settings -->
                            <el-option label="On for Checked Layers" value="On for Checked Layers" />
                            <el-option label="Off for All Layers" value="Off for All Layers" />
                            <el-option label="Current Settings" value="Current Settings" />
                          </el-select>
                        </el-form-item>

                        <el-form-item label="Field Render">
                          <el-select v-model="renderForm.fieldRender" placeholder="Off">
                            <!-- Off、Upper Field First、Lower Field First -->
                            <el-option label="Off" value="Off" />
                            <el-option label="Upper Field First" value="Upper Field First" />
                            <el-option label="Lower Field First" value="Lower Field First" />
                          </el-select>
                        </el-form-item>

                        <el-form-item label="3:2 Pulldown">
                          <el-select v-model="renderForm.pulldown" :disabled="isOff" placeholder="Off">
                            <!-- Off、WSSWW、SSWWW、SWWWS、WWWSS、WWSSW -->
                            <el-option label="Off" value="off" />
                            <el-option label="WSSWW" value="WSSWW" />
                            <el-option label="SSWWW" value="SSWWW" />
                            <el-option label="SWWWS" value="SWWWS" />
                            <el-option label="WWWSS" value="WWWSS" />
                            <el-option label="WWSSW" value="WWSSW" />
                          </el-select>
                        </el-form-item>

                        <el-form-item label="Motion Blur">
                          <el-select v-model="renderForm.motionBlur" placeholder="On for Checked Layers">
                            <!-- On for Checked Layers、Off for All Layers、Current Settings -->
                            <el-option label="On for Checked Layers" value="On for Checked Layers" />
                            <el-option label="Off for All Layers" value="Off for All Layers" />
                            <el-option label="Current Settings" value="Current Settings" />
                          </el-select>
                        </el-form-item>

                        <el-form-item label="Time Span">
                          <el-select v-model="renderForm.timeSpan" placeholder="Length of Camp">
                            <!-- Length of Comp、Work Area Only 、Custom -->
                            <el-option label="Length of Comp" value="Length of Comp" />
                            <el-option label="Work Area Only" value="Work Area Only" />
                            <el-option label="Custom" value="Custom"><el-button text @click="changeTime">Custom</el-button></el-option>
                          </el-select>
                        </el-form-item>
                      </el-form>
                    </div>

                    <el-dialog v-model="customDialogVisible" title="时间修改" width="500" align-center>
                      <!-- 弹窗内容 -->
                      <div>
                        <el-form class="demo-form-inline" label-width="120px">
                          <el-form-item>格式： 小时:分钟:秒:毫秒</el-form-item>
                          <el-form-item label="Start">
                            <el-input v-model="startTime" @input="calculateDuration" @blur="isNoStartTimeVal" />
                          </el-form-item>
                          <el-form-item label="End">
                            <el-input v-model="endTime" @input="calculateDuration" @blur="isNoEndTimeVal" />
                          </el-form-item>
                          <el-form-item label="Duration">
                            <el-input v-model="duration" @input="calculateEndTime" @blur="isNoDurationTimeVal" />
                          </el-form-item>
                        </el-form>
                      </div>

                      <template #footer>
                        <div class="dialog-footer">
                          <el-button @click="customDialogVisible = false">Cancel</el-button>
                          <el-button type="primary" @click="putRenderTemp"> Confirm </el-button>
                        </div>
                      </template>
                    </el-dialog>

                    <el-dialog v-model="customDialogVisible2" width="220" align-center>
                      <!-- 弹窗内容 -->
                      <div>
                        <div class="input__x">
                          <input type="text" class="input__fill" placeholder="修改帧率" v-model="inputFrameRate" />
                          <label class="input__label">帧率</label>
                        </div>
                      </div>

                      <template #footer>
                        <div class="dialog-footer">
                          <el-button type="primary" @click="customDialogVisible2 = false" style="margin-right: 10px"> 确认</el-button>
                        </div>
                      </template>
                    </el-dialog>

                    <div class="box-right" style="margin-left: 30px; width: 320px; display: flex; flex-direction: column">
                      <div class="box-right-top bordered-div4" style="border: 1px solid #dcdfe6">
                        <el-form :model="renderForm" label-width="120px" :inline="true" style="padding: 10px">
                          <el-form-item>
                            <el-radio-group v-model="renderForm.frameRate">
                              <!-- <el-radio label="Use comp's frame rate">Use comp's frame rate</el-radio> -->
                              <el-radio>Use this frame rate: <el-input v-model="inputFrameRate" style="width: 60px" /></el-radio>
                            </el-radio-group>
                          </el-form-item>
                        </el-form>
                      </div>
                      <div class="box-right-bottom" style="margin-top: 10px; display: flex">
                        <div style="display: flex; flex-direction: column">
                          <el-descriptions :column="1" border>
                            <el-descriptions-item>
                              <template #label>
                                <div class="cell-item">Start</div>
                              </template>
                              {{ startTime }}
                            </el-descriptions-item>
                            <el-descriptions-item>
                              <template #label>
                                <div class="cell-item">End</div>
                              </template>
                              {{ endTime }}
                            </el-descriptions-item>
                            <el-descriptions-item>
                              <template #label>
                                <div class="cell-item">Duration</div>
                              </template>
                              {{ duration }}
                            </el-descriptions-item>
                          </el-descriptions>
                        </div>
                        <div style="display: flex; align-items: center; margin-left: 20px">
                          <el-button round @click="changeTime">Custom...</el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <br />
                <br />
                <!-- <div class="bordered-div3">
                  <div style="margin-left: 90px; margin-top: 30px; margin-bottom: 30px"><el-switch v-model="switchFlag" class="mt-2" style="margin-left: 24px; margin-right: 10px" inline-prompt :active-icon="Check" :inactive-icon="Close" />Skip existing files (allow multi-machine rendering)</div>
                </div> -->

                <br /><br />
                <br />

                <div style="display: flex; justify-content: center">
                  <el-button plain @click="setRenderDialog = false">Cancel</el-button>
                  <el-button type="primary" plain>OK</el-button>
                </div>
              </el-drawer>
            </div>

            <el-scrollbar v-loading="loading" element-loading-text="文件导入中..." class="show-input">
              <!-- Template模板 -->
              <div v-for="(item, index) in displayFilesRef" :key="index">
                <el-descriptions title="Template" direction="vertical" :column="3" border class="asset-class" v-if="getSuffixName(item.name) === 'aep'">
                  <el-descriptions-item label="文件名">{{ item.name }}</el-descriptions-item>
                  <el-descriptions-item label="合成名">
                    <el-tooltip class="box-item" effect="dark" content="指定一个正确的合成名" placement="bottom-start">
                      <input class="my-input2" type="text" name="text" :value="lastInput1" @input="changeSynName($event)" />
                    </el-tooltip>
                  </el-descriptions-item>
                  <el-descriptions-item label="输出名" :span="2">
                    <div class="out-class">
                      <input class="my-input2 out-2" type="text" name="text" :value="currentInput" @blur="changeOutName($event)" />

                      <div class="out-3">{{ outputExtValue }}</div>
                    </div></el-descriptions-item
                  >
                </el-descriptions>
              </div>

              <div v-if="assetList.length">
                <!-- Asset模板 -->
                <el-descriptions title="Asset" class="asset-class"> </el-descriptions>

                <el-table :data="assetList" border style="width: 100%" :header-cell-style="{ backgroundColor: '#F5F7FA' }">
                  <el-table-column label="文件名" min-width="40%">
                    <template #default="scope">{{ scope.row.name }} </template>
                  </el-table-column>

                  <el-table-column label="图层名" min-width="60%">
                    <template #default="scope">
                      <el-tooltip class="box-item" effect="dark" content="图层名请与素材名称对应" placement="right-start">
                        <input malength="30" type="text" name="text" :value="imgList[scope.row.name] || scope.row.name" @input="changeImgName(scope.row.name, $event)" class="assets my-input2" />
                      </el-tooltip>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-scrollbar>
          </div>

          <template #footer>
            <div class="card-footer">
              <el-button type="primary" :disabled="isSubmitDisable" @click="submitBtn" ref="ref4"> 上传 </el-button>

              <el-button :disabled="isRenderDisable" @click="renderBtn" type="primary" ref="ref5">渲染</el-button>

              <el-button :disabled="isDownloadDisable" @click="downloadBtn" type="primary" ref="ref6">下载</el-button>

              <div class="work-style">
                <button @click="addWork">
                  <span class="button_top" ref="ref7"> 新建工作 </span>
                </button>
              </div>
            </div>
          </template>
        </el-card>
      </div>
    </div>
  </el-space>

  <el-tour v-model="isCover">
    <el-tour-step :target="ref1?.$el" title="选择文件"> 选择本地需要渲染的文件，注意以'aep'为后缀的文件有且只能有一个 </el-tour-step>
    <el-tour-step target=".target-table" title="文件信息" description="所选择文件的基本信息会展示在这里,可对导入的文件进行替换、删除操作" />
    <el-tour-step :target="ref2" title="设置工作名" description="设置本次渲染工作的名称" />
    <el-tour-step :target="ref3" title="设置格式" description="选择要渲染的格式" />
    <el-tour-step :target="ref4?.$el" placement="top" title="上传" description="选择文件并设置完成后，即可点击上传" />
    <el-tour-step :target="ref5?.$el" placement="top" title="渲染" description="对上传的文件进行渲染" />placement="top" <el-tour-step :target="ref6?.$el" placement="top" title="下载" description="下载已渲染完成的工程" />placement="top"
    <el-tour-step :target="ref7" placement="top" title="新建工作" description="新建渲染工作" />
  </el-tour>
</template>

<style scoped style="less">
@media screen and (max-width: 1536px) {
  /* 在屏幕宽度小于等于1536px时应用的样式规则 */
  .target-table {
    height: 250px !important;
  }
  .show-input {
    height: 270px !important;
  }
  .select {
    width: 280px !important;
  }
  /* .time-sampling-style {
    flex-direction: column;
  } */
  .renderDrawer ::v-deep .el-drawer {
    width: 54% !important;
  }
}

@media screen and (min-width: 1920px) {
  /* 在屏幕宽度大于等于1920px */
  .target-table {
    height: 500px !important;
  }
  .show-input {
    height: 520px !important;
  }
}

.target-table {
  height: 370px;
}
.show-input {
  height: 390px;
}
.work {
  display: flex;
  gap: 10px;
  margin: 0 50px;
  margin-top: 5px;
  height: var(--my-height);
}
.left {
  flex: 1;
  width: 50%;
}

.right {
  flex: 1;
  width: 50%;
}

.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 5px;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

/* .box-card {
  width: 480px;
} */

.scrollbar-demo-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  margin: 10px;
  text-align: center;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
.message {
  flex: 1;
}

.uploadDiv {
  display: flex;
  /* justify-content: space-between; */
}
.table {
  margin: 10px 0;
}
.show {
}

.demo-progress .el-progress--line {
  /* margin-bottom: 15px; */
  width: 180px;
}

.my-progress {
  display: flex;
  justify-content: center;
  align-items: center;
}

.left-bottom {
  display: flex;
  /* grid-template-columns: 1fr 1fr; */
  gap: 5px;
  margin-top: 10px;
}
.job-name {
  display: flex;
  justify-content: center;
  align-items: center;
}

.workName {
  font-size: 14px;
  color: #f56c6c;
}
.my-input {
  line-height: 0.4rem;
  border-width: 0.1px;

  border-radius: 4px;
}
.my-input2 {
  /* margin-top: 0.75rem; */
  border-width: 0.1px;
  border-radius: 6px;

  height: 100%;
  width: 60%;
}
.out-class {
  display: flex;
  justify-content: center;
  align-items: center;
}

.out-2 {
  flex: 3;
  margin-top: 0;

  border-top-right-radius: 0; /* 右上角 */
  border-bottom-right-radius: 0; /* 右下角 */
}
.out-3 {
  height: 37.33px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-width: 0.1px;
  border-radius: 6px;
  flex: 1;
  background: #f5f7fa;
  border-color: #6b7280;

  cursor: pointer;
  color: #909399;
  border-left-width: 0;
  border-top-left-radius: 0; /* 左上角 */
  border-bottom-left-radius: 0; /* 左下角 */
}
.my-font {
  font-weight: bold;
}
.my-font2 {
  font-weight: 550;
}

/* From www.lingdaima.com */

.work-style {
  margin-left: 25px;
}
.work-style button {
  /* Variables */
  --button_radius: 0.75em;
  --button_color: #ffffff;
  --button_outline_color: #409eff;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: var(--button_radius);
  background: var(--button_outline_color);
}

.button_top {
  display: block;
  box-sizing: border-box;
  border: 1px solid var(--button_outline_color);
  border-radius: var(--button_radius);
  padding: 0.55em 1em;
  background: var(--button_color);
  color: var(--button_outline_color);
  transform: translateY(-0.2em);
  transition: transform 0.1s ease;
}

.work-style button:hover .button_top {
  /* Pull the button upwards when hovered */
  transform: translateY(-0.33em);
}

.work-style button:active .button_top {
  /* Push the button downwards when pressed */
  transform: translateY(0);
}
.my-card {
}

.el-descriptions {
}
.cell-item {
  display: flex;
  align-items: center;
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter,
.expand-fade-leave-active {
  margin-left: 20px;
  opacity: 0;
}
.el-descriptions__header {
  margin-bottom: 5px !important;
  margin-top: 15px !important;
}
.temp-class {
  margin-top: 20px;
}
.asset-class {
  margin-top: 25px;
  margin-bottom: -6px;
}
.my-select {
  height: 100%;
  width: 261px;
}
.el-space {
  display: block;
}
.select {
  width: 335px;
}
.my-icon {
  display: flex;
}
.demo-form-inline .el-input {
  --el-input-width: 220px;
}

.demo-form-inline .el-select {
  --el-select-width: 220px;
}

.bordered-div {
  position: relative; /* 设置相对定位，以便伪元素相对于它定位 */
  /* border: 1px solid #dcdfe6;  */
  padding: 10px;
}

.bordered-div1 {
  position: relative; /* 设置相对定位，以便伪元素相对于它定位 */
  border: 1px solid #dcdfe6; /* 设置边框样式 */
  padding-top: 20px;
}

.bordered-div1::before {
  content: 'Composition"main"'; /* 添加文字内容 */
  position: absolute; /* 设置绝对定位，使之悬浮在 div 上方 */
  top: -15px; /* 负值使之超出 div 上方 */
  left: 10px; /* 水平偏移量 */
  padding: 0 5px; /* 设置内边距 */
  background-color: #fff; /* 设置背景颜色 */
  color: #909399;
}
.bordered-div2 {
  position: relative; /* 设置相对定位，以便伪元素相对于它定位 */
  border: 1px solid #dcdfe6; /* 设置边框样式 */
  padding: 20px;
}

.bordered-div2::before {
  content: "Time Sampling"; /* 添加文字内容 */
  position: absolute; /* 设置绝对定位，使之悬浮在 div 上方 */
  top: -15px; /* 负值使之超出 div 上方 */
  left: 10px; /* 水平偏移量 */
  padding: 0 5px; /* 设置内边距 */
  background-color: #fff; /* 设置背景颜色 */
  color: #909399;
}
.bordered-div3 {
  position: relative; /* 设置相对定位，以便伪元素相对于它定位 */
  border: 1px solid #dcdfe6; /* 设置边框样式 */
  padding-top: 20px;

  backgroundcolor: pink;
}

.bordered-div3::before {
  content: "Options"; /* 添加文字内容 */
  position: absolute; /* 设置绝对定位，使之悬浮在 div 上方 */
  top: -15px; /* 负值使之超出 div 上方 */
  left: 10px; /* 水平偏移量 */
  padding: 0 5px; /* 设置内边距 */
  background-color: #fff; /* 设置背景颜色 */
  color: #909399;
}
.bordered-div4 {
  position: relative; /* 设置相对定位，以便伪元素相对于它定位 */
  border: 1px solid #dcdfe6; /* 设置边框样式 */
  padding-top: 20px;
}

.bordered-div4::before {
  content: "Frame Rate"; /* 添加文字内容 */
  position: absolute; /* 设置绝对定位，使之悬浮在 div 上方 */
  top: -13px; /* 负值使之超出 div 上方 */
  left: 10px; /* 水平偏移量 */
  padding: 0 5px; /* 设置内边距 */
  background-color: #fff; /* 设置背景颜色 */
  color: #909399;
}
.first {
  position: relative; /* 设置相对定位，以便伪元素相对于它定位 */
  border: 1px solid #dcdfe6; /* 设置边框样式 */
  padding-top: 20px;

  display: flex;
  margin-top: 10px;
}
.first-right {
  margin-left: 30px;
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  justify-content: flex-start;
}

.second {
  position: relative; /* 设置相对定位，以便伪元素相对于它定位 */
  border: 1px solid #dcdfe6; /* 设置边框样式 */
  padding: 20px;
  margin-top: 15px;
}
.second-two {
  position: relative; /* 设置相对定位，以便伪元素相对于它定位 */
  border: 1px solid #dcdfe6; /* 设置边框样式 */
  padding: 20px;
  margin-top: 20px;
}
.third {
  position: relative; /* 设置相对定位，以便伪元素相对于它定位 */
  border: 1px solid #dcdfe6; /* 设置边框样式 */
  padding: 20px;
  margin-top: 23px;
}
.second-three {
  position: relative; /* 设置相对定位，以便伪元素相对于它定位 */
  border: 1px solid #dcdfe6; /* 设置边框样式 */
  padding: 20px;
  margin-top: 20px;
}
.second-header {
  position: absolute;
  top: -15px;
  left: 10px;
  background-color: #fff;
  padding: 0 10px;
}
.third-header {
  position: absolute;
  top: -15px;
  left: 10px;
  background-color: #fff;
  padding: 0 10px;
  width: 157px;
}
.second-one {
  display: flex;
}
.second-right {
  display: flex;
  flex-direction: column;
  /* justify-content:center; */
  margin-left: 60px;
  /* align-items: center; */
}
.el-row {
  margin-bottom: 20px;
}
.el-row:last-child {
  margin-bottom: 0;
}
.el-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
.loading {
  position: relative;
  width: 16px;
  height: 16px;
  border: 2px solid #59a6ff;
  border-top-color: rgba(0, 0, 0, 0.2);
  border-right-color: rgba(0, 0, 0, 0.2);
  border-bottom-color: rgba(0, 0, 0, 0.2);
  border-radius: 100%;

  animation: circle infinite 0.75s linear;
}

@keyframes circle {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
.input__x {
  position: relative;
}

.input__fill {
  outline: none;
  height: 34px;
  line-height: 34px;
  box-sizing: border-box;
  padding: 0 6px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: #666;
}

.input__fill:not(:placeholder-shown),
.input__fill:focus {
  border-color: #3be2be;
}

.input__fill::placeholder {
  color: transparent;
}

.input__label {
  position: absolute;
  left: 10px;
  top: 5px;
  transition: transform 0.25s;
  font-size: 16px;
  padding: 0 6px;
  pointer-events: none;
  color: #999;
}

.input__fill:not(:placeholder-shown) ~ .input__label,
.input__fill:focus ~ .input__label {
  transform: scale(0.75) translate(0, -20px);
  background: #fff;
  color: #00d1a4;
}
</style>
