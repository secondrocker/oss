module Sts
  class API < Grape::API
    format :json
    prefix :api

    get '/token' do
      header 'Access-Control-Allow-Origin','*'
      ::Oss.token
    end

  end
end