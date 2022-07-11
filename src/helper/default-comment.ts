/**
 * This class provides the default setings for the comments of the teacher and the principal.
 */

/**
 * The default array or dictionary for teachers comment regarding good behavioural traits.
 */
export const DEFAULT_GOOD_BEHAVIOUR_TEACHER_COMMENTS : string[] = [
    'A cool and gentle soul. Easy going and friendly and with a ready attitude to learn.',
    'A nice and easy going individual. Cool headed and calm towards learning.'
];

/**
 * The default array or dictionary for teachers based on bad behavioural trait.
 */
export const DEFAULT_BAD_BEHAVIOUR_TEACHER_COMMENTS : string[] = [
    'A rude, playful individual. Always ready to pickup fights and with a little attitude to learn.',
    'Playful but smart. Not always settled and lacking considerable level of discipline.'
]

/**
 * The default principal comment for an excellent result.
 */
export const DEFAULT_EXCELLENT_PRINCIPAL_COMMENTS : string[] = [
    'Excellent result, keep it up.',
    'Excellent performance, keep the ball rolling',
    'Brilliant performance. Never stop the flag flying'
];

/**
 * The default principal comment for a good result
 */
export const DEFAULT_VERY_GOOD_PRINCIPAL_COMMENTS : string[] = [
    'A very good result, however, you can push it to the limit.',
    'A very good performance, you are very close to excellence.',
    'A brilliant performance, you can be the best.'
];

/**
 * The default principal comment for a good result.
 */
export const DEFAULT_GOOD_PRINCIPAL_COMMENT : string[] = [
    'A good result. There is more that can be done',
    'A good performance, you can make this better',
    'A good result. You are just starting to be the best.'
];

/**
 * The default principal comment for a poor result
 */
export const DEFAULT_POOR_PRINCIPAL_COMMENT : string[] = [
    'A poor result. There is more academic work to be done.',
    'A poor performance. You really need to improve.',
    'A poor performance. You can do better.'
]

/**
 * The default principal comment for a woefully failed result
 */
export const DEFAULT_FAILED_PRINCIPAL_COMMENT : string[] = [
    'A failed result. You cannot settle for this',
    'A failed performance. This is not an option.',
    'A failed result. You can do much better.'
]

export const ALL_TEACHER_DEFAULTS_COMMENT : Object = {
    good : DEFAULT_GOOD_BEHAVIOUR_TEACHER_COMMENTS,
    bad : DEFAULT_BAD_BEHAVIOUR_TEACHER_COMMENTS   
}

export const ALL_PRINCIPAL_DEFAULT_COMMENT : Object = {
    excellent : DEFAULT_EXCELLENT_PRINCIPAL_COMMENTS,
    veryGood : DEFAULT_VERY_GOOD_PRINCIPAL_COMMENTS,
    good : DEFAULT_GOOD_PRINCIPAL_COMMENT,
    poor : DEFAULT_POOR_PRINCIPAL_COMMENT,
    failed : DEFAULT_FAILED_PRINCIPAL_COMMENT
}