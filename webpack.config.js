const path = require("path");
const widgetWebpack = require("materia-widget-development-kit/webpack-widget");

const srcPath = path.join(__dirname, "src");
const outputPath = path.join(process.cwd(), "build");

const rules = widgetWebpack.getDefaultRules();

const buildConfig = widgetWebpack.getLegacyWidgetBuildConfig({
  entries: {
    player: [
      path.join(srcPath, "player", "index.html"),
      path.join(srcPath, "player", "index.js"),
      path.join(srcPath, "player", "style.scss"),
    ],
    creator: [
      path.join(srcPath, "creator", "index.html"),
      path.join(srcPath, "creator", "index.js"),
      path.join(srcPath, "creator", "style.scss"),
    ],
    scoreScreen: [
      path.join(srcPath, "scorescreen", "index.html"),
      path.join(srcPath, "scorescreen", "index.js"),
      path.join(srcPath, "scorescreen", "style.scss"),
    ]
  },
  copyList: [
    ...widgetWebpack.getDefaultCopyList(),
    {
      from: path.join(srcPath, "assets"),
      to: path.join(outputPath, "assets"),
      toType: "dir",
    },
  ],
  moduleRules: [
    rules.loadHTMLAndReplaceMateriaScripts,
    rules.loadAndPrefixSASS,
    rules.copyImages,
  ],
});

module.exports = buildConfig;
