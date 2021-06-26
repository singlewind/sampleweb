# How to Develope

1. clone repo into `git clone git@github.com:singlewind/sampleweb.git $GOPATH/src/github.com/singlewind/sampleweb`
2. Install `make` by run `xcode-select --install` or `brew install make`
3. Run `make build`
4. You can find the binaries in `build/cmd` folder

## Other Commands
- `make build` run security and build binaries 
- `make security` scan go source code for vulnerabilities
- `make clean` delete all builds
- `npm run lint` lint typescript code