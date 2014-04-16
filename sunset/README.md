# Sunset

Nitrogen application that automatically takes photos around sunset given a location and a camera id.

## Using this application

1. Nitrogen applications are executed in a reactor.  Check out our [project page](http://nitrogen.io) for an explanation of what that means if you haven't executed an application before.
2. Use the [Nitrogen command tool](http://github.com/nitrogenjs/cli) to install this application into a reactor:

`n2 reactor install <reactor_id> <instance_id> sunset`

3. Then start the application using:

`n2 reactor install <reactor_id> <instance_id> --params '{"camera_id": "ID", "latitude": 34.22, "longitude": -123.12}'`

## Paramters

* camera_id:  The camera to take a photo of the sunset with
* latitude: The latitude this camera is at (for calculation of the sunset time)
* longitude: The longitude this camera is at (for calculation of the sunset time)

## Nitrogen Project

The Nitrogen project is housed in a set of GitHub projects:

1. [service](https://github.com/nitrogenjs/service): Core platform responsible for managing principals, security, and messaging.
2. [client](https://github.com/nitrogenjs/client): JavaScript client library for building Nitrogen devices and applications.
3. [admin](https://github.com/nitrogenjs/admin): Web admin tool for working with the Nitrogen service.
4. [device](https://github.com/nitrogenjs/devices): Device principals for common pieces of hardware.
5. [commands](https://github.com/nitrogenjs/commands): CommandManagers and schemas for well known command types.
6. [cli](https://github.com/nitrogenjs/cli): Command line interface for working with the Nitrogen service.
7. [reactor](https://github.com/nitrogenjs/reactor): Always-on hosted application execution platform.
8. [apps](https://github.com/nitrogenjs/apps): Project maintained Nitrogen applications.