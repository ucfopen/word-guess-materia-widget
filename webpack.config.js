const path = require('path')
const srcPath = path.join(__dirname, 'src') + path.sep
const widgetWebpack = require('materia-widget-development-kit/webpack-widget')

const entries = widgetWebpack.getDefaultEntries()

entries['player.js'] = [
	`${srcPath}player-events.coffee`,
	`${srcPath}player-logic.coffee`,
	`${srcPath}player-UI.coffee`,
	`${srcPath}player.coffee`
]

entries['creator.js'] = [
	`${srcPath}creator-events.coffee`,
	`${srcPath}creator-logic.coffee`,
	`${srcPath}creator-UI.coffee`,
	`${srcPath}creator.coffee`
]

// options for the build
let options = {
	entries: entries
}

module.exports = widgetWebpack.getLegacyWidgetBuildConfig(options)
