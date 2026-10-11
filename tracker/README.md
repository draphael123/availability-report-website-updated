# Fountain Availability Tracker

Password-gated report viewer for Fountain Vitality. The repository contains no report records or password. The Vercel server route reads the protected Fountain report source after validating the viewer's session. The live source and its weekly update workflow remain authoritative.

## Vercel setup

Set `TRACKER_PASSWORD` as an encrypted environment variable for Production and Preview. Never put it in the repository or browser code. Deploy the project with this directory as the root.

## Layout

Drag section tabs and overview panels while **Arrange view** is on. Each viewer's choices stay in that browser's local storage. Data remains read-only and always carries its report date.
