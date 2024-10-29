import { IncrementalVersioning } from "./IncrementalVersioning"

describe('Incremental Versioning Test', () => {
    const MOCK_INFOS = { downloadUrl: '', packageHash: '' }

    // When major version is released, it must be considered like below
    const FIRST_RELEASE_INFO = { enabled: true, mandatory: false, ...MOCK_INFOS };

    describe('findLatestRelease', () => {
        it('should throw error when there is no releases', () => {
            const RELEASED_BUNDLES = {}
            expect(() => IncrementalVersioning.findLatestRelease(RELEASED_BUNDLES)).toThrow("There is no latest release.")
        })

        it('should return latest release', () => {
            const RELEASED_BUNDLES = {
                '1': { enabled: true, mandatory: false, downloadUrl: 'R1', packageHash: 'P1' },
                '2': { enabled: true, mandatory: false, downloadUrl: 'R2', packageHash: 'P2' },
                '3': { enabled: true, mandatory: true, downloadUrl: 'R3', packageHash: 'P3' },
            };

            expect(IncrementalVersioning.findLatestRelease(RELEASED_BUNDLES)).toEqual([
                '3',
                { enabled: true, mandatory: true, downloadUrl: 'R3', packageHash: 'P3' }
            ])
        })
    })

    describe('checkIsMandatory', () => {
        describe('not-mandatory cases', () => {
            it('should consider not-mandatory when the first major version is released', () => {
                const RUNTIME_VERSION = '1';
                const RELEASED_BUNDLES = {
                    '1': FIRST_RELEASE_INFO,
                };
        
                expect(IncrementalVersioning.checkIsMandatory(RUNTIME_VERSION, RELEASED_BUNDLES)).toBe(false);
            });
        
            it('should consider not-mandatory when latest version is running', () => {
                const RUNTIME_VERSION = '3';
                const RELEASED_BUNDLES = {
                    '1': FIRST_RELEASE_INFO,
                    '2': { enabled: true, mandatory: false, ...MOCK_INFOS },
                    '3': { enabled: true, mandatory: true, ...MOCK_INFOS },
                };
        
                expect(IncrementalVersioning.checkIsMandatory(RUNTIME_VERSION, RELEASED_BUNDLES)).toBe(false);
            });

            it('should consider not-mandatory when only not-mandatory version is released', () => {
                const RUNTIME_VERSION = '1';
                const RELEASED_BUNDLES = {
                    '1': FIRST_RELEASE_INFO,
                    '2': { enabled: true, mandatory: false, ...MOCK_INFOS },
                };
        
                expect(IncrementalVersioning.checkIsMandatory(RUNTIME_VERSION, RELEASED_BUNDLES)).toBe(false);
            });

            it('should consider not-mandatory when only not-mandatory version is released after current runtime version', () => {
                const RUNTIME_VERSION = '2';
                const RELEASED_BUNDLES = {
                    '1': FIRST_RELEASE_INFO,
                    '2': { enabled: true, mandatory: true, ...MOCK_INFOS },
                    '3': { enabled: true, mandatory: false, ...MOCK_INFOS },
                };
        
                expect(IncrementalVersioning.checkIsMandatory(RUNTIME_VERSION, RELEASED_BUNDLES)).toBe(false);
            });
        })

        describe('mandatory cases', () => {
            it('should consider mandatory when mandatory release exists', () => {
                const RUNTIME_VERSION = '1';
                const RELEASED_BUNDLES = {
                    '1': FIRST_RELEASE_INFO,
                    '2': { enabled: true, mandatory: true, ...MOCK_INFOS },
                };
        
                expect(IncrementalVersioning.checkIsMandatory(RUNTIME_VERSION, RELEASED_BUNDLES)).toBe(true);
            });
        })

        describe('scenario test', () => {
            it('Major Release > Mandatory > Not-mandatory > Not-mandatory', () => {
                const RELEASED_BUNDLES = {
                    '1': FIRST_RELEASE_INFO,
                    '2': { enabled: true, mandatory: true, ...MOCK_INFOS },
                    '3': { enabled: true, mandatory: false, ...MOCK_INFOS },
                    '4': { enabled: true, mandatory: false, ...MOCK_INFOS },
                };

                expect(IncrementalVersioning.checkIsMandatory('1', RELEASED_BUNDLES)).toBe(true);
                expect(IncrementalVersioning.checkIsMandatory('2', RELEASED_BUNDLES)).toBe(false);
                expect(IncrementalVersioning.checkIsMandatory('3', RELEASED_BUNDLES)).toBe(false);
                expect(IncrementalVersioning.checkIsMandatory('4', RELEASED_BUNDLES)).toBe(false);
            });

            it('Major Release > Mandatory > Not-mandatory > Mandatory > Not-mandatory', () => {
                const RELEASED_BUNDLES = {
                    '1': FIRST_RELEASE_INFO,
                    '2': { enabled: true, mandatory: true, ...MOCK_INFOS },
                    '3': { enabled: true, mandatory: false, ...MOCK_INFOS },
                    '4': { enabled: true, mandatory: true, ...MOCK_INFOS },
                    '5': { enabled: true, mandatory: false, ...MOCK_INFOS },
                };

                expect(IncrementalVersioning.checkIsMandatory('1', RELEASED_BUNDLES)).toBe(true);
                expect(IncrementalVersioning.checkIsMandatory('2', RELEASED_BUNDLES)).toBe(true);
                expect(IncrementalVersioning.checkIsMandatory('3', RELEASED_BUNDLES)).toBe(true);
                expect(IncrementalVersioning.checkIsMandatory('4', RELEASED_BUNDLES)).toBe(false);
                expect(IncrementalVersioning.checkIsMandatory('5', RELEASED_BUNDLES)).toBe(false);
            });
        })
    })

    describe('shouldRollback', () => {
        it('should return true when latest version < current runtime version', () => {
            const currentVersion = '2'
            const latestVersion = '1'

            expect(IncrementalVersioning.shouldRollback(currentVersion, latestVersion)).toBe(true)
        })
    })
})
