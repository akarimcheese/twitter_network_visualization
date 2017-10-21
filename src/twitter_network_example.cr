require "./twitter_network_example/*"

require "kemal"
require "twitter_networks"

module TwitterNetworkExample
    class Client
      property network : Twitter::Network
      property socket : HTTP::WebSocket?
    
      def initialize(access_token : Twitter::Auth::AccessToken)
        @network = Twitter::Network.new(
          ENV["TWITTER_CONSUMER_KEY"], 
          ENV["TWITTER_CONSUMER_SECRET"], 
          access_token.oauth_token,
          access_token.oauth_token_secret
        )
        
        @socket = nil
      end
      
      private def receive_user(user)
        if socket = @socket
          socket.send "{\"node\":#{user.screen_name.inspect}}"
        end
      end
      
      private def receive_relationship(source, target)
        if socket = @socket
          socket.send "{\"source\":#{source.inspect},\"target\":#{target.inspect}}"
        end
      end
      
      private def receive_rate_limit()
        if socket = @socket
          socket.send "{\"message\":\"Rate Limit Reached\"}"
        end
      end
      
      def addSocket(socket)
        @network.each_node do |node|
          socket.send "{\"node\":#{node.inspect}}"
        end
      
        @network.each_edge do |source, target|
          socket.send "{\"source\":#{source.inspect},\"target\":#{target.inspect}}"
        end
    
        socket.on_message do |message|
          spawn do
            @network.add_user(message)
          end
        end
      
        socket.on_close do
          @socket = nil
        end
      
        @network.on_user_added do |user|
          receive_user(user)
        end
        
        @network.on_relationship_found do |source, target|
          receive_relationship(source, target)
        end
    
        @network.on_rate_limit do
          receive_rate_limit()
        end
      
        @socket = socket
      end
    end
    
    
    clients = {} of String => Client
    auth_client = Twitter::Auth::Client.new(
        ENV["TWITTER_CONSUMER_KEY"], 
        ENV["TWITTER_CONSUMER_SECRET"], 
        ENV["TWITTER_ACCESS_TOKEN"],
        ENV["TWITTER_ACCESS_SECRET"]
    )
    
    public_folder "views"
    
    # Matches GET "http://host:port/"
    get "/" do
      oauth_request = auth_client.oauth_request_token("#{ENV["HOSTNAME"]}/auth")
      render "views/index.ecr"
    end
    
    get "/auth" do |ctx|
      auth_params = ctx.request.query_params
      oauth_token, oauth_verifier = auth_params["oauth_token"], auth_params["oauth_verifier"]
      access_token = auth_client.oauth_access_token(oauth_token, oauth_verifier)
      session_id = SecureRandom.hex
      
      ctx.response.cookies["session"] = HTTP::Cookie.new("session", session_id, "/", Time.now + 12.hours, nil, true)
      clients[session_id] = Client.new(access_token)
      
      ctx.redirect "/network"
    end

    # Matches GET "http://host:port/network"
    get "/network" do |ctx|
      if !ctx.request.cookies["session"]?
        ctx.redirect "/"
      elsif !clients[ctx.request.cookies["session"].value]?
        ctx.redirect "/"
      end
    
      render "views/network.ecr"
    end
    
    # Creates a WebSocket handler.
    # Matches "ws://host:port/events"
    ws "/events" do |socket, ctx|
      client = clients[ctx.request.cookies["session"].value]
      client.addSocket(socket)
    end
    
    Kemal.run(ENV["PORT"].to_i)
end
