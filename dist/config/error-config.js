"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidFileTypeError = exports.NoUrlError = void 0;
exports.NoUrlError = {
    message: 'No url specified for the remote file type. You must specify a valid remote url',
    statusCode: 403,
    statusMessage: 'Bad request url.'
};
exports.InvalidFileTypeError = {
    message: "Invlaid file type. File type can only be 'local' or 'remote'.",
    statusCode: 403,
    statusMessage: 'Bad file type.'
};
