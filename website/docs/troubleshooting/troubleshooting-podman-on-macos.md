---
sidebar_position: 30
---

# Troubleshooting Podman on macOS

## Unable to set custom binary path for Podman on macOS

#### Issue

When setting a custom binary path (under Preferences -> Custom binary path), Podman is unable to find `gvproxy` and `podman-mac-helper`:

```sh
Error: unable to start host networking: "could not find \"gvproxy\" in one of [/usr/local/opt/podman/libexec /opt/homebrew/bin /opt/homebrew/opt/podman/libexec /usr/local/bin /usr/local/libexec/podman /usr/local/lib/podman /usr/libexec/podman /usr/lib/podman $BINDIR/../libexec/podman].  To resolve this error, set the helper_binaries_dir key in the `[engine]` section of containers.conf to the directory containing your helper binaries."
```

#### Solution

1. Download `gvproxy` from the [gvisor-tap-vsock release page](https://github.com/containers/gvisor-tap-vsock/releases).
2. Build the `podman-mac-helper` from the source code on the [Podman GitHub page](https://github.com/containers/podman/tree/main/cmd/podman-mac-helper).
3. Add the `helpers_binaries_dir` entry to `~/.config/containers/conf`:

```sh
[containers]

helper_binaries_dir=["/Users/user/example_directory"]
```

**NOTE**: A pre-built binary will be added to the Podman release page so you do not have to build `podman-mac-helper`. An [issue is open for this](https://github.com/containers/podman/issues/16746).

## Unable to locate Podman Engine

#### Issue

Despite having Podman Engine installed, you might receive an error as follows -
`Error: No such keg: /usr/local/Cellar/podman`
or any similar error denoting that Podman Engine does not exist.

#### Explanation

The Podman Installer and Homebrew use different locations to store the Podman Engine files in the file system. For example, Podman Installer installs Podman Engine in the path `/opt/podman` whereas Homebrew uses the path `/usr/local` for macOS Intel, `/opt/homebrew` for Apple Silicon and `/home/linuxbrew/.linuxbrew` for Linux.

#### Solution

To check where exactly is your Podman Engine installed, run the command-

```sh
which podman
```

This returns the path where the Podman Engine would be installed. This would help determine further action.

For example, if you’re looking to completely uninstall Podman Engine from your system for a fresh installation, running `which podman` returns the exact path where Podman still exists. This could be the path where Podman Installer stores Podman Engine, such as `/opt/podman`. Once you know the path, run:

```sh
sudo rm -rf /opt/podman
```

Or

```sh
sudo rm -rf path-where-podman-exists
```

Here, you would replace `path-where-podman-exists` with the output of `which podman`.

You can now proceed for a fresh installation of Podman Desktop

## Podman machine on Apple Silicon

#### Issue

If you are using an Apple Silicon and brew, you might encounter the following error when starting Podman from Podman Desktop

```shell-session
Error: qemu exited unexpectedly with exit code 1, stderr: qemu-system-x86_64: invalid accelerator hvf
qemu-system-x86_64: falling back to tcg
qemu-system-x86_64: unable to find CPU model 'host'
```

#### Explanation

Podman machine is running as a `x86_64` process and it could be due to a dual install of homebrew: one for `x86_64` and one for `arm64`.

#### Solution

You can

1. Uninstall Podman machine on your `x86_64` brew install (for example from a terminal running under rosetta) `brew uninstall podman-machine`
2. or uninstall brew `x86_64` as most brew receipe have now arm64 support: follow [these instructions](https://github.com/homebrew/install#uninstall-homebrew) from a terminal running under rosetta

Then run a terminal in native mode (default) and install Podman machine `brew install podman-machine`

Finally clean the Podman machine VMs that had been previously created, and create new ones.

```shell-session
$ podman machine rm podman-machine-default
$ podman machine init
```

You should be a happy camper from here.

## Recovering from a failed start

After a failed start, the Podman machine might be unable to start because a QEMU process is still running and the PID file is in use.

#### Workaround

1. Kill the remaining QEMU process and stop the Podman machine:

   ```shell-session
   $ ps -edf | grep qemu-system | grep -v grep | awk '{print $2}' | xargs -I{} kill -9 {}; podman machine stop
   ```

2. Start the Podman machine.

#### Solution

Use Podman 4.6.1 or greater.
