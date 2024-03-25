<script setup>
import svgWaves from "./svgWaves.vue";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { mainStore } from "@/store";
import md5 from "js-md5";


import { inject } from 'vue'
const ws = inject('ws')

const key = "account";
const getToken = () => sessionStorage.getItem(key);
const setToken = (token) => sessionStorage.setItem(key, token);
const removeToken = () => sessionStorage.removeItem(key);

const router = useRouter();
const loginFormRef = ref();

/** 登录表单数据 */
const loginForm = reactive({
  username: "",
  password: "",
});

/** 登录表单校验规则 */
const loginFormRules = {
  username: [{ required: true, message: "请输入账号", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 4, max: 16, message: "长度在 4 到 16 个字符", trigger: "blur" },
  ],
};

/** 登录逻辑 */
const handleLogin = (loginFormRef) => {
  loginFormRef.validate((valid) => {
    if (valid) {

     

      fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: loginForm.username, password: md5(loginForm.password), type: "login" }),
      })
        .then((res) => {
          res.json().then((res) => {
            if (res.state) {
              
              setToken(loginForm.username);

              mainStore().msgAlert("登录成功", "success");
              setTimeout(() => {
                router.push({ path: "/" });
              }, 100);
            
              ws.setId(loginForm.username);
              ws.connect()
           


            } else {
              console.log(res)
              mainStore().msgAlert(res.msg, "warning");
              router.push({ path: "/login" });
            }
          });
        })
        .catch(() => {
          mainStore().msgAlert("请求失败", "error");
          loginForm.password = "";
        });
    } else {
      return false;
    }
  });
};

const toRegister = () => {
  router.push({ path: "/register" });
};
</script>

<template>
  <div class="container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2>AE云渲染登录入口</h2>
        </div>
      </template>
      <div>
        <el-form :label-position="'left'" label-width="60px" :model="loginForm" :rules="loginFormRules" ref="loginFormRef">
          <el-form-item label="账号:" prop="username" class="login-item1">
            <el-input v-model.trim="loginForm.username" placeholder="请输入账号"></el-input>
          </el-form-item>
          <el-form-item label="密码:" prop="password" class="login-item">
            <el-input type="password" v-model="loginForm.password" show-password placeholder="请输入密码"></el-input>
          </el-form-item>
          <div class="from-button login-item">
            <el-button type="primary" @click="toRegister">注册</el-button>
            <el-button type="primary" @click.prevent="handleLogin(loginFormRef)">登录</el-button>
          </div>
        </el-form>
      </div>
    </el-card>
  </div>
  <!-- <svgWaves class="svg"/> -->

</template>

<style scoped lang="less">
.my-con {
  position: absolute;
  z-index: 9999;

}
.svg {
  position: absolute;
  bottom: 0;
  vertical-align: bottom;
  padding-bottom: 0;
  z-index: 2;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.box-card {
  width: 480px;
}

.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
}

.from-button {
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-item1 {
  margin-top: 10px;
}
.login-item {
  margin-top: 40px;
}
</style>
