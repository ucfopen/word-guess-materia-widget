// const path = require('path')
// const srcPath = path.join(__dirname, 'src') + path.sep
// const webpackWidget = require('materia-widget-development-kit/webpack-widget')
//
// const rules = webpackWidget.getDefaultRules()
//
// const entries = {
// 	'player': [
// 		path.join(srcPath, 'player.html'),
// 		path.join(srcPath, 'player-events.js'),
// 		path.join(srcPath, 'player-logic.js'),
// 		path.join(srcPath, 'player-UI.js'),
// 		path.join(srcPath, 'player.js'),
// 		path.join(srcPath, 'player.scss'),
// 	],
// 	'creator': [
// 		path.join(srcPath, 'creator.html'),
// 		path.join(srcPath, 'creator-events.js'),
// 		path.join(srcPath, 'creator-logic.js'),
// 		path.join(srcPath, 'creator-UI.js'),
// 		path.join(srcPath, 'creator.js'),
// 		path.join(srcPath, 'creator.scss'),
// 	],
// }
//
// // entries['player.js'] = [
// // 	`${srcPath}player-events.js`,
// // 	`${srcPath}player-logic.js`,
// // 	`${srcPath}player-UI.js`,
// // 	`${srcPath}player.js`
// // ]
// //
// // entries['creator.js'] = [
// // 	`${srcPath}creator-events.js`,
// // 	`${srcPath}creator-logic.js`,
// // 	`${srcPath}creator-UI.js`,
// // 	`${srcPath}creator.js`
// // ]
//
// // options for the build
// let options = {
// 	entries: entries,
// 	copyList: [...webpackWidget.getDefaultCopyList()],
// 	moduleRules: [
// 		rules.loadHTMLAndReplaceMateriaScripts,
// 		rules.loadAndPrefixSASS,
// 		rules.copyImages,
// 	]
// }
//
// module.exports = webpackWidget.getLegacyWidgetBuildConfig(options)

// This is an example webpack for a React project

const path = require('path')
const srcPath = path.join(__dirname, 'src') + path.sep
const outputPath = path.join(__dirname, 'build') + path.sep
const widgetWebpack = require('materia-widget-development-kit/webpack-widget')

const rules = widgetWebpack.getDefaultRules()
const copy = [
	...widgetWebpack.getDefaultCopyList()
]

const entries = {
	'player': [
		path.join(srcPath, 'player.html'),
		path.join(srcPath, 'player-events.js'),
		path.join(srcPath, 'player-logic.js'),
		path.join(srcPath, 'player-UI.js'),
		path.join(srcPath, 'player.js'),
		path.join(srcPath, 'player.scss')
	],
	'creator': [
		path.join(srcPath, 'creator.html'),
		path.join(srcPath, 'creator-events.js'),
		path.join(srcPath, 'creator-logic.js'),
		path.join(srcPath, 'creator-UI.js'),
		path.join(srcPath, 'creator.js'),
		path.join(srcPath, 'creator.scss')
	]
}


const customRules = [
	rules.loadHTMLAndReplaceMateriaScripts,
	rules.loadAndPrefixSASS,
	rules.copyImages,
]

const options = {
	entries: entries,
	copyList: copy,
	moduleRules: customRules
}

const buildConfig = widgetWebpack.getLegacyWidgetBuildConfig(options)

module.exports = buildConfig
