"use strict";
exports.__esModule = true;
exports.OverflowScorError = exports.NegativeScoreError = void 0;
exports.NegativeScoreError = {
    Message: 'Subject Total-Score cannot be negative',
    StatusCode: 400,
    StatusMessage: 'Bad total score'
};
exports.OverflowScorError = {
    Message: 'Score cannot be overflow above 100%',
    StatusCode: 400,
    StatusMessage: 'Bad total score'
};
