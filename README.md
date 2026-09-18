# DKP-Bot — Offline Guild

DKP-Bot is a **Discord bot I created as a personal project for Offline Guild**, an online gaming guild focused on **MMO (Massively Multiplayer Online) games**.

The bot was designed to display members' **DKP or attendance points** directly through Discord, making it easier for guild members to check their current points without manually looking through a spreadsheet.

## How It Works

The system uses **SheetDB** as the data source.

1. A guild admin manually updates members' DKP or attendance points in a spreadsheet.
2. SheetDB provides access to the spreadsheet data through its API.
3. A guild member uses the `/dkp` command in Discord.
4. The bot searches the SheetDB data for the member's username.
5. The bot retrieves and displays the member's current points.

## Features

* `/dkp` Command — Allows guild members to check their DKP or attendance points.
* SheetDB Integration — Retrieves data from the guild's spreadsheet through the SheetDB API.
* Username Search — Finds a member's records based on their username.
* Automatic Display — Shows the retrieved points directly in Discord.

## Technologies Used

* Discord Bot API
* SheetDB API
* JavaScript
* Spreadsheet Data Storage

## Project Purpose

The main purpose of DKP-Bot was to make it easier for **Offline Guild members** to check their DKP or attendance points through Discord instead of manually checking the spreadsheet.

It was also a personal project that gave me experience working with Discord bots, APIs, and external data sources.

## Project Status

**Not Currently Running**

The bot is still functional and can be run again if needed. However, it is currently not being used, so I have shut it down for now.

The bot only needs to be hosted on a server to run continuously again. The project itself is not abandoned and can be brought back if Offline Guild decides to use it again.
