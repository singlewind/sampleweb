security:
	@gosec --exclude-dir=node_modules ./...
	@echo "[OK] Go security check was completed!"

.PHONY: clean
clean: 
	@echo Cleaning project ...
	@go clean
	@rm -rf build/cmd
	@echo [OK] Done!

.PHONY: build
build: security build-binary

build-binary: ./cmd/*
	@echo Building lambdas ...
	@for dir in $^; do \
		echo Building $${dir}; \
		go build -o build/$${dir} $${dir}/main.go ; \
	done
	@echo [OK] Done!