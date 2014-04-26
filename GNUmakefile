# ----------------------------------------------------------------------------
# Configurations
# ----------------------------------------------------------------------------

TOP_DIR      = $(abspath .)


# ----------------------------------------------------------------------------
# Main targets
# ----------------------------------------------------------------------------


.PHONY: all
all: help

.PHONY: help
help:
	@echo "Usage: make [ TARGET ... ]";
	@echo "";
	@echo "TARGET:";
	@echo "";
	@echo "  help      - show this help message";
	@echo "  deploy    - deploy as github pages";
	@echo "  clean     - delete all generated files";
	@echo "";
	@echo "Default TARGET is 'help'.";

.PHONY: clean
clean:
	rm -rf $(RUNTIME_DIR);

.PHONY: build
build:
	rm -rf _public;
	npm install
	bower install
	brunch build

.PHONY: server
server:
	npm start;

.PHONY: deploy
deploy:
	./deploy.sh


