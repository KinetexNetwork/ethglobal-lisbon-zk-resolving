# Lint

lint_service = \
	./tools/lint.sh $(1)

.PHONY: lint_mm
lint_mm:
	$(call lint_service,mm)

# Build Utils

tag ?= latest
f = $(if $(shallow),,true)

pull_cache_if_needed = \
	$(if $(cache_src), \
		docker pull $(cache_src)/$(1):${cache_tag} || true, \
		true \
	)

build_image_core = \
	docker build \
		$(if $(cache_src), --cache-from '$(cache_src)/$(1):${cache_tag}') \
		--tag $(1):${tag} \
		$(2) \
		--build-arg TAG=${tag} \
		--build-arg DEV=${dev} \
	$(if $(push_to), \
		&& docker tag $(1):${tag} $(push_to)/$(1):${tag} \
		&& docker tag $(1):${tag} $(push_to)/$(1):${cache_tag} \
		&& docker push '$(push_to)/$(1):${tag}' \
		&& docker push '$(push_to)/$(1):${cache_tag}' \
	)

build_image = \
	$(call pull_cache_if_needed,$(1)) && \
	$(call build_image_core,$(1),$(2))

# Same as 'build_image', but can resolve symlinks by packing all content into '.tar.gz'
# archive and feeding it to Docker builder (which is more resource intensive)
build_image_res = \
	$(call pull_cache_if_needed,$(1)) && \
	tar -czh -C $(2) . | $(call build_image_core,$(1),-)

# Build Base

.PHONY: build_core
build_core:
	$(call build_image,x_core,base/core)

.PHONY: build_deps
build_deps: $(if $(f), build_core)
	$(call build_image_res,x_deps,base/deps)

.PHONY: build_runtime
build_runtime: $(if $(f), build_core)
	$(call build_image,x_runtime,base/runtime)

.PHONY: build_base
build_base: build_deps build_runtime

# Build Periphery

.PHONY: build_redis
build_redis:
	$(call build_image,x_redis,base/periphery/redis)

# Build Services

.PHONY: build_mm
build_mm: $(if $(f), build_base)
	$(call build_image,mm,mm)

.PHONY: build_mm_redis
build_mm_redis: $(if $(f), build_redis)
	$(call build_image,mm_redis,mm_redis)
.PHONY: build_fusion
build_fusion: $(if $(f), build_fusion)
	$(call build_image,fusion,fusion)


.PHONY: build
build: \
	build_api \
	build_api_redis \
	build_mm \
	build_mm_redis \
	build_fusion


# Pull Services

pull_image = \
	docker pull ${pull_from}/$(1):${tag} && \
	docker tag ${pull_from}/$(1):${tag} $(1):${tag}

.PHONY: pull_x_core
pull_x_core:
	$(call pull_image,x_core)

.PHONY: pull_x_deps
pull_x_deps:
	$(call pull_image,x_deps)

.PHONY: pull_x_runtime
pull_x_runtime:
	$(call pull_image,x_runtime)

.PHONY: pull_x_redis
pull_x_redis:
	$(call pull_image,x_redis)

.PHONY: pull_mm
pull_mm:
	$(call pull_image,mm)

.PHONY: pull_mm_redis
pull_mm_redis:
	$(call pull_image,mm_redis)



# Shortcuts

.PHONY: b
b:
	make build -j 16

.PHONY: l
l:
	make lint -j 16

.PHONY: t
t:
	make test -j 16

.PHONY: up
up:
	docker-compose up -d

.PHONY: dn
dn:
	docker-compose down

.PHONY: ps
ps:
	docker ps

.PHONY: rs
rs:
	make dn && make b && make up