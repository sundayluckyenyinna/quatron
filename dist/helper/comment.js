"use strict";
/**
 * This class is the base class for the TeacherComment and the PrincipalComment
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const comment_type_1 = require("./comment-type");
const default_comment_1 = require("./default-comment");
class Comment {
    constructor() {
    }
    ;
    /**
     * The base function to read all the comments of a particular kind from a comment file.
     * The comment file can either be a '.txt', '.doc' or a '.pdf' file.
     */
    /**
     * @param commentType Returnbs the array or dictionary of comments based on the specified CommentType.
     * In this base class, the comments loaded is the default comments that must be overriden by the concrete implementation of this base class.
     */
    loadComments(commentType, options = { includeDefault: true }) {
        return __awaiter(this, void 0, void 0, function* () {
            let comments = [];
            let additionalComment = [];
            switch (commentType) {
                case comment_type_1.CommentType.Teacher_Good_Behaviour: {
                    comments = Comment.teacherGoodBehaviourComments;
                    additionalComment = yield this.getTeacherGoodCommentFromExternalFile();
                    break;
                }
                case comment_type_1.CommentType.Teacher_Bad_Behaviour: {
                    comments = Comment.teacherBadBehaviourComments;
                    additionalComment = yield this.getTeacherBadBehaviourCommentFromExternalFile();
                    break;
                }
                case comment_type_1.CommentType.Principal_Excellent: {
                    comments = Comment.principalExcellentScoreComment;
                    additionalComment = yield this.getPrincipalExcellentScoreCommentFromExternalFile();
                    break;
                }
                case comment_type_1.CommentType.Pincipal_Very_Good: {
                    comments = Comment.principalVeryGoodScoreComment;
                    additionalComment = yield this.getPrincipalVeryGoodScoreCommentFromExternalFile();
                    break;
                }
                case comment_type_1.CommentType.Principal_Good: {
                    comments = Comment.principalGoodScoreComment;
                    additionalComment = yield this.getprincipalGoodScoreCommentFromExternalFile();
                    break;
                }
                case comment_type_1.CommentType.Principal_Poor: {
                    comments = Comment.principalPoorScoreComment;
                    break;
                }
                case comment_type_1.CommentType.Principal_Fail: {
                    comments = Comment.principalFailedScoreComment;
                    additionalComment = yield this.getPrincipalFailedScoreCommentFromExternalFile();
                    break;
                }
                default: throw { message: 'Illegal CommentType specified', statusCode: 404 };
            }
            if (options.includeDefault === true) {
                return comments.concat(additionalComment);
            }
            return additionalComment;
        });
    }
    /** Defaults additional teachers comment from external file. */
    getTeacherGoodCommentFromExternalFile() {
        return __awaiter(this, void 0, void 0, function* () { return []; });
    }
    ;
    getTeacherBadBehaviourCommentFromExternalFile() {
        return __awaiter(this, void 0, void 0, function* () { return []; });
    }
    ;
    /** Defaults additional principal comment from external file. */
    getPrincipalExcellentScoreCommentFromExternalFile() {
        return __awaiter(this, void 0, void 0, function* () { return []; });
    }
    ;
    getPrincipalVeryGoodScoreCommentFromExternalFile() {
        return __awaiter(this, void 0, void 0, function* () { return []; });
    }
    ;
    getprincipalGoodScoreCommentFromExternalFile() {
        return __awaiter(this, void 0, void 0, function* () { return []; });
    }
    ;
    getPrincipalPoorScoreCommentFromExternalFile() {
        return __awaiter(this, void 0, void 0, function* () { return []; });
    }
    ;
    getPrincipalFailedScoreCommentFromExternalFile() {
        return __awaiter(this, void 0, void 0, function* () { return []; });
    }
    ;
}
exports.default = Comment;
Comment.teacherGoodBehaviourComments = default_comment_1.DEFAULT_GOOD_BEHAVIOUR_TEACHER_COMMENTS;
Comment.teacherBadBehaviourComments = default_comment_1.DEFAULT_BAD_BEHAVIOUR_TEACHER_COMMENTS;
Comment.principalExcellentScoreComment = default_comment_1.DEFAULT_EXCELLENT_PRINCIPAL_COMMENTS;
Comment.principalVeryGoodScoreComment = default_comment_1.DEFAULT_VERY_GOOD_PRINCIPAL_COMMENTS;
Comment.principalGoodScoreComment = default_comment_1.DEFAULT_GOOD_PRINCIPAL_COMMENT;
Comment.principalPoorScoreComment = default_comment_1.DEFAULT_POOR_PRINCIPAL_COMMENT;
Comment.principalFailedScoreComment = default_comment_1.DEFAULT_FAILED_PRINCIPAL_COMMENT;
