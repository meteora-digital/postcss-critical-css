# PostCSS Critical CSS

This plugin allows the user to define and output critical CSS using custom atRules, and/or custom CSS properties. Critical CSS may be output to one or more files, as defined within the [plugin options](#plugin-options) and/or within the CSS. Depending on the plugin options used, processed CSS may be left unchanged, or critical CSS may be removed from it.

## Install

`npm install @meteora-digital/postcss-critical-css --save`

## Examples

An example is available in this repo. See the `/example` directory, and use the command `npm run example` to test it out.

## Usage examples

All examples given below show the input CSS and the critical CSS that is output from it. Note that the input CSS will remain unchanged, unless `preserve` is set to `false` in the [plugin options](#plugin-options). Use `npm run example` to see how this works.

### Using the `@critical` atRule

```css
/* In foo.css */
@critical;

.foo {
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```

Will output:

```css
/* In critical.css */
.foo {
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```

### Using the `@critical` atRule with a custom file path

```css
/* In foo.css */
@critical bar.css;

.foo {
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```

Will output:

```css
/* In bar.css */
.foo {
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```

### Using the `@critical` atRule with a subset of styles

```css
/* In foo.css */
.foo {
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}

@critical {
  .bar {
    border: 10px solid gold;
    color: gold;
  }
}
```

Will output:

```css
/* In critical.css */
.bar {
  border: 10px solid gold;
  color: gold;
}
```

### Using the custom property, `critical-selector`

```css
/* In foo.css */
.foo {
  critical-selector: this;
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```

Will output:

```css
/* In critical.css */
.foo {
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```

### Using the custom property, `critical-selector`, with a custom selector.

```css
/* In foo.css */
.foo {
  critical-selector: .bar;
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```

Will output:

```css
/* In critical.css */
.bar {
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```

### Using the custom property, `critical-filename`

```css
/* in foo.css */
.foo {
  critical-selector: this;
  critical-filename: secondary-critical.css;
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```

Will output:

```css
/* In secondary-critical.css */
.foo {
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}
```

### Using the custom property, `critical-selector`, with value `scope`

This allows the user to output the entire scope of a module, including children.

```css
/* in foo.css */
.foo {
  critical-selector: scope;
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}

.foo a {
  color: blue;
  text-decoration: none;
}
```

Will output:

```css
/* In critical.css */
.foo {
  border: 3px solid gray;
  display: flex;
  padding: 1em;
}

.foo a {
  color: blue;
  text-decoration: none;
}
```

## Plugin options

The plugin takes a single object as its only parameter. The following properties are valid:

| Argument     | Data Type | Description                                                                                                                 | Default Value             |
|--------------|-----------|-----------------------------------------------------------------------------------------------------------------------------|---------------------------|
| outputPath   | string    | The path where the critical CSS should be output.                                                                           | Current working directory |
| outputDest   | string    | The default name for the critical CSS file.                                                                                 | "critical.css"            |
| preserve     | boolean   | If true, selectors from the primary CSS document are not removed even after being marked as critical. Prevents duplication. | true                      |
| minify       | boolean   | If true, the output CSS will be minified.                                                                                   | true                      |
| append       | boolean   | If true, each new entry that gets processed will be appended to the critical CSS file.                                      | false                     |
