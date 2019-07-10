FROM anzerr/node:11

COPY . /app
RUN apk update && \
	apk upgrade && \
	apk --update add --no-cache --virtual .source-tools git build-base openssh-client findutils && \
	mkdir -p /cwd && \
	cd /app && \
	npm ci --only=prod && \
	find /app -regextype egrep -regex ".*.(ts|map|md)$"  -type f -delete && \
	find /app -regextype egrep -regex ".*(Dockerfile|LICENSE)$"  -type f -delete && \
	apk del .source-tools && \
	rm -Rf /app/.git ~/.ssh ~/.npmrc /root/.config /root/.npm /root/.npmrc /tmp/* /root/.ssh /lib/apk/db/scripts.tar /var/cache/apk/* && \
	rm -Rf Dockerfile.* .gitignore server task tsconfig.json tslint.json LICENSE

FROM anzerr/node:11
COPY --from=0 /app /app
WORKDIR /app
ENTRYPOINT ["node", "bin/index.js", "server", "--host", "0.0.0.0:3000", "--cwd", "/cwd"]