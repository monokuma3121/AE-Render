<script setup>
//在历史页面刷新时获取不到数据是因为ws连接断了

import { ref, watch } from "vue";
import { ElTable, ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { mainStore } from "@/store";
import {storeToRefs} from 'pinia'
const store = mainStore()



let {isLook,renderState,downloadId} = storeToRefs(store)



const router = useRouter();

  // 声明触发的事件
  const emit = defineEmits(["on-click"]);

/**
 * 全局
 */
import { inject } from "vue";
let ws = inject("ws");
const tempInfo = inject("tempInfo");


const histroyWorkList = inject("histroyWorkList");



//多选框
const multipleSelection = ref([]);
const deleteIdArr = ref([]);
const deleteUidArr = ref([]);
const downloadArr = ref([]);

let currentPage = ref(1); //当前页 刷新后默认显示第一页
let pageSize = ref(12); // 定义单页展示数量

// 切换页面
const changePage = (val) => {
  currentPage.value = val;
};

const test = () => {


};

const openErrorMsg = (msg) => {
  store.msgAlert(`${msg}`, "error");
}
  

//多选
const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};



/**
 * 操作：
 * 删除、批量删除、查看、下载
 */
//删除
const handleDelete = (id,job_id) => {
  if(job_id) {
    ws.send(JSON.stringify({ type: "historyWork", work: "delete", jobids: [id],jobuids: [job_id]  }));
  }else {
    ws.send(JSON.stringify({ type: "historyWork", work: "delete", jobids: [id],jobuids: ['']  }));
  }




};

//点击“下载”按钮
const handleDownload = (id) => {
  
  ws.send(JSON.stringify({ type: "fileDownload", jobuid: id }));

};

//批量删除
const deleteMany = () => {
  deleteIdArr.value = [];
  deleteUidArr.value = [];
  multipleSelection.value.forEach(function (file) {
    if (file.state !== "rendering") {
      deleteIdArr.value.push(file.id);
      if (file.job_id) {
        deleteUidArr.value.push(file.job_id);
      }
    }
  });
  ws.send(JSON.stringify({ type: "historyWork", work: "delete", jobids: [...deleteIdArr.value],jobuids: [...deleteUidArr.value]}));


};

//批量下载
const downloadMany =  () => {
  multipleSelection.value.forEach(function (file) {
    if (file.state === "finished") {
      downloadArr.value.push(file.job_id);
    }
  });

  ws.send(JSON.stringify({ type: "historyWork", work: "download", jobuids: [...downloadArr.value] }));
};

//查看
const handleLook = (id,state,jobuid) => {
  downloadId.value = jobuid
  renderState.value = state;
  isLook.value += 1;
  ws.send(JSON.stringify({ type: "searchTemplateInfor",  "jobid":id }));

  emit("on-click");
 

}
</script>

<template>
<div class="history">
  <el-card>
    <template #header>
      <div class="card-header">
        <!-- <el-button @click="test">测试</el-button> -->
        <el-button plain type="danger" @click="deleteMany">批量删除</el-button>
        <!-- <el-button  plain type="primary" @click="downloadMany" >批量下载</el-button> -->
      </div>
    </template>
    <el-table :data="histroyWorkList.slice((currentPage - 1) * pageSize, currentPage * pageSize)" style="width: 100%"  @selection-change="handleSelectionChange" height="630" class="my-table">
      <el-table-column type="selection" min-width="5%" />

      <el-table-column type="index" label="序号" min-width="10%"> </el-table-column>

      <el-table-column label="工作名" min-width="10%">
        <template #default="scope">{{ scope.row.name }}</template>
      </el-table-column>
      <el-table-column label="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;状态" min-width="20%">
        <template #default="scope">
          <span v-if="scope.row.state === 'finished'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;完成</span>
          <span v-if="scope.row.state === 'rendering'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;渲染中</span>
          <span v-if="scope.row.state === 'created' || scope.row.state === 'waiting'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;等待中</span>
          <span v-if="scope.row.state === 'error'" style="color: #F56C6C" @click="openErrorMsg(scope.row.error_information)">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;错误</span>
          <span v-if="scope.row.state === 'started'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;开始</span>

        </template>
      </el-table-column>
      <el-table-column label="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;操作" min-width="30%" >
        <template #default="scope">
          <el-button plain  @click="handleLook(scope.row.id,scope.row.state,scope.row.job_id)">查看</el-button>

          <el-button plain type="danger" v-if="scope.row.state !== 'rendering'" @click="handleDelete(scope.row.id,scope.row.job_id)">删除</el-button>

          <el-button plain type="primary" v-if="scope.row.state === 'finished'" @click="handleDownload(scope.row.job_id)">下载</el-button>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="25%">
        <template #default="scope">{{ scope.row.create_time }}</template>
      </el-table-column>
    </el-table>
    <div class="footer">
      <el-pagination background layout="prev, pager, next,jumper, ->, total" :total="histroyWorkList.length" @current-change="changePage" :current-page="currentPage" :page-size="pageSize" />
    </div>
  </el-card>
</div>
</template>

<style scoped>
@media screen and (max-width: 1536px) {
  /* 在屏幕宽度小于等于1536px时应用的样式规则 */
.my-table {
  /* height: 500px !important; */
}


}
@media screen and (min-width: 1920px) {
  /* 在屏幕宽度大于等于1920px */
  /* .my-table {
  height: 800px !important;
}
  .el-table__inner-wrapper {
  height: 800px !important;
}
.el-table tr {
  height: 60px !important;
} */
}
.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
}
.card-header {
  display: flex;
  justify-content: flex-end;
}
</style>
