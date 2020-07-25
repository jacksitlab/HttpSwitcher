# HttpSwitcher

## Library

Base implementation of an http-proxy server which like a proxy does forwards all http requests to another specified endpoint, but additionally can execute some actions on specific URIs, query parameters, etc.

## Foobar Switch

created because with wine started foobar2000 was not able to control audio output of SPDIF linux host system. So the goal is to get the remote commands for setting the volume are handled also on the linux host system and set with amixer, so that the foobar remote control app is working with all its features.

cli command to set master volume
```
amixer -D pulse sset Master ${volume}%
```