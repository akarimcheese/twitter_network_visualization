![Imgur](https://i.imgur.com/pwvGUse.gif)
# Twitter Network Visualiation

Web application to draw Twitter network graphs. Backend written in Crystal. 
Currently supports drawing Twitter networks as force-directed or circular graphs.

This project was made to demonstrate how the [twitter_networks](https://github.com/akarimcheese/twitter_networks) library could be used and to learn about SVG animations without d3.js

![Imgur](https://i.imgur.com/2G4BQ1L.gif)

Check out the app live in action [here](https://twitterviz.herokuapp.com)

## Usage
Run
`crystal run src/twitter_network_example.cr`

Make sure you have environment variables:
* TWITTER_CONSUMER_KEY
* TWITTER_CONSUMER_SECRET
* TWITTER_ACCESS_TOKEN
* TWITTER_ACCESS_SECRET
* HOSTNAME

Go to the homepage (e.g. `localhost:8080/`) and click on the "Sign in with Twitter" button. Authenticate yourself, and then you can add users and mess with the graph configurations.

## Development

Planned work and progress is documented in the tasks.md file. Feel free to contribute, provide feedback, or add tasks/issues.

## Contributing

1. Fork it ( https://github.com/akarimcheese/twitter_network_visualization/fork )
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create a new Pull Request

# Demo
### Adding Users
![Imgur](https://i.imgur.com/dE2N66N.gif)
### Using the Circlular Layout
[Gif too large for Github](https://i.imgur.com/NxGUaTF.gifv)

