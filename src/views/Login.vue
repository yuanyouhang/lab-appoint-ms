<template>
    <div class="login-wrap">
        <div class="ms-login">
            <div class="ms-title">高校实验室预约后台管理系统</div>
            <el-form :model="param" :rules="rules" ref="login" label-width="0px" class="ms-content">
                <el-form-item prop="username">
                    <el-input v-model="param.username" placeholder="admin">
                        <template #prepend>
                            <el-button icon="el-icon-user"></el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" placeholder="123456" v-model="param.password"
                        @keyup.enter="submitForm()">
                        <template #prepend>
                            <el-button icon="el-icon-lock"></el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <div class="login-btn">
                    <el-button type="primary" @click="submitForm()">登录</el-button>
                </div>
                <p class="login-tips">
                    <span @click="toRegister()" class="register">注册</span>
                </p>
            </el-form>
        </div>
    </div>
</template>

<script>
import { ref, reactive } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import axios from '../api/request';

export default {
    setup() {
        const router = useRouter();
        const store = useStore();
        const param = reactive({
            username: "",
            password: "",
        });

        const rules = {
            username: [{required: true, message: "请输入用户名", trigger: "blur"}],
            password: [{ required: true, message: "请输入密码", trigger: "blur" }],
        };
        const login = ref(null);
        const submitForm = () => {
            // 根据验证规则进行验证
            login.value.validate((valid) => {
                if (valid) {
                    axios.post('/admins/login', {
                        username: param.username,
                        password: param.password
                    })
                    .then(res => {
                        // console.log(res);
                        if(res.status === 403) {
                            ElMessage.error(res.message);
                        }
                        else {
                            ElMessage.success("登录成功");
                            localStorage.setItem("username", res.username);
                            // localStorage.setItem("token", res.token);
                            localStorage.setItem('loginDatetime', new Date().toLocaleString())
                            router.push("/");
                        }
                    })
                    // .catch(err => {
                    //     // console.log(err);
                    //     ElMessage.error('' + err);
                    // })
                } else {
                    ElMessage.error("登录失败");
                    return false;
                }
            });
        };
        const toRegister = () => {
            router.push('/register');
        }

        store.commit("clearTags");

        return {
            param,
            rules,
            login,
            submitForm,
            toRegister
        };
    },
};
</script>

<style scoped>
.login-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    background-image: url(../assets/img/login-bg.jpeg);
    background-size: 100%;
}
.ms-title {
    width: 100%;
    line-height: 50px;
    text-align: center;
    font-size: 20px;
    color: #3E983E;
    border-bottom: 1px solid #ddd;
}
.ms-login {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 350px;
    transform: translate(-50%, -50%);
    border-radius: 5px;
    background: rgba(141,251,251,0.7);
    overflow: hidden;
}
.ms-content {
    padding: 30px 30px;
}
.login-btn {
    text-align: center;
}
.login-btn button {
    width: 100%;
    height: 36px;
    margin-bottom: 10px;
}
.login-tips {
    font-size: 12px;
    line-height: 30px;
    color: blue;
}
.register {
    cursor: pointer;
}
.register:hover {
    color: #409EFF;
}
</style>