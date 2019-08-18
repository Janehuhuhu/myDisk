<template>
  <div id="upload">
	
	<!-- 文件列表 -->
	<el-table :data="tableData" style="width: 100%">
	  <el-table-column prop="fileIndex" label="序号" width="180" align='center'></el-table-column>
      <el-table-column prop="fileName" label="文件名" width="300" align='center'></el-table-column>
      <el-table-column prop="fileSize" label="文件大小" width="180" align='center'></el-table-column>
      <el-table-column prop="uploadTime" label="上传时间" align='center'></el-table-column>
	  <el-table-column prop="download" label="下载次数" align='center'></el-table-column>
	  <el-table-column prop="isDelete" label="是否删除" align='center'>
		  <template slot-scope="scope">
			<el-button 
				:data-hash='hashValue[scope.$index]' 
				type="danger" 
				size='mini' 
				icon="el-icon-delete" 
				circle 
				@click="del(scope.$index,scope.row)">
			</el-button>
		  </template>
	  </el-table-column>
    </el-table>
	
	<!-- 上传文件 -->
	<br>
	<form>
		<input type='file' name='' id='fileNode'>
		<el-button type='primary' size='mini' @click='submit()'>提交</el-button>
	</form>
	
  </div>
</template>

<script>
import Ajax from '../ajax'
export default {
	name: 'upload',
	props: [
		'userChild',
		'dialogVisibleChild',
		'btnVisibleChild',
		'nameVisibleChild',
		'tableDataChild',
		'countChild',
		'hashValueChild',
		'filesDataChild',
		'homeCountChild',
		'homeHashChild'
	],
	data() {
	  return {
		  user: this.userChild,
		  dialogVisible: this.dialogVisibleChild,
		  btnVisible: this.btnVisibleChild,
		  nameVisible: this.nameVisibleChild,
		  tableData: this.tableDataChild,
		  count: this.countChild,
		  filesData: this.filesDataChild,
		  homeCount: this.homeCountChild,
		  hashValue: this.hashValueChild,
		  homeHash: this.homeHashChild,
	  }
	},
	methods: {
	  
	  /*提交按钮*/
	  submit(){
		  var formData = new FormData();
		  formData.append('files', fileNode.files[0]);  /*第一个参数为fieldname*/
		  formData.append('loginUser', this.user.name); /*第一个参数为req.body对象属性*/
		  if(window.XMLHttpRequest){
				var ajax = new XMLHttpRequest();
			}
			else{
				var ajax = new ActiveXObject('Microsoft.XMLHTTP');
			}

			ajax.open('post', 'http://localhost:1200/loginRegister/upload', true); /*不用设置请求头*/
			ajax.send(formData); /*注意参数*/
			
			ajax.onreadystatechange = () => {
				if(ajax.readyState == 4){
					if(ajax.status >= 200 && ajax.status < 300 || ajax.status == 304){
						if(JSON.parse(ajax.responseText).ok == 1){
							this.$message({
								message: JSON.parse(ajax.responseText).msg,
								type: 'success'
							})
							this.tableDataChild.push({
								fileIndex: this.count.index++,
								fileName: fileNode.files[0].name,
								fileSize: (fileNode.files[0].size / 1024).toFixed(2) + 'KB',
								uploadTime: JSON.parse(ajax.responseText).timer,
								download: 0
							})
							this.hashValue.push(JSON.parse(ajax.responseText).hashName);
							
							this.filesData.push({
								fileIndex:this.homeCount.homeIndex++,
								fileName:fileNode.files[0].name,
								fileSize:(fileNode.files[0].size / 1024).toFixed(2) + 'KB',
								uploadTime:JSON.parse(ajax.responseText).timer,
								download:0,
								uploader:this.user.name,
							})
							this.homeHash.push(JSON.parse(ajax.responseText).hashName);
						}
						else{
							this.$message.error(JSON.parse(ajax.responseText).msg);
						}
					}
				}
			} 
	  },
	  /*删除按钮*/
	 del(ind,row){
		 this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
			  confirmButtonText: '确定',
			  cancelButtonText: '取消',
			  type: 'warning'
			}).then(() => {
				 Ajax({ 
					 type: 'get',
					 url: 'http://localhost:1200/loginRegister/del',
					 data: {
							fileIndex:row.fileIndex,
							fileName:row.fileName,
							fileSize:row.fileSize,
							uploadTime:row.uploadTime,
							download:row.download,
							hashName:this.hashValue[ind],
							userName:this.user.name,
						},
					 success: (data) => {
						 if(JSON.parse(data).ok == 1){	 
							 var homeInd = this.homeHash.findIndex(
							 	(value) => {
									return value == this.hashValue[ind];
							});
							 this.filesData.splice(homeInd,1);
							 this.homeHash.splice(homeInd,1);
							 for(let i = homeInd; i < this.filesData.length; i++){
								 this.filesData[i].fileIndex--;
							 }
							 this.homeCount.homeIndex--;
							 
							 this.tableData.splice(ind,1);
							 this.hashValue.splice(ind,1);
							 for(let i = ind; i < this.tableData.length; i++){
								 this.tableData[i].fileIndex--;
							 }
							 this.count.index--;
							 
							 this.$message({
								type: 'success',
								message: JSON.parse(data).msg
							  });
						 }
						 else{
							 this.$message.error(JSON.parse(data).msg);
						 }  
					 }
				 })
			}).catch(() => {
			  this.$message({
				type: 'info',
				message: '已取消删除'
			  });          
			});
	 	},
	} 
}
</script>

<style>
</style>
