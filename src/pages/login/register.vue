<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { mainStore } from "@/store";
import md5 from "js-md5";
const router = useRouter();
const registerFormRef = ref();

/** 登录表单数据 */
const registerForm = reactive({
  username: "",
  password: "",
});

/** 登录表单校验规则 */
const registerFormRules = {
  username: [
    { required: true, message: "手机号必填", trigger: "blur" },
    { pattern: /^1[3456789]\d{9}$/, message: "手机号码格式不正确", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 4, max: 16, message: "长度在 4 到 16 个字符", trigger: "blur" },
  ],
};

/** 注册逻辑 */
const handleRegister = (registerFormRef) => {
  registerFormRef.validate((valid) => {
    if (valid) {
      fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: registerForm.username, password: md5(registerForm.password), type: "register" }),
      })
        .then((res) => {
          res
            .json()
            .then((res) => {
              if (res.state) {
                mainStore().msgAlert("已成功注册", "success");
                setTimeout(() => {
                  router.push({ path: "/login" });
                }, 500);
              } else {
                mainStore().msgAlert(res.msg, "warning");
                registerForm.username = "";
                registerForm.password = "";
              }
            })
            .catch(() => {
              mainStore().msgAlert("注册时发生错误", "error");
            });
        })
        .catch(() => {
          mainStore().msgAlert("请求失败", "error");
          registerForm.password = "";
        });
    } else {
      return false;
    }
  });
};
</script>

<template>
  <div class="container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2>注册</h2>
        </div>
      </template>
      <div>
        <el-form :label-position="'left'" label-width="60px" :model="registerForm" :rules="registerFormRules" ref="registerFormRef">
          <el-form-item label="账号:" prop="username" class="register-item1">
            <el-input v-model.trim="registerForm.username" placeholder="请输入注册手机号"></el-input>
          </el-form-item>
          <el-form-item label="密码:" prop="password" class="register-item">
            <el-input type="password" v-model="registerForm.password" show-password placeholder="请输入注册密码"></el-input>
          </el-form-item>
          <div class="from-button register-item">
            <el-button type="primary" @click.prevent="handleRegister(registerFormRef)">确认注册</el-button>
          </div>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="less">
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

.register-item1 {
  margin-top: 10px;
}
.register-item {
  margin-top: 40px;
}
</style>
