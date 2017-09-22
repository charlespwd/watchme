# watchme

This little program watches your file changes and increments a counter
in a sqlite database whenever you do.

## Usage

```
$ watchme <glob> [savefile]
```

- `glob` is a glob of strings to watch for. e.g. `'src/**/*.{js,jsx,scss}'`
- `savefile` is the file name for your sqlite database

### Example

```
$ watchme "{src,css}/**/*.{js,jsx,scss}" "$HOME/counts.sqlite"
```

## License

MIT
