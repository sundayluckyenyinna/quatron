/**
 * This class is the base class for the TeacherComment and the PrincipalComment
 */

import { CommentType } from "./comment-type";
import { 
    DEFAULT_BAD_BEHAVIOUR_TEACHER_COMMENTS, DEFAULT_EXCELLENT_PRINCIPAL_COMMENTS, DEFAULT_FAILED_PRINCIPAL_COMMENT, DEFAULT_GOOD_BEHAVIOUR_TEACHER_COMMENTS, DEFAULT_GOOD_PRINCIPAL_COMMENT, DEFAULT_POOR_PRINCIPAL_COMMENT, DEFAULT_VERY_GOOD_PRINCIPAL_COMMENTS 
} from "./default-comment";

export default class Comment
{

    static teacherGoodBehaviourComments : string[] = DEFAULT_GOOD_BEHAVIOUR_TEACHER_COMMENTS;
    static teacherBadBehaviourComments : string[] = DEFAULT_BAD_BEHAVIOUR_TEACHER_COMMENTS;

    static principalExcellentScoreComment : string[] = DEFAULT_EXCELLENT_PRINCIPAL_COMMENTS;
    static principalVeryGoodScoreComment : string[] = DEFAULT_VERY_GOOD_PRINCIPAL_COMMENTS;
    static principalGoodScoreComment : string[]  = DEFAULT_GOOD_PRINCIPAL_COMMENT;
    static principalPoorScoreComment : string[] = DEFAULT_POOR_PRINCIPAL_COMMENT;
    static principalFailedScoreComment : string[] = DEFAULT_FAILED_PRINCIPAL_COMMENT;


    constructor(){
    };

    /**
     * The base function to read all the comments of a particular kind from a comment file.
     * The comment file can either be a '.txt', '.doc' or a '.pdf' file.
     */

    /**
     * @param commentType Returnbs the array or dictionary of comments based on the specified CommentType.
     * In this base class, the comments loaded is the default comments that must be overriden by the concrete implementation of this base class.
     */
    async loadComments( commentType : CommentType, 
        options : { includeDefault : boolean } = { includeDefault : true } ) : Promise<string[]>  {

        let comments : string[] = [];
        let additionalComment : string[] = [];

        switch( commentType ){
            case CommentType.Teacher_Good_Behaviour : { 
                comments = Comment.teacherGoodBehaviourComments;
                additionalComment = await this.getTeacherGoodCommentFromExternalFile(); 
                break; 
            }
            case CommentType.Teacher_Bad_Behaviour : { 
                comments = Comment.teacherBadBehaviourComments; 
                additionalComment = await this.getTeacherBadBehaviourCommentFromExternalFile();
                break;
            }
            case CommentType.Principal_Excellent : {
                comments = Comment.principalExcellentScoreComment;
                additionalComment = await this.getPrincipalExcellentScoreCommentFromExternalFile(); 
                break; 
            }
            case CommentType.Pincipal_Very_Good : {
                comments = Comment.principalVeryGoodScoreComment;
                additionalComment = await this.getPrincipalVeryGoodScoreCommentFromExternalFile(); 
                break; 
            }
            case CommentType.Principal_Good : {
                comments = Comment.principalGoodScoreComment; 
                additionalComment = await this.getprincipalGoodScoreCommentFromExternalFile();
                break;
            }
            case CommentType.Principal_Poor : {
                comments = Comment.principalPoorScoreComment; 
                break;
            }
            case CommentType.Principal_Fail : {
                comments = Comment.principalFailedScoreComment;
                additionalComment = await this.getPrincipalFailedScoreCommentFromExternalFile(); 
                break;
            }

            default: throw { message : 'Illegal CommentType specified', statusCode: 404 };
        }
        
        if( options.includeDefault === true ){ 
            return comments.concat( additionalComment );
        }
        return additionalComment;
    }

    /** Defaults additional teachers comment from external file. */
    async getTeacherGoodCommentFromExternalFile() : Promise<string[]> { return []; };

    async getTeacherBadBehaviourCommentFromExternalFile() : Promise<string[]> { return []; };


    /** Defaults additional principal comment from external file. */
    async getPrincipalExcellentScoreCommentFromExternalFile() : Promise<string[]> { return []; };

    async getPrincipalVeryGoodScoreCommentFromExternalFile() : Promise<string[]> { return []; };

    async getprincipalGoodScoreCommentFromExternalFile() : Promise<string[]> { return []; };

    async getPrincipalPoorScoreCommentFromExternalFile() : Promise<string[]> { return []; };

    async getPrincipalFailedScoreCommentFromExternalFile() : Promise<string[]> { return []; };
    /**
     * Returns a random comment from the 
     */

}