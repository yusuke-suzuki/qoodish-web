# Changelog

## [5.0.0](https://github.com/yusuke-suzuki/qoodish-web/compare/v4.0.2...v5.0.0) (2026-04-25)


### ⚠ BREAKING CHANGES

* AuthContext no longer exposes currentUser, setCurrentUser, providerData, or setProviderData.

### Features

* add server-side auth and data fetching ([6b04c65](https://github.com/yusuke-suzuki/qoodish-web/commit/6b04c650e362850a1027201099a8df89163e1d19))
* migrate guest fetching to Server Components ([63d06e3](https://github.com/yusuke-suzuki/qoodish-web/commit/63d06e389dedce992e0937da4854d1dcf0959107)), closes [#1044](https://github.com/yusuke-suzuki/qoodish-web/issues/1044)
* migrate Pages Router to App Router ([041e55a](https://github.com/yusuke-suzuki/qoodish-web/commit/041e55a6edaa29e5cb3d047182280e2f3b7019c1))


### Bug Fixes

* init Firebase at module load in AuthProvider ([d7eacca](https://github.com/yusuke-suzuki/qoodish-web/commit/d7eaccadcf581da555de599663c881c4f1b640fe)), closes [#1040](https://github.com/yusuke-suzuki/qoodish-web/issues/1040)


### Code Refactoring

* replace SWR with BFF pattern ([d5ea860](https://github.com/yusuke-suzuki/qoodish-web/commit/d5ea8608716e8db4f37b4f5c5b56ec26e3157482))

## [4.0.2](https://github.com/yusuke-suzuki/qoodish-web/compare/v4.0.1...v4.0.2) (2026-03-23)


### Bug Fixes

* make bottom review item tappable in drawer ([3848db6](https://github.com/yusuke-suzuki/qoodish-web/commit/3848db6f8d0958e4f6dae20c1df4078794483173))

## [4.0.1](https://github.com/yusuke-suzuki/qoodish-web/compare/v4.0.0...v4.0.1) (2026-03-22)


### Bug Fixes

* exclude component name from release tag ([7f80afe](https://github.com/yusuke-suzuki/qoodish-web/commit/7f80afe192e9f2c23655f3245447674840839fa3))
* include locale in Firebase email action URLs ([d35a720](https://github.com/yusuke-suzuki/qoodish-web/commit/d35a7201ac0b3c66072b354ffe5340223c356183))
* lower map drawer z-index below AppBar ([377ad63](https://github.com/yusuke-suzuki/qoodish-web/commit/377ad636afa135307e7521e014885e62d1d3aeb0))
* prevent duplicate snackbar messages ([18f1cf5](https://github.com/yusuke-suzuki/qoodish-web/commit/18f1cf565e8840d989f9576e674ff14ff292ced5))
* prevent stale mapId on map navigation ([519f0d6](https://github.com/yusuke-suzuki/qoodish-web/commit/519f0d6231cd5e9bef936d28602178287ec2c3ee))
* show localized message for SWR timeout ([3f544a1](https://github.com/yusuke-suzuki/qoodish-web/commit/3f544a1194ba189de5419503eedf05d8a021c6e9))
* sync provider list immediately after link/unlink ([63d220d](https://github.com/yusuke-suzuki/qoodish-web/commit/63d220db3e46b374303aef64f5b70d7d3d95418c))

## [4.0.0](https://github.com/yusuke-suzuki/qoodish-web/compare/qoodish-v3.3.0...qoodish-v4.0.0) (2026-03-18)


### ⚠ BREAKING CHANGES

* Requires Node.js 22 and pnpm 10 for local development.

### Features

* add email change functionality ([f3e5eff](https://github.com/yusuke-suzuki/qoodish-web/commit/f3e5eff98f03d0e58a25eb17407ad829f1b4e459))
* add email change functionality ([da874da](https://github.com/yusuke-suzuki/qoodish-web/commit/da874da1ab689d0d55d1e174ab436776ab8b791a))
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
* use PR number as Cloud Run traffic tag ([388a9ff](https://github.com/yusuke-suzuki/qoodish-web/commit/388a9ff172785c97842ca19ae2bcfff9ac0b2f95))


### Performance Improvements

* optimize Dev Container build performance ([929dd1b](https://github.com/yusuke-suzuki/qoodish-web/commit/929dd1b1dadcefdb988b8491e8fd1a0351c5b001))


### Reverts

* Move to spot on entered review dialog ([35d348e](https://github.com/yusuke-suzuki/qoodish-web/commit/35d348ef0db8cb72e5f1d10893c6125e8b9ea0b9))
