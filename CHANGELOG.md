# Changelog
## [Unreleased]
### Added
- Device Discovery for configuration page
- Device configuration page.
- Estimated battery times for devices using Shure rechargeable batteries.
- Custom QR code support using `local_url` config key.
- Offline device type for devices like PSM900s that need slots, but may not have network connectivity.
- docker-compose for simplified docker deployment.
- Added color guide to help HUD


### Changed
- Migrated CSS display from flex to grid based system.
- Cleaned up node dependencies.


### Fixed
- Disable caching for background images.
- Updated Dockerfile to Node 10.
- Invalid 'p10t' device type in configuration documentation.
- Resolved issue with PyInstaller that required the Mac app to be occasionally restarted.


## [0.8.0] - 2019-8-29
Initial public beta

[Unreleased]: https://github.com/karlcswanson/micboard/compare/0.8.5
[0.8.0]: https://github.com/karlcswanson/micboard/releases/tag/v0.8.0
