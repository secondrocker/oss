require 'aliyun/sts'
require 'aliyun/oss'

class Oss
  def self.client
    # access key,secret
    @client ||= Aliyun::STS::Client.new(
      access_key_id: 'xxxxxxxxx',
      access_key_secret: 'xxxxxxxxxxxxx'
    )
  end

  def self.token
    policy = Aliyun::STS::Policy.new
    policy.allow(['oss:Put*'], ['acs:oss:*:*:dong-87/test/*']) #上传版，bucket 和路径
    policy.allow(['oss:Get*'], ['acs:oss:*:*:dong-87/test/*']) # 下载
    
    # 角色赋权
    t = client.assume_role('acs:ram::1633783653024415:role/uploader','uploader',policy, 60 * 15)
    {
      region: 'oss-cn-beijing',
      accessKeyId: t.access_key_id,
      accessKeySecret: t.access_key_secret,
      stsToken: t.security_token,
      bucket: 'dong-87'
    }
  end
end
