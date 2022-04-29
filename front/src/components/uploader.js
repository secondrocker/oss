import OSS from 'ali-oss'

import axios from 'axios'

function Uploader(opts = {}) {
  this.abortCheckpoint = null
  this.uploadType = 'Rescue'
  if (opts.chipUpload) {
    this.uploadType = 'Chip'
    this.partSize = opts.partSize || 1024 * 1024
  }
  this.setupClient()
}

function ossSTS() {
  return new Promise((resolve,reject) => {
    axios.get('http://localhost:3002/api/token').then(res => resolve(res.data)).catch(err => reject(err))
  })
}

Uploader.prototype.setupClient = async function() {
  const res = await ossSTS()
  this.client = new OSS({
    region: res.region,
       // 从STS服务获取的临时访问密钥（AccessKey ID和AccessKey Secret）。
    accessKeyId: res.accessKeyId,
    accessKeySecret: res.accessKeySecret,
    // 从STS服务获取的安全令牌（SecurityToken）。
    stsToken: res.stsToken,
    // 填写Bucket名称，例如examplebucket。
    bucket: res.bucket,
    refreshSTSTokenInterval: 15 * 60 * 1000,
    refreshSTSToken: ossSTS
  })
}

Uploader.prototype.upload = function(file, opts = {}) {
  if (this.uploadOptions) {
    return new Promise((resolve,reject) => {
      reject('清空后再上传!')
    })
  }
  let options = {
    progress: (p, cpt, res) => {
      // 为了实现断点上传，您可以在上传过程中保存断点信息（checkpoint）。发生上传错误后，将已保存的checkpoint作为参数传递给multipartUpload，此时将从上次上传失败的地方继续上传。
      this.abortCheckpoint = cpt;
      if(opts.progressCallback) opts.progressCallback(p,cpt,res)
      // 获取上传进度。
      console.log(p);
    },
    headers: {
      'x-oss-object-acl': opts.acl || 'private'
    },
    checkpoint: this.abortCheckpoint
  }
  if (this.uploadType == 'Chip') {
    options = {
      ...options,
      partSize: this.partSize
    }
  }
  this.uploadOptions = { options: options, file: file, fileName: opts.file_name,retryCount: 0 }

  return new Promise((resolve,reject) => {
    this.realUpload(resolve,reject)
  })
}

Uploader.prototype.realUpload = function(resolve,reject) {
  this.client.multipartUpload(this.uploadOptions.fileName, this.uploadOptions.file, this.uploadOptions.options).then(res => {
    this.uploadOptions = null
    this.abortCheckpoint = null
    resolve(res)
  }).catch(err => {
    reject(err)
  })
}

Uploader.prototype.resumeUpload = function() {
  return new Promise((resolve,reject) => {
    if (!this.uploadOptions) {
      return reject('未上传,无法恢复!')
    }
    if (this.uploadOptions.retryCount > 20 ){
      return reject('重试次数过多!')
    }
    this.uploadOptions.options.checkpoint = this.abortCheckpoint
    this.uploadOptions.retryCount = this.uploadOptions.retryCount + 1
    this.realUpload(resolve,reject)
  }) 
}

Uploader.prototype.suspend = function() {
  this.client.cancel()
}

Uploader.prototype.abort = function() {
  if (this.abortCheckpoint) this.client.abortMultipartUpload(abortCheckpoint.name, abortCheckpoint.uploadId)
}

export default Uploader