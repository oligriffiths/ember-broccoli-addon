const Filter = require("broccoli-filter");
const MarkdownIt = require("markdown-it");
const fs = require("fs");
const path = require('path');

class BroccoliMarkdown extends Filter {
  constructor(inputNodes, options) {
    options = options || {};
    options.extensions = ["hbs"];
    super(inputNodes, options);

    this.rootPath = options.rootPath || 'app';
    this.parser = new MarkdownIt();
  }

  processString(contents, relativePath) {
    let template = contents.toString("utf8");

    // Perform simple check for component usage
    if (template.indexOf("{{static-markdown") === -1 && template.indexOf("{{#static-markdown") === -1) {
      return contents;
    }

    template = this.replaceUsage(template);
    template = this.replaceBlockUsage(template);

    return Buffer.from(template);
  }

  replaceUsage(template) {
    return template.replace(/\{\{static-markdown.*file=['"]([^'"]+)['"].*\}\}/, (string, file) => {

      if (!file) {
        throw new Error('{{static-markdown}} must be invoked with file="path/to/file"');
      }

      const filePath = this.absolutePath(file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`The file ${filePath} does not exit`);
      }

      const markdown = fs.readFileSync(filePath);
      const markdownString = markdown.toString('utf8');

      return this.parser.render(markdownString);
    });
  }

  replaceBlockUsage(template) {
    return template.replace(/\{\{#static-markdown\}\}([^]*)\{\{\/static-markdown\}\}/m, (string, content) => {
      return this.parser.render(content)
    });
  }

  absolutePath(file) {
    return path.join(this.rootPath, file)
  }
}

module.exports = BroccoliMarkdown;
