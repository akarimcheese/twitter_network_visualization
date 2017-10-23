require "./twitter_network_example/*"

require "kemal"
require "twitter_networks"

module TwitterNetworkExample
    # Handles communication with socket and Twitter API
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
      
      # Callback to give to Twitter::Network for when it finds a user that exists
      private def receive_user(user)
        if socket = @socket
          # Let the browser know a user was found. Provide the image as well.
          socket.send "{\"node\":#{user.screen_name.inspect},\"img\":#{user.profile_image_url_https.inspect}}"
        end
      end
      
      # Callback to give to Twitter::Network for when it finds a relationship
      private def receive_relationship(source, target)
        if socket = @socket
          # Let the browser know a relationship was found.
          socket.send "{\"source\":#{source.inspect},\"target\":#{target.inspect}}"
        end
      end
      
      # Callback to give to Twitter::Network for when its Twitter API Client gets ratelimited
      private def receive_rate_limit()
        if socket = @socket
          # Let the browser know the rate limit was reached
          socket.send "{\"message\":\"Rate Limit Reached\"}"
        end
      end
      
      # Register the socket for this client
      def addSocket(socket)
        # If this network client was active for a previous socket,
        # catch up the current socket with all the users and links
        @network.each_user do |user|
          socket.send "{\"node\":#{user.screen_name.inspect},\"img\":#{user.profile_image_url_https.inspect}}"
        end
      
        @network.each_edge do |source, target|
          socket.send "{\"source\":#{source.inspect},\"target\":#{target.inspect}}"
        end
    
        # When the socket sends a user to add, handle it asynchronously
        socket.on_message do |message|
          spawn do
            @network.add_user(message)
          end
        end
      
        # When the socket closes, unregister it from this client
        socket.on_close do
          @socket = nil
        end
      
        # Set callbacks for Twitter::Network
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
    
    # SessionId => Client. Client handles Socket and Twitter API stuff
    clients = {} of String => Client
    
    # Handles the OAuth stuff
    auth_client = Twitter::Auth::Client.new(
        ENV["TWITTER_CONSUMER_KEY"], 
        ENV["TWITTER_CONSUMER_SECRET"], 
        ENV["TWITTER_ACCESS_TOKEN"],
        ENV["TWITTER_ACCESS_SECRET"]
    )
    
    public_folder "views"
    
    # Matches GET "http://host:port/"
    get "/" do
      # oauth_request is the object containing the oauth link
      oauth_request = auth_client.oauth_request_token("#{ENV["HOSTNAME"]}/auth")
      render "views/index.ecr"
    end
    
    # Matches GET "http://host:port/auth"
    get "/auth" do |ctx|
      # This endpoint should be reached by the Twitter OAuth callback with the oauth token and oauth verifier
      auth_params = ctx.request.query_params
      oauth_token, oauth_verifier = auth_params["oauth_token"], auth_params["oauth_verifier"]
      # Get the access token from the OAuth callback params
      access_token = auth_client.oauth_access_token(oauth_token, oauth_verifier)
      session_id = SecureRandom.hex
      
      # Set a session cookie
      ctx.response.cookies["session"] = HTTP::Cookie.new("session", session_id, "/", Time.now + 12.hours, nil, true)
      clients[session_id] = Client.new(access_token)
      
      ctx.redirect "/network"
    end

    # Matches GET "http://host:port/network"
    get "/network" do |ctx|
      # If there's no session, redirect to home page
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
