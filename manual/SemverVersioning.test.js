import { SemverVersioning } from "./SemverVersioning";

describe('Semver Versioning Test', () => {
    const MOCK_INFOS = { downloadUrl: '', packageHash: '' }

    // When major version is released, it must be considered like below
    const FIRST_RELEASE_INFO = { enabled: true, mandatory: false, ...MOCK_INFOS };

    describe('findLatestRelease', () => {
        it('should throw error when there is no releases', () => {
            const RELEASED_BUNDLES = {}
            expect(() => SemverVersioning.findLatestRelease(RELEASED_BUNDLES)).toThrow("There is no latest release.")
        })

        it('should return latest release', () => {
            const RELEASED_BUNDLES = {
                '1.0.0': { enabled: true, mandatory: false, downloadUrl: 'R1', packageHash: 'P1' },
                '1.1.0': { enabled: true, mandatory: false, downloadUrl: 'R2', packageHash: 'P2' },
                '1.1.1': { enabled: true, mandatory: true, downloadUrl: 'R3', packageHash: 'P3' },
            };

            expect(SemverVersioning.findLatestRelease(RELEASED_BUNDLES)).toEqual([
                '1.1.1',
                { enabled: true, mandatory: true, downloadUrl: 'R3', packageHash: 'P3' }
            ])
        })

        it('should ignore not-enabled bundles and return latest release', () => {
            const RELEASED_BUNDLES_1 = {
                '1.0.0': { enabled: true, mandatory: false, downloadUrl: 'R1', packageHash: 'P1' },
                '1.1.0': { enabled: false, mandatory: false, downloadUrl: 'R2', packageHash: 'P2' },
            };

            const RELEASED_BUNDLES_2 = {
                '1.0.0': { enabled: true, mandatory: false, downloadUrl: 'R1', packageHash: 'P1' },
                '1.1.0': { enabled: false, mandatory: false, downloadUrl: 'R2', packageHash: 'P2' },
                '1.1.1': { enabled: true, mandatory: true, downloadUrl: 'R3', packageHash: 'P3' },
            };

            expect(SemverVersioning.findLatestRelease(RELEASED_BUNDLES_1)).toEqual([
                '1.0.0',
                { enabled: true, mandatory: false, downloadUrl: 'R1', packageHash: 'P1' }
            ])

            expect(SemverVersioning.findLatestRelease(RELEASED_BUNDLES_2)).toEqual([
                '1.1.1',
                { enabled: true, mandatory: true, downloadUrl: 'R3', packageHash: 'P3' }
            ])
        })
    })

    describe('checkIsMandatory', () => {
        describe('not-mandatory cases', () => {
            it('should consider not-mandatory when the first major version is released', () => {
                const RUNTIME_VERSION = '1.0.0';
                const RELEASED_BUNDLES = {
                    '1.0.0': FIRST_RELEASE_INFO,
                };
        
                expect(SemverVersioning.checkIsMandatory(RUNTIME_VERSION, RELEASED_BUNDLES)).toBe(false);
            });
        
            it('should consider not-mandatory when latest version is running', () => {
                const RUNTIME_VERSION = '1.1.1';
                const RELEASED_BUNDLES = {
                    '1.0.0': FIRST_RELEASE_INFO,
                    '1.1.0': { enabled: true, mandatory: false, ...MOCK_INFOS },
                    '1.1.1': { enabled: true, mandatory: true, ...MOCK_INFOS },
                };
        
                expect(SemverVersioning.checkIsMandatory(RUNTIME_VERSION, RELEASED_BUNDLES)).toBe(false);
            });

            it('should consider not-mandatory when only not-mandatory version is released', () => {
                const RUNTIME_VERSION = '1.0.0';
                const RELEASED_BUNDLES = {
                    '1.0.0': FIRST_RELEASE_INFO,
                    '1.1.0': { enabled: true, mandatory: false, ...MOCK_INFOS },
                };
        
                expect(SemverVersioning.checkIsMandatory(RUNTIME_VERSION, RELEASED_BUNDLES)).toBe(false);
            });

            it('should consider not-mandatory when only not-mandatory version is released after current runtime version', () => {
                const RUNTIME_VERSION = '1.0.1';
                const RELEASED_BUNDLES = {
                    '1.0.0': FIRST_RELEASE_INFO,
                    '1.0.1': { enabled: true, mandatory: true, ...MOCK_INFOS },
                    '1.1.0': { enabled: true, mandatory: false, ...MOCK_INFOS },
                };
        
                expect(SemverVersioning.checkIsMandatory(RUNTIME_VERSION, RELEASED_BUNDLES)).toBe(false);
            });
        })

        describe('mandatory cases', () => {
            it('should consider mandatory when mandatory release exists', () => {
                const RUNTIME_VERSION = '1.0.0';
                const RELEASED_BUNDLES = {
                    '1.0.0': FIRST_RELEASE_INFO,
                    '1.0.1': { enabled: true, mandatory: true, ...MOCK_INFOS },
                };
        
                expect(SemverVersioning.checkIsMandatory(RUNTIME_VERSION, RELEASED_BUNDLES)).toBe(true);
            });
        })

        describe('scenario test', () => {
            it('Major Release > Mandatory > Not-mandatory > Not-mandatory', () => {
                const RELEASED_BUNDLES = {
                    '1.0.0': FIRST_RELEASE_INFO,
                    '1.0.1': { enabled: true, mandatory: true, ...MOCK_INFOS },
                    '1.1.0': { enabled: true, mandatory: false, ...MOCK_INFOS },
                    '1.2.0': { enabled: true, mandatory: false, ...MOCK_INFOS },
                };

                expect(SemverVersioning.checkIsMandatory('1.0.0', RELEASED_BUNDLES)).toBe(true);
                expect(SemverVersioning.checkIsMandatory('1.0.1', RELEASED_BUNDLES)).toBe(false);
                expect(SemverVersioning.checkIsMandatory('1.1.0', RELEASED_BUNDLES)).toBe(false);
                expect(SemverVersioning.checkIsMandatory('1.2.0', RELEASED_BUNDLES)).toBe(false);
            });
        
            it('Major Release > Mandatory > Not-mandatory > Mandatory > Not-mandatory', () => {
                const RELEASED_BUNDLES = {
                    '1.0.0': FIRST_RELEASE_INFO,
                    '1.0.1': { enabled: true, mandatory: true, ...MOCK_INFOS },
                    '1.1.0': { enabled: true, mandatory: false, ...MOCK_INFOS },
                    '1.1.1': { enabled: true, mandatory: true, ...MOCK_INFOS },
                    '1.2.0': { enabled: true, mandatory: false, ...MOCK_INFOS },
                };

                expect(SemverVersioning.checkIsMandatory('1.0.0', RELEASED_BUNDLES)).toBe(true);
                expect(SemverVersioning.checkIsMandatory('1.0.1', RELEASED_BUNDLES)).toBe(true);
                expect(SemverVersioning.checkIsMandatory('1.1.0', RELEASED_BUNDLES)).toBe(true);
                expect(SemverVersioning.checkIsMandatory('1.1.1', RELEASED_BUNDLES)).toBe(false);
                expect(SemverVersioning.checkIsMandatory('1.2.0', RELEASED_BUNDLES)).toBe(false);
            });
        })
    })

    describe('shouldRollback', () => {
        it('should return true when latest version < current runtime version', () => {
            const currentVersion = '1.2.0'
            const latestVersion = '1.1.0'

            expect(SemverVersioning.shouldRollback(currentVersion, latestVersion)).toBe(true)
        })
    })
})
