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
		path.join(srcPath, 'player-events.coffee'),
		path.join(srcPath, 'player-logic.coffee'),
		path.join(srcPath, 'player-UI.coffee'),
		path.join(srcPath, 'player.coffee'),
		path.join(srcPath, 'player.scss')
	],
	'creator': [
		path.join(srcPath, 'creator.html'),
		path.join(srcPath, 'creator-events.coffee'),
		path.join(srcPath, 'creator-logic.coffee'),
		path.join(srcPath, 'creator-UI.coffee'),
		path.join(srcPath, 'creator.coffee'),
		path.join(srcPath, 'creator.scss')
	],
	'scoreScreen': [
		path.join(srcPath, 'scoreScreen.html'),
		path.join(srcPath, 'scoreScreen.js'),
		path.join(srcPath, 'scoreScreen.scss'),
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
