# Configuration
# You need 'make' util installed to make use of this file
# To execute command run "make <command>"

# Param: 'tag'
# Tag to use for built images
# Also used to specify pulled image tag
# Empty value = 'latest'
# Usage example: make build_web tag=my-tag
tag ?= latest

# Param: 'shallow'
# Any value is considered 'true', empty value = 'false'
# Full mode ('f') builds all service dependencies first
# Shallow mode assumes dependencies are already built
# Usage example: make build_web shallow=1
f = $(if $(shallow),,true)

# Param: 'cache_src'
# Registry to pull cached docker image from before build
# Empty value omits cache pull attempt
# Example: make build_web cache_src=some.registry.com/path

# Param: 'cache_tag'
# Tag to use for image pulled from 'cache_src'
# Empty value = 'latest'
# Usage example: make build_web cache_src=<...> cache_tag=some-specific-cache-tag
cache_tag ?= latest

# Param: 'push_to'
# Registry to push built docker images to
# Empty value omits push attempt
# Pushed images are tagged with 'tag' & 'cache_tag'
# Usage example: make build_web push_to=some.registry.com/path

# Param: 'pull_from'
# Source to pull built docker images from
# Usage example: make pull_web pull_from=some.registry.com/path


# Build Utils

pull_cache_if_needed = \
	$(if $(cache_src), \
		docker pull $(cache_src)/$(1):${cache_tag} || true, \
		true \
	)

build_image_core = \
	docker build \
		$(if $(cache_src), --cache-from '$(cache_src)/$(1):${cache_tag}') \
		--tag $(1):${tag} \
		-f $(2)/Dockerfile . \
		--build-arg TAG=${tag} \
	$(if $(push_to), \
		&& docker tag $(1):${tag} $(push_to)/$(1):${tag} \
		&& docker tag $(1):${tag} $(push_to)/$(1):${cache_tag} \
		&& docker push '$(push_to)/$(1):${tag}' \
		&& docker push '$(push_to)/$(1):${cache_tag}' \
	)

build_image = \
	$(call pull_cache_if_needed,$(1)) && \
	$(call build_image_core,$(1),$(2))

# Build Base

.PHONY: build_base
build_base:
	$(call build_image,kinetex_flash_base,docker/base)

# Build Web (default)

.PHONY: build_web
build_web: $(if $(f), build_base)
	$(call build_image,kinetex_flash_web,docker/web)

.DEFAULT_GOAL := build_web


# Pull Services

pull_image = \
	docker pull ${pull_from}/$(1):${tag} && \
	docker tag ${pull_from}/$(1):${tag} $(1):${tag}

.PHONY: pull_base
pull_base:
	$(call pull_image,kinetex_flash_base)

.PHONY: pull_web
pull_web:
	$(call pull_image,kinetex_flash_web)
