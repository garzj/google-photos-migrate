# we need some image and video processing tools too, so use Debian 12 "Bookworm" as the base so we can get them.
FROM docker.io/node:bookworm

# get our image and video processing dependencies
RUN apt-get update && apt-get install -y ffmpeg exiftool

COPY . /app

WORKDIR /app
# build the application
RUN yarn && yarn build

ENTRYPOINT [ "yarn", "start" ]
