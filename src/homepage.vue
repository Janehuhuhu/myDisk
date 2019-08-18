<template>
  <div id="homepage">
	
	<!-- 主页文件列表 -->
	<el-table :data="filesData" style="width: 100%">
	  <el-table-column prop="fileIndex" label="序号" width="150" align='center'></el-table-column>
      <el-table-column prop="fileName" label="文件名" width="200" align='center'></el-table-column>
      <el-table-column prop="fileSize" label="文件大小" width="180" align='center'></el-table-column>
      <el-table-column prop="uploadTime" label="上传时间" align='center'></el-table-column>
	  <el-table-column prop="download" label="下载次数" align='center'></el-table-column>
	  <el-table-column prop="uploader" label="上传者数" align='center'></el-table-column>
	  <el-table-column label="下载" align='center'>
		  <template slot-scope="scope">
			<el-link :href="'./files/'+homeHash[scope.$index]" download=''>
				<el-button type="success" size='mini' @click='download(scope.$index,scope.row)'>下载</el-button>
			</el-link>
		  </template>
	  </el-table-column>
	  <el-table-column label="预览" align='center'>
		  <template slot-scope="scope">
					<el-button type="primary" size='mini' @click='preview(scope.$index,scope.row)'>预览</el-button>
		  </template>
	  </el-table-column>
    </el-table>

		<el-dialog title="预览" :visible.sync='picShow' width='50%'>
			 <el-image
				:src="picUrl">
			</el-image>
		</el-dialog>

		<el-dialog title="预览" :visible.sync='docShow' width='50%'>
			 <iframe :src='docUrl' width='100%' height='100%' scrolling='no'>
			 </iframe>
		</el-dialog>
  </div>
</template>

<script>
import Ajax from '../ajax'
export default {
	name: 'homepage',
	props: [
		'userChild',
		'dialogVisibleChild',
		'btnVisibleChild',
		'nameVisibleChild',
		'filesDataChild',
		'tableDataChild',
		'homeIndexChild',
		'hashValueChild',
		'homeHashChild'
	],
	data() {
	  return {
		  user: this.userChild,
		  dialogVisible: this.dialogVisibleChild,
		  btnVisible: this.btnVisibleChild,
		  nameVisible: this.nameVisibleChild,
		  filesData: this.filesDataChild,
		  homeIndex: this.indexChild,
		  hashValue: this.hashValueChild,
			homeHash: this.homeHashChild,
			tableData: this.tableDataChild,
			picShow: false,
			picUrl: '',
			docUrl: '',
			docShow: false,
	  }
	},
	methods: {
	  
	  /*下载按钮*/
	  download(ind,row){
		  Ajax({
			  type: 'get',
			  url: 'http://localhost:1200/loginRegister/download',
			  data: {
					fileIndex: row.fileIndex,
					fileName: row.fileName,
					fileSize: row.fileSize,
					uploadTime: row.uploadTime,
					download: row.download,
					uploader: row.uploader,
					hashName: this.homeHash[ind],
					userName: this.user.name,
			  },
			  success: (data) => {
				  if(JSON.parse(data).ok == 1){
						this.filesData[ind].download = JSON.parse(data).download;
						var hashIndex = this.hashValue.indexOf(this.homeHash[ind]);
						if(hashIndex != -1){
							this.tableData[hashIndex].download = JSON.parse(data).download;
						}
				  }
				  else{
					  this.$message.errer(JSON.parse(data).msg)
				  }
			  }
		  })
		  
	  },
	  /*预览按钮*/
	  preview(ind,row){
			var re = /.jpg|.png|.jpeg|.gif$/gi;
			if(re.test(row.fileName)){
				this.picShow = true;
				this.picUrl = './files/' + this.homeHash[ind];
			}
			else{
				this.docShow = true;
				this.docUrl = './files/' + this.homeHash[ind];
			}
	  },
	} 
}
</script>

<style>
</style>
