/* eslint-env node */
"use strict";

const BroccoliMarkdown = require("./lib/plugin");
// const stew = require("broccoli-stew");

module.exports = {
  name: "static-markdown",

  isDevelopingAddon() {
    return true;
  },

  preprocessTree(type, tree) {
    if (type === "template") {
      tree = new BroccoliMarkdown(tree, {
        rootPath: this.app.project.root + '/app',
      });
      return tree;
    }

    return tree;
  }
};
