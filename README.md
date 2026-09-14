# Qoodish

## Description

https://qoodish.com

## Installation

```bash
pnpm install
```

## Environment variables

`.env.example` lists every variable the app reads. Copy it to `.env.local`
and fill in the values, or decrypt the shared set:

```bash
gcloud secrets versions access latest --secret=QOODISH_WEB_DOTENV --project=$PROJECT_ID --out-file=.env.local
```

`.env` files are ignored by git, so never commit one.

## Running app

```bash
pnpm dev
```
