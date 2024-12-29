const { upload } = require('./upload');
const fs = require('fs');

jest.mock('fs');

describe('upload', () => {
    const mockUploader = jest.fn();

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('uploads the file and deletes it if deleteAfterUpload is true', async () => {
        mockUploader.mockResolvedValueOnce();
        fs.unlinkSync.mockImplementationOnce(() => {});

        await upload('path/to/source/file.txt', 'path/to/target', mockUploader, { deleteAfterUpload: true });

        expect(mockUploader).toHaveBeenCalledWith('path/to/source/file.txt', 'path/to/target');
        expect(fs.unlinkSync).toHaveBeenCalledWith('path/to/source/file.txt');
    });

    it('uploads the file and does not delete it if deleteAfterUpload is false', async () => {
        mockUploader.mockResolvedValueOnce();

        await upload('path/to/source/file.txt', 'path/to/target', mockUploader, { deleteAfterUpload: false });

        expect(mockUploader).toHaveBeenCalledWith('path/to/source/file.txt', 'path/to/target');
        expect(fs.unlinkSync).not.toHaveBeenCalled();
    });

    it('exits with error if uploader is not provided', async () => {
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

        await upload('path/to/source/file.txt', 'path/to/target', null);

        expect(exitSpy).toHaveBeenCalledWith(1);
        exitSpy.mockRestore();
    });

    it('exits with error if pathToSourceFile is invalid', async () => {
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

        await upload('', 'path/to/target', mockUploader);

        expect(exitSpy).toHaveBeenCalledWith(1);
        exitSpy.mockRestore();
    });

    it('logs error and exits if uploader throws an error', async () => {
        mockUploader.mockRejectedValueOnce(new Error('upload error'));
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

        await upload('path/to/source/file.txt', 'path/to/target', mockUploader);

        expect(exitSpy).toHaveBeenCalledWith(1);
        exitSpy.mockRestore();
    });

    it('delete the file if deleteAfterUpload is not provided in options', async () => {
        mockUploader.mockResolvedValueOnce();

        await upload('path/to/source/file.txt', 'path/to/target', mockUploader);

        expect(mockUploader).toHaveBeenCalledWith('path/to/source/file.txt', 'path/to/target');
        expect(fs.unlinkSync).toHaveBeenCalled();
    });
});
