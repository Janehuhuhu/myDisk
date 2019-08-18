<template>
  <div id="app">
  	<!-- 注册登陆按钮 -->
    <el-row>
	  <el-col :span='10' :offset='1'>
	  	<el-button 
				type="primary" 
				round 
				@click='dialogVisible = true' 
				:style='{display:btnVisible}'>
				登陆/注册
			</el-button>
		<p :style='{display:nameVisible}' class='nameStyle'>{{user.name}},您好</p>
	  </el-col>
	</el-row>
	<el-row type='flex' justify='center'>
	  <el-col :span='5'>
	  	<el-button type="text" @click='com = "Homepage"' class='navi'>主页</el-button>
	  </el-col>
	  <el-col :span='5'>
	  	<el-button type="text" @click='com = "Upload"' class='navi'>个人中心</el-button>
	  </el-col>
	</el-row>
	
	<!-- 注册登陆框 -->
	<el-dialog
	  title="注册登录框"
	  :visible.sync="dialogVisible"
	  width="50%"
	  :before-close="closeDialog"
	  center>
	  <el-form label-position="left" :model="user" ref='user' :rules="rules">
		  <el-form-item label="用户名:" prop="name">
			<el-input v-model="user.name" placeholder='请输入用户名'></el-input>
		  </el-form-item>
		  <el-form-item label="密码:" prop='pass'>
			<el-input type='password' v-model="user.pass" placeholder='请输入密码'></el-input>
		  </el-form-item>
	  </el-form>
	  <span slot="footer" class="dialog-footer">
		<el-button type="primary" @click="login">登陆</el-button>
		<el-button type="success" @click="register('user')">注册</el-button>
	  </span>
	</el-dialog>
	
	<!-- 个人中心/主页 -->
	
	<component 
		:is='com' 
		:user-child="user" 
		:dialog-visible-child="dialogVisible" 
		:btn-visible-child="btnVisible" 
		:name-visible-child="nameVisible"
		:table-data-child="tableData"
		:hash-value-child="hashValue"
		:count-child="count"
		:home-count-child="homeCount"
		:files-data-child="filesData"
		:home-hash-child="homeHash">
	</component>
	
  </div>
</template>

<script>
import Ajax from '../ajax'
import Upload from './upload.vue'
import Homepage from './homepage.vue'
export default {
	name: 'app',
	data() {
	  var validateName = (rule, value, callback) => {
	  	return callback(new Error('用户名已存在！'));
	  };
	
	  return {
		dialogVisible: false,
        user: {
          name: '',
          pass: ''
        },
		btnVisible: 'block',
		nameVisible: 'none',
		tableData: [],
		hashValue: [],
		filesData: [],
		homeHash: [],
		count: {index:1},
		homeCount: {homeIndex:1},
		com: 'Homepage',
		rules: {
			name: [
				{min:3,max:5,message: '长度在 3 到 5 个字符',trigger:'blur'},
				{required:true,message:'用户名不能为空',trigger:'blur'},
				{validator:validateName,trigger:'submit'},
			],
			pass:[
				{
					required:true,
					message:'密码不能为空',
					trigger:'blur'}
			]
		}
	  }
	},
	methods: {
		
	  // 关闭注册对话框
	  closeDialog(done) {
		this.$confirm('确认关闭？')
		  .then(_ => {
			done();
		  })
		  .catch(_ => {});
	  },
	  
	  // 注册按钮
	  register(formName){
		  Ajax({
			type: 'post',
			url: 'http://localhost:1200/loginRegister/register',
			data: {
				name:this.user.name,
				pass:this.user.pass
			},
			success: (data) => {
				if(JSON.parse(data).ok == 1){
					this.dialogVisible = false;
					this.$message({
					  message: JSON.parse(data).msg,
					  type: 'success'
					});
					this.user.name = '';
					this.user.pass = '';
				}
				else if(JSON.parse(data).ok == 2){
					this.$refs[formName].validate((valid) => {
					  /*确保提交后用户名栏变红*/
					});
				}
				else{
					console.log(JSON.parse(data).msg)
				}
			}
		})
	   },
	
	  /*登陆按钮*/
	  login(){
	  	Ajax({
			type: 'post',
			url: 'http://localhost:1200/loginRegister/login',
			data: {
				name:this.user.name,
				pass:this.user.pass
			},
			success: (data) => {
				if(JSON.parse(data).ok == 1){
					this.btnVisible = 'none';
					this.nameVisible = 'block';
					this.dialogVisible = false;
					this.$message({
						message:JSON.parse(data).msg,
						type:'success'
					})
					for(let item of JSON.parse(data).data){
						this.tableData.push({
							fileIndex:this.count.index++,
							fileName:item.lastName,
							fileSize:(item.size / 1024).toFixed(2) + 'KB',
							uploadTime:item.lastTime,
							download:item.download
						})
						this.hashValue.push(item.hashName);
					}
					for(let item of JSON.parse(data).files){
						this.filesData.push({
							fileIndex:this.homeCount.homeIndex++,
							fileName:item.lastName,
							fileSize:(item.size / 1024).toFixed(2) + 'KB',
							uploadTime:item.lastTime,
							download:item.download,
							uploader:item.uploader
						})
						this.homeHash.push(item.hashName);
					}
				}
				else{
					this.$message.error(JSON.parse(data).msg);
				}
			}
		})
	  },
	},
	components:{
		Upload,
		Homepage
	}
}
</script>

<style>
	.nameStyle{
		font-size:18px;
		font-weight:bold;
		color:#409eff;
	}
	.navi{
		color:#409eff;
		font-size:15px;
		font-weight:bold;		
	}
</style>
