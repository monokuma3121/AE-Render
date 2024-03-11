import { createRouter, createWebHistory} from "vue-router";
import { useRouter } from "vue-router";
import { mainStore } from "@/store";
//引入进度条
import nprogress from "nprogress";
import "nprogress/nprogress.css";


const wsURL = "wss://websocket.jutian.online:8081";


const routes = [
  {
    path: "/test",
    name: "test",
    meta: {
      title: "登录",
      keepAlive: true,
      requireAuth: false,
    },
    component: () => import("@/pages/test.vue"),
  },
  {
    path: "/login",
    name: "Login",
    meta: {
      title: "登录",
      keepAlive: true,
      requireAuth: false,
    },
    component: () => import("@/pages/login/index.vue"),
  },
  {
    path: "/register",
    name: "Register",
    meta: {
      title: "注册",
      keepAlive: true,
      requireAuth: false,
    },
    component: () => import("@/pages/login/register.vue"),
  },
  {
    path: "/",
    name: "Index",
    meta: {
      isAuth: true,
      title: "首页",
      keepAlive: true,
      requireAuth: true,
    },
    component: () => import("@/pages/index.vue"),
    children: [
      {
        path: "/",
        name: "work",
        meta: {
          keepAlive: true,
        },
        component: () => import("@/pages/work/index.vue"),
      },
      {
        path: "history",
        name: "history",
        meta: {
          keepAlive: false,
        },
        component: () => import("@/pages/history/index.vue"),
      },
    ]
  },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
  
});




router.beforeEach((to, from, next) => {
  //如果路由需要跳转
  if (to.meta.isAuth) {
      //判断 如果本地存储是account的时候，可以进去
      if (sessionStorage.getItem('account') ) { 
  
        nprogress.start();

          next()  //放行

          
      } else {
          router.push({ path: "/login" })
      }
  } else {
      // 否则，放行
      nprogress.start();
      next()
  }
})

//全局后置守卫
router.afterEach((to, from) => {
  nprogress.done();
});



export default router;