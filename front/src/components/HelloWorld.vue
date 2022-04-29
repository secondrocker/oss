<template>
  <div>
    <div>
      <input v-on:change="changeFile" type="file" />
      进度:{{percent}}
    </div>
    <div>
      <button @click="startUpload">上传</button>&nbsp;
      <button @click="suspendUpload">暂停</button>&nbsp;
      <button @click="resumeUpload">继续</button>&nbsp;
    </div>
  </div>
</template>
<script>
  import Uploader from './uploader'
  export default{
    data () {
      return {
        file: null,
        percent: 0,
        uploader: new Uploader({chipUpload: true, partSize: 1024*800})
      }
    },
    methods: {
      startUpload() {
        this.uploader.upload(this.file,{
          file_name: 'test/'+this.file.name,
          acl: 'public-read',
          progressCallback: (p,cpt,res) => {
            this.percent = (p* 100).toFixed(2)
          } 
        }).then(res => {
          console.log(res)
          alert('上传成功')
        }).catch(err => {
          console.log(err)
        })
      },
      suspendUpload() {
        this.uploader.suspend()
      },
      changeFile(f){
        this.file = f.target.files[0]
      },
      resumeUpload() {
        this.uploader.resumeUpload().then(res => {
          console.log(res)
          alert('上传成功')
        }).catch(err => {
          console.log(err)
        })
      }
    }
  }
</script>
<style scoped>

</style>
