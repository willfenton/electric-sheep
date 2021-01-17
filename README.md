# electric-sheep

What androids dream of. Web application that plays AI-generated music accompanied with a procedural animation. Built for HackED 2021.

<img width="256" alt="Electric Sheep Logo" src="https://raw.githubusercontent.com/willfenton/electric-sheep/main/website/static/logo-512.png">

## Setup

This project requires [Docker](https://www.docker.com/).

#### Build Docker Images

NOTE: The docker images can take a while to build the first time. It's much faster for subsequent builds since Docker builds a cache.

```
$ docker-compose build
```

#### Run Docker Images

```
$ docker-compose up
```

Website is accessible at [localhost:5000](http://localhost:5000)

## Components

#### Music Generator - `/music-generator`

Docker container that generates music in a MIDI format.

#### MIDI Processor - `/midi-processor`

Docker container that takes the output from the music generator, renames it, gives it a title, and moves it to the server's MIDI directory.

#### Server - `/server`

Docker container that serves the MIDIs generated by the music generator.

#### Website - `/website`

Web application that fetches MIDIs from the server and plays them. Procedural animation too.
