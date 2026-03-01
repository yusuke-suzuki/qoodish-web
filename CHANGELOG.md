# Changelog

## [4.0.0](https://github.com/yusuke-suzuki/qoodish-web/compare/qoodish-v3.3.0...qoodish-v4.0.0) (2026-03-01)


### ⚠ BREAKING CHANGES

* Requires Node.js 22 and pnpm 10 for local development.

### Features

* add Email Link auth, remove FB/Twitter ([164c1d1](https://github.com/yusuke-suzuki/qoodish-web/commit/164c1d1247b0560160037b1b888368abdda2f1ab))
* add Email Link auth, remove FB/Twitter ([a48ca33](https://github.com/yusuke-suzuki/qoodish-web/commit/a48ca33877176804be53a8e5017eb411a5d0507f))
* add provider management to settings ([8f1e063](https://github.com/yusuke-suzuki/qoodish-web/commit/8f1e063ac867d44c54d397078633bfae72cd1133))
* add provider management to settings ([a8f26be](https://github.com/yusuke-suzuki/qoodish-web/commit/a8f26becbd0fbf24269d5d107a0aaebdb2fe5629))
* add provider management to settings ([e312d38](https://github.com/yusuke-suzuki/qoodish-web/commit/e312d38058f4af5c06b53947450ead3fc5071248))
* integrate @mui/material-nextjs package ([37fe0fe](https://github.com/yusuke-suzuki/qoodish-web/commit/37fe0fe7f8bb9bb48f1386911ef3bd53441407f3))
* integrate SpecKit workflow tools ([6176f33](https://github.com/yusuke-suzuki/qoodish-web/commit/6176f3321867052cea5d9e20b2992fd27944d995))
* split pr command into smaller commands ([7c4c689](https://github.com/yusuke-suzuki/qoodish-web/commit/7c4c6899c4726dbe961ed7378603b0f2426f0500))
* split pr command into smaller commands ([9413e38](https://github.com/yusuke-suzuki/qoodish-web/commit/9413e387953c61c4f3e85217bf06ea9ca56f4351))
* upgrade to Node.js 22 and pnpm 10 ([b6f5eda](https://github.com/yusuke-suzuki/qoodish-web/commit/b6f5eda378f29008211e3167a065975bb5092618))


### Bug Fixes

* correct Emotion SSR cache setup to prevent icon FOUC ([de52f66](https://github.com/yusuke-suzuki/qoodish-web/commit/de52f663b51a5ef5edce42d2e861a6aa92c9162a))
* correct Emotion SSR cache setup to prevent icon FOUC ([334b586](https://github.com/yusuke-suzuki/qoodish-web/commit/334b5866b534846d0656073cb021cca6ea611b40))
* correct spelling of 'occurred' ([2e9aab9](https://github.com/yusuke-suzuki/qoodish-web/commit/2e9aab91fb393c230dc7a884a8ff80725b65f113))
* correct spelling of 'occurred' ([3b01fe2](https://github.com/yusuke-suzuki/qoodish-web/commit/3b01fe27d8ad1afb0d2edf7ed973e7219af58ec4))
* improve null safety in auth types ([eb67314](https://github.com/yusuke-suzuki/qoodish-web/commit/eb673140fd3d291ebb446fe5456308188129d784))
* **lint:** resolve errors reported by Biome ([03fa3e8](https://github.com/yusuke-suzuki/qoodish-web/commit/03fa3e82c82bd5edf9ebd31c9e8b70843eca1cd3))
* **maps:** prevent router-related infinite loops ([ddc1623](https://github.com/yusuke-suzuki/qoodish-web/commit/ddc16237331fc6bd0dcff56052721ca844b38004))
* normalize branch names in Cloud Run tags ([2e24a7f](https://github.com/yusuke-suzuki/qoodish-web/commit/2e24a7f95e9add9f6a6e6092bdab16f9f58f9ef6))
* Prevent crash on empty review pages ([5de0dca](https://github.com/yusuke-suzuki/qoodish-web/commit/5de0dca8d9ce7355e807b38ef0f0ba7d3e03bf36))
* replace useMediaQuery with CSS responsive display in Layout ([2a628e0](https://github.com/yusuke-suzuki/qoodish-web/commit/2a628e052b9c7ff68924ece714b060792227a8bd))
* replace useMediaQuery with CSS responsive display in Layout ([404b918](https://github.com/yusuke-suzuki/qoodish-web/commit/404b918640cbe38b1363d9aee3270ddad813fe64))
* set permissions for volume mount dirs ([db1800c](https://github.com/yusuke-suzuki/qoodish-web/commit/db1800cb4bbc1ef15c8af7bd5b36a8f96ad29609))
* set permissions for volume mount dirs ([14b3ca6](https://github.com/yusuke-suzuki/qoodish-web/commit/14b3ca6122982979cae1b2713e58a53228ade14d))


### Performance Improvements

* optimize Dev Container build performance ([929dd1b](https://github.com/yusuke-suzuki/qoodish-web/commit/929dd1b1dadcefdb988b8491e8fd1a0351c5b001))


### Reverts

* Move to spot on entered review dialog ([35d348e](https://github.com/yusuke-suzuki/qoodish-web/commit/35d348ef0db8cb72e5f1d10893c6125e8b9ea0b9))
