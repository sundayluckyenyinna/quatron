/**
 * This class encapsulates the extraction, manipulation and retrievals of the teacher's comment with regards to the scores of the student.
 */
import Comment from "./comment";

export default class TeacherComment extends Comment
{


    private teacherCommentPathFile : string;

    constructor( teacherCommentPathFile : string = 'NULL' ){
        super();
        this.teacherCommentPathFile = teacherCommentPathFile;
    }

    //Override the loadComment method to load extra from a file specified by the user.
    async getTeacherGoodCommentFromExternalFile() : Promise<string[]> {
        // The additional comments from the teacher can be loaded from either a database or from the text file
        return []; 
    };

    /**
     * A private method to check the type of file supplied 
     */


}
