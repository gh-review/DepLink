.PHONY: build
build:
	docker build -t gh-reviewer/deplink .

.PHONY: run
run:
	docker run -it --rm --workdir /github/workspace -e GITHUB_WORKSPACE="/github/workspace" -v $(shell pwd):"/github/workspace" gh-reviewer/deplink

.PHONY: test
test:
	npm test

