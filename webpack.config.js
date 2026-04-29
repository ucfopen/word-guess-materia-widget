const path = require("path");
const srcPath = path.join(__dirname, "src") + path.sep;
const outputPath = path.join(process.cwd(), "build") + path.sep;
const widgetWebpack = require("materia-widget-development-kit/webpack-widget");

const rules = widgetWebpack.getDefaultRules();
const copy = [
  ...widgetWebpack.getDefaultCopyList(),
  {
    from: `${srcPath}source-images`,
    to: `${outputPath}source-images`,
    toType: "dir",
  },
];

const entries = {
  player: [
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
    path.join(srcPath, "creator", "style-new.scss"),
  ],
};

const customRules = [
  rules.loadHTMLAndReplaceMateriaScripts,
  rules.loadAndPrefixSASS,
  rules.loaderCompileCoffee,
  rules.copyImages,
];

const options = {
  entries: entries,
  copyList: copy,
  moduleRules: customRules,
};

const buildConfig = widgetWebpack.getLegacyWidgetBuildConfig(options);

module.exports = buildConfig;
