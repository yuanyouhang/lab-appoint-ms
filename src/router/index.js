import {createRouter, createWebHashHistory} from "vue-router";
import Home from "../views/Home.vue";
import NotFound from '../views/NotFound.vue'

const routes = [
    {
        path: '/',
        redirect: '/dashboard'
    }, {
        path: "/",
        name: "Home",
        component: Home,
        children: [
            {
                path: "/dashboard",
                name: "dashboard",
                meta: {
                    title: '系统首页',
                    permiss: '1'
                },
                component: () => import ( /* webpackChunkName: "dashboard" */ "../views/dashboard.vue")
            }, {
                path: "/stuAppointment",
                name: "stuAppointment",
                meta: {
                    title: '学生预约管理'
                },
                component: () => import ("../views/StuAppointment.vue")
            }, {
              path: "/teachAppointment",
              name: "teachAppointment",
              meta: {
                  title: '教师预约管理'
              },
              component: () => import ("../views/TeachAppointment.vue")
            }, {
                path: "/adminAppointment",
                name: "adminAppointment",
                meta: {
                    title: '管理员手动预约管理'
                },
                component: () => import ("../views/AdminAppointment.vue")
            }, {
                path: "/addLaboratory",
                name: "addLaboratory",
                meta: {
                    title: '实验室信息录入'
                },
                component: () => import ("../views/AddLaboratory.vue")
            }, {
                path: "/notices",
                name: "notices",
                meta: {
                    title: '公告管理'
                },
                component: () => import ("../views/Notice.vue")
            }, {
                path: "/sysVar",
                name: "sysVar",
                meta: {
                    title: '系统参数设置'
                },
                component: () => import ("../views/SysVar.vue")
            }, {
                path: "/students",
                name: "students",
                meta: {
                    title: '学生管理',
                    // permission: true
                },
                component: () => import ("../views/Student.vue")
            }, {
                path: "/message",
                name: "message",
                meta: {
                    title: '系统消息'
                },
                component: () => import ("../views/Message.vue")
            }, {
                path: "/laboratories",
                name: "laboratories",
                meta: {
                    title: '实验室信息表'
                },
                component: () => import ("../views/Laboratory.vue")
            }, {
                path: '/teachers',
                name: 'teachers',
                meta: {
                    title: '教师管理'
                },
                component: () => import ('../views/Teacher.vue')
            }, {
              path: '/teacherId',
              name: 'teacherId',
              meta: {
                  title: '教师编号录入'
              },
              component: () => import ('../views/TeacherId.vue')
            }, {
                path: '/user',
                name: 'user',
                meta: {
                    title: '个人中心'
                },
                component: () => import (/* webpackChunkName: "user" */ '../views/user.vue')
            }, {
                path: '/labSchedule',
                name: 'labSchedule',
                meta: {
                    title: '实验室课程表'
                },
                component: () => import ('../views/LabSchedule.vue')
            },
        ]
    }, {
        path: "/login",
        name: "Login",
        meta: {
            title: '登录'
        },
        component: () => import ( /* webpackChunkName: "login" */ "../views/Login.vue")
    },
    {
        path: "/register",
        name: "Register",
        meta: {
            title: '注册'
        },
        component: () => import('../views/Register.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notfound',
      component: NotFound
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

// 全局前置导航守卫
router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title} | lab-appoint-ms`;
    // const role = localStorage.getItem('username');
    const username = localStorage.getItem('username');
    if (!username && to.path !== '/login' && to.path !== '/register') {
        next('/login');
    // } else if (to.meta.permission) {
    //     // 如果是管理员权限则可进入，这里只是简单的模拟管理员权限而已
    //     role === 'admin'
    //         ? next()
    //         : next('/403');
    }
    else {
      next();
    }
});

export default router;