<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="clearfix">
              <span>基础信息</span>
            </div>
          </template>
          <div class="info">
            <div class="info-image" @click="showDialog">
              <img :src="avatarImg" />
              <span class="info-edit">
                <i class="el-icon-lx-camerafill"></i>
              </span>
            </div>
            <div class="info-name">{{ username }}</div>
            <div class="info-basic">
              <div>办公室：{{ adminInfo.office }}</div>
              <div>手机号码：{{ adminInfo.phone_number }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="clearfix">
              <span>编辑基本信息</span>
            </div>
          </template>

          <el-form label-width="90px">
            <el-form-item label="用户名："> {{ username }} </el-form-item>
            <el-form-item label="姓名：">
              <el-input v-model="form.realname"></el-input>
            </el-form-item>
            <el-form-item label="手机号码：">
              <el-input v-model="form.phone_number"></el-input>
            </el-form-item>
            <el-form-item label="办公室：">
              <el-input v-model="form.office"></el-input>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveInfo">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="clearfix">
              <span>修改密码</span>
            </div>
          </template>

          <el-form label-width="90px">
            <el-form-item label="旧密码：">
              <el-input type="password" v-model="form.old"></el-input>
            </el-form-item>
            <el-form-item label="新密码：">
              <el-input type="password" v-model="form.new"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="savePassword">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog title="裁剪图片" v-model="dialogVisible" width="600px">
      <vue-cropper
        ref="cropper"
        :src="imgSrc"
        :ready="cropImage"
        :zoom="cropImage"
        :cropmove="cropImage"
        style="width: 100%; height: 400px"
      ></vue-cropper>

      <template #footer>
        <span class="dialog-footer">
          <el-button class="crop-demo-btn" type="primary"
            >选择图片
            <input
              class="crop-input"
              type="file"
              name="image"
              accept="image/*"
              @change="setImage"
            />
          </el-button>
          <el-button type="primary" @click="saveAvatar">上传并保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import "cropperjs/dist/cropper.css";
import avatar from "../assets/img/img.jpg";
import axios from "../api/request";
import { ElMessage } from "element-plus";

const username = localStorage.getItem("username");
let adminInfo = ref({});

const getAdminInfo = async () => {
  adminInfo.value = await axios.get("/admins/findByName", {
    params: {
      username
    },
  });
  // console.log(adminInfo);
}

onMounted(getAdminInfo);

const form = ref({
  old: "",
  new: "",
  phone_number: '',
  office: '',
  realname: '',
});

const saveInfo = () => {
  const phone_number = form.value.phone_number;
  const office = form.value.office;
  const realname = form.value.realname;
  const regex =
    /^(13[0-9]{9})|(15[0-9]{9})|(17[0-9]{9})|(18[0-9]{9})|(19[0-9]{9})$/;
  if (!phone_number || !office || !realname) {
    ElMessage.error("所有字段不能为空！");
  } else if (!regex.test(form.value.phone_number)) {
    ElMessage.error("手机号码格式错误！");
  } else if(office.length > 20) {
    ElMessage.error("办公室最多输入20个字符！");
  } else {
    axios
      .patch("/admins/updateByName", {
        username,
        phone_number,
        office,
      })
      .then((res) => {
        // console.log(res);
        getAdminInfo();
        ElMessage.success("修改成功！");
        form.value.phone_number = '';
        form.value.office = '';
        form.value.realname = '';
      })
      .catch((err) => {
        ElMessage.error(err);
      });
  }
};
const savePassword = () => {
  const oldPassword = form.value.old;
  const newPassword = form.value.new;
  if(!oldPassword || !newPassword) {
    ElMessage.error('所有字段不能为空！');
  }
  else if(oldPassword !== adminInfo.value.password) {
    ElMessage.error('旧密码错误！');
  }
  else {
    axios.patch('/admins/updatePassword', {
      username,
      newPassword
    })
    .then(res => {
      // console.log(res);
      getAdminInfo();
      ElMessage.success("修改成功！");
      form.value.old = '';
      form.value.new = '';
    })
    .catch((err) => {
      ElMessage.error(err);
    });
  }
};

const avatarImg = ref(avatar);
const imgSrc = ref("");
const cropImg = ref("");
const dialogVisible = ref(false);
const cropper = ref(null);

const showDialog = () => {
  dialogVisible.value = true;
  imgSrc.value = avatarImg.value;
};

const setImage = (e) => {
  const file = e.target.files[0];
  if (!file.type.includes("image/")) {
    return;
  }
  const reader = new FileReader();
  reader.onload = (event) => {
    dialogVisible.value = true;
    imgSrc.value = event.target.result;
    cropper.value && cropper.value.replace(event.target.result);
  };
  reader.readAsDataURL(file);
};

const cropImage = () => {
  cropImg.value = cropper.value.getCroppedCanvas().toDataURL();
};

const saveAvatar = () => {
  avatarImg.value = cropImg.value;
  dialogVisible.value = false;
};

</script>

<style scoped>
.info {
  text-align: center;
  padding: 35px 0;
}
.info-image {
  position: relative;
  margin: auto;
  width: 100px;
  height: 100px;
  background: #f8f8f8;
  border: 1px solid #eee;
  border-radius: 50px;
  overflow: hidden;
}
.info-image img {
  width: 100%;
  height: 100%;

	text-align: center;
	padding: 35px 0;
}
.info-image {
	position: relative;
	margin: auto;
	width: 100px;
	height: 100px;
	background: #f8f8f8;
	border: 1px solid #eee;
	border-radius: 50px;
	overflow: hidden;
}

.info-edit {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.info-edit i {
  color: #eee;
  font-size: 25px;
}
.info-image:hover .info-edit {
  opacity: 1;
}
.info-name {
  margin: 15px 0 10px;
  font-size: 24px;
  font-weight: 500;
  color: #262626;
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.5);
	opacity: 0;
	transition: opacity 0.3s ease;
}
.info-edit i {
	color: #eee;
	font-size: 25px;
}
.info-image:hover .info-edit {
	opacity: 1;
}
.info-name {
	margin: 15px 0 10px;
	font-size: 24px;
	font-weight: 500;
	color: #262626;
}
.info-basic {
  width: 60%;
  /* display: flex;
  justify-content: space-between; */
  color: gray;
  margin: 0 auto;
  font-size: 14px;
  text-align: left;
}

.crop-demo-btn {
  position: relative;
}
.crop-input {
  position: absolute;
  width: 100px;
  height: 40px;
  left: 0;
  top: 0;
  opacity: 0;
  cursor: pointer;
	position: relative;
}
.crop-input {
	position: absolute;
	width: 100px;
	height: 40px;
	left: 0;
	top: 0;
}
</style>
