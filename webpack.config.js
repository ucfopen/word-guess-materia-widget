const path = require("path");
const widgetWebpack = require("materia-widget-development-kit/webpack-widget");

const srcPath = path.join(__dirname, "src");
const outputPath = path.join(process.cwd(), "build");

const rules = widgetWebpack.getDefaultRules();

const buildConfig = widgetWebpack.getLegacyWidgetBuildConfig({
  entries: {
    player: [
      // TODO
      path.join(srcPath, "player", "player.html"),
      path.join(srcPath, "player", "player-events.js"),
      path.join(srcPath, "player", "player-logic.js"),
      path.join(srcPath, "player", "player-UI.js"),
      path.join(srcPath, "player", "player.js"),
      path.join(srcPath, "player", "player.scss"),
    ],
    creator: [
      path.join(srcPath, "creator", "index.html"),
      path.join(srcPath, "creator", "index.js"),
      path.join(srcPath, "creator", "style.scss"),
    ],
  },
  copyList: [
    ...widgetWebpack.getDefaultCopyList(),
    {
      from: path.join(srcPath, "source-images"),
      to: path.join(outputPath, "source-images"),
      toType: "dir",
    },
  ],
  moduleRules: [
    rules.loadHTMLAndReplaceMateriaScripts,
    rules.loadAndPrefixSASS,
    rules.loaderCompileCoffee,
    rules.copyImages,
  ],
});

module.exports = buildConfig;
