const path = require('path')
const srcPath = path.join(process.cwd(), 'src')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

//override the demo with a copy that assigns ids to each question for dev purposes
const configOptions = {}
// if (process.env.npm_lifecycle_script == 'webpack-dev-server') {
// 	configOptions.demoPath = 'devmateria_demo.json'
// }

let webpackConfig = require('materia-widget-development-kit/webpack-widget').getLegacyWidgetBuildConfig(configOptions)

// process less files
webpackConfig.module.rules.push({
	test: /\.less$/i,
	exclude: /node_modules/,
	loader: ExtractTextPlugin.extract({
		use: [
			'raw-loader',
			{
				// postcss-loader is needed to run autoprefixer
				loader: 'postcss-loader',
				options: {
					// add autoprefixer, tell it what to prefix
					plugins: [require('autoprefixer')({browsers: [
						'Explorer >= 11',
						'last 3 Chrome versions',
						'last 3 ChromeAndroid versions',
						'last 3 Android versions',
						'last 3 Firefox versions',
						'last 3 FirefoxAndroid versions',
						'last 3 iOS versions',
						'last 3 Safari versions',
						'last 3 Edge versions'
					]})]
				}
			},
			'less-loader'
		]
	})
})

// add entries for our other coffee files
webpackConfig.entry['creator-events.js'] = [path.join(srcPath, 'creator-events.coffee')]
webpackConfig.entry['creator-logic.js'] = [path.join(srcPath, 'creator-logic.coffee')]
webpackConfig.entry['creator-UI.js'] = [path.join(srcPath, 'creator-UI.coffee')]

webpackConfig.entry['player-events.js'] = [path.join(srcPath, 'player-events.coffee')]
webpackConfig.entry['player-logic.js'] = [path.join(srcPath, 'player-logic.coffee')]
webpackConfig.entry['player-UI.js'] = [path.join(srcPath, 'player-UI.coffee')]

// replace creator.css entry with one using our less file
webpackConfig.entry['creator.css'] = [
	path.join(srcPath, 'creator.html'),
	path.join(srcPath, 'creator.less')
]

// replace player.css entry with one using our less file
webpackConfig.entry['player.css'] = [
	path.join(srcPath, 'player.html'),
	path.join(srcPath, 'player.less')
]

module.exports = webpackConfig
