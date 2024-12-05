const path = require('path')
const srcPath = path.join(__dirname, 'src') + path.sep
const widgetWebpack = require('materia-widget-development-kit/webpack-widget')

const rules = widgetWebpack.getDefaultRules()
const copy = [
	...widgetWebpack.getDefaultCopyList()
]

const entries = {
	'player': [
		path.join(srcPath, 'player.html'),
		// path.join(srcPath, 'player-events.js'),
		// path.join(srcPath, 'player-logic.js'),
		// path.join(srcPath, 'player-UI.js'),
		// path.join(srcPath, 'player.js'),
		path.join(srcPath, 'player-events.coffee'),
		path.join(srcPath, 'player-logic.coffee'),
		path.join(srcPath, 'player-UI.coffee'),
		path.join(srcPath, 'player.coffee'),
		path.join(srcPath, 'player.scss')
	],
	'creator': [
		path.join(srcPath, 'creator.html'),
		// path.join(srcPath, 'creator-events.js'),
		// path.join(srcPath, 'creator-logic.js'),
		// path.join(srcPath, 'creator-UI.js'),
		// path.join(srcPath, 'creator.js'),
		path.join(srcPath, 'creator-events.coffee'),
		path.join(srcPath, 'creator-logic.coffee'),
		path.join(srcPath, 'creator-UI.coffee'),
		path.join(srcPath, 'creator.coffee'),
		path.join(srcPath, 'creator.scss')
	]
}


const customRules = [
	rules.loadHTMLAndReplaceMateriaScripts,
	rules.loadAndPrefixSASS,
	rules.loaderCompileCoffee,
	rules.copyImages,
]

const options = {
	entries: entries,
	copyList: copy,
	moduleRules: customRules
}

const buildConfig = widgetWebpack.getLegacyWidgetBuildConfig(options)

module.exports = buildConfig
