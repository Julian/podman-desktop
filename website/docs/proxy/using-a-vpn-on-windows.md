---
sidebar_position: 5
title: Podman behind a VPN on Windows
description: Accessing resources behind a VPN with Podman on Windows
tags: [podman, vpn, windows]
keywords: [podman, vpn, windows]
---

# Accessing resources behind a VPN with Podman on Windows

On Windows, if Podman needs to access resources behind a user-controlled VPN, enable user mode networking in your Podman machine.

#### Prerequisites

- Windows host with updated WSL2.
- Podman 4.6.0 or greater.

#### Procedure

- When creating the Podman machine, select the **User mode networking (traffic relayed by a user process)** option to enable user mode networking.

#### Verification

- You can now access resources that are behind the VPN.