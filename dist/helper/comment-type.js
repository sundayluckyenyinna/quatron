"use strict";
/**
 * An enum class to hold the type of the comments that will be loaded.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentType = void 0;
var CommentType;
(function (CommentType) {
    /** The constant for the Teacher's comments */
    CommentType[CommentType["Teacher_Good_Behaviour"] = 0] = "Teacher_Good_Behaviour";
    CommentType[CommentType["Teacher_Bad_Behaviour"] = 1] = "Teacher_Bad_Behaviour";
    /** The constant for the principal comments */
    CommentType[CommentType["Principal_Excellent"] = 2] = "Principal_Excellent";
    CommentType[CommentType["Pincipal_Very_Good"] = 3] = "Pincipal_Very_Good";
    CommentType[CommentType["Principal_Good"] = 4] = "Principal_Good";
    CommentType[CommentType["Principal_Poor"] = 5] = "Principal_Poor";
    CommentType[CommentType["Principal_Fail"] = 6] = "Principal_Fail";
})(CommentType = exports.CommentType || (exports.CommentType = {}));
