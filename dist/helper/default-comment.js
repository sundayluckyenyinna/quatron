"use strict";
/**
 * This class provides the default setings for the comments of the teacher and the principal.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_PRINCIPAL_DEFAULT_COMMENT = exports.ALL_TEACHER_DEFAULTS_COMMENT = exports.DEFAULT_FAILED_PRINCIPAL_COMMENT = exports.DEFAULT_POOR_PRINCIPAL_COMMENT = exports.DEFAULT_GOOD_PRINCIPAL_COMMENT = exports.DEFAULT_VERY_GOOD_PRINCIPAL_COMMENTS = exports.DEFAULT_EXCELLENT_PRINCIPAL_COMMENTS = exports.DEFAULT_BAD_BEHAVIOUR_TEACHER_COMMENTS = exports.DEFAULT_GOOD_BEHAVIOUR_TEACHER_COMMENTS = void 0;
/**
 * The default array or dictionary for teachers comment regarding good behavioural traits.
 */
exports.DEFAULT_GOOD_BEHAVIOUR_TEACHER_COMMENTS = [
    'A cool and gentle soul. Easy going and friendly and with a ready attitude to learn.',
    'A nice and easy going individual. Cool headed and calm towards learning.'
];
/**
 * The default array or dictionary for teachers based on bad behavioural trait.
 */
exports.DEFAULT_BAD_BEHAVIOUR_TEACHER_COMMENTS = [
    'A rude, playful individual. Always ready to pickup fights and with a little attitude to learn.',
    'Playful but smart. Not always settled and lacking considerable level of discipline.'
];
/**
 * The default principal comment for an excellent result.
 */
exports.DEFAULT_EXCELLENT_PRINCIPAL_COMMENTS = [
    'Excellent result, keep it up.',
    'Excellent performance, keep the ball rolling',
    'Brilliant performance. Never stop the flag flying'
];
/**
 * The default principal comment for a good result
 */
exports.DEFAULT_VERY_GOOD_PRINCIPAL_COMMENTS = [
    'A very good result, however, you can push it to the limit.',
    'A very good performance, you are very close to excellence.',
    'A brilliant performance, you can be the best.'
];
/**
 * The default principal comment for a good result.
 */
exports.DEFAULT_GOOD_PRINCIPAL_COMMENT = [
    'A good result. There is more that can be done',
    'A good performance, you can make this better',
    'A good result. You are just starting to be the best.'
];
/**
 * The default principal comment for a poor result
 */
exports.DEFAULT_POOR_PRINCIPAL_COMMENT = [
    'A poor result. There is more academic work to be done.',
    'A poor performance. You really need to improve.',
    'A poor performance. You can do better.'
];
/**
 * The default principal comment for a woefully failed result
 */
exports.DEFAULT_FAILED_PRINCIPAL_COMMENT = [
    'A failed result. You cannot settle for this',
    'A failed performance. This is not an option.',
    'A failed result. You can do much better.'
];
exports.ALL_TEACHER_DEFAULTS_COMMENT = {
    good: exports.DEFAULT_GOOD_BEHAVIOUR_TEACHER_COMMENTS,
    bad: exports.DEFAULT_BAD_BEHAVIOUR_TEACHER_COMMENTS
};
exports.ALL_PRINCIPAL_DEFAULT_COMMENT = {
    excellent: exports.DEFAULT_EXCELLENT_PRINCIPAL_COMMENTS,
    veryGood: exports.DEFAULT_VERY_GOOD_PRINCIPAL_COMMENTS,
    good: exports.DEFAULT_GOOD_PRINCIPAL_COMMENT,
    poor: exports.DEFAULT_POOR_PRINCIPAL_COMMENT,
    failed: exports.DEFAULT_FAILED_PRINCIPAL_COMMENT
};
