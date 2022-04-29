require 'aliyun/sts'
require 'aliyun/oss'

class Oss
  def self.client
          # host: oss-cn-hangzhou.aliyuncs.com
      # bucket: rccfiles
      # access_key_id: 
      # access_key_secret: 
      # region: oss-cn-hangzhou
      # dir: project-case-dev
    @client ||= Aliyun::STS::Client.new(
      access_key_id: 'LTAI5tJxJtz8SaUGpW2rBPXY',
      access_key_secret: 'KZspf6omxaTcwSPGuvr4VRAPMD579w'
    )
  end

  def self.token
    policy = Aliyun::STS::Policy.new
    policy.allow(['oss:Put*'], ['acs:oss:*:*:dong-87/test/*'])
    # policy.allow(['oss-cloudbox:PutObject'], ['acs:oss:*:*:dong-87/*'])
    # policy.allow(['oss-cloudbox:AbortMultipartUpload'], ['acs:oss:*:*:dong-87/*'])
    
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
