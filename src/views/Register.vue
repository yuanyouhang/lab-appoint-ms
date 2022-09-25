<template>
    <div class="login-wrap">
        <div class="ms-login">
            <div class="ms-title">注册成为管理员</div>
            <el-form
              :model="ruleForm"
              :rules="rules"
              ref="register"
              label-width="80px"
              label-position="left"
              class="ms-content"
            >
              <el-form-item prop="username" label='用户名'>
                  <el-input placeholder="username" v-model="ruleForm.username">
                  </el-input>
              </el-form-item>

              <el-form-item prop="pass" label='密码'>
                  <el-input type="password" placeholder="password" v-model="ruleForm.pass">
                  </el-input>
              </el-form-item>

              <el-form-item prop="checkPass" label='确认密码'>
                  <el-input type="password" placeholder="checkPassword" v-model="ruleForm.checkPass">
                  </el-input>
              </el-form-item>

              <el-form-item prop="realname" label='真实姓名'>
                  <el-input placeholder="realname" v-model="ruleForm.realname">
                  </el-input>
              </el-form-item>

              <el-form-item prop="phoneNumber" label='手机号码'>
                  <el-input placeholder="phoneNumber" v-model="ruleForm.phoneNumber">
                  </el-input>
              </el-form-item>

              <el-form-item prop="officeLocation" label='办公室'>
                  <el-input placeholder="officeLocation" v-model="ruleForm.officeLocation">
                  </el-input>
              </el-form-item>

              <p class="login-tips">办公室地址格式参考：六教-6-601</p>

              <div class="login-btn">
                  <el-button type="primary" @click="submitForm()">注册</el-button>
              </div>
            </el-form>
        </div>
    </div>
</template>

<script>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import axios from '../api/request'

export default {
    setup() {
      const router = useRouter();
      const register = ref(null)
      const ruleForm = reactive({
        username: '',
        pass: '',
        checkPass: '',
        phoneNumber: '',
        officeLocation: '',
        realname: ''
      })

      const validateUsername = (rule, value, callback) => {
        if(!value) {
          callback(new Error('请输入用户名！'))
        }
        else {
          (async () => {
            const result = await axios.get('/admins/findByName', {
              params: {
                username: ruleForm.username
              }
            })
            // 如果返回的结果非空，则表明该用户已存在
            if(result) {
              callback(new Error('该用户名已存在！'))
            }
            else {
              callback();
            }
          })()
        }
      }

      const validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码！'))
        } else {
          if (ruleForm.checkPass !== '') {
            register.value.validateField('checkPass', () => null)
          }
          callback()
        }
      }
      const validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码！'))
        } else if (value !== ruleForm.pass) {
          callback(new Error("两次密码不匹配!"))
        } else {
          callback()
        }
      }

      const checkPhoneNumber = (rule, value, callback) => {
        const regex = /^(13[0-9]{9})|(15[0-9]{9})|(17[0-9]{9})|(18[0-9]{9})|(19[0-9]{9})$/;
        if(value === '') {
          callback(new Error('请输入手机号码！'))
        }
        else if(!regex.test(value)) {
          callback(new Error('手机号码格式错误！'))
        }
        else {
          callback();
        }
      }

      const rules = reactive({
        username: [{ required: true, validator: validateUsername, trigger: "blur" }],
        pass: [{ required: true, validator: validatePass, trigger: 'blur' }],
        checkPass: [{ required: true, validator: validatePass2, trigger: 'blur' }],
        phoneNumber: [{ required: true, validator: checkPhoneNumber, trigger: 'blur' }],
        officeLocation: [{required: true, message: "请输入办公室地址", trigger: "blur"}],
        realname:[{required: true, message: "请输入姓名", trigger: "blur"}]
      })

      const submitForm = () => {
        // 根据验证规则进行验证
        register.value.validate((valid) => {
          // 表单验证通过
          if (valid) {
            // 调用API添加管理员信息
            axios.post('/admins/insert', {
              username: ruleForm.username,
              password: ruleForm.pass,
              phone_number: ruleForm.phoneNumber,
              office: ruleForm.officeLocation,
              realname: ruleForm.realname
            })
            .then(res => {
              // console.log(res);
              ElMessage.success("注册成功");
              router.push("/login");
            })
            .catch(err => {
              ElMessage.error(err);
            })
          }
          // 未通过验证
          else {
            ElMessage.error("注册失败");
            return false;
          }
        });
      };

      return {
          ruleForm,
          rules,
          register,
          submitForm,
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
    padding: 30px 15px;
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
    font-size: 13px;
    line-height: 30px;
    color: orange;
}
</style>